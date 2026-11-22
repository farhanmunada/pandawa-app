import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { getCurrentUserSession } from '@/lib/auth/guard';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessionData = await getCurrentUserSession();
  const userName = sessionData?.user?.name || 'Pengurus';
  const userRole =
    sessionData?.member?.positionTitle ||
    (sessionData?.roles?.includes('super_admin')
      ? 'Super Administrator'
      : 'Pengurus Aktif');
  const userRoles = sessionData?.roles || [];

  return (
    <AppShell userName={userName} userRole={userRole} userRoles={userRoles}>
      {children}
    </AppShell>
  );
}
