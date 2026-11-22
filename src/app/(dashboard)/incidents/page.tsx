import { getCurrentUserSession } from '@/lib/auth/guard';
import { IncidentsView } from './IncidentsView';

export default async function IncidentsPage() {
  const session = await getCurrentUserSession();
  const userId = session?.user?.id || '';
  const roles = session?.roles || [];
  return <IncidentsView userId={userId} userRoles={roles} />;
}
