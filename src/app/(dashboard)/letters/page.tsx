import { getCurrentUserSession } from '@/lib/auth/guard';
import { LettersView } from './LettersView';

export default async function LettersPage() {
  const session = await getCurrentUserSession();
  const roles = session?.roles || [];
  return <LettersView userRoles={roles} />;
}
