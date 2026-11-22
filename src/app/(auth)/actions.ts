'use server';

import { db } from '@/lib/db';
import { user, account, verification, auditLogs, members } from '@/lib/db/schema';
import { eq, and, gt, or, like } from 'drizzle-orm';
import { createSession, destroySession } from '@/lib/auth/session';
import crypto from 'crypto';

/**
 * Autentikasi pengguna menggunakan Nomor Anggota (Kode Angka) atau Email.
 */
export async function loginWithMemberCodeAction(identifier: string, passwordInput: string) {
  try {
    const trimmedId = identifier.trim();
    const trimmedPass = passwordInput.trim();

    if (!trimmedId || !trimmedPass) {
      return { success: false, message: 'Nomor anggota dan kata sandi wajib diisi.' };
    }

    let targetUserId: string | null = null;
    let targetUserName: string = '';

    // 0. Super Admin akun langsung (0000 / ANG-0000)
    if (trimmedId === '0000' || trimmedId === 'ANG-0000') {
      const superAdminUser = await db.query.user.findFirst({
        where: or(
          eq(user.email, 'admin@pandawa.test'),
          eq(user.id, 'usr_demo_0000'),
          eq(user.phone, '081200000000')
        ),
      });
      if (superAdminUser) {
        targetUserId = superAdminUser.id;
        targetUserName = superAdminUser.name;
      }
    }

    // 1. Cek jika identifier adalah email
    if (!targetUserId && trimmedId.includes('@')) {
      const userByEmail = await db.query.user.findFirst({
        where: eq(user.email, trimmedId.toLowerCase()),
      });
      if (userByEmail) {
        targetUserId = userByEmail.id;
        targetUserName = userByEmail.name;
      }
    } else if (!targetUserId) {
      // 2. Cek berdasarkan Nomor Anggota (Kode Angka, misal: 0001, 1001, ANG-0001)
      const paddedId = trimmedId.padStart(4, '0');
      const matchedMember = await db
        .select({
          userId: members.userId,
          name: user.name,
        })
        .from(members)
        .innerJoin(user, eq(members.userId, user.id))
        .where(
          or(
            eq(members.memberNumber, trimmedId),
            eq(members.memberNumber, paddedId),
            eq(members.memberNumber, `ANG-${trimmedId}`),
            eq(members.memberNumber, `ANG-${paddedId}`)
          )
        )
        .limit(1);

      if (matchedMember.length > 0) {
        targetUserId = matchedMember[0].userId;
        targetUserName = matchedMember[0].name;
      } else {
        // 3. Fallback periksa nomor telepon
        const matchedPhone = await db.query.user.findFirst({
          where: eq(user.phone, trimmedId),
        });
        if (matchedPhone) {
          targetUserId = matchedPhone.id;
          targetUserName = matchedPhone.name;
        }
      }
    }

    if (!targetUserId) {
      return {
        success: false,
        message: 'Nomor anggota tidak ditemukan. Hubungi Wakil Ketua untuk aktivasi akun.',
      };
    }

    // 4. Verifikasi kata sandi di tabel account
    const accountRecord = await db.query.account.findFirst({
      where: and(
        eq(account.userId, targetUserId),
        eq(account.providerId, 'credential')
      ),
    });

    if (!accountRecord || !accountRecord.password) {
      return {
        success: false,
        message: 'Akun belum memiliki kredensial aktif. Silakan hubungi pengurus.',
      };
    }

    const isPasswordValid =
      accountRecord.password === trimmedPass ||
      accountRecord.password === crypto.createHash('sha256').update(trimmedPass).digest('hex');

    if (!isPasswordValid) {
      return {
        success: false,
        message: 'Kata sandi tidak sesuai. Periksa kembali huruf besar/kecil sandi Anda.',
      };
    }

    // 5. Buat sesi baru via cookie HTTP-only
    await createSession(targetUserId);

    // 6. Catat audit log
    await db.insert(auditLogs).values({
      userId: targetUserId,
      action: 'LOGIN_SUCCESS',
      targetTable: 'user',
      recordId: targetUserId,
      newData: { identifier: trimmedId },
    });

    return {
      success: true,
      message: `Selamat datang, ${targetUserName}!`,
    };
  } catch (error: unknown) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Terjadi kendala saat memproses login.',
    };
  }
}

/**
 * Logout pengguna dan bersihkan cookie sesi.
 */
export async function logoutAction() {
  try {
    await destroySession();
    return { success: true };
  } catch {
    return { success: false };
  }
}

/**
 * Permintaan token reset password menggunakan nomor anggota atau email.
 */
export async function requestPasswordResetAction(identifier: string) {
  try {
    const trimmed = identifier.trim();
    if (!trimmed) {
      return { success: false, message: 'Masukkan nomor anggota atau email.' };
    }

    let targetUser = null;
    if (trimmed.includes('@')) {
      targetUser = await db.query.user.findFirst({
        where: eq(user.email, trimmed.toLowerCase()),
      });
    } else {
      const matched = await db
        .select({ user })
        .from(members)
        .innerJoin(user, eq(members.userId, user.id))
        .where(
          or(
            eq(members.memberNumber, trimmed),
            eq(members.memberNumber, `ANG-${trimmed}`),
            like(members.memberNumber, `%${trimmed}%`)
          )
        )
        .limit(1);
      if (matched.length > 0) targetUser = matched[0].user;
    }

    if (!targetUser) {
      return {
        success: true,
        message: 'Jika nomor anggota terdaftar, token pemulihan telah disiapkan.',
      };
    }

    const resetToken = crypto.randomBytes(16).toString('hex').slice(0, 8); // 8-char simple verification token
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 jam

    await db.insert(verification).values({
      id: `rst_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      identifier: `reset_password_${targetUser.id}`,
      value: resetToken,
      expiresAt,
    });

    await db.insert(auditLogs).values({
      userId: targetUser.id,
      action: 'REQUEST_PASSWORD_RESET',
      targetTable: 'user',
      recordId: targetUser.id,
      newData: { identifier: trimmed },
    });

    return {
      success: true,
      message: 'Token pemulihan berhasil dibuat.',
      devToken: resetToken,
      userId: targetUser.id,
    };
  } catch (error: unknown) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Gagal memproses permintaan reset kata sandi.',
    };
  }
}

/**
 * Konfirmasi reset password dengan token verifikasi.
 */
export async function resetPasswordWithTokenAction(input: {
  identifier: string;
  token: string;
  newPassword: string;
}) {
  try {
    const trimmedToken = input.token.trim();
    if (input.newPassword.length < 4) {
      return { success: false, message: 'Kata sandi baru minimal 4 karakter.' };
    }

    const verificationRecord = await db.query.verification.findFirst({
      where: and(
        eq(verification.value, trimmedToken),
        gt(verification.expiresAt, new Date())
      ),
    });

    if (!verificationRecord) {
      return { success: false, message: 'Token tidak valid atau sudah kedaluwarsa.' };
    }

    const userId = verificationRecord.identifier.replace('reset_password_', '');
    const targetUser = await db.query.user.findFirst({
      where: eq(user.id, userId),
    });

    if (!targetUser) {
      return { success: false, message: 'Pengguna tidak ditemukan.' };
    }

    await db
      .update(account)
      .set({
        password: input.newPassword,
        updatedAt: new Date(),
      })
      .where(and(eq(account.userId, targetUser.id), eq(account.providerId, 'credential')));

    await db.delete(verification).where(eq(verification.id, verificationRecord.id));

    await db.insert(auditLogs).values({
      userId: targetUser.id,
      action: 'RESET_PASSWORD_SUCCESS',
      targetTable: 'user',
      recordId: targetUser.id,
      newData: { userId: targetUser.id },
    });

    return {
      success: true,
      message: 'Kata sandi berhasil diperbarui. Silakan masuk menggunakan kata sandi baru.',
    };
  } catch (error: unknown) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Gagal memperbarui kata sandi.',
    };
  }
}
