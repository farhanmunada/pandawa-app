import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { session, user } from '@/lib/db/schema';
import { eq, and, gt } from 'drizzle-orm';
import crypto from 'crypto';

export const SESSION_COOKIE_NAME = 'pandawa_session';
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 hari

/**
 * Membuat sesi pengguna baru di database dan menetapkan HTTP-only cookie.
 */
export async function createSession(userId: string): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex');
  const sessionId = `ses_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);

  await db.insert(session).values({
    id: sessionId,
    userId,
    token,
    expiresAt,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  return token;
}

/**
 * Menghapus sesi aktif pengguna dari database dan membersihkan cookie.
 */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    try {
      await db.delete(session).where(eq(session.token, token));
    } catch {
      // Abaikan jika sudah terhapus
    }
    cookieStore.delete(SESSION_COOKIE_NAME);
  }
}

/**
 * Memvalidasi token sesi dari cookie dan mengembalikan data pengguna aktif.
 */
export async function getSessionUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;

    const sessionRecord = await db.query.session.findFirst({
      where: and(
        eq(session.token, token),
        gt(session.expiresAt, new Date())
      ),
    });

    if (!sessionRecord) return null;

    const userRecord = await db.query.user.findFirst({
      where: eq(user.id, sessionRecord.userId),
    });

    if (!userRecord || !userRecord.isActive) return null;

    return {
      session: sessionRecord,
      user: userRecord,
    };
  } catch {
    return null;
  }
}
