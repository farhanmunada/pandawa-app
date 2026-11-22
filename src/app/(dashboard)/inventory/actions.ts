'use server';

import { db } from '@/lib/db';
import { assets, assetLoans, wallets, cashTransactions } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function getInventoryOverview() {
  try {
    const assetsList = await db.select().from(assets).orderBy(desc(assets.createdAt));

    const activeLoans = await db
      .select({
        id: assetLoans.id,
        assetId: assetLoans.assetId,
        assetName: assets.name,
        clientTier: assetLoans.clientTier,
        borrowerName: assetLoans.borrowerName,
        borrowerPhone: assetLoans.borrowerPhone,
        quantity: assetLoans.quantity,
        startDate: assetLoans.startDate,
        expectedEndDate: assetLoans.expectedEndDate,
        purpose: assetLoans.purpose,
        totalFee: assetLoans.totalFee,
        status: assetLoans.status,
      })
      .from(assetLoans)
      .innerJoin(assets, eq(assetLoans.assetId, assets.id))
      .orderBy(desc(assetLoans.createdAt));

    return {
      success: true,
      data: {
        assets: assetsList,
        loans: activeLoans,
      },
    };
  } catch (error: unknown) {
    return {
      success: false,
      data: { assets: [], loans: [] },
      message: error instanceof Error ? error.message : 'Gagal memuat inventaris.',
    };
  }
}

export async function createLoanOrRentalAction(data: {
  assetId: number;
  clientTier: 'INTERNAL' | 'EXTERNAL';
  borrowerName: string;
  borrowerPhone: string;
  quantity: number;
  startDate: string;
  expectedEndDate: string;
  purpose: string;
  processedByUserId: string;
}) {
  try {
    const targetAsset = await db.query.assets.findFirst({
      where: eq(assets.id, data.assetId),
    });

    if (!targetAsset) return { success: false, message: 'Barang tidak ditemukan.' };
    if (targetAsset.availableQuantity < data.quantity) {
      return {
        success: false,
        message: `Stok tersedia tidak mencukupi (Tersedia: ${targetAsset.availableQuantity} unit).`,
      };
    }

    // Hitung durasi hari
    const start = new Date(data.startDate).getTime();
    const end = new Date(data.expectedEndDate).getTime();
    const diffDays = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));

    // Skema Harga Ganda
    const ratePerDay =
      data.clientTier === 'INTERNAL'
        ? Number(targetAsset.internalRatePerDay)
        : Number(targetAsset.externalRatePerDay);

    const totalFee = ratePerDay * diffDays * data.quantity;

    // Catat pinjaman/sewa
    const loanInsert = await db
      .insert(assetLoans)
      .values({
        assetId: data.assetId,
        clientTier: data.clientTier,
        borrowerName: data.borrowerName,
        borrowerPhone: data.borrowerPhone,
        quantity: data.quantity,
        startDate: data.startDate,
        expectedEndDate: data.expectedEndDate,
        purpose: data.purpose,
        totalFee,
        status: 'BORROWED',
        processedBy: data.processedByUserId,
      })
      .returning({ id: assetLoans.id });

    // Kurangi stok tersedia
    await db
      .update(assets)
      .set({ availableQuantity: targetAsset.availableQuantity - data.quantity })
      .where(eq(assets.id, data.assetId));

    // Jika sewa komersial pihak luar (Harga Luar) dan ada biaya, otomatis buat pemasukan di kas usaha
    if (data.clientTier === 'EXTERNAL' && totalFee > 0) {
      const rentalWallet = await db.query.wallets.findFirst({
        where: eq(wallets.name, 'Kas Usaha & Sewa Inventaris'),
      });

      if (rentalWallet) {
        const trxId = `trx_sewa_${Date.now()}`;
        await db.insert(cashTransactions).values({
          id: trxId,
          walletId: rentalWallet.id,
          type: 'IN',
          category: 'Sewa Inventaris',
          amount: totalFee,
          transactionDate: data.startDate,
          description: `Penerimaan sewa ${targetAsset.name} (${data.quantity} unit) oleh ${data.borrowerName}`,
          status: 'APPROVED',
          createdBy: data.processedByUserId,
        });

        // Update saldo dompet kas usaha
        await db
          .update(wallets)
          .set({ currentBalance: Number(rentalWallet.currentBalance) + totalFee })
          .where(eq(wallets.id, rentalWallet.id));

        // Hubungkan ke peminjaman
        if (loanInsert[0]?.id) {
          await db
            .update(assetLoans)
            .set({ cashTransactionId: trxId })
            .where(eq(assetLoans.id, loanInsert[0].id));
        }
      }
    }

    revalidatePath('/inventory');
    return {
      success: true,
      message: `Peminjaman/sewa berhasil dicatat. Total biaya: Rp ${totalFee.toLocaleString('id-ID')}`,
    };
  } catch (error: unknown) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Gagal memproses peminjaman.',
    };
  }
}

export async function returnAssetLoanAction(data: {
  loanId: number;
  returnCondition: string;
  returnNotes: string;
}) {
  try {
    const loan = await db.query.assetLoans.findFirst({
      where: eq(assetLoans.id, data.loanId),
    });

    if (!loan) return { success: false, message: 'Data peminjaman tidak ditemukan.' };

    const assetItem = await db.query.assets.findFirst({
      where: eq(assets.id, loan.assetId),
    });

    if (assetItem) {
      // Kembalikan stok tersedia
      await db
        .update(assets)
        .set({ availableQuantity: assetItem.availableQuantity + loan.quantity })
        .where(eq(assets.id, loan.assetId));
    }

    await db
      .update(assetLoans)
      .set({
        status: 'RETURNED',
        actualEndDate: new Date().toISOString().split('T')[0],
        returnCondition: data.returnCondition,
        returnNotes: data.returnNotes,
      })
      .where(eq(assetLoans.id, data.loanId));

    revalidatePath('/inventory');
    return { success: true, message: 'Berita acara pengembalian aset berhasil disimpan.' };
  } catch (error: unknown) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Gagal memproses pengembalian.',
    };
  }
}
