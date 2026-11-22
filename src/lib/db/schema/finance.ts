import { pgTable, serial, varchar, text, bigint, boolean, timestamp, integer, date } from 'drizzle-orm/pg-core';
import { user, periods, members } from './auth';

export const wallets = pgTable('wallets', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(), // "Kas Utama", "Kas Sosial", "Kas Usaha", "Kas Acara"
  description: text('description'),
  currentBalance: bigint('current_balance', { mode: 'number' }).default(0).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const cashTransactions = pgTable('cash_transactions', {
  id: text('id').primaryKey(), // UUID
  walletId: integer('wallet_id').references(() => wallets.id).notNull(),
  type: varchar('type', { length: 10 }).notNull(), // IN, OUT
  category: varchar('category', { length: 50 }).notNull(),
  amount: bigint('amount', { mode: 'number' }).notNull(),
  transactionDate: date('transaction_date').notNull(),
  description: text('description').notNull(),
  receiptDriveId: text('receipt_drive_id'),
  receiptDriveUrl: text('receipt_drive_url'),
  status: varchar('status', { length: 20 }).default('APPROVED').notNull(), // APPROVED, PENDING_APPROVAL, REJECTED
  requiresApproval: boolean('requires_approval').default(false).notNull(),
  approvedBy: text('approved_by').references(() => user.id),
  approvedAt: timestamp('approved_at'),
  rejectionReason: text('rejection_reason'),
  eventId: integer('event_id'),
  createdBy: text('created_by').references(() => user.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const routineDuesSchedules = pgTable('routine_dues_schedules', {
  id: serial('id').primaryKey(),
  periodId: integer('period_id').references(() => periods.id).notNull(),
  title: varchar('title', { length: 100 }).notNull(),
  amountPerPeriod: bigint('amount_per_period', { mode: 'number' }).notNull(),
  frequency: varchar('frequency', { length: 20 }).default('monthly').notNull(), // monthly, weekly
  isActive: boolean('is_active').default(true).notNull(),
});

export const routineDuesPayments = pgTable('routine_dues_payments', {
  id: serial('id').primaryKey(),
  scheduleId: integer('schedule_id').references(() => routineDuesSchedules.id).notNull(),
  memberId: integer('member_id').references(() => members.id).notNull(),
  walletId: integer('wallet_id').references(() => wallets.id).notNull(),
  periodLabel: varchar('period_label', { length: 30 }).notNull(), // "2026-11"
  amount: bigint('amount', { mode: 'number' }).notNull(),
  paymentDate: date('payment_date').notNull(),
  proofDriveId: text('proof_drive_id'),
  recordedBy: text('recorded_by').references(() => user.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const eventDuesSchedules = pgTable('event_dues_schedules', {
  id: serial('id').primaryKey(),
  eventId: integer('event_id').notNull(),
  targetAmountPerMember: bigint('target_amount_per_member', { mode: 'number' }).notNull(),
  dueDate: date('due_date').notNull(),
  notes: text('notes'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const eventDuesPayments = pgTable('event_dues_payments', {
  id: serial('id').primaryKey(),
  eventDuesScheduleId: integer('event_dues_schedule_id').references(() => eventDuesSchedules.id).notNull(),
  memberId: integer('member_id').references(() => members.id).notNull(),
  walletId: integer('wallet_id').references(() => wallets.id).notNull(),
  amountPaid: bigint('amount_paid', { mode: 'number' }).notNull(),
  status: varchar('status', { length: 20 }).default('LUNAS').notNull(), // LUNAS, SEBAGIAN
  paymentDate: date('payment_date').notNull(),
  proofDriveId: text('proof_drive_id'),
  notes: text('notes'),
  recordedBy: text('recorded_by').references(() => user.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
