'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  userRole?: string;
}

export function MobileDrawer({ isOpen, onClose }: MobileDrawerProps) {
  const pathname = usePathname();

  const menuSections = [
    {
      title: 'Operasional Utama',
      items: [
        { label: 'Kalender Agenda & Humas', href: '/events', icon: Calendar },
        { label: 'Pesan Sounding WhatsApp', href: '/events/sounding', icon: Megaphone },
        { label: 'Arus Kas & Iuran', href: '/finance', icon: Wallet },
        { label: 'Persuratan Resmi', href: '/letters', icon: FileText },
        { label: 'Inventaris & Sewa', href: '/inventory', icon: Package },
      ],
    },
    {
      title: 'Keorganisasian & Penanganan',
      items: [
        { label: 'Internal Anggota (Wakil Ketua)', href: '/internal/members', icon: Users },
        { label: 'Laporan & Insiden (Keamanan)', href: '/incidents', icon: ShieldAlert },
        { label: 'Audit Log Sistem (Ketua/Wakil)', href: '/audit', icon: ClipboardList },
      ],
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white p-4 shadow-xl dark:bg-neutral-900">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
          <div>
            <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
              Menu Organisasi
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Sistem Informasi Kepemudaan
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 flex-1 overflow-y-auto space-y-6">
          {menuSections.map((section) => (
            <div key={section.title}>
              <h3 className="px-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                {section.title}
              </h3>
              <div className="mt-2 space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-colors',
                        isActive
                          ? 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 font-semibold'
                          : 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
