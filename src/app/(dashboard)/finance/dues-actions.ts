'use server';

import { db } from '@/lib/db';
import {
  routineDuesSchedules,
  routineDuesPayments,
  cashTransactions,
  wallets,
  members,
  user,
  periods,
} from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { getCurrentUserSession } from '@/lib/auth/guard';

async function checkFinancePermission() {
  const session = await getCurrentUserSession();
  const roles = session?.roles || [];
  return (
    roles.includes('super_admin') ||
    roles.includes('ketua_umum') ||
    roles.includes('wakil_ketua') ||
    roles.includes('bendahara')
  );
}

export async function getOrCreateSelapananSchedule() {
  const activePeriod = await db.query.periods.findFirst({
    where: eq(periods.isActive, true),
  });

  if (!activePeriod) return null;

  let schedule = await db.query.routineDuesSchedules.findFirst({
    where: and(
      eq(routineDuesSchedules.periodId, activePeriod.id),
      eq(routineDuesSchedules.title, 'Kas Selapanan Wajib')
    ),
  });

  if (!schedule) {
    const inserted = await db
      .insert(routineDuesSchedules)
      .values({
        periodId: activePeriod.id,
        title: 'Kas Selapanan Wajib',
        amountPerPeriod: 5000,
        frequency: 'monthly',
        isActive: true,
      })
      .returning();
    schedule = inserted[0];
  }

  return schedule;
}

export async function getSelapananOverviewAction(periodLabel?: string) {
  try {
    const schedule = await getOrCreateSelapananSchedule();
    if (!schedule) {
      return { success: false, message: 'Periode kepengurusan aktif tidak ditemukan.' };
    }

    const now = new Date();
    const currentLabel =
      periodLabel ||
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // Ambil seluruh anggota aktif
    const allMembers = await db
      .select({
        memberId: members.id,
        memberNumber: members.memberNumber,
        name: user.name,
        phone: user.phone,
        division: members.division,
        positionTitle: members.positionTitle,
      })
      .from(members)
      .innerJoin(user, eq(members.userId, user.id))
      .where(eq(members.status, 'active'))
      .orderBy(members.memberNumber);

    // Ambil pembayaran pada periode terkait
    const payments = await db
      .select()
      .from(routineDuesPayments)
      .where(
        and(
          eq(routineDuesPayments.scheduleId, schedule.id),
          eq(routineDuesPayments.periodLabel, currentLabel)
        )
      );

    const paymentMap = new Map<number, (typeof payments)[0]>();
    payments.forEach((p) => paymentMap.set(p.memberId, p));

    const membersWithStatus = allMembers.map((m) => {
      const payment = paymentMap.get(m.memberId);
      return {
        ...m,
        hasPaid: !!payment,
        paymentDate: payment ? payment.paymentDate : null,
        amount: payment ? Number(payment.amount) : 5000,
      };
    });

    const totalMembers = allMembers.length;
    const paidCount = payments.length;
    const unpaidCount = Math.max(0, totalMembers - paidCount);
    const totalCollected = paidCount * 5000;
    const percentage = totalMembers > 0 ? Math.round((paidCount / totalMembers) * 100) : 0;

    return {
      success: true,
      data: {
        schedule,
        currentLabel,
        totalMembers,
        paidCount,
        unpaidCount,
        totalCollected,
        percentage,
        members: membersWithStatus,
      },
    };
  } catch (err: unknown) {
    return {
      success: false,
      message: err instanceof Error ? err.message : 'Gagal memuat rekap kas selapanan.',
    };
  }
}

export async function recordSelapananPaymentAction(data: {
  memberId: number;
  periodLabel: string;
  paymentDate?: string;
}) {
  try {
    if (!(await checkFinancePermission())) {
      return {
        success: false,
        message: 'FORBIDDEN: Hanya Bendahara atau Pimpinan yang dapat mencatat kas selapanan.',
      };
    }

    const session = await getCurrentUserSession();
    const recordedBy = session?.user?.id || 'usr_demo_0000';

    const schedule = await getOrCreateSelapananSchedule();
    if (!schedule) {
      return { success: false, message: 'Jadwal selapanan tidak aktif.' };
    }

    // Ambil data anggota
    const memberRecord = await db
      .select({
        memberId: members.id,
        memberNumber: members.memberNumber,
        name: user.name,
      })
      .from(members)
      .innerJoin(user, eq(members.userId, user.id))
      .where(eq(members.id, data.memberId))
      .limit(1);

    if (memberRecord.length === 0) {
      return { success: false, message: 'Data anggota tidak ditemukan.' };
    }

    const targetMember = memberRecord[0];

    // Cek apakah sudah pernah membayar pada periode ini
    const existingPayment = await db.query.routineDuesPayments.findFirst({
      where: and(
        eq(routineDuesPayments.scheduleId, schedule.id),
        eq(routineDuesPayments.memberId, data.memberId),
        eq(routineDuesPayments.periodLabel, data.periodLabel)
      ),
    });

    if (existingPayment) {
      return { success: false, message: 'Anggota ini sudah tercatat lunas untuk periode ini.' };
    }

    // Cari Dompet Kas Utama Organisasi
    let kasUtama = await db.query.wallets.findFirst({
      where: eq(wallets.name, 'Kas Utama Organisasi'),
    });
    if (!kasUtama) {
      kasUtama = await db.query.wallets.findFirst({
        where: eq(wallets.isActive, true),
      });
    }

    if (!kasUtama) {
      return { success: false, message: 'Dompet kas utama tidak ditemukan.' };
    }

    const payDate = data.paymentDate || new Date().toISOString().split('T')[0];

    // 1. Simpan pembayaran di routineDuesPayments
    await db.insert(routineDuesPayments).values({
      scheduleId: schedule.id,
      memberId: data.memberId,
      walletId: kasUtama.id,
      periodLabel: data.periodLabel,
      amount: 5000,
      paymentDate: payDate,
      recordedBy,
    });

    // 2. Catat otomatis mutasi kas masuk di cashTransactions
    const trxId = `trx_selapanan_${Date.now()}_${data.memberId}`;
    await db.insert(cashTransactions).values({
      id: trxId,
      walletId: kasUtama.id,
      type: 'IN',
      category: 'Kas Selapanan',
      amount: 5000,
      transactionDate: payDate,
      description: `Setoran Kas Selapanan (Rp5.000) oleh ${targetMember.memberNumber} - ${targetMember.name} [${data.periodLabel}]`,
      status: 'APPROVED',
      createdBy: recordedBy,
    });

    // 3. Update saldo dompet kas utama
    await db
      .update(wallets)
      .set({ currentBalance: Number(kasUtama.currentBalance) + 5000 })
      .where(eq(wallets.id, kasUtama.id));

    revalidatePath('/finance');
    revalidatePath('/');
    return {
      success: true,
      message: `Setoran Rp 5.000 oleh ${targetMember.name} berhasil dicatat & masuk ke Kas Utama.`,
    };
  } catch (err: unknown) {
    return {
      success: false,
      message: err instanceof Error ? err.message : 'Gagal mencatat pembayaran selapanan.',
    };
  }
}

export async function getMySelapananStatusAction(userId: string, periodLabel?: string) {
  try {
    const memberRecord = await db.query.members.findFirst({
      where: eq(members.userId, userId),
    });

    if (!memberRecord) {
      return { hasPaid: false, periodLabel: '', amount: 5000, paymentDate: null };
    }

    const schedule = await getOrCreateSelapananSchedule();
    if (!schedule) {
      return { hasPaid: false, periodLabel: '', amount: 5000, paymentDate: null };
    }

    const now = new Date();
    const currentLabel =
      periodLabel ||
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const payment = await db.query.routineDuesPayments.findFirst({
      where: and(
        eq(routineDuesPayments.scheduleId, schedule.id),
        eq(routineDuesPayments.memberId, memberRecord.id),
        eq(routineDuesPayments.periodLabel, currentLabel)
      ),
    });

    return {
      hasPaid: !!payment,
      periodLabel: currentLabel,
      amount: 5000,
      paymentDate: payment ? payment.paymentDate : null,
    };
  } catch {
    return { hasPaid: false, periodLabel: '', amount: 5000, paymentDate: null };
  }
}
