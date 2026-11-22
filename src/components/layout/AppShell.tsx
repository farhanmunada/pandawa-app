'use client';

import React, { useState, Suspense } from 'react';
import { HeaderBar } from './HeaderBar';
import { BottomNav } from './BottomNav';
import { MobileDrawer } from './MobileDrawer';
import { Sidebar } from './Sidebar';

interface AppShellProps {
  children: React.ReactNode;
  userName?: string;
  userRole?: string;
}

export function AppShell({ children, userName, userRole }: AppShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#FAFAFA] text-slate-900">
      {/* Desktop Sidebar Berkelompok */}
      <Sidebar userName={userName} userRole={userRole} />

      {/* Mobile Drawer */}
      <Suspense fallback={null}>
        <MobileDrawer
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          userName={userName}
          userRole={userRole}
        />
      </Suspense>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        <HeaderBar
          onOpenDrawer={() => setDrawerOpen(true)}
          userName={userName}
          userRole={userRole}
        />

        <main className="flex-1 pb-20 md:pb-12">
          <div className="mx-auto max-w-6xl px-4 py-6 md:px-8">
            {children}
          </div>
        </main>

        <Suspense fallback={null}>
          <BottomNav />
        </Suspense>
      </div>
    </div>
  );
}
