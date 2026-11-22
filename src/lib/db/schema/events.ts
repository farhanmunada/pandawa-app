import { pgTable, serial, integer, varchar, text, timestamp, bigint, boolean } from 'drizzle-orm/pg-core';
import { user, periods } from './auth';
import { letters } from './letters';

export const events = pgTable('events', {
  id: serial('id').primaryKey(),
  periodId: integer('period_id').references(() => periods.id).notNull(),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description'),
  location: varchar('location', { length: 200 }).notNull(),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),
  status: varchar('status', { length: 20 }).default('PLANNING').notNull(), // PLANNING, ONGOING, COMPLETED, CANCELED
  
  // Financial Allocation
  plannedBudget: bigint('planned_budget', { mode: 'number' }).default(0).notNull(),
  kasAllocation: bigint('kas_allocation', { mode: 'number' }).default(0).notNull(),
  externalSponsorAmount: bigint('external_sponsor_amount', { mode: 'number' }).default(0).notNull(),
  hasSpecialDues: boolean('has_special_dues').default(false).notNull(),
  
  // Associated Official Letter & GDrive
  associatedLetterId: integer('associated_letter_id').references(() => letters.id),
  driveFolderId: text('drive_folder_id'),
  driveFolderUrl: text('drive_folder_url'),
  
  picUserId: text('pic_user_id').references(() => user.id).notNull(),
  lpjNotes: text('lpj_notes'),
  createdBy: text('created_by').references(() => user.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const eventCommittees = pgTable('event_committees', {
  id: serial('id').primaryKey(),
  eventId: integer('event_id').references(() => events.id, { onDelete: 'cascade' }).notNull(),
  userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }).notNull(),
  section: varchar('section', { length: 50 }).notNull(),
  roleTitle: varchar('role_title', { length: 50 }).notNull(),
});
