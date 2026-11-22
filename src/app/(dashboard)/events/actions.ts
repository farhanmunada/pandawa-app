'use server';

import { db } from '@/lib/db';
import {
  events,
  eventDuesSchedules,
  periods,
  user,
  letters,
} from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { getCurrentUserSession } from '@/lib/auth/guard';

async function checkEventPermission() {
  const session = await getCurrentUserSession();
  if (!session?.user) return false;
  const roles = session.roles || [];
  return (
    roles.includes('super_admin') ||
    roles.includes('ketua_umum') ||
    roles.includes('wakil_ketua') ||
    roles.includes('divisi_acara') ||
    roles.includes('divisi_humas')
  );
}

export async function getEventsList() {
  try {
    const list = await db
      .select({
        id: events.id,
        title: events.title,
        description: events.description,
        location: events.location,
        startTime: events.startTime,
        endTime: events.endTime,
        status: events.status,
        plannedBudget: events.plannedBudget,
        kasAllocation: events.kasAllocation,
        externalSponsorAmount: events.externalSponsorAmount,
        hasSpecialDues: events.hasSpecialDues,
        picName: user.name,
      })
      .from(events)
      .innerJoin(user, eq(events.picUserId, user.id))
      .orderBy(desc(events.startTime));

    return { success: true, data: list };
  } catch (error: unknown) {
    return {
      success: false,
      data: [],
      message: error instanceof Error ? error.message : 'Gagal memuat agenda.',
    };
  }
}

export async function createEventAction(data: {
  title: string;
  description: string;
  location: string;
  startTime: string;
  endTime: string;
  plannedBudget: number;
  kasAllocation: number;
  externalSponsorAmount: number;
  hasSpecialDues: boolean;
  targetDuesPerMember?: number;
  duesDueDate?: string;
  picUserId?: string;
}) {
  try {
    if (!(await checkEventPermission())) {
      return {
        success: false,
        message: 'FORBIDDEN: Hanya Divisi Acara, Humas, atau Pimpinan yang dapat menjadwalkan agenda.',
      };
    }

    const activePeriod = await db.query.periods.findFirst({
      where: eq(periods.isActive, true),
    });

    if (!activePeriod) return { success: false, message: 'Tidak ada periode aktif.' };

    const insertedEvent = await db
      .insert(events)
      .values({
        periodId: activePeriod.id,
        title: data.title,
        description: data.description,
        location: data.location,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        plannedBudget: data.plannedBudget,
        kasAllocation: data.kasAllocation,
        externalSponsorAmount: data.externalSponsorAmount,
        hasSpecialDues: data.hasSpecialDues,
        picUserId: data.picUserId || 'usr_demo_0000',
        createdBy: data.picUserId || 'usr_demo_0000',
      })
      .returning({ id: events.id });

    const newEventId = insertedEvent[0]?.id;

    // Jika agenda memungut iuran khusus anggota, buat jadwal penagihannya
    if (newEventId && data.hasSpecialDues && data.targetDuesPerMember && data.duesDueDate) {
      await db.insert(eventDuesSchedules).values({
        eventId: newEventId,
        targetAmountPerMember: data.targetDuesPerMember,
        dueDate: data.duesDueDate,
        notes: `Iuran khusus untuk kegiatan: ${data.title}`,
      });
    }

    revalidatePath('/events');
    return { success: true, message: 'Agenda kegiatan berhasil dibuat dan tersinkronisasi.' };
  } catch (error: unknown) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Gagal membuat agenda kegiatan.',
    };
  }
}

export async function getEventSoundingData(eventId: number) {
  try {
    const session = await getCurrentUserSession();
    const roles = session?.roles || [];
    const isAllowed = roles.some((r) =>
      ['super_admin', 'ketua_umum', 'wakil_ketua', 'divisi_humas'].includes(r)
    );
    if (!isAllowed) {
      return {
        success: false,
        data: null,
        message: 'FORBIDDEN: Hanya Divisi Humas dan Pimpinan yang dapat mengakses draf sounding.',
      };
    }

    const event = await db.query.events.findFirst({
      where: eq(events.id, eventId),
    });

    if (!event) return { success: false, data: null };

    const duesSchedule = await db.query.eventDuesSchedules.findFirst({
      where: eq(eventDuesSchedules.eventId, eventId),
    });

    let letterNumber = '-';
    if (event.associatedLetterId) {
      const letRecord = await db.query.letters.findFirst({
        where: eq(letters.id, event.associatedLetterId),
      });
      if (letRecord) letterNumber = letRecord.letterNumber;
    }

    const startDate = new Date(event.startTime).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    // Format pesan broadcast tanpa emoticon sesuai aturan
    const soundingText = [
      `*PEMBERITAHUAN KEGIATAN KEPEMUDAAN PANDAWA*`,
      `Agenda: ${event.title}`,
      `Waktu: ${startDate} WIB`,
      `Lokasi: ${event.location}`,
      ``,
      `*Rincian Sumber Anggaran:*`,
      `- Alokasi Kas Organisasi: Rp ${Number(event.kasAllocation).toLocaleString('id-ID')}`,
      `- Sumber Sponsor/Luar: Rp ${Number(event.externalSponsorAmount).toLocaleString('id-ID')}`,
      `- Total Kebutuhan Anggaran: Rp ${Number(event.plannedBudget).toLocaleString('id-ID')}`,
      duesSchedule
        ? [
            ``,
            `*Iuran Anggota:*`,
            `- Besaran Iuran: Rp ${Number(duesSchedule.targetAmountPerMember).toLocaleString('id-ID')} / orang`,
            `- Batas Penyetoran: ${duesSchedule.dueDate}`,
            `- Rekening/Tempat: Kas Bendahara Pandawa / Sie Acara`,
          ].join('\n')
        : '',
      ``,
      letterNumber !== '-' ? `Surat Resmi No: ${letterNumber}` : '',
      `Harap seluruh rekan pengurus dan anggota berpartisipasi aktif. Terima kasih.`,
    ]
      .filter(Boolean)
      .join('\n');

    return {
      success: true,
      data: {
        event,
        duesSchedule,
        soundingText,
      },
    };
  } catch (error: unknown) {
    return {
      success: false,
      data: null,
      message: error instanceof Error ? error.message : 'Gagal menghasilkan sounding.',
    };
  }
}
