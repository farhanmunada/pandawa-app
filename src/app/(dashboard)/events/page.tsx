import { getCurrentUserSession } from '@/lib/auth/guard';
import { EventsView } from './EventsView';

export default async function EventsPage() {
  const session = await getCurrentUserSession();
  const roles = session?.roles || [];
  return <EventsView userRoles={roles} />;
}
