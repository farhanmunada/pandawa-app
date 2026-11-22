import React from 'react';
import Image from 'next/image';
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
  Plus,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';

export default function HomePage() {
  const stats = [
    { label: 'Saldo Kas Aktif', value: 'Rp 14.250.000', change: '+Rp 750.000 bln ini' },
    { label: 'Agenda Terdekat', value: 'Kerja Bakti Akbar', change: '28 Nov 2026' },
    { label: 'Inventaris Tersedia', value: '18 Unit Aset', change: 'Harga Dalam & Luar' },
    { label: 'Penanganan Kasus', value: '2 Laporan Ditangani', change: 'Divisi Keamanan' },
  ];

  const modules = [
    {
      title: 'Kalender & Sounding',
      division: 'Divisi Humas',
      desc: 'Agenda terintegrasi dan siaran pesan WhatsApp pengumuman kegiatan.',
      href: '/events',
      icon: Calendar,
    },
    {
      title: 'Arus Kas & Iuran',
      division: 'Divisi Keuangan',
      desc: 'Multi-wallet kas, approval pengeluaran, dan rekonsiliasi iuran rutin.',
      href: '/finance',
      icon: Wallet,
    },
    {
      title: 'Persuratan Resmi',
      division: 'Kesekretariatan',
      desc: 'Nomor surat otomatis, verifikasi draf divisi, dan pengesahan TTD sah.',
      href: '/letters',
      icon: FileText,
    },
    {
      title: 'Inventaris Harga Ganda',
      division: 'Divisi Logistik',
      desc: 'Katalog barang, pinjam warga subsidi, dan sewa komersial kas masuk.',
      href: '/inventory',
      icon: Package,
    },
    {
      title: 'Data Anggota & Jabatan',
      division: 'Wakil Ketua',
      desc: 'Pengelolaan struktur pengurus, status keanggotaan, dan penugasan divisi.',
      href: '/internal/members',
      icon: Users,
    },
    {
      title: 'Laporan Publik & Rahasia',
      division: 'Divisi Keamanan',
      desc: 'Aspirasi warga terbuka dan insiden rahasia berpenugasan petugas lapangan.',
      href: '/incidents',
      icon: ShieldAlert,
    },
  ];

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Hero Card Modern White with Logo */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-xs">
                <Image
                  src="/favicon.png"
                  alt="Logo Pandawa"
                  width={48}
                  height={48}
                  className="h-full w-full object-contain"
                  priority
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold tracking-tight text-slate-900">
                    ORGANISASI PANDAWA
                  </span>
                  <span className="rounded-full border border-[#D8AC41]/40 bg-[#D8AC41]/10 px-2 py-0.5 text-[9px] font-semibold text-[#B4821E]">
                    Aktif
                  </span>
                </div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  Sistem Informasi Administrasi & Operasional
                </h2>
                <p className="text-[11px] text-slate-500">
                  Wanangsri, Wonoboyo, Temanggung Regency
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/letters"
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5 text-slate-500" />
                Buat Surat
              </Link>
              <Link
                href="/finance"
                className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5 text-[#D8AC41]" />
                Catat Transaksi
              </Link>
            </div>
          </div>
        </div>

        {/* Ringkasan Cepat */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-slate-200 border-l-2 border-l-[#D8AC41] bg-white p-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
            >
              <p className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                {s.label}
              </p>
              <p className="mt-1 text-sm font-bold text-slate-900 truncate">
                {s.value}
              </p>
              <div className="mt-1 flex items-center text-[10px] text-[#B4821E] font-medium">
                <TrendingUp className="mr-1 h-3 w-3" />
                <span>{s.change}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Grid 6 Modul Divisi */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Modul Operasional
            </h3>
            <span className="text-[10px] font-medium text-slate-400">
              6 Modul Divisi
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {modules.map((m) => {
              const Icon = m.icon;
              return (
                <Link
                  key={m.title}
                  href={m.href}
                  className="group relative flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-[#D8AC41] hover:shadow-md transition-all cursor-pointer"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-800 group-hover:border-[#D8AC41]/40 group-hover:bg-[#D8AC41]/10 group-hover:text-[#B4821E] transition-colors">
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                        {m.division}
                      </span>
                    </div>

                    <h4 className="mt-3 text-xs font-bold text-slate-900 group-hover:text-[#B4821E] transition-colors">
                      {m.title}
                    </h4>
                    <p className="mt-1 text-[11px] text-slate-500 leading-relaxed">
                      {m.desc}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center text-[11px] font-semibold text-slate-700 group-hover:text-slate-900">
                    <span>Akses Layanan</span>
                    <ArrowRight className="ml-1 h-3 w-3 text-slate-400 group-hover:text-[#B4821E] transition-transform group-hover:translate-x-0.5" />
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
