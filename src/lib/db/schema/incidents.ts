import { pgTable, serial, varchar, text, timestamp, boolean, integer } from 'drizzle-orm/pg-core';
import { user } from './auth';

export const incidents = pgTable('incidents', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 200 }).notNull(),
  category: varchar('category', { length: 50 }).notNull(),
  description: text('description').notNull(),
  location: varchar('location', { length: 150 }).notNull(),
  incidentTime: timestamp('incident_time').notNull(),
  urgency: varchar('urgency', { length: 20 }).notNull(), // LOW, MEDIUM, HIGH, EMERGENCY
  
  // Visibility
  isConfidential: boolean('is_confidential').default(false).notNull(), // true = Pelapor, Keamanan, Ketua/Wakil
  
  status: varchar('status', { length: 20 }).default('OPEN').notNull(), // OPEN, IN_PROGRESS, RESOLVED, CLOSED
  reporterUserId: text('reporter_user_id').references(() => user.id),
  reporterName: varchar('reporter_name', { length: 100 }).notNull(),
  proofDriveId: text('proof_drive_id'),
  proofDriveUrl: text('proof_drive_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const incidentAssignees = pgTable('incident_assignees', {
  id: serial('id').primaryKey(),
  incidentId: integer('incident_id').references(() => incidents.id, { onDelete: 'cascade' }).notNull(),
  assignedUserId: text('assigned_user_id').references(() => user.id).notNull(),
  assignedAt: timestamp('assigned_at').defaultNow().notNull(),
});

export const incidentLogs = pgTable('incident_logs', {
  id: serial('id').primaryKey(),
  incidentId: integer('incident_id').references(() => incidents.id, { onDelete: 'cascade' }).notNull(),
  authorUserId: text('author_user_id').references(() => user.id).notNull(),
  actionTaken: text('action_taken').notNull(),
  proofDriveId: text('proof_drive_id'),
  proofDriveUrl: text('proof_drive_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
