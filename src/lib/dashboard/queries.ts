import { db } from '@/lib/db';
import { wallets, members, assets, events, incidents, letters } from '@/lib/db/schema';
import { eq, ne, gte, asc, desc, sum, count, or, and } from 'drizzle-orm';

export interface WalletSummaryItem {
  id: number;
  name: string;
  currentBalance: number;
}

export interface EventSummaryItem {
  id: number;
  title: string;
  location: string;
  startTime: Date;
  plannedBudget: number;
  kasAllocation: number;
  status: string;
}

export interface AssetSummaryItem {
  id: number;
  code: string;
  name: string;
  category: string;
  availableQuantity: number;
  totalQuantity: number;
  internalRatePerDay: number;
}

export interface LetterSummaryItem {
  id: number;
  letterNumber: string;
  subject: string;
  letterType: string;
  status: string;
  letterDate: string;
}

export interface IncidentSummaryItem {
  id: number;
  title: string;
  category: string;
  urgency: string;
  status: string;
  incidentTime: Date;
}

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
  walletsList: WalletSummaryItem[];
  upcomingEvents: EventSummaryItem[];
  recentAssets: AssetSummaryItem[];
  recentLetters: LetterSummaryItem[];
  recentIncidents: IncidentSummaryItem[];
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
 * Mengambil ringkasan data operasional langsung dari basis data PostgreSQL.
 */
export async function getDashboardAggregates(
  userId?: string,
  userRoles: string[] = []
): Promise<DashboardAggregates> {
  const isSecurityOrLeader = userRoles.some((r) =>
    ['super_admin', 'ketua_umum', 'wakil_ketua', 'divisi_keamanan'].includes(r)
  );

  const incidentWhere = isSecurityOrLeader
    ? undefined
    : userId
    ? or(eq(incidents.isConfidential, false), eq(incidents.reporterUserId, userId))
    : eq(incidents.isConfidential, false);

  const [
    walletStats,
    memberStats,
    assetStats,
    nextEvent,
    incidentStats,
    letterStats,
    walletItems,
    upcomingEventsList,
    assetsList,
    lettersList,
    incidentsList,
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
      .where(
        isSecurityOrLeader
          ? ne(incidents.status, 'RESOLVED')
          : and(
              ne(incidents.status, 'RESOLVED'),
              incidentWhere || eq(incidents.isConfidential, false)
            )
      ),
    db
      .select({ count: count() })
      .from(letters)
      .where(eq(letters.status, 'SUBMITTED')),
    db.query.wallets.findMany({
      where: eq(wallets.isActive, true),
      limit: 4,
    }),
    db.query.events.findMany({
      where: gte(events.startTime, new Date()),
      orderBy: [asc(events.startTime)],
      limit: 2,
    }),
    db.query.assets.findMany({
      limit: 3,
    }),
    db.query.letters.findMany({
      orderBy: [desc(letters.createdAt)],
      limit: 3,
    }),
    db.query.incidents.findMany({
      where: incidentWhere,
      orderBy: [desc(incidents.createdAt)],
      limit: 3,
    }),
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
    walletsList: walletItems.map((w) => ({
      id: w.id,
      name: w.name,
      currentBalance: Number(w.currentBalance),
    })),
    upcomingEvents: upcomingEventsList.map((e) => ({
      id: e.id,
      title: e.title,
      location: e.location,
      startTime: e.startTime,
      plannedBudget: Number(e.plannedBudget),
      kasAllocation: Number(e.kasAllocation),
      status: e.status,
    })),
    recentAssets: assetsList.map((a) => ({
      id: a.id,
      code: a.code,
      name: a.name,
      category: a.category,
      availableQuantity: a.availableQuantity,
      totalQuantity: a.totalQuantity,
      internalRatePerDay: Number(a.internalRatePerDay),
    })),
    recentLetters: lettersList.map((l) => ({
      id: l.id,
      letterNumber: l.letterNumber,
      subject: l.subject,
      letterType: l.letterType,
      status: l.status,
      letterDate: String(l.letterDate),
    })),
    recentIncidents: incidentsList.map((i) => ({
      id: i.id,
      title: i.title,
      category: i.category,
      urgency: i.urgency,
      status: i.status,
      incidentTime: i.incidentTime,
    })),
  };
}
