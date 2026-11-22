import { redirect } from 'next/navigation';
import { getCurrentUserSession } from '@/lib/auth/guard';
import { getAuditLogsAction } from './actions';
import { AuditLogView } from './AuditLogView';

export default async function AuditLogPage() {
  const session = await getCurrentUserSession();
  const roles = session?.roles || [];
  const isAllowed =
    roles.includes('super_admin') ||
    roles.includes('ketua_umum') ||
    roles.includes('wakil_ketua');

  if (!isAllowed) {
    redirect('/');
  }

  const res = await getAuditLogsAction();
  return <AuditLogView initialLogs={res.data || []} />;
}
