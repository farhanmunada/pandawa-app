'use server';

import { db } from '@/lib/db';
import { user, account, verification, auditLogs, members } from '@/lib/db/schema';
import { eq, and, gt, or, like } from 'drizzle-orm';
import crypto from 'crypto';

/**
 * Menyelesaikan kode unik angka anggota menjadi email autentikasi internal.
 */
export async function resolveLoginEmailAction(identifier: string) {
  try {
    const trimmed = identifier.trim();
    if (!trimmed) {
      return { success: false, message: 'Masukkan kode akses anggota atau email.' };
    }

    if (trimmed.includes('@')) {
      return { success: true, email: trimmed.toLowerCase() };
    }

    // Cari anggota berdasarkan nomor anggota atau akhiran angka
    const matchedMember = await db
      .select({
        email: user.email,
        name: user.name,
      })
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

    if (matchedMember.length > 0 && matchedMember[0].email) {
      return { success: true, email: matchedMember[0].email, name: matchedMember[0].name };
    }

    // Fallback: periksa kecocokan nomor telepon
    const matchedUserByPhone = await db.query.user.findFirst({
      where: eq(user.phone, trimmed),
    });

    if (matchedUserByPhone) {
      return { success: true, email: matchedUserByPhone.email, name: matchedUserByPhone.name };
    }

    return {
      success: false,
      message: 'Kode unik anggota tidak ditemukan. Hubungi Wakil Ketua untuk pendaftaran akun.',
    };
  } catch (error: unknown) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Gagal memproses kode login.',
    };
  }
}

export async function requestPasswordResetAction(email: string) {
  try {
    const trimmedEmail = email.trim().toLowerCase();
    const existingUser = await db.query.user.findFirst({
      where: eq(user.email, trimmedEmail),
    });

    if (!existingUser) {
      // Return generic success to prevent email enumeration
      return {
        success: true,
        message: 'Jika email terdaftar, instruksi setel ulang telah dikirimkan.',
      };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    await db.insert(verification).values({
      id: `rst_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      identifier: `reset_password_${trimmedEmail}`,
      value: resetToken,
      expiresAt,
    });

    // Record audit log
    await db.insert(auditLogs).values({
      userId: existingUser.id,
      action: 'REQUEST_PASSWORD_RESET',
      targetTable: 'user',
      recordId: existingUser.id,
      newData: { email: trimmedEmail },
    });

    return {
      success: true,
      message: 'Token setel ulang berhasil dibuat.',
      // In development / demo, provide token directly for smooth verification
      devToken: resetToken,
    };
  } catch (error: unknown) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Gagal memproses permintaan reset kata sandi.',
    };
  }
}

export async function resetPasswordWithTokenAction(input: {
  email: string;
  token: string;
  newPassword: string;
}) {
  try {
    const trimmedEmail = input.email.trim().toLowerCase();
    if (input.newPassword.length < 8) {
      return { success: false, message: 'Kata sandi baru minimal 8 karakter.' };
    }

    // Verify token
    const verificationRecord = await db.query.verification.findFirst({
      where: and(
        eq(verification.identifier, `reset_password_${trimmedEmail}`),
        eq(verification.value, input.token.trim()),
        gt(verification.expiresAt, new Date())
      ),
    });

    if (!verificationRecord) {
      return { success: false, message: 'Token tidak valid atau sudah kedaluwarsa.' };
    }

    const targetUser = await db.query.user.findFirst({
      where: eq(user.email, trimmedEmail),
    });

    if (!targetUser) {
      return { success: false, message: 'Pengguna tidak ditemukan.' };
    }

    // Update password in account table
    // Better Auth stores passwords in account table with providerId = 'credential'
    await db
      .update(account)
      .set({
        password: input.newPassword,
        updatedAt: new Date(),
      })
      .where(and(eq(account.userId, targetUser.id), eq(account.providerId, 'credential')));

    // Clean up verification token
    await db.delete(verification).where(eq(verification.id, verificationRecord.id));

    // Audit log
    await db.insert(auditLogs).values({
      userId: targetUser.id,
      action: 'RESET_PASSWORD_SUCCESS',
      targetTable: 'user',
      recordId: targetUser.id,
      newData: { email: trimmedEmail },
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
