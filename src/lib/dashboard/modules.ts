import {
  Calendar,
  Wallet,
  FileText,
  Package,
  Users,
  ShieldAlert,
  ClipboardList,
  Plus,
  LucideIcon,
} from 'lucide-react';

export interface RoleFlags {
  isSuperAdmin: boolean;
  isLeader: boolean;
  isKetuaUmum: boolean;
  isWakilKetua: boolean;
  isSecretary: boolean;
  isFinance: boolean;
  isEvents: boolean;
  isHumas: boolean;
  isLogistics: boolean;
  isSecurity: boolean;
}

export interface QuickActionItem {
  label: string;
  href: string;
  icon: LucideIcon;
  primary: boolean;
}

export interface DashboardModuleItem {
  title: string;
  division: string;
  desc: string;
  href: string;
  icon: LucideIcon;
  isPrimary: boolean;
}

export function getQuickActions(flags: RoleFlags): QuickActionItem[] {
  const {
    isSuperAdmin,
    isLeader,
    isKetuaUmum,
    isWakilKetua,
    isSecretary,
    isFinance,
    isEvents,
    isHumas,
    isLogistics,
  } = flags;

  return [
    {
      label: 'Catat Kas',
      href: '/finance',
      icon: Plus,
      primary: true,
      visible: isFinance || isSuperAdmin,
    },
    {
      label: 'Draf Surat',
      href: '/letters',
      icon: Plus,
      primary: !isFinance && (isSecretary || isEvents || isHumas || isLogistics),
      visible: isSecretary || isEvents || isHumas || isLogistics || isSuperAdmin,
    },
    {
      label: 'Pinjam Aset',
      href: '/inventory',
      icon: Plus,
      primary: !isFinance && !isSecretary,
      visible: isLogistics || !isLeader || isSuperAdmin,
    },
    {
      label: 'Kelola Anggota',
      href: '/internal/members',
      icon: Users,
      primary: false,
      visible: isWakilKetua || isKetuaUmum || isSuperAdmin,
    },
    {
      label: 'Jejak Audit',
      href: '/audit',
      icon: ClipboardList,
      primary: false,
      visible: isLeader,
    },
  ]
    .filter((a) => a.visible)
    .map(({ label, href, icon, primary }) => ({ label, href, icon, primary }));
}

export function getDashboardModules(flags: RoleFlags): DashboardModuleItem[] {
  const {
    isSuperAdmin,
    isLeader,
    isWakilKetua,
    isSecretary,
    isFinance,
    isEvents,
    isHumas,
    isLogistics,
    isSecurity,
  } = flags;

  const list = [
    {
      title: 'Arus Kas & Iuran',
      division: 'Divisi Keuangan',
      desc: 'Multi-wallet kas operasional, persetujuan belanja, dan rekonsiliasi iuran.',
      href: '/finance',
      icon: Wallet,
      isPrimary: isFinance,
      visible: isFinance || isLeader,
    },
    {
      title: 'Persuratan Resmi',
      division: 'Kesekretariatan',
      desc: isSecretary
        ? 'Penomoran surat otomatis, verifikasi permohonan divisi, dan tanda tangan sah.'
        : 'Pengajuan draf surat resmi divisi, disposisi, dan arsip dokumen organisasi.',
      href: '/letters',
      icon: FileText,
      isPrimary: isSecretary,
      visible: isSecretary || isLeader || isEvents || isHumas || isLogistics || isSecurity,
    },
    {
      title: 'Kalender & Sounding',
      division: 'Divisi Humas & Acara',
      desc: isEvents || isHumas
        ? 'Agenda kegiatan terpadu, perencanaan RAB, dan siaran pesan WhatsApp.'
        : 'Jadwal agenda resmi kepemudaan dan informasi kegiatan berkala.',
      href: '/events',
      icon: Calendar,
      isPrimary: isEvents || isHumas,
      visible: true,
    },
    {
      title: 'Katalog Inventaris',
      division: 'Divisi Logistik',
      desc: isLogistics
        ? 'Katalog aset, sirkulasi pinjam warga subsidi, dan sewa komersial kas masuk.'
        : 'Peminjaman peralatan inventaris organisasi dengan tarif warga dan umum.',
      href: '/inventory',
      icon: Package,
      isPrimary: isLogistics,
      visible: true,
    },
    {
      title: 'Data Anggota & Jabatan',
      division: 'Wakil Ketua',
      desc: 'Pengelolaan struktur organisasi, status keanggotaan, dan penugasan divisi.',
      href: '/internal/members',
      icon: Users,
      isPrimary: isWakilKetua,
      visible: isLeader,
    },
    {
      title: 'Laporan & Penanganan Kasus',
      division: 'Divisi Keamanan',
      desc: isSecurity || isLeader
        ? 'Investigasi pengaduan rahasia, laporan fasilitas umum, dan penugasan petugas.'
        : 'Penyampaian aspirasi warga terbuka dan laporan insiden lingkungan aman.',
      href: '/incidents',
      icon: ShieldAlert,
      isPrimary: isSecurity,
      visible: true,
    },
    {
      title: 'Jejak Audit Sistem',
      division: 'Supervisi BPH',
      desc: 'Pencatatan rekam jejak aktivitas digital untuk menjamin transparansi organisasi.',
      href: '/audit',
      icon: ClipboardList,
      isPrimary: isSuperAdmin,
      visible: isLeader,
    },
  ];

  return list
    .filter((m) => m.visible)
    .sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0))
    .map(({ title, division, desc, href, icon, isPrimary }) => ({
      title,
      division,
      desc,
      href,
      icon,
      isPrimary,
    }));
}
