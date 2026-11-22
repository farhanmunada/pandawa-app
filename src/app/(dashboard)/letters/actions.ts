'use server';

import { db } from '@/lib/db';
import { letters, letterDispositions, periods, user } from '@/lib/db/schema';
import { eq, desc, and, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

const ROMAN_MONTHS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

export async function generateNextLetterNumber(codeType: string, letterDateStr: string) {
  const d = new Date(letterDateStr);
  const year = d.getFullYear() || new Date().getFullYear();
  const monthIdx = d.getMonth() || new Date().getMonth();
  const romanMonth = ROMAN_MONTHS[monthIdx] || 'I';

  // Hitung jumlah surat keluar pada tahun ini
  const countRes = await db
    .select({ count: sql<number>`count(*)` })
    .from(letters)
    .where(and(eq(letters.direction, 'OUT'), eq(letters.year, year)));

  const nextSeq = Number(countRes[0]?.count || 0) + 1;
  const seqPadded = String(nextSeq).padStart(3, '0');

  const letterNumber = `${seqPadded}/${codeType}/KT/${romanMonth}/${year}`;
  return { sequenceNumber: nextSeq, year, letterNumber };
}

export async function getLettersList(directionFilter = 'ALL') {
  try {
    const conditions = [];
    if (directionFilter !== 'ALL') {
      conditions.push(eq(letters.direction, directionFilter));
    }

    const query = db
      .select({
        id: letters.id,
        direction: letters.direction,
        letterType: letters.letterType,
        letterNumber: letters.letterNumber,
        subject: letters.subject,
        sender: letters.sender,
        recipient: letters.recipient,
        letterDate: letters.letterDate,
        status: letters.status,
        primarySignatoryName: letters.primarySignatoryName,
        secondarySignatoryName: letters.secondarySignatoryName,
        signedAt: letters.signedAt,
        requestedByDivision: letters.requestedByDivision,
        creatorName: user.name,
      })
      .from(letters)
      .innerJoin(user, eq(letters.createdBy, user.id))
      .orderBy(desc(letters.createdAt));

    const result = conditions.length > 0 ? await query.where(and(...conditions)) : await query;
    return { success: true, data: result };
  } catch (error: unknown) {
    return {
      success: false,
      data: [],
      message: error instanceof Error ? error.message : 'Gagal memuat persuratan.',
    };
  }
}

export async function getLetterDetail(id: number) {
  try {
    const letter = await db.query.letters.findFirst({
      where: eq(letters.id, id),
    });

    if (!letter) return { success: false, data: null };

    const dispositions = await db
      .select({
        id: letterDispositions.id,
        instructions: letterDispositions.instructions,
        status: letterDispositions.status,
        createdAt: letterDispositions.createdAt,
        assignedName: user.name,
      })
      .from(letterDispositions)
      .innerJoin(user, eq(letterDispositions.assignedToUserId, user.id))
      .where(eq(letterDispositions.letterId, id));

    return { success: true, data: { ...letter, dispositions } };
  } catch (error: unknown) {
    return { success: false, data: null, message: error instanceof Error ? error.message : 'Gagal.' };
  }
}

export type LetterType =
  | 'UNDANGAN'
  | 'PERINGATAN'
  | 'GIRIK_IURAN'
  | 'SURAT_TUGAS'
  | 'PERMOHONAN'
  | 'REKOMENDASI'
  | 'SURAT_KEPUTUSAN'
  | 'SURAT_MASUK';

export async function createOutgoingLetterDraft(data: {
  letterType: LetterType;
  codeType: string;
  subject: string;
  recipient: string;
  letterDate: string;
  requestedByDivision: string;
  creatorUserId?: string;
}) {
  try {
    const activePeriod = await db.query.periods.findFirst({
      where: eq(periods.isActive, true),
    });

    if (!activePeriod) return { success: false, message: 'Tidak ada periode aktif.' };

    const { sequenceNumber, year, letterNumber } = await generateNextLetterNumber(
      data.codeType,
      data.letterDate
    );

    await db.insert(letters).values({
      periodId: activePeriod.id,
      direction: 'OUT',
      letterType: data.letterType,
      letterNumber,
      sequenceNumber,
      year,
      subject: data.subject,
      sender: 'Organisasi Kepemudaan Pandawa',
      recipient: data.recipient,
      letterDate: data.letterDate,
      status: 'PENDING_APPROVAL',
      requestedByDivision: data.requestedByDivision,
      primarySignatoryName: 'Ketua Umum Pandawa',
      secondarySignatoryName: 'Sekretaris Pandawa',
      createdBy: data.creatorUserId || 'usr_demo_0000',
    });

    revalidatePath('/letters');
    return { success: true, message: 'Draf surat keluar berhasil diajukan untuk disetujui.' };
  } catch (error: unknown) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Gagal membuat draf surat.',
    };
  }
}

export async function approveLetterAction(letterId: number) {
  try {
    await db
      .update(letters)
      .set({
        status: 'APPROVED',
        signedAt: new Date(),
      })
      .where(eq(letters.id, letterId));

    revalidatePath('/letters');
    return { success: true, message: 'Surat resmi telah disetujui dan ditandatangani.' };
  } catch (error: unknown) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Gagal menyetujui surat.',
    };
  }
}
