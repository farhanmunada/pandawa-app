import { pgTable, text, varchar, boolean, timestamp, serial, integer } from 'drizzle-orm/pg-core';

// Better Auth Core Tables
export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').unique().notNull(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  image: text('image'),
  phone: varchar('phone', { length: 25 }),
  avatarDriveId: text('avatar_drive_id'),
  avatarDriveUrl: text('avatar_drive_url'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').unique().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }).notNull(),
});

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }).notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Organization Structure & Dynamic RBAC Tables
export const roles = pgTable('roles', {
  id: serial('id').primaryKey(),
  key: varchar('key', { length: 50 }).unique().notNull(), // ketua_umum, wakil_ketua, sekretaris, bendahara, divisi_acara, divisi_humas, divisi_logistik, divisi_keamanan, anggota
  name: varchar('name', { length: 100 }).notNull(),
  division: varchar('division', { length: 50 }),
  description: text('description'),
});

export const periods = pgTable('periods', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 50 }).notNull(), // e.g., "Periode 2026–2028"
  startYear: integer('start_year').notNull(),
  endYear: integer('end_year').notNull(),
  isActive: boolean('is_active').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const userRoles = pgTable('user_roles', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }).notNull(),
  roleId: integer('role_id').references(() => roles.id, { onDelete: 'cascade' }).notNull(),
  periodId: integer('period_id').references(() => periods.id, { onDelete: 'cascade' }).notNull(),
  assignedAt: timestamp('assigned_at').defaultNow().notNull(),
});

export const members = pgTable('members', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }).notNull(),
  periodId: integer('period_id').references(() => periods.id, { onDelete: 'cascade' }).notNull(),
  memberNumber: varchar('member_number', { length: 50 }).unique(),
  positionTitle: varchar('position_title', { length: 100 }).notNull(), // "Wakil Ketua", "Koordinator Sie Humas", etc.
  division: varchar('division', { length: 50 }).notNull(), // "BPH", "Humas", "Acara", "Logistik", "Keamanan", "Anggota"
  status: varchar('status', { length: 20 }).default('active').notNull(), // active, inactive, alumni
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
});
