'use server';

import { db } from '@/lib/db';
import { events, letters, cashTransactions, assetLoans, incidents } from '@/lib/db/schema';
import { eq, gte, asc, count, ne, and } from 'drizzle-orm';
import { getCurrentUserSession } from '@/lib/auth/guard';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'EVENT' | 'LETTER' | 'FINANCE' | 'INVENTORY' | 'INCIDENT';
  href: string;
  isUrgent?: boolean;
}

export async function getNotificationsAction(): Promise<{
  success: boolean;
  data: NotificationItem[];
}> {
  try {
    const session = await getCurrentUserSession();
    if (!session?.user) {
      return { success: true, data: [] };
    }

    const { user: currentUser, roles } = session;
    const isSuperAdmin = roles.includes('super_admin');
    const isLeader =
      isSuperAdmin || roles.includes('ketua_umum') || roles.includes('wakil_ketua');
    const isSecretary = isSuperAdmin || roles.includes('sekretaris');
    const isFinance = isSuperAdmin || roles.includes('bendahara');
    const isLogistics = isLeader || roles.includes('divisi_logistik');
    const isSecurityOrLeader = isLeader || roles.includes('divisi_keamanan');

    const alerts: NotificationItem[] = [];

    // 1. Pengingat Agenda Terdekat (Untuk Semua Akun & Anggota)
    const upcomingEvents = await db.query.events.findMany({
      where: gte(events.startTime, new Date()),
      orderBy: [asc(events.startTime)],
      limit: 2,
    });

    for (const ev of upcomingEvents) {
      const formattedDate = new Date(ev.startTime).toLocaleDateString('id-ID', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
      alerts.push({
        id: `ev-${ev.id}`,
        title: `Agenda: ${ev.title}`,
        message: `Jadwal ${formattedDate} WIB di ${ev.location}.${
          ev.hasSpecialDues ? ' Memungut iuran kegiatan.' : ''
        }`,
        time: formattedDate,
        type: 'EVENT',
        href: '/events',
      });
    }

    // 2. Notifikasi Persuratan (BPH & Sekretaris)
    if (isSecretary || isLeader) {
      const pendingLetters = await db
        .select({ total: count() })
        .from(letters)
        .where(eq(letters.status, 'PENDING_APPROVAL'));

      const num = Number(pendingLetters[0]?.total || 0);
      if (num > 0) {
        alerts.push({
          id: 'letters-pending',
          title: 'Verifikasi Persuratan',
          message: `${num} draf surat resmi keluar menunggu tinjauan dan tanda tangan digital.`,
          time: 'Menunggu',
          type: 'LETTER',
          href: '/letters',
          isUrgent: true,
        });
      }
    }

    // 3. Notifikasi Pengesahan Kas (Bendahara & Ketua Umum)
    if (isFinance || isLeader) {
      const pendingTrx = await db
        .select({ total: count() })
        .from(cashTransactions)
        .where(eq(cashTransactions.status, 'PENDING_APPROVAL'));

      const num = Number(pendingTrx[0]?.total || 0);
      if (num > 0) {
        alerts.push({
          id: 'finance-pending',
          title: 'Persetujuan Kas Masuk / Keluar',
          message: `${num} mutasi transaksi kas organisasi menunggu konfirmasi.`,
          time: 'Menunggu',
          type: 'FINANCE',
          href: '/finance',
          isUrgent: true,
        });
      }
    }

    // 4. Notifikasi Inventaris Pinjam / Sewa (Divisi Logistik & BPH)
    if (isLogistics) {
      const activeLoans = await db
        .select({ total: count() })
        .from(assetLoans)
        .where(eq(assetLoans.status, 'BORROWED'));

      const num = Number(activeLoans[0]?.total || 0);
      if (num > 0) {
        alerts.push({
          id: 'inventory-active',
          title: 'Sirkulasi Aset Inventaris',
          message: `${num} peminjaman aset aktif sedang berjalan di masyarakat.`,
          time: 'Sedang Dipinjam',
          type: 'INVENTORY',
          href: '/inventory',
        });
      }
    }

    // 5. Notifikasi Laporan Pengaduan & Keamanan
    if (isSecurityOrLeader) {
      const openIncidents = await db
        .select({ total: count() })
        .from(incidents)
        .where(eq(incidents.status, 'OPEN'));

      const num = Number(openIncidents[0]?.total || 0);
      if (num > 0) {
        alerts.push({
          id: 'incidents-open',
          title: 'Laporan Ketertiban Terbuka',
          message: `${num} laporan pengaduan warga belum ditunjuk PIC penanganan.`,
          time: 'Perlu PIC',
          type: 'INCIDENT',
          href: '/incidents',
          isUrgent: true,
        });
      }
    } else {
      // Anggota biasa: Pantau status laporan milik sendiri
      const myActiveReports = await db
        .select({ total: count() })
        .from(incidents)
        .where(
          and(
            eq(incidents.reporterUserId, currentUser.id),
            ne(incidents.status, 'RESOLVED')
          )
        );

      const num = Number(myActiveReports[0]?.total || 0);
      if (num > 0) {
        alerts.push({
          id: 'my-incidents',
          title: 'Status Laporan Anda',
          message: `${num} tiket aspirasi/pengaduan Anda sedang diproses oleh divisi keamanan.`,
          time: 'Dalam Proses',
          type: 'INCIDENT',
          href: '/incidents',
        });
      }
    }

    return { success: true, data: alerts };
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    return { success: false, data: [] };
  }
}
