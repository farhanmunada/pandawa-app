'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, Bell, LogOut, User as UserIcon } from 'lucide-react';
import { authClient } from '@/lib/auth/auth-client';

interface HeaderBarProps {
  onOpenDrawer?: () => void;
  activePeriodName?: string;
  userName?: string;
}

export function HeaderBar({
  onOpenDrawer,
  activePeriodName = '2026–2028',
}: HeaderBarProps) {
  const router = useRouter();
  const { data: sessionData } = authClient.useSession();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const currentUser = sessionData?.user;
  const displayName = currentUser?.name || 'Pengurus';
  const initial = displayName.charAt(0).toUpperCase();

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      router.push('/sign-in');
      router.refresh();
    } catch {
      router.push('/sign-in');
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenDrawer}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          aria-label="Buka Menu"
        >
          <Menu className="h-4 w-4" />
        </button>

        <Link href="/" className="flex items-center gap-2.5">
          <div className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded-md border border-slate-200 bg-white p-0.5 shadow-2xs">
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
      </div>

      <div className="relative flex items-center gap-2">
        <button
          type="button"
          className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
          aria-label="Notifikasi"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#D8AC41]" />
        </button>

        <button
          type="button"
          onClick={() => setShowProfileMenu((prev) => !prev)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-900 text-xs font-bold text-[#D8AC41] hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Menu Pengguna"
        >
          {initial}
        </button>

        {showProfileMenu && (
          <div className="absolute right-0 top-11 z-50 w-52 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
            <div className="border-b border-slate-100 px-2.5 py-2">
              <p className="text-xs font-bold text-slate-900 truncate">{displayName}</p>
              <p className="text-[10px] text-slate-500 truncate">{currentUser?.email || 'Akun Aktif'}</p>
            </div>
            <div className="mt-1 space-y-0.5">
              <Link
                href="/internal/members"
                onClick={() => setShowProfileMenu(false)}
                className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <UserIcon className="h-3.5 w-3.5 text-slate-400" />
                <span>Direktori Pengurus</span>
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
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
