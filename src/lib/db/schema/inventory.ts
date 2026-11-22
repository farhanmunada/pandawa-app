import { pgTable, serial, varchar, integer, text, boolean, bigint, timestamp, date } from 'drizzle-orm/pg-core';
import { user } from './auth';
import { cashTransactions } from './finance';

export const assets = pgTable('assets', {
  id: serial('id').primaryKey(),
  code: varchar('code', { length: 50 }).unique().notNull(), // AST-TND-001
  name: varchar('name', { length: 150 }).notNull(),
  category: varchar('category', { length: 50 }).notNull(),
  totalQuantity: integer('total_quantity').notNull(),
  availableQuantity: integer('available_quantity').notNull(),
  condition: varchar('condition', { length: 25 }).default('GOOD').notNull(), // GOOD, MINOR_DAMAGE, MAJOR_DAMAGE, LOST
  storageLocation: varchar('storage_location', { length: 100 }).notNull(),
  photoDriveId: text('photo_drive_id'),
  isRentable: boolean('is_rentable').default(false).notNull(),
  
  // Dual Pricing (Harga Ganda)
  internalRatePerDay: bigint('internal_rate_per_day', { mode: 'number' }).default(0).notNull(), // Anggota/Warga
  externalRatePerDay: bigint('external_rate_per_day', { mode: 'number' }).default(0).notNull(), // Pihak Luar/Komersial
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const assetLoans = pgTable('asset_loans', {
  id: serial('id').primaryKey(),
  assetId: integer('asset_id').references(() => assets.id).notNull(),
  clientTier: varchar('client_tier', { length: 15 }).notNull(), // INTERNAL, EXTERNAL
  borrowerName: varchar('borrower_name', { length: 100 }).notNull(),
  borrowerPhone: varchar('borrower_phone', { length: 25 }).notNull(),
  quantity: integer('quantity').notNull(),
  startDate: date('start_date').notNull(),
  expectedEndDate: date('expected_end_date').notNull(),
  actualEndDate: date('actual_end_date'),
  purpose: text('purpose').notNull(),
  totalFee: bigint('total_fee', { mode: 'number' }).default(0).notNull(),
  cashTransactionId: text('cash_transaction_id').references(() => cashTransactions.id),
  status: varchar('status', { length: 20 }).default('REQUESTED').notNull(), // REQUESTED, BORROWED, RETURNED, REJECTED, OVERDUE
  returnCondition: varchar('return_condition', { length: 25 }),
  returnNotes: text('return_notes'),
  processedBy: text('processed_by').references(() => user.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
