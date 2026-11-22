'use client';

import React from 'react';
import { Menu, Bell } from 'lucide-react';

interface HeaderBarProps {
  onOpenDrawer?: () => void;
  activePeriodName?: string;
  userName?: string;
}

export function HeaderBar({
  onOpenDrawer,
  activePeriodName = 'Periode 2026–2028',
  userName = 'Pengurus',
}: HeaderBarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-neutral-200 bg-white/90 px-4 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-950/90">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenDrawer}
          className="rounded-lg p-2 text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
          aria-label="Buka Menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-sm font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Pandawa App
          </h1>
          <span className="text-[10px] font-medium text-blue-600 dark:text-blue-400">
            {activePeriodName}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          className="relative rounded-lg p-2 text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
          aria-label="Notifikasi"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
        </button>

        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
          {userName.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
}
