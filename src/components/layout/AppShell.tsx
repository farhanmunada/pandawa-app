'use client';

import React, { useState } from 'react';
import { HeaderBar } from './HeaderBar';
import { BottomNav } from './BottomNav';
import { MobileDrawer } from './MobileDrawer';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      <HeaderBar onOpenDrawer={() => setDrawerOpen(true)} />
      <MobileDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <main className="flex-1 pb-20 md:pb-8">
        <div className="mx-auto max-w-5xl px-4 py-4 md:px-6">{children}</div>
      </main>

      <BottomNav />
    </div>
  );
}
