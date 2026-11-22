'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, Bell } from 'lucide-react';

interface HeaderBarProps {
  onOpenDrawer?: () => void;
  activePeriodName?: string;
  userName?: string;
}

export function HeaderBar({
  onOpenDrawer,
  activePeriodName = '2026–2028',
  userName = 'Pengurus',
}: HeaderBarProps) {
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
          <div className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded-md border border-slate-200 bg-white p-0.5">
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

      <div className="flex items-center gap-2">
        <button
          type="button"
          className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
          aria-label="Notifikasi"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#D8AC41]" />
        </button>

        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-900 text-xs font-bold text-[#D8AC41]">
          {userName.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
}
