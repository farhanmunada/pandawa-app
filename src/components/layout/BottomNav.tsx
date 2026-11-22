'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Wallet, FileText, Package, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Beranda', href: '/', icon: Home },
    { label: 'Kalender', href: '/events', icon: Calendar },
    { label: 'Kas', href: '/finance', icon: Wallet },
    { label: 'Surat', href: '/letters', icon: FileText },
    { label: 'Inventaris', href: '/inventory', icon: Package },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 border-t border-neutral-200 bg-white/95 px-2 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-950/95 md:hidden">
      <div className="mx-auto flex w-full max-w-md items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center py-1 transition-colors',
                isActive
                  ? 'text-blue-600 dark:text-blue-400 font-semibold'
                  : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="mt-1 text-[11px] leading-none">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
