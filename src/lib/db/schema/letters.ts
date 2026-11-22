import { pgTable, serial, integer, varchar, text, date, timestamp, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { user, periods } from './auth';

export const letterTypeEnum = pgEnum('letter_type', [
  'UNDANGAN',
  'PERINGATAN',
  'GIRIK_IURAN',
  'SURAT_TUGAS',
  'PERMOHONAN',
  'REKOMENDASI',
  'SURAT_KEPUTUSAN',
  'SURAT_MASUK',
]);

export const letters = pgTable('letters', {
  id: serial('id').primaryKey(),
  periodId: integer('period_id').references(() => periods.id).notNull(),
  direction: varchar('direction', { length: 10 }).notNull(), // IN, OUT
  letterType: letterTypeEnum('letter_type').notNull(),
  letterNumber: varchar('letter_number', { length: 100 }).unique().notNull(), // e.g. "014/UND/KT/XI/2026"
  sequenceNumber: integer('sequence_number').notNull(),
  year: integer('year').notNull(),
  subject: varchar('subject', { length: 255 }).notNull(),
  sender: varchar('sender', { length: 150 }).notNull(),
  recipient: varchar('recipient', { length: 150 }).notNull(),
  letterDate: date('letter_date').notNull(),
  fileDriveId: text('file_drive_id'),
  fileDriveUrl: text('file_drive_url'),
  status: varchar('status', { length: 25 }).default('APPROVED').notNull(), // DRAFT, PENDING_APPROVAL, APPROVED, REJECTED, ARCHIVED
  // TTD Resmi (tanpa barcode)
  primarySignatoryName: varchar('primary_signatory_name', { length: 100 }), // Ketua Umum
  secondarySignatoryName: varchar('secondary_signatory_name', { length: 100 }), // Sekretaris
  signedAt: timestamp('signed_at'),
  isPublic: boolean('is_public').default(false).notNull(),
  requestedByDivision: varchar('requested_by_division', { length: 50 }),
  createdBy: text('created_by').references(() => user.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const letterDispositions = pgTable('letter_dispositions', {
  id: serial('id').primaryKey(),
  letterId: integer('letter_id').references(() => letters.id, { onDelete: 'cascade' }).notNull(),
  assignedToUserId: text('assigned_to_user_id').references(() => user.id).notNull(),
  instructions: text('instructions').notNull(),
  status: varchar('status', { length: 20 }).default('PENDING').notNull(), // PENDING, IN_PROGRESS, COMPLETED
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
