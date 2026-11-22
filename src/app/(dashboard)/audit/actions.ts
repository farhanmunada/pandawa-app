'use server';

import { db } from '@/lib/db';
import { auditLogs, user } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';
import { getCurrentUserSession } from '@/lib/auth/guard';

export interface AuditLogItem {
  id: number;
  action: string;
  targetTable: string;
  recordId: string | null;
  createdAt: Date;
  userName: string | null;
  userEmail: string | null;
}

export async function getAuditLogsAction(): Promise<{
  success: boolean;
  data?: AuditLogItem[];
  error?: string;
}> {
  try {
    const session = await getCurrentUserSession();
    if (!session?.user) {
      return { success: false, error: 'UNAUTHORIZED: Sesi tidak valid' };
    }

    const roles = session.roles || [];
    const isAllowed =
      roles.includes('super_admin') ||
      roles.includes('ketua_umum') ||
      roles.includes('wakil_ketua');

    if (!isAllowed) {
      return { success: false, error: 'FORBIDDEN: Anda tidak memiliki akses ke jejak audit.' };
    }

    const logs = await db
      .select({
        id: auditLogs.id,
        action: auditLogs.action,
        targetTable: auditLogs.targetTable,
        recordId: auditLogs.recordId,
        createdAt: auditLogs.createdAt,
        userName: user.name,
        userEmail: user.email,
      })
      .from(auditLogs)
      .leftJoin(user, eq(auditLogs.userId, user.id))
      .orderBy(desc(auditLogs.createdAt))
      .limit(50);

    return { success: true, data: logs };
  } catch (error) {
    console.error('Failed to fetch audit logs:', error);
    return { success: false, error: 'Gagal mengambil data jejak audit sistem' };
  }
}
