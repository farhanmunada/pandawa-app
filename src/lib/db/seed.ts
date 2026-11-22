import { db } from './index';
import { roles, periods, userRoles, members, user } from './schema';
import { ROLE_KEYS } from '../auth/permissions';
import { auth } from '../auth/better-auth';
import { eq } from 'drizzle-orm';

export async function seedInitialData() {
  console.log('Seeding initial organizational roles...');

  const initialRoles = [
    {
      key: ROLE_KEYS.KETUA_UMUM,
      name: 'Ketua Umum',
      division: 'BPH',
      description: 'Pimpinan tertinggi organisasi dengan otoritas approval dan supervisi penuh.',
    },
    {
      key: ROLE_KEYS.WAKIL_KETUA,
      name: 'Wakil Ketua',
      division: 'BPH',
      description: 'Koordinator urusan internal organisasi, pengelolaan anggota, dan jabatan.',
    },
    {
      key: ROLE_KEYS.SEKRETARIS,
      name: 'Sekretaris Umum',
      division: 'Kesekretariatan',
      description: 'Pengelola tunggal tata persuratan resmi, surat masuk, surat keluar, dan disposisi.',
    },
    {
      key: ROLE_KEYS.BENDAHARA,
      name: 'Bendahara Umum',
      division: 'Keuangan',
      description: 'Pengelola arus kas multi-wallet, iuran rutin, dan rekonsiliasi keuangan.',
    },
    {
      key: ROLE_KEYS.DIVISI_ACARA,
      name: 'Divisi Acara',
      division: 'Divisi Acara',
      description: 'Perencana agenda kegiatan, RAB, dan formulir tracking iuran khusus acara.',
    },
    {
      key: ROLE_KEYS.DIVISI_HUMAS,
      name: 'Divisi Humas',
      division: 'Divisi Humas',
      description: 'Pengelola kalender agenda terpadu dan pembuat pesan siaran sounding WhatsApp.',
    },
    {
      key: ROLE_KEYS.DIVISI_LOGISTIK,
      name: 'Divisi Logistik',
      division: 'Divisi Logistik',
      description: 'Pengelola katalog inventaris aset dan sirkulasi peminjaman/sewa harga ganda.',
    },
    {
      key: ROLE_KEYS.DIVISI_KEAMANAN,
      name: 'Divisi Keamanan',
      division: 'Divisi Keamanan',
      description: 'Penanggung jawab investigasi insiden, pengaduan rahasia, dan mediasi lapangan.',
    },
    {
      key: ROLE_KEYS.ANGGOTA,
      name: 'Anggota',
      division: 'Anggota',
      description: 'Anggota biasa dengan hak akses kalender terpadu, forum publik, dan pinjam aset.',
    },
  ];

  for (const roleData of initialRoles) {
    await db
      .insert(roles)
      .values(roleData)
      .onConflictDoNothing({ target: roles.key });
  }

  // Inisialisasi Periode Kepengurusan Awal
  await db
    .insert(periods)
    .values({
      name: 'Periode 2026–2028',
      startYear: 2026,
      endYear: 2028,
      isActive: true,
    })
    .onConflictDoNothing();

  const activePeriod = await db.query.periods.findFirst({
    where: eq(periods.isActive, true),
  });

  if (!activePeriod) return;

  // Daftar Akun Demo untuk Setiap Peran
  const demoAccounts = [
    {
      name: 'Ketua Umum Pandawa',
      email: 'ketua@pandawa.test',
      password: 'Password123!',
      roleKey: ROLE_KEYS.KETUA_UMUM,
      positionTitle: 'Ketua Umum',
      division: 'BPH',
      phone: '081211110001',
    },
    {
      name: 'Wakil Ketua Internal',
      email: 'wakil@pandawa.test',
      password: 'Password123!',
      roleKey: ROLE_KEYS.WAKIL_KETUA,
      positionTitle: 'Wakil Ketua',
      division: 'BPH',
      phone: '081211110002',
    },
    {
      name: 'Sekretaris Pandawa',
      email: 'sekretaris@pandawa.test',
      password: 'Password123!',
      roleKey: ROLE_KEYS.SEKRETARIS,
      positionTitle: 'Sekretaris Umum',
      division: 'Kesekretariatan',
      phone: '081211110003',
    },
    {
      name: 'Bendahara Pandawa',
      email: 'bendahara@pandawa.test',
      password: 'Password123!',
      roleKey: ROLE_KEYS.BENDAHARA,
      positionTitle: 'Bendahara Umum',
      division: 'Keuangan',
      phone: '081211110004',
    },
    {
      name: 'Koordinator Humas',
      email: 'humas@pandawa.test',
      password: 'Password123!',
      roleKey: ROLE_KEYS.DIVISI_HUMAS,
      positionTitle: 'Koordinator Sie Humas',
      division: 'Divisi Humas',
      phone: '081211110005',
    },
    {
      name: 'Anggota Aktif',
      email: 'anggota@pandawa.test',
      password: 'Password123!',
      roleKey: ROLE_KEYS.ANGGOTA,
      positionTitle: 'Anggota',
      division: 'Anggota',
      phone: '081211110006',
    },
  ];

  console.log('Seeding demo accounts for each division...');

  for (const acc of demoAccounts) {
    const existingUser = await db.query.user.findFirst({
      where: eq(user.email, acc.email),
    });

    let userId = existingUser?.id;

    if (!userId) {
      try {
        const signupRes = await auth.api.signUpEmail({
          body: {
            name: acc.name,
            email: acc.email,
            password: acc.password,
          },
        });
        userId = signupRes?.user?.id;
      } catch (err) {
        console.warn(`Account ${acc.email} might already exist:`, err);
      }
    }

    if (userId) {
      // Update data telepon
      await db.update(user).set({ phone: acc.phone }).where(eq(user.id, userId));

      // Cari ID role
      const roleRecord = await db.query.roles.findFirst({
        where: eq(roles.key, acc.roleKey),
      });

      if (roleRecord) {
        // Berikan role pada periode aktif
        await db
          .insert(userRoles)
          .values({
            userId,
            roleId: roleRecord.id,
            periodId: activePeriod.id,
          })
          .onConflictDoNothing();
      }

      // Buat entri profil keanggotaan
      const existingMember = await db.query.members.findFirst({
        where: eq(members.userId, userId),
      });

      if (!existingMember) {
        await db.insert(members).values({
          userId,
          periodId: activePeriod.id,
          memberNumber: `ANG-${acc.phone.slice(-4)}`,
          positionTitle: acc.positionTitle,
          division: acc.division,
          status: 'active',
        });
      }
    }
  }

  console.log('Seeding demo accounts completed successfully.');
}
