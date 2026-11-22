'use server';

import { db } from '@/lib/db';
import { members, user, account, periods, auditLogs } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export interface CreateMemberInput {
  name: string;
  email: string;
  phone: string;
  positionTitle: string;
  division: string;
  memberNumber?: string;
  password?: string;
}

export interface UpdateMemberInput {
  memberId: number;
  name: string;
  email: string;
  phone: string;
  positionTitle: string;
  division: string;
  status: string;
  memberNumber?: string;
  password?: string;
}

export async function getMembersList(divisionFilter?: string) {
  try {
    const activePeriod = await db.query.periods.findFirst({
      where: eq(periods.isActive, true),
    });

    if (!activePeriod) {
      return { success: false, data: [], message: 'Tidak ada periode aktif.' };
    }

    const conditions = [eq(members.periodId, activePeriod.id)];
    if (divisionFilter && divisionFilter !== 'ALL') {
      conditions.push(eq(members.division, divisionFilter));
    }

    const result = await db
      .select({
        id: members.id,
        memberNumber: members.memberNumber,
        positionTitle: members.positionTitle,
        division: members.division,
        status: members.status,
        joinedAt: members.joinedAt,
        userName: user.name,
        userEmail: user.email,
        userPhone: user.phone,
      })
      .from(members)
      .innerJoin(user, eq(members.userId, user.id))
      .where(and(...conditions));

    return { success: true, data: result };
  } catch (error: unknown) {
    return { success: false, data: [], message: error instanceof Error ? error.message : 'Gagal memuat anggota.' };
  }
}

export async function createMemberAction(input: CreateMemberInput) {
  try {
    const activePeriod = await db.query.periods.findFirst({
      where: eq(periods.isActive, true),
    });

    if (!activePeriod) {
      return { success: false, message: 'Tidak ada periode aktif.' };
    }

    const userId = `usr_${Date.now()}`;

    // 1. Simpan user
    await db.insert(user).values({
      id: userId,
      name: input.name,
      email: input.email,
      phone: input.phone,
      emailVerified: true,
      isActive: true,
    });

    // 2. Simpan kredensial login (enrollment oleh Wakil Ketua)
    await db.insert(account).values({
      id: `acc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      accountId: userId,
      providerId: 'credential',
      userId,
      password: input.password || 'Pandawa123!',
    });

    // 3. Simpan member dengan nomor kode angka
    const [newMember] = await db
      .insert(members)
      .values({
        userId,
        periodId: activePeriod.id,
        memberNumber: input.memberNumber || `1${Date.now().toString().slice(-3)}`,
        positionTitle: input.positionTitle,
        division: input.division,
        status: 'active',
      })
      .returning({ id: members.id });

    // 4. Catat jejak audit
    await db.insert(auditLogs).values({
      action: 'CREATE_MEMBER',
      targetTable: 'members',
      recordId: String(newMember?.id || userId),
      newData: { ...input, memberNumber: input.memberNumber || `1${Date.now().toString().slice(-3)}` },
    });

    revalidatePath('/internal/members');
    return { success: true, message: 'Anggota berhasil ditambahkan.' };
  } catch (error: unknown) {
    return { success: false, message: error instanceof Error ? error.message : 'Gagal menambahkan anggota.' };
  }
}

export async function updateMemberAction(input: UpdateMemberInput) {
  try {
    const existingMember = await db.query.members.findFirst({
      where: eq(members.id, input.memberId),
    });

    if (!existingMember) {
      return { success: false, message: 'Data anggota tidak ditemukan.' };
    }

    // 1. Perbarui data user
    await db
      .update(user)
      .set({
        name: input.name,
        email: input.email,
        phone: input.phone,
        updatedAt: new Date(),
      })
      .where(eq(user.id, existingMember.userId));

    // 2. Perbarui data member
    await db
      .update(members)
      .set({
        positionTitle: input.positionTitle,
        division: input.division,
        status: input.status,
        memberNumber: input.memberNumber || existingMember.memberNumber,
      })
      .where(eq(members.id, input.memberId));

    // 3. Perbarui kata sandi jika diisi oleh Wakil Ketua
    if (input.password && input.password.length >= 8) {
      await db
        .update(account)
        .set({
          password: input.password,
          updatedAt: new Date(),
        })
        .where(and(eq(account.userId, existingMember.userId), eq(account.providerId, 'credential')));
    }

    // 4. Catat jejak audit
    await db.insert(auditLogs).values({
      action: 'UPDATE_MEMBER',
      targetTable: 'members',
      recordId: String(input.memberId),
      oldData: existingMember,
      newData: input,
    });

    revalidatePath('/internal/members');
    return { success: true, message: 'Data anggota berhasil diperbarui.' };
  } catch (error: unknown) {
    return { success: false, message: error instanceof Error ? error.message : 'Gagal memperbarui data anggota.' };
  }
}

export async function deleteMemberAction(memberId: number) {
  try {
    const existingMember = await db.query.members.findFirst({
      where: eq(members.id, memberId),
    });

    if (!existingMember) {
      return { success: false, message: 'Data anggota tidak ditemukan.' };
    }

    // 1. Hapus record member
    await db.delete(members).where(eq(members.id, memberId));

    // 2. Catat jejak audit
    await db.insert(auditLogs).values({
      action: 'DELETE_MEMBER',
      targetTable: 'members',
      recordId: String(memberId),
      oldData: existingMember,
    });

    revalidatePath('/internal/members');
    return { success: true, message: 'Anggota berhasil dihapus dari sistem.' };
  } catch (error: unknown) {
    return { success: false, message: error instanceof Error ? error.message : 'Gagal menghapus anggota.' };
  }
}
