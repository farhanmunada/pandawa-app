'use server';

import { db } from '@/lib/db';
import { wallets, cashTransactions, user } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { uploadToDrive } from '@/lib/gdrive/client';
import { getCurrentUserSession } from '@/lib/auth/guard';

async function checkFinancePermission() {
  const session = await getCurrentUserSession();
  if (!session?.user) return false;
  const roles = session.roles || [];
  return (
    roles.includes('super_admin') ||
    roles.includes('ketua_umum') ||
    roles.includes('wakil_ketua') ||
    roles.includes('bendahara')
  );
}

export async function getFinanceOverview() {
  try {
    const allWallets = await db.select().from(wallets).where(eq(wallets.isActive, true));
    const totalBalance = allWallets.reduce((acc, w) => acc + Number(w.currentBalance), 0);

    const recentTransactions = await db
      .select({
        id: cashTransactions.id,
        walletId: cashTransactions.walletId,
        walletName: wallets.name,
        type: cashTransactions.type,
        category: cashTransactions.category,
        amount: cashTransactions.amount,
        transactionDate: cashTransactions.transactionDate,
        description: cashTransactions.description,
        receiptDriveUrl: cashTransactions.receiptDriveUrl,
        status: cashTransactions.status,
        requiresApproval: cashTransactions.requiresApproval,
        creatorName: user.name,
      })
      .from(cashTransactions)
      .innerJoin(wallets, eq(cashTransactions.walletId, wallets.id))
      .leftJoin(user, eq(cashTransactions.createdBy, user.id))
      .orderBy(desc(cashTransactions.createdAt))
      .limit(30);

    return {
      success: true,
      data: {
        wallets: allWallets,
        totalBalance,
        transactions: recentTransactions,
      },
    };
  } catch (error: unknown) {
    return {
      success: false,
      data: { wallets: [], totalBalance: 0, transactions: [] },
      message: error instanceof Error ? error.message : 'Gagal memuat data keuangan.',
    };
  }
}

export async function createTransactionAction(formData: FormData) {
  try {
    if (!(await checkFinancePermission())) {
      return { success: false, message: 'FORBIDDEN: Hanya Bendahara dan Pimpinan yang berwenang mencatat kas.' };
    }

    const walletId = Number(formData.get('walletId'));
    const type = formData.get('type') as 'IN' | 'OUT';
    const category = formData.get('category') as string;
    const amount = Number(formData.get('amount'));
    const transactionDate = formData.get('transactionDate') as string;
    const description = formData.get('description') as string;
    const session = await getCurrentUserSession();
    const creatorUserId = session?.user?.id || (formData.get('creatorUserId') as string) || 'usr_demo_0000';

    if (!walletId || !type || !amount || !transactionDate || !description) {
      return { success: false, message: 'Harap lengkapi seluruh kolom wajib.' };
    }

    const receiptFile = formData.get('receiptFile') as File | null;
    let receiptDriveId: string | null = null;
    let receiptDriveUrl: string | null = null;

    if (receiptFile && receiptFile.size > 0) {
      const buffer = Buffer.from(await receiptFile.arrayBuffer());
      const uploadRes = await uploadToDrive(
        buffer,
        `nota_${Date.now()}_${receiptFile.name}`,
        receiptFile.type || 'image/webp',
        '01_KAS_NOTA'
      );
      if (uploadRes) {
        receiptDriveId = uploadRes.fileId;
        receiptDriveUrl = uploadRes.webViewLink;
      }
    }

    // Alur approval: pengeluaran di atas Rp500.000 wajib persetujuan Ketua Umum
    const requiresApproval = type === 'OUT' && amount > 500000;
    const initialStatus = requiresApproval ? 'PENDING_APPROVAL' : 'APPROVED';
    const transactionId = `trx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Simpan transaksi
    await db.insert(cashTransactions).values({
      id: transactionId,
      walletId,
      type,
      category: category || 'Operasional',
      amount,
      transactionDate,
      description,
      receiptDriveId,
      receiptDriveUrl,
      status: initialStatus,
      requiresApproval,
      createdBy: creatorUserId,
    });

    // Jika langsung approved, perbarui saldo dompet
    if (initialStatus === 'APPROVED') {
      const targetWallet = await db.query.wallets.findFirst({
        where: eq(wallets.id, walletId),
      });

      if (targetWallet) {
        const newBalance =
          type === 'IN'
            ? Number(targetWallet.currentBalance) + amount
            : Number(targetWallet.currentBalance) - amount;

        await db
          .update(wallets)
          .set({ currentBalance: newBalance })
          .where(eq(wallets.id, walletId));
      }
    }

    revalidatePath('/finance');
    return {
      success: true,
      message: requiresApproval
        ? 'Transaksi dicatat dan menunggu persetujuan Ketua Umum (> Rp500.000).'
        : 'Transaksi berhasil disimpan dan saldo dompet diperbarui.',
    };
  } catch (error: unknown) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Gagal membuat transaksi.',
    };
  }
}

export async function approveTransactionAction(transactionId: string, approverUserId?: string) {
  try {
    const session = await getCurrentUserSession();
    const effectiveApprover = session?.user?.id || approverUserId || 'usr_demo_0000';

    const trx = await db.query.cashTransactions.findFirst({
      where: eq(cashTransactions.id, transactionId),
    });

    if (!trx) return { success: false, message: 'Transaksi tidak ditemukan.' };
    if (trx.status !== 'PENDING_APPROVAL') {
      return { success: false, message: 'Transaksi ini tidak dalam status menunggu persetujuan.' };
    }

    const targetWallet = await db.query.wallets.findFirst({
      where: eq(wallets.id, trx.walletId),
    });

    if (!targetWallet) return { success: false, message: 'Dompet kas tidak valid.' };

    const newBalance =
      trx.type === 'IN'
        ? Number(targetWallet.currentBalance) + Number(trx.amount)
        : Number(targetWallet.currentBalance) - Number(trx.amount);

    // Update status transaksi
    await db
      .update(cashTransactions)
      .set({
        status: 'APPROVED',
        approvedBy: effectiveApprover,
        approvedAt: new Date(),
      })
      .where(eq(cashTransactions.id, transactionId));

    // Potong/tambah saldo dompet
    await db
      .update(wallets)
      .set({ currentBalance: newBalance })
      .where(eq(wallets.id, trx.walletId));

    revalidatePath('/finance');
    return { success: true, message: 'Transaksi berhasil disetujui.' };
  } catch (error: unknown) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Gagal menyetujui transaksi.',
    };
  }
}
