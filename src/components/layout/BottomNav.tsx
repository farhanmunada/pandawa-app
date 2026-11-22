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
    { label: 'Agenda', href: '/events', icon: Calendar },
    { label: 'Kas', href: '/finance', icon: Wallet },
    { label: 'Surat', href: '/letters', icon: FileText },
    { label: 'Aset', href: '/inventory', icon: Package },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 border-t border-slate-100 bg-white/95 px-2 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] backdrop-blur-md md:hidden">
      <div className="mx-auto flex w-full max-w-md items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative flex flex-col items-center justify-center py-1 transition-colors cursor-pointer',
                isActive
                  ? 'text-slate-900 font-semibold'
                  : 'text-slate-400 hover:text-slate-700'
              )}
            >
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-2xl transition-colors',
                  isActive ? 'bg-[#D8AC41]/15 text-[#B4821E]' : ''
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              <span className="mt-0.5 text-[10px] leading-none tracking-tight">{item.label}</span>
              {isActive && (
                <span className="absolute bottom-0.5 h-1 w-1 rounded-full bg-[#D8AC41]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
