'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, Bell, LogOut, User as UserIcon } from 'lucide-react';
import { logoutAction } from '@/app/(auth)/actions';

interface HeaderBarProps {
  onOpenDrawer?: () => void;
  activePeriodName?: string;
  userName?: string;
  userRole?: string;
}

export function HeaderBar({
  onOpenDrawer,
  activePeriodName = '2026–2028',
  userName = 'Pengurus',
  userRole = 'Anggota Organisasi',
}: HeaderBarProps) {
  const router = useRouter();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const displayName = userName || 'Pengurus';
  const initial = displayName.charAt(0).toUpperCase();

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
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-100/80 bg-white/95 px-4 md:px-8 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenDrawer}
          className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-50 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer md:hidden"
          aria-label="Buka Menu"
        >
          <Menu className="h-4 w-4" />
        </button>

        <Link href="/" className="flex items-center gap-2.5 md:hidden">
          <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-2xl bg-slate-50 p-1 shadow-2xs">
            <Image
              src="/favicon.png"
              alt="Logo Pandawa"
              width={32}
              height={32}
              className="h-full w-full object-contain"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold tracking-tight text-slate-900 leading-none">
              PANDAWA
            </span>
            <span className="text-[10px] font-medium text-[#B4821E] leading-tight">
              Periode {activePeriodName}
            </span>
          </div>
        </Link>

        {/* Desktop Header Title */}
        <div className="hidden md:flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">
            Sistem Informasi Operasional
          </span>
          <span className="text-slate-300">&bull;</span>
          <span className="rounded-full bg-[#D8AC41]/15 px-2.5 py-0.5 text-[10px] font-bold text-[#B4821E]">
            Periode {activePeriodName}
          </span>
        </div>
      </div>

      <div className="relative flex items-center gap-2">
        <button
          type="button"
          className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Notifikasi"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#D8AC41]" />
        </button>

        <button
          type="button"
          onClick={() => setShowProfileMenu((prev) => !prev)}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-xs font-bold text-[#D8AC41] hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Menu Pengguna"
        >
          {initial}
        </button>

        {showProfileMenu && (
          <div className="absolute right-0 top-11 z-50 w-52 rounded-2xl bg-white p-2 shadow-xl border border-slate-100">
            <div className="border-b border-slate-100 px-3 py-2">
              <p className="text-xs font-bold text-slate-900 truncate">{displayName}</p>
              <p className="text-[10px] text-slate-400 truncate">{userRole}</p>
            </div>
            <div className="mt-1 space-y-0.5">
              <Link
                href="/internal/members"
                onClick={() => setShowProfileMenu(false)}
                className="flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <UserIcon className="h-3.5 w-3.5 text-slate-400" />
                <span>Direktori Pengurus</span>
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5 text-rose-600" />
                <span>Keluar Akun</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
