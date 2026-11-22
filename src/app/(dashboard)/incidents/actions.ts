'use server';

import { db } from '@/lib/db';
import { incidents, incidentAssignees, incidentLogs } from '@/lib/db/schema';
import { eq, desc, or, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { uploadToDrive } from '@/lib/gdrive/client';
import { getCurrentUserSession } from '@/lib/auth/guard';

async function checkSecurityPermission() {
  const session = await getCurrentUserSession();
  if (!session?.user) return false;
  const roles = session.roles || [];
  return (
    roles.includes('super_admin') ||
    roles.includes('ketua_umum') ||
    roles.includes('wakil_ketua') ||
    roles.includes('divisi_keamanan')
  );
}

export async function getIncidentsList(userId: string, userRoles: string[]) {
  try {
    const isSecurityOrLeader =
      userRoles.includes('divisi_keamanan') ||
      userRoles.includes('ketua_umum') ||
      userRoles.includes('wakil_ketua');

    let query;

    if (isSecurityOrLeader) {
      // Pimpinan & Divisi Keamanan memiliki hak melihat semua laporan (publik dan rahasia)
      query = db
        .select({
          id: incidents.id,
          title: incidents.title,
          category: incidents.category,
          description: incidents.description,
          location: incidents.location,
          incidentTime: incidents.incidentTime,
          urgency: incidents.urgency,
          isConfidential: incidents.isConfidential,
          status: incidents.status,
          reporterName: incidents.reporterName,
          reporterUserId: incidents.reporterUserId,
          proofDriveUrl: incidents.proofDriveUrl,
          createdAt: incidents.createdAt,
        })
        .from(incidents)
        .orderBy(desc(incidents.createdAt));
    } else {
      // Anggota biasa: Hanya melihat laporan publik ATAU laporan rahasia miliknya sendiri
      query = db
        .select({
          id: incidents.id,
          title: incidents.title,
          category: incidents.category,
          description: incidents.description,
          location: incidents.location,
          incidentTime: incidents.incidentTime,
          urgency: incidents.urgency,
          isConfidential: incidents.isConfidential,
          status: incidents.status,
          reporterName: incidents.reporterName,
          reporterUserId: incidents.reporterUserId,
          proofDriveUrl: incidents.proofDriveUrl,
          createdAt: incidents.createdAt,
        })
        .from(incidents)
        .where(
          or(
            eq(incidents.isConfidential, false),
            and(eq(incidents.isConfidential, true), eq(incidents.reporterUserId, userId))
          )
        )
        .orderBy(desc(incidents.createdAt));
    }

    const list = await query;
    return { success: true, data: list };
  } catch (error: unknown) {
    return {
      success: false,
      data: [],
      message: error instanceof Error ? error.message : 'Gagal memuat laporan pengaduan.',
    };
  }
}

export async function createIncidentAction(formData: FormData) {
  try {
    const title = formData.get('title') as string;
    const category = formData.get('category') as string;
    const description = formData.get('description') as string;
    const location = formData.get('location') as string;
    const incidentTime = formData.get('incidentTime') as string;
    const urgency = (formData.get('urgency') as 'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY') || 'MEDIUM';
    const isConfidential = formData.get('isConfidential') === 'true';
    const reporterName = formData.get('reporterName') as string;
    const reporterUserId = (formData.get('reporterUserId') as string) || 'demo_user_id';

    const proofFile = formData.get('proofFile') as File | null;
    let proofDriveId: string | null = null;
    let proofDriveUrl: string | null = null;

    if (proofFile && proofFile.size > 0) {
      const buffer = Buffer.from(await proofFile.arrayBuffer());
      const uploadRes = await uploadToDrive(
        buffer,
        `bukti_insiden_${Date.now()}_${proofFile.name}`,
        proofFile.type || 'image/webp',
        '05_LAPORAN_KEJADIAN'
      );
      if (uploadRes) {
        proofDriveId = uploadRes.fileId;
        proofDriveUrl = uploadRes.webViewLink;
      }
    }

    await db.insert(incidents).values({
      title,
      category,
      description,
      location,
      incidentTime: new Date(incidentTime),
      urgency,
      isConfidential,
      status: 'OPEN',
      reporterUserId,
      reporterName,
      proofDriveId,
      proofDriveUrl,
    });

    revalidatePath('/incidents');
    return { success: true, message: 'Laporan pengaduan berhasil dikirim.' };
  } catch (error: unknown) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Gagal mengirim laporan.',
    };
  }
}

export async function assignIncidentPicAction(incidentId: number, picUserId: string) {
  try {
    if (!(await checkSecurityPermission())) {
      return {
        success: false,
        message: 'FORBIDDEN: Hanya Divisi Keamanan atau Pimpinan yang berwenang menugaskan PIC.',
      };
    }

    await db.insert(incidentAssignees).values({
      incidentId,
      assignedUserId: picUserId,
    });

    await db
      .update(incidents)
      .set({ status: 'IN_PROGRESS' })
      .where(eq(incidents.id, incidentId));

    revalidatePath('/incidents');
    return { success: true, message: 'PIC lapangan berhasil ditugaskan.' };
  } catch (error: unknown) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Gagal menugaskan PIC.',
    };
  }
}

export async function addIncidentProgressLog(incidentId: number, authorUserId: string, actionTaken: string) {
  try {
    await db.insert(incidentLogs).values({
      incidentId,
      authorUserId,
      actionTaken,
    });

    revalidatePath('/incidents');
    return { success: true, message: 'Catatan progres mediasi berhasil ditambahkan.' };
  } catch (error: unknown) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Gagal mencatat progres.',
    };
  }
}

export async function resolveIncidentAction(incidentId: number) {
  try {
    if (!(await checkSecurityPermission())) {
      return {
        success: false,
        message: 'FORBIDDEN: Hanya Divisi Keamanan atau Pimpinan yang berwenang menyelesaikan insiden.',
      };
    }

    await db
      .update(incidents)
      .set({ status: 'RESOLVED' })
      .where(eq(incidents.id, incidentId));

    revalidatePath('/incidents');
    return { success: true, message: 'Status laporan diperbarui menjadi Selesai (Resolved).' };
  } catch (error: unknown) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Gagal menyelesaikan kasus.',
    };
  }
}
