import React from 'react';
import Link from 'next/link';
import {
  Calendar,
  Wallet,
  FileText,
  Package,
  Users,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';

export default function HomePage() {
  const stats = [
    { label: 'Saldo Kas Aktif', value: 'Rp 14.250.000', change: '+Rp 750.000 bln ini' },
    { label: 'Agenda Terdekat', value: 'Kerja Bakti Akbar', change: '28 Nov 2026' },
    { label: 'Inventaris Tersedia', value: '18 Unit Aset', change: 'Harga Dalam & Luar' },
    { label: 'Status Laporan', value: '2 Tiket Ditangani', change: 'Divisi Keamanan' },
  ];

  const modules = [
    {
      title: 'Kalender Terpadu & Sounding',
      division: 'Divisi Humas',
      desc: 'Kelola agenda kegiatan yang tersinkron ke dashboard anggota & buat broadcast sounding WhatsApp.',
      href: '/events',
      icon: Calendar,
      color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
    },
    {
      title: 'Arus Kas & Iuran Rutin',
      division: 'Divisi Keuangan',
      desc: 'Buku kas multi-wallet, approval pengeluaran besar, dan pencatatan iuran wajib anggota.',
      href: '/finance',
      icon: Wallet,
      color: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300',
    },
    {
      title: 'Persuratan Resmi (TTD)',
      division: 'Kesekretariatan',
      desc: 'Penomoran surat otomatis, verifikasi draf surat divisi, dan arsip PDF resmi tanda tangan.',
      href: '/letters',
      icon: FileText,
      color: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300',
    },
    {
      title: 'Inventaris Harga Ganda',
      division: 'Divisi Logistik',
      desc: 'Katalog perlengkapan, sirkulasi pinjam warga (harga dalam) & sewa komersial (harga luar).',
      href: '/inventory',
      icon: Package,
      color: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
    },
    {
      title: 'Internal Anggota & Jabatan',
      division: 'Wakil Ketua',
      desc: 'Kelola struktur pengurus, pendaftaran anggota, penetapan jabatan, dan pembagian divisi.',
      href: '/internal/members',
      icon: Users,
      color: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300',
    },
    {
      title: 'Pengaduan: Publik vs Rahasia',
      division: 'Divisi Keamanan',
      desc: 'Aspirasi warga pada forum publik dan pelaporan insiden rahasia untuk mediasi lapangan.',
      href: '/incidents',
      icon: ShieldAlert,
      color: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
    },
  ];

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Banner Selamat Datang */}
        <div className="rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-800 p-5 text-white shadow-sm">
          <span className="inline-block rounded-full bg-blue-500/30 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-blue-100">
            Organisasi Kepemudaan
          </span>
          <h2 className="mt-2 text-xl font-bold tracking-tight">
            Selamat Datang di Pandawa App
          </h2>
          <p className="mt-1 text-xs text-blue-100/90 leading-relaxed">
            Platform terpadu administrasi, kas, kalender Humas, inventaris, dan penanganan insiden.
          </p>
        </div>

        {/* Ringkasan Cepat */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-neutral-200 bg-white p-3.5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900"
            >
              <p className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                {s.label}
              </p>
              <p className="mt-1 text-sm font-bold text-neutral-900 dark:text-neutral-100 truncate">
                {s.value}
              </p>
              <div className="mt-1 flex items-center text-[10px] text-blue-600 dark:text-blue-400 font-medium">
                <TrendingUp className="mr-1 h-3 w-3" />
                <span>{s.change}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Menu Modul Berdasarkan Divisi */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              Modul Divisi & Layanan
            </h3>
            <span className="text-[11px] font-medium text-neutral-500">
              6 Modul Terintegrasi
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {modules.map((m) => {
              const Icon = m.icon;
              return (
                <Link
                  key={m.title}
                  href={m.href}
                  className="group relative flex flex-col justify-between rounded-xl border border-neutral-200 bg-white p-4 shadow-xs transition hover:border-blue-400 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-blue-600"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${m.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
                        {m.division}
                      </span>
                    </div>
                    <h4 className="mt-3 text-sm font-bold text-neutral-900 group-hover:text-blue-600 dark:text-neutral-100 dark:group-hover:text-blue-400">
                      {m.title}
                    </h4>
                    <p className="mt-1 text-xs text-neutral-500 leading-relaxed dark:text-neutral-400">
                      {m.desc}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center text-xs font-semibold text-blue-600 dark:text-blue-400">
                    <span>Buka Modul</span>
                    <ArrowRight className="ml-1 h-3.5 w-3.5 transition group-hover:translate-x-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
