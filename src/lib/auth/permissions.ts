export const ROLE_KEYS = {
  SUPER_ADMIN: 'super_admin',
  KETUA_UMUM: 'ketua_umum',
  WAKIL_KETUA: 'wakil_ketua',
  SEKRETARIS: 'sekretaris',
  BENDAHARA: 'bendahara',
  DIVISI_ACARA: 'divisi_acara',
  DIVISI_HUMAS: 'divisi_humas',
  DIVISI_LOGISTIK: 'divisi_logistik',
  DIVISI_KEAMANAN: 'divisi_keamanan',
  ANGGOTA: 'anggota',
} as const;

export type RoleKey = (typeof ROLE_KEYS)[keyof typeof ROLE_KEYS];

export const PERMISSIONS = {
  // Wakil Ketua (Keorganisasian & Internal Anggota)
  'members:manage': [ROLE_KEYS.KETUA_UMUM, ROLE_KEYS.WAKIL_KETUA],
  'organization:structure': [ROLE_KEYS.KETUA_UMUM, ROLE_KEYS.WAKIL_KETUA],

  // Sekretariat (Tata Kelola Persuratan Resmi)
  'letters:manage': [ROLE_KEYS.SEKRETARIS],
  'letters:request': [
    ROLE_KEYS.KETUA_UMUM,
    ROLE_KEYS.WAKIL_KETUA,
    ROLE_KEYS.BENDAHARA,
    ROLE_KEYS.DIVISI_ACARA,
    ROLE_KEYS.DIVISI_HUMAS,
    ROLE_KEYS.DIVISI_LOGISTIK,
    ROLE_KEYS.DIVISI_KEAMANAN,
  ],
  'letters:approve': [ROLE_KEYS.KETUA_UMUM, ROLE_KEYS.SEKRETARIS],

  // Keuangan (Kas & Iuran)
  'cash:manage': [ROLE_KEYS.BENDAHARA],
  'cash:approve_large': [ROLE_KEYS.KETUA_UMUM],
  'dues:manage_routine': [ROLE_KEYS.BENDAHARA],

  // Acara & Iuran Acara
  'events:manage': [ROLE_KEYS.DIVISI_ACARA],
  'event_dues:manage': [ROLE_KEYS.DIVISI_ACARA, ROLE_KEYS.BENDAHARA],

  // Humas (Kalender & Broadcast Sounding)
  'calendar:manage': [ROLE_KEYS.DIVISI_HUMAS],
  'broadcast:generate': [ROLE_KEYS.DIVISI_HUMAS],

  // Logistik (Inventaris Harga Ganda)
  'inventory:manage': [ROLE_KEYS.DIVISI_LOGISTIK],
  'inventory:rent_external': [ROLE_KEYS.DIVISI_LOGISTIK],

  // Keamanan & Penanganan Insiden
  'incidents:confidential_view': [
    ROLE_KEYS.KETUA_UMUM,
    ROLE_KEYS.WAKIL_KETUA,
    ROLE_KEYS.DIVISI_KEAMANAN,
  ],
  'incidents:public_view': ['*'],
  'incidents:create': ['*'],

  // Audit Logs
  'audit:view': [ROLE_KEYS.KETUA_UMUM, ROLE_KEYS.WAKIL_KETUA],
} as const;

export type PermissionKey = keyof typeof PERMISSIONS;
