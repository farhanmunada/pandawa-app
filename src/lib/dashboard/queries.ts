import { db } from '@/lib/db';
import { wallets, members, assets, events, incidents, letters } from '@/lib/db/schema';
import { eq, ne, gte, asc, sum, count } from 'drizzle-orm';

export interface DashboardAggregates {
  totalKas: number;
  activeWallets: number;
  activeMembers: number;
  availableAssets: number;
  totalAssetKinds: number;
  openIncidents: number;
  pendingLetters: number;
  nextEvent: {
    title: string;
    startTime: Date;
  } | null;
}

export function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

/**
 * Mengambil ringkasan data metrik langsung dari basis data PostgreSQL.
 */
export async function getDashboardAggregates(): Promise<DashboardAggregates> {
  const [
    walletStats,
    memberStats,
    assetStats,
    nextEvent,
    incidentStats,
    letterStats,
  ] = await Promise.all([
    db
      .select({ total: sum(wallets.currentBalance), count: count() })
      .from(wallets)
      .where(eq(wallets.isActive, true)),
    db
      .select({ total: count() })
      .from(members)
      .where(eq(members.status, 'active')),
    db
      .select({
        available: sum(assets.availableQuantity),
        kinds: count(),
      })
      .from(assets),
    db.query.events.findFirst({
      where: gte(events.startTime, new Date()),
      orderBy: [asc(events.startTime)],
    }),
    db
      .select({ count: count() })
      .from(incidents)
      .where(ne(incidents.status, 'RESOLVED')),
    db
      .select({ count: count() })
      .from(letters)
      .where(eq(letters.status, 'SUBMITTED')),
  ]);

  return {
    totalKas: Number(walletStats[0]?.total ?? 0),
    activeWallets: Number(walletStats[0]?.count ?? 0),
    activeMembers: Number(memberStats[0]?.total ?? 0),
    availableAssets: Number(assetStats[0]?.available ?? 0),
    totalAssetKinds: Number(assetStats[0]?.kinds ?? 0),
    openIncidents: Number(incidentStats[0]?.count ?? 0),
    pendingLetters: Number(letterStats[0]?.count ?? 0),
    nextEvent: nextEvent ? { title: nextEvent.title, startTime: nextEvent.startTime } : null,
  };
}
