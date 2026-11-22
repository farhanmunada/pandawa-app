import { redirect } from 'next/navigation';
import { getCurrentUserSession } from '@/lib/auth/guard';
import { LettersView } from './LettersView';

export default async function LettersPage() {
  const session = await getCurrentUserSession();
  const roles = session?.roles || [];
  const isAllowed =
    roles.includes('super_admin') ||
    roles.includes('ketua_umum') ||
    roles.includes('wakil_ketua') ||
    roles.includes('sekretaris');

  if (!isAllowed) {
    redirect('/');
  }

  return <LettersView userRoles={roles} />;
}
