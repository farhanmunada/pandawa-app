import { pgTable, text, varchar, timestamp, bigserial, jsonb } from 'drizzle-orm/pg-core';
import { user } from './auth';

export const auditLogs = pgTable('audit_logs', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  userId: text('user_id').references(() => user.id),
  action: varchar('action', { length: 50 }).notNull(), // e.g., 'CREATE_TRANSACTION', 'APPROVE_TRANSACTION', 'ASSIGN_ROLE'
  targetTable: varchar('target_table', { length: 50 }).notNull(),
  recordId: text('record_id').notNull(),
  oldData: jsonb('old_data'),
  newData: jsonb('new_data'),
  ipAddress: varchar('ip_address', { length: 45 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
