'use client';

import React, { useState, Suspense } from 'react';
import { HeaderBar } from './HeaderBar';
import { BottomNav } from './BottomNav';
import { MobileDrawer } from './MobileDrawer';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900">
      <HeaderBar onOpenDrawer={() => setDrawerOpen(true)} />
      <Suspense fallback={null}>
        <MobileDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
      </Suspense>

      <main className="flex-1 pb-20 md:pb-10">
        <div className="mx-auto max-w-5xl px-4 py-5 md:px-6">{children}</div>
      </main>

      <Suspense fallback={null}>
        <BottomNav />
      </Suspense>
    </div>
  );
}
