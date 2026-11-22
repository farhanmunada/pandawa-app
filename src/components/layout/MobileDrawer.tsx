'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  X,
  Home,
  Users,
  Calendar,
  Wallet,
  FileText,
  Package,
  ShieldAlert,
  ClipboardList,
  Megaphone,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { logoutAction } from '@/app/(auth)/actions';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
  userRole?: string;
}

export function MobileDrawer({
  isOpen,
  onClose,
  userName = 'Pengurus',
  userRole = 'Pengurus Aktif',
}: MobileDrawerProps) {
  const pathname = usePathname();
  const router = useRouter();

  const menuGroups = [
    {
      title: 'Utama',
      items: [{ label: 'Ringkasan Data', href: '/', icon: Home }],
    },
    {
      title: 'Operasional',
      items: [
        { label: 'Kalender Agenda', href: '/events', icon: Calendar },
        { label: 'Broadcast Sounding', href: '/events/sounding', icon: Megaphone },
        { label: 'Katalog Inventaris', href: '/inventory', icon: Package },
      ],
    },
    {
      title: 'Administratif',
      items: [
        { label: 'Arus Kas Multi-Wallet', href: '/finance', icon: Wallet },
        { label: 'Persuratan Resmi', href: '/letters', icon: FileText },
      ],
    },
    {
      title: 'Tata Kelola',
      items: [
        { label: 'Data Anggota & Jabatan', href: '/internal/members', icon: Users },
        { label: 'Laporan & Keamanan', href: '/incidents', icon: ShieldAlert },
        { label: 'Jejak Audit Aktivitas', href: '/audit', icon: ClipboardList },
      ],
    },
  ];

  const handleSignOut = async () => {
    try {
      await logoutAction();
      onClose();
      router.push('/sign-in');
      router.refresh();
    } catch {
      router.push('/sign-in');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex md:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel Frameless */}
      <div className="relative z-10 flex w-full max-w-xs flex-col bg-white shadow-2xl h-full justify-between">
        <div className="space-y-4">
          {/* Header Drawer */}
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-2xl bg-slate-50 p-1.5 shadow-2xs">
                <Image
                  src="/favicon.png"
                  alt="Logo Pandawa"
                  width={36}
                  height={36}
                  className="h-full w-full object-contain"
                />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 leading-none">PANDAWA APP</p>
                <p className="text-[10px] text-[#B4821E] font-medium leading-tight mt-0.5">Wanangsri, Wonoboyo</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Tutup Menu"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Info Pengguna Aktif */}
          <div className="bg-slate-50/70 mx-4 rounded-2xl px-4 py-3">
            <p className="text-xs font-bold text-slate-900 truncate">{userName}</p>
            <p className="text-[10px] text-slate-400 truncate">{userRole}</p>
          </div>

          {/* Menu Navigation List */}
          <div className="flex-1 overflow-y-auto px-4 space-y-4 max-h-[calc(100vh-220px)]">
            {menuGroups.map((group) => (
              <div key={group.title} className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3">
                  {group.title}
                </p>
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      item.href === '/'
                        ? pathname === '/'
                        : pathname.startsWith(item.href);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onClose}
                        className={cn(
                          'flex items-center gap-2.5 rounded-2xl px-3.5 py-2 text-xs font-medium transition-all cursor-pointer',
                          isActive
                            ? 'bg-slate-900 text-white font-semibold shadow-xs'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        )}
                      >
                        <Icon
                          className={cn(
                            'h-4 w-4 shrink-0',
                            isActive ? 'text-[#D8AC41]' : 'text-slate-400'
                          )}
                        />
                        <span className="truncate">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Tombol Keluar */}
        <div className="p-4 border-t border-slate-100 bg-white">
          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-50 py-2.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5 text-rose-600" />
            <span>Keluar Akun</span>
          </button>
        </div>
      </div>
    </div>
  );
}
