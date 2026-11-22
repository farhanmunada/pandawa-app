import { redirect } from 'next/navigation';
import { getCurrentUserSession } from '@/lib/auth/guard';
import { FinanceView } from './FinanceView';

export default async function FinancePage() {
  const session = await getCurrentUserSession();
  const roles = session?.roles || [];
  const isAllowed =
    roles.includes('super_admin') ||
    roles.includes('ketua_umum') ||
    roles.includes('wakil_ketua') ||
    roles.includes('bendahara');

  if (!isAllowed) {
    redirect('/');
  }

  return <FinanceView userRoles={roles} />;
}
