'use server';

import { db } from '@/lib/db';
import { members, user, periods } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export interface CreateMemberInput {
  name: string;
  email: string;
  phone: string;
  positionTitle: string;
  division: string;
  memberNumber?: string;
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

    // 2. Simpan member
    await db.insert(members).values({
      userId,
      periodId: activePeriod.id,
      memberNumber: input.memberNumber || `ANG-${Date.now().toString().slice(-4)}`,
      positionTitle: input.positionTitle,
      division: input.division,
      status: 'active',
    });

    revalidatePath('/internal/members');
    return { success: true, message: 'Anggota berhasil ditambahkan.' };
  } catch (error: unknown) {
    return { success: false, message: error instanceof Error ? error.message : 'Gagal menambahkan anggota.' };
  }
}
