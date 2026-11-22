import { db } from '@/lib/db';
import { userRoles, roles, periods } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getSessionUser } from './session';
import { PERMISSIONS, PermissionKey, RoleKey } from './permissions';

export interface UserSessionData {
  userId: string;
  roles: RoleKey[];
  activePeriodId?: number;
}

/**
 * Mengambil sesi pengguna aktif di sisi server via native session cookie.
 */
export async function getCurrentUserSession() {
  try {
    const sessionData = await getSessionUser();
    if (!sessionData?.user) return null;

    const { roles: userRolesList, periodId } = await getUserActiveRoles(sessionData.user.id);
    return {
      user: sessionData.user,
      session: sessionData.session,
      roles: userRolesList,
      periodId,
    };
  } catch {
    return null;
  }
}

/**
 * Mendapatkan daftar role aktif untuk user pada periode yang sedang berjalan.
 */
export async function getUserActiveRoles(userId: string): Promise<{ roles: RoleKey[]; periodId?: number }> {
  const activePeriod = await db.query.periods.findFirst({
    where: eq(periods.isActive, true),
  });

  if (!activePeriod) {
    return { roles: [] };
  }

  const userRoleRecords = await db
    .select({
      roleKey: roles.key,
    })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .where(
      and(
        eq(userRoles.userId, userId),
        eq(userRoles.periodId, activePeriod.id)
      )
    );

  const activeRoles = userRoleRecords.map((r) => r.roleKey as RoleKey);
  return { roles: activeRoles, periodId: activePeriod.id };
}

/**
 * Memeriksa apakah sekumpulan peran memiliki izin yang diminta.
 */
export function hasPermission(userRoleKeys: RoleKey[], permission: PermissionKey): boolean {
  const allowedRoles = PERMISSIONS[permission];
  if (!allowedRoles) return false;

  if ((allowedRoles as readonly string[]).includes('*')) {
    return true;
  }

  return userRoleKeys.some((role) => (allowedRoles as readonly string[]).includes(role));
}

/**
 * Gatekeeper untuk Server Actions: Melemparkan error jika otorisasi tidak terpenuhi.
 */
export async function assertPermission(userId: string, permission: PermissionKey) {
  if (!userId) {
    throw new Error('UNAUTHORIZED: Sesi pengguna tidak valid.');
  }

  const { roles: userRoleKeys } = await getUserActiveRoles(userId);

  if (!hasPermission(userRoleKeys, permission)) {
    throw new Error(`FORBIDDEN: Anda tidak memiliki izin untuk aksi '${permission}'.`);
  }

  return { userId, roles: userRoleKeys };
}
