import { getCurrentUserSession } from '@/lib/auth/guard';
import { InventoryView } from './InventoryView';

export default async function InventoryPage() {
  const session = await getCurrentUserSession();
  const roles = session?.roles || [];
  return <InventoryView userRoles={roles} />;
}
