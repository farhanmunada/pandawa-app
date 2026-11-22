import { db } from './index';
import { roles, periods, userRoles, members, user, account, wallets, assets } from './schema';
import { ROLE_KEYS } from '../auth/permissions';
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
      userId = `usr_demo_${acc.phone.slice(-4)}`;
      await db.insert(user).values({
        id: userId,
        name: acc.name,
        email: acc.email,
        phone: acc.phone,
        emailVerified: true,
        isActive: true,
      });

      await db.insert(account).values({
        id: `acc_demo_${acc.phone.slice(-4)}`,
        accountId: userId,
        providerId: 'credential',
        userId,
        password: acc.password,
      });
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

  // Inisialisasi Dompet Kas Baku (Multi-Wallet)
  console.log('Seeding default organizational wallets...');
  const defaultWallets = [
    { name: 'Kas Utama Organisasi', description: 'Arus kas operasional utama organisasi kepemudaan', currentBalance: 12500000 },
    { name: 'Kas Sosial & Kematian', description: 'Dana santunan dan kepedulian warga pemuda', currentBalance: 3200000 },
    { name: 'Kas Usaha & Sewa Inventaris', description: 'Penerimaan sewa perlengkapan dan unit usaha pemuda', currentBalance: 1850000 },
    { name: 'Kas Khusus Acara', description: 'Penampungan iuran dan alokasi dana kegiatan aktif', currentBalance: 750000 },
  ];

  for (const w of defaultWallets) {
    const existing = await db.query.wallets.findFirst({
      where: eq(wallets.name, w.name),
    });
    if (!existing) {
      await db.insert(wallets).values(w);
    }
  }

  // Inisialisasi Katalog Inventaris Awal (Skema Harga Ganda)
  console.log('Seeding initial inventory assets...');
  const initialAssets = [
    {
      code: 'AST-TND-001',
      name: 'Tenda Pesta Ukuran 4x6 Meter',
      category: 'Tenda & Terpal',
      totalQuantity: 4,
      availableQuantity: 4,
      condition: 'GOOD',
      storageLocation: 'Gudang Utama Pemuda (Balai Pertemuan)',
      isRentable: true,
      internalRatePerDay: 50000, // Harga Warga/Anggota
      externalRatePerDay: 175000, // Harga Komersial Pihak Luar
    },
    {
      code: 'AST-SND-001',
      name: 'Sound System Portable Wireless 15 Inch + 2 Mic',
      category: 'Audio & Elektronik',
      totalQuantity: 2,
      availableQuantity: 2,
      condition: 'GOOD',
      storageLocation: 'Ruang Inventaris Sekretariat',
      isRentable: true,
      internalRatePerDay: 50000,
      externalRatePerDay: 150000,
    },
    {
      code: 'AST-KRS-001',
      name: 'Kursi Plastik Napolly',
      category: 'Tempat Duduk',
      totalQuantity: 120,
      availableQuantity: 120,
      condition: 'GOOD',
      storageLocation: 'Gudang Utama Pemuda',
      isRentable: true,
      internalRatePerDay: 500, // Rp 500 / buah
      externalRatePerDay: 1500, // Rp 1.500 / buah
    },
    {
      code: 'AST-TRP-001',
      name: 'Terpal Plastik Tebal 6x8 Meter',
      category: 'Tenda & Terpal',
      totalQuantity: 5,
      availableQuantity: 5,
      condition: 'GOOD',
      storageLocation: 'Gudang Utama Pemuda',
      isRentable: true,
      internalRatePerDay: 15000,
      externalRatePerDay: 40000,
    },
    {
      code: 'AST-LMP-001',
      name: 'Lampu Tembak LED 100 Watt + Kabel Roll 25m',
      category: 'Penerangan',
      totalQuantity: 6,
      availableQuantity: 6,
      condition: 'GOOD',
      storageLocation: 'Ruang Inventaris Sekretariat',
      isRentable: true,
      internalRatePerDay: 10000,
      externalRatePerDay: 30000,
    },
  ];

  for (const a of initialAssets) {
    const existing = await db.query.assets.findFirst({
      where: eq(assets.code, a.code),
    });
    if (!existing) {
      await db.insert(assets).values(a);
    }
  }

  console.log('Seeding demo accounts completed successfully.');
}
