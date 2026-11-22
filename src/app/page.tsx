import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { TrendingUp, ArrowRight } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { getCurrentUserSession } from '@/lib/auth/guard';
import { getDashboardAggregates, formatIDR, formatDate } from '@/lib/dashboard/queries';
import { getDashboardModules, getQuickActions } from '@/lib/dashboard/modules';

export default async function HomePage() {
  const sessionData = await getCurrentUserSession();

  if (!sessionData?.user) {
    redirect('/sign-in');
  }

  const { user, roles: userRoles, member } = sessionData;

  const isSuperAdmin = userRoles.includes('super_admin');
  const roleFlags = {
    isSuperAdmin,
    isLeader: isSuperAdmin || userRoles.includes('ketua_umum') || userRoles.includes('wakil_ketua'),
    isKetuaUmum: isSuperAdmin || userRoles.includes('ketua_umum'),
    isWakilKetua: isSuperAdmin || userRoles.includes('wakil_ketua'),
    isSecretary: isSuperAdmin || userRoles.includes('sekretaris'),
    isFinance: isSuperAdmin || userRoles.includes('bendahara'),
    isEvents: isSuperAdmin || userRoles.includes('divisi_acara'),
    isHumas: isSuperAdmin || userRoles.includes('divisi_humas'),
    isLogistics: isSuperAdmin || userRoles.includes('divisi_logistik'),
    isSecurity: isSuperAdmin || userRoles.includes('divisi_keamanan'),
  };

  const memberCode = member?.memberNumber || (isSuperAdmin ? '0000' : '0001');
  const memberTitle = member?.positionTitle || (isSuperAdmin ? 'Super Administrator' : 'Anggota');
  const memberDivision = member?.division || 'BPH';

  const data = await getDashboardAggregates();
  const quickActions = getQuickActions(roleFlags);
  const modules = getDashboardModules(roleFlags);

  const stats = [
    {
      label: 'Saldo Kas Organisasi',
      value: formatIDR(data.totalKas),
      meta: `${data.activeWallets} Dompet Kas Terdata`,
      visible: roleFlags.isFinance || roleFlags.isLeader,
    },
    {
      label: 'Anggota Aktif',
      value: `${data.activeMembers} Anggota`,
      meta: 'Basis Data Keanggotaan',
      visible: roleFlags.isLeader,
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
      meta: `${data.totalAssetKinds} Kategori Aset`,
      visible: true,
    },
    {
      label: 'Laporan & Kasus',
      value: `${data.openIncidents} Kasus Aktif`,
      meta: 'Divisi Keamanan',
      visible: roleFlags.isSecurity || roleFlags.isLeader,
    },
    {
      label: 'Surat Masuk / Draf',
      value: `${data.pendingLetters} Menunggu Sah`,
      meta: 'Kesekretariatan',
      visible: roleFlags.isSecretary || roleFlags.isLeader,
    },
  ].filter((s) => s.visible);

  return (
    <AppShell userName={user.name} userRole={memberTitle}>
      <div className="space-y-6">
        {/* Banner Profil Pengurus Sesuai RBAC */}
        <div className="rounded-2xl bg-slate-50/80 p-5 md:p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl bg-white p-1.5 shadow-xs">
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
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold tracking-tight text-slate-900">
                    {user.name}
                  </span>
                  <span className="rounded-full bg-slate-900 px-2.5 py-0.5 text-[10px] font-bold text-[#D8AC41]">
                    {memberCode}
                  </span>
                  <span className="rounded-full bg-[#D8AC41]/15 px-2.5 py-0.5 text-[10px] font-bold text-[#9A6B0A]">
                    {memberDivision}
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-600 mt-0.5">
                  {memberTitle} &bull; Wanangsri, Wonoboyo
                </p>
              </div>
            </div>

            {/* Tombol Aksi Cepat Berbasis Peran */}
            <div className="flex items-center gap-2 flex-wrap">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.label}
                    href={action.href}
                    className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                      action.primary
                        ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-xs'
                        : 'bg-white text-slate-700 hover:bg-slate-100/80 shadow-xs'
                    }`}
                  >
                    <Icon className={`h-3.5 w-3.5 ${action.primary ? 'text-[#D8AC41]' : 'text-slate-500'}`} />
                    <span>{action.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Ringkasan Indikator Kinerja */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl bg-slate-50/90 p-4 shadow-xs"
            >
              <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                {s.label}
              </p>
              <p className="mt-1 text-base font-bold text-slate-900 truncate">
                {s.value}
              </p>
              <div className="mt-1.5 flex items-center text-[10px] text-[#9A6B0A] font-semibold">
                <TrendingUp className="mr-1 h-3 w-3 shrink-0" />
                <span className="truncate">{s.meta}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Grid Modul Operasional dengan Highlight Peran RBAC */}
        <div>
          <div className="mb-3.5 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Modul Layanan Organisasi
            </h3>
            <span className="text-[10px] font-medium text-slate-400">
              {modules.length} Modul Terotorisasi
            </span>
          </div>

          <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {modules.map((m) => {
              const Icon = m.icon;
              return (
                <Link
                  key={m.title}
                  href={m.href}
                  className={`group relative flex flex-col justify-between rounded-2xl p-5 shadow-xs transition-all cursor-pointer ${
                    m.isPrimary
                      ? 'bg-[#D8AC41]/10 hover:bg-[#D8AC41]/15 shadow-sm'
                      : 'bg-slate-50/70 hover:bg-slate-100/70'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${
                          m.isPrimary
                            ? 'bg-slate-900 text-[#D8AC41]'
                            : 'bg-white text-slate-700 shadow-2xs'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider ${
                          m.isPrimary ? 'text-[#9A6B0A]' : 'text-slate-400'
                        }`}
                      >
                        {m.division}
                      </span>
                    </div>

                    <h4 className="mt-3.5 text-xs font-bold text-slate-900 group-hover:text-slate-950 transition-colors">
                      {m.title}
                    </h4>
                    <p className="mt-1 text-[11px] text-slate-500 leading-relaxed">
                      {m.desc}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center text-[11px] font-semibold text-slate-700 group-hover:text-slate-900">
                    <span>{m.isPrimary ? 'Akses Pengelolaan' : 'Buka Modul'}</span>
                    <ArrowRight className="ml-1 h-3 w-3 text-slate-400 group-hover:text-[#9A6B0A] transition-transform group-hover:translate-x-0.5" />
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
