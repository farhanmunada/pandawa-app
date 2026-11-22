import { redirect } from 'next/navigation';
import { getCurrentUserSession } from '@/lib/auth/guard';
import { SoundingView } from './SoundingView';

export default async function SoundingBroadcastPage() {
  const session = await getCurrentUserSession();
  const roles = session?.roles || [];
  const isAllowed =
    roles.includes('super_admin') ||
    roles.includes('ketua_umum') ||
    roles.includes('wakil_ketua') ||
    roles.includes('divisi_humas');

  if (!isAllowed) {
    redirect('/events');
  }

  return <SoundingView />;
}
