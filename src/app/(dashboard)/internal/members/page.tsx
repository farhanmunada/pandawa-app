import { redirect } from 'next/navigation';
import { getCurrentUserSession } from '@/lib/auth/guard';
import { MembersManagementView } from './MembersManagementView';

export default async function MembersManagementPage() {
  const session = await getCurrentUserSession();
  const roles = session?.roles || [];
  const isAllowed =
    roles.includes('super_admin') ||
    roles.includes('ketua_umum') ||
    roles.includes('wakil_ketua');

  if (!isAllowed) {
    redirect('/');
  }

  return <MembersManagementView />;
}
