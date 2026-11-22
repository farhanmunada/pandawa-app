'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  Calendar,
  Megaphone,
  Package,
  Wallet,
  FileText,
  Users,
  ShieldAlert,
  ClipboardList,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { logoutAction } from '@/app/(auth)/actions';

interface SidebarProps {
  userName?: string;
  userRole?: string;
  userRoles?: string[];
}

export function Sidebar({
  userName = 'Pengurus',
  userRole = 'Anggota',
  userRoles = [],
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const isSuperAdmin = userRoles.includes('super_admin');
  const isLeader =
    isSuperAdmin || userRoles.includes('ketua_umum') || userRoles.includes('wakil_ketua');
  const isSecretary = isSuperAdmin || userRoles.includes('sekretaris');
  const isFinance = isSuperAdmin || userRoles.includes('bendahara');
  const isHumas = isSuperAdmin || userRoles.includes('divisi_humas');

  const rawMenuGroups = [
    {
      title: 'Ruang Publik & Anggota',
      items: [
        { label: 'Ringkasan & Transparansi', href: '/', icon: Home, visible: true },
        { label: 'Kalender Kegiatan', href: '/events', icon: Calendar, visible: true },
        { label: 'Katalog Pinjam Aset', href: '/inventory', icon: Package, visible: true },
        { label: 'Aspirasi & Pengaduan', href: '/incidents', icon: ShieldAlert, visible: true },
      ],
    },
    {
      title: 'Meja Kerja Pengurus',
      items: [
        {
          label: 'Buku Kas & Selapanan',
          href: '/finance',
          icon: Wallet,
          visible: isLeader || isFinance,
        },
        {
          label: 'Tata Kelola Persuratan',
          href: '/letters',
          icon: FileText,
          visible: isLeader || isSecretary,
        },
        {
          label: 'Broadcast Sounding',
          href: '/events/sounding',
          icon: Megaphone,
          visible: isLeader || isHumas,
        },
        {
          label: 'Administrasi Anggota',
          href: '/internal/members',
          icon: Users,
          visible: isLeader,
        },
        {
          label: 'Jejak Audit Sistem',
          href: '/audit',
          icon: ClipboardList,
          visible: isLeader,
        },
      ],
    },
  ];

  const menuGroups = rawMenuGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => item.visible),
    }))
    .filter((group) => group.items.length > 0);

  const allHrefs = menuGroups.flatMap((g) => g.items.map((i) => i.href));
  const activeHref = allHrefs
    .filter((href) =>
      href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/')
    )
    .sort((a, b) => b.length - a.length)[0];

  const handleSignOut = async () => {
    try {
      await logoutAction();
      router.push('/sign-in');
      router.refresh();
    } catch {
      router.push('/sign-in');
    }
  };

  return (
    <aside className="hidden md:flex w-72 shrink-0 flex-col justify-between bg-white shadow-[0_12px_40px_rgba(0,0,0,0.03)] h-screen sticky top-0 p-5 overflow-y-auto">
      <div className="space-y-6">
        {/* Header Identitas Brand */}
        <div className="flex items-center gap-3 px-2">
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-2xl bg-slate-50 p-1.5 shadow-2xs">
            <Image
              src="/favicon.png"
              alt="Logo Pandawa"
              width={40}
              height={40}
              className="h-full w-full object-contain"
              priority
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold tracking-tight text-slate-900 leading-none">
                PANDAWA
              </span>
              <span className="rounded-full bg-[#D8AC41]/15 px-2 py-0.5 text-[9px] font-bold text-[#B4821E] uppercase leading-none">
                Internal
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 truncate">Wanangsri, Wonoboyo</p>
          </div>
        </div>

        {/* Daftar Navigasi Berkelompok */}
        <nav className="space-y-5">
          {menuGroups.map((group) => (
            <div key={group.title} className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3">
                {group.title}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.href === activeHref;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'group flex items-center gap-2.5 rounded-2xl px-3.5 py-2.5 text-xs font-medium transition-all cursor-pointer',
                        isActive
                          ? 'bg-slate-900 text-white font-semibold shadow-xs'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      )}
                    >
                      <Icon
                        className={cn(
                          'h-4 w-4 shrink-0 transition-colors',
                          isActive ? 'text-[#D8AC41]' : 'text-slate-400 group-hover:text-slate-600'
                        )}
                      />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Profil Pengguna Aktif & Keluar */}
      <div className="pt-4 mt-4 border-t border-slate-100 space-y-2">
        <div className="flex items-center justify-between rounded-2xl bg-slate-50/80 p-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-900 truncate">{userName}</p>
            <p className="text-[10px] text-slate-400 truncate">{userRole}</p>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
            aria-label="Keluar"
            title="Keluar Akun"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
