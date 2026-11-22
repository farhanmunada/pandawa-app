import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { TrendingUp, ArrowRight, Plus } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { getCurrentUserSession } from '@/lib/auth/guard';
import { getDashboardAggregates, formatIDR, formatDate } from '@/lib/dashboard/queries';
import {
  WalletSummaryCard,
  EventSummaryCard,
  AssetSummaryCard,
  LetterSummaryCard,
  IncidentSummaryCard,
} from '@/components/dashboard/DashboardSummaries';

export default async function HomePage() {
  const sessionData = await getCurrentUserSession();

  if (!sessionData?.user) {
    redirect('/sign-in');
  }

  const { user, roles: userRoles, member } = sessionData;

  const isSuperAdmin = userRoles.includes('super_admin');
  const isLeader = isSuperAdmin || userRoles.includes('ketua_umum') || userRoles.includes('wakil_ketua');
  const isSecretary = isSuperAdmin || userRoles.includes('sekretaris');
  const isFinance = isSuperAdmin || userRoles.includes('bendahara');
  const isLogistics = isSuperAdmin || userRoles.includes('divisi_logistik');

  const memberCode = member?.memberNumber || (isSuperAdmin ? '0000' : '0001');
  const memberTitle = member?.positionTitle || (isSuperAdmin ? 'Super Administrator' : 'Anggota');
  const memberDivision = member?.division || 'BPH';

  const data = await getDashboardAggregates();

  // Focal point action button configuration per role
  const focalAction = isFinance
    ? { label: 'Catat Kas Masuk / Keluar', href: '/finance' }
    : isSecretary
    ? { label: 'Buat Draf Surat Resmi', href: '/letters' }
    : isLogistics
    ? { label: 'Proses Peminjaman Aset', href: '/inventory' }
    : isLeader
    ? { label: 'Tinjau Jejak Audit & Otorisasi', href: '/audit' }
    : { label: 'Ajukan Peminjaman Aset', href: '/inventory' };

  const stats = [
    {
      label: 'Saldo Kas Organisasi',
      value: formatIDR(data.totalKas),
      meta: `${data.activeWallets} Pos Dompet Aktif`,
      visible: isFinance || isLeader,
    },
    {
      label: 'Basis Anggota Aktif',
      value: `${data.activeMembers} Anggota`,
      meta: 'Struktur Kepengurusan',
      visible: isLeader,
    },
    {
      label: 'Agenda Terdekat',
      value: data.nextEvent ? data.nextEvent.title : 'Belum Ada Agenda',
      meta: data.nextEvent ? formatDate(new Date(data.nextEvent.startTime)) : 'Kalender Organisasi',
      visible: true,
    },
    {
      label: 'Inventaris Tersedia',
      value: `${data.availableAssets} Unit Siap`,
      meta: `${data.totalAssetKinds} Kategori Barang`,
      visible: true,
    },
  ].filter((s) => s.visible);

  return (
    <AppShell userName={user.name} userRole={memberTitle}>
      <div className="space-y-6">
        {/* Banner Profil Eksekutif Mengikuti Gaya Sign-In */}
        <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.04)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-slate-50 p-2 shadow-2xs">
                <Image
                  src="/favicon.png"
                  alt="Logo Pandawa"
                  width={56}
                  height={56}
                  className="h-full w-full object-contain"
                  priority
                />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-base font-bold tracking-tight text-slate-900">
                    {user.name}
                  </span>
                  <span className="rounded-full bg-slate-900 px-2.5 py-0.5 text-[10px] font-bold text-[#D8AC41]">
                    {memberCode}
                  </span>
                  <span className="rounded-full bg-[#D8AC41]/15 px-2.5 py-0.5 text-[10px] font-bold text-[#B4821E]">
                    {memberDivision}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {memberTitle} &bull; Wanangsri, Wonoboyo, Temanggung Regency
                </p>
              </div>
            </div>

            {/* Titik Poin Highlight Utama */}
            <Link
              href={focalAction.href}
              className="flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 transition-all cursor-pointer shrink-0"
            >
              <Plus className="h-4 w-4 text-[#D8AC41]" />
              <span>{focalAction.label}</span>
              <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
            </Link>
          </div>
        </div>

        {/* Ringkasan Indikator Kinerja Utama (Frameless Cards) */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-3xl bg-white p-5 sm:p-6 shadow-[0_12px_40px_rgba(0,0,0,0.03)]"
            >
              <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                {s.label}
              </p>
              <p className="mt-2 text-lg font-bold text-slate-900 truncate">
                {s.value}
              </p>
              <div className="mt-2 flex items-center text-[11px] text-[#B4821E] font-medium">
                <TrendingUp className="mr-1 h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{s.meta}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Ringkasan Data Operasional Nyata */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Ringkasan Kas & Dompet */}
          {(isFinance || isLeader) && (
            <WalletSummaryCard wallets={data.walletsList} totalKas={data.totalKas} />
          )}

          {/* Ringkasan Agenda Terdekat */}
          <EventSummaryCard events={data.upcomingEvents} />

          {/* Ringkasan Kesiapan Inventaris */}
          <AssetSummaryCard assets={data.recentAssets} />

          {/* Ringkasan Persuratan Resmi */}
          <LetterSummaryCard letters={data.recentLetters} />

          {/* Ringkasan Laporan & Keamanan */}
          <IncidentSummaryCard incidents={data.recentIncidents} />
        </div>
      </div>
    </AppShell>
  );
}
