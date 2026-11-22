'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  X,
  Users,
  Calendar,
  Wallet,
  FileText,
  Package,
  ShieldAlert,
  ClipboardList,
  Megaphone,
  ArrowRight,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { authClient } from '@/lib/auth/auth-client';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileDrawer({ isOpen, onClose }: MobileDrawerProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: sessionData } = authClient.useSession();

  const currentUser = sessionData?.user;
  const displayName = currentUser?.name || 'Pengurus';

  const menuSections = [
    {
      title: 'Operasional',
      items: [
        { label: 'Kalender Agenda', href: '/events', icon: Calendar },
        { label: 'Broadcast Sounding', href: '/events/sounding', icon: Megaphone },
        { label: 'Buku Kas Multi-Wallet', href: '/finance', icon: Wallet },
        { label: 'Persuratan Resmi', href: '/letters', icon: FileText },
        { label: 'Katalog Inventaris', href: '/inventory', icon: Package },
      ],
    },
    {
      title: 'Tata Kelola',
      items: [
        { label: 'Data Anggota & Jabatan', href: '/internal/members', icon: Users },
        { label: 'Laporan & Pengaduan', href: '/incidents', icon: ShieldAlert },
        { label: 'Jejak Audit Aktivitas', href: '/audit', icon: ClipboardList },
      ],
    },
  ];

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      onClose();
      router.push('/sign-in');
      router.refresh();
    } catch {
      router.push('/sign-in');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div className="relative z-10 flex w-full max-w-xs flex-col bg-white border-r border-slate-200 shadow-xl">
        {/* Header Drawer */}
        <div className="flex items-center justify-between border-b border-slate-200 p-4">
          <div className="flex items-center gap-2.5">
            <div className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded-md border border-slate-200 bg-white p-0.5">
              <Image
                src="/favicon.png"
                alt="Logo Pandawa"
                width={32}
                height={32}
                className="h-full w-full object-contain"
              />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 leading-none">PANDAWA APP</p>
              <p className="text-[10px] text-[#B4821E] font-medium leading-tight">Wanangsri, Wonoboyo</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer"
            aria-label="Tutup Menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Info Pengguna Aktif */}
        <div className="border-b border-slate-100 bg-slate-50/70 px-4 py-3">
          <p className="text-xs font-bold text-slate-900 truncate">{displayName}</p>
          <p className="text-[10px] text-slate-500 truncate">{currentUser?.email || 'Akun Pengurus'}</p>
        </div>

        {/* Menu Navigation List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {menuSections.map((section) => (
            <div key={section.title} className="space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2.5">
                {section.title}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        'flex items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium transition-colors cursor-pointer',
                        isActive
                          ? 'bg-slate-900 text-white font-semibold'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon
                          className={cn(
                            'h-4 w-4',
                            isActive ? 'text-[#D8AC41]' : 'text-slate-400'
                          )}
                        />
                        <span>{item.label}</span>
                      </div>
                      <ArrowRight className="h-3 w-3 opacity-40" />
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Tombol Keluar */}
        <div className="border-t border-slate-200 p-3 bg-slate-50">
          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-rose-200 bg-white py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5 text-rose-600" />
            <span>Keluar Akun</span>
          </button>
        </div>
      </div>
    </div>
  );
}
