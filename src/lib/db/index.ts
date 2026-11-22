import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as dotenv from 'dotenv';
import * as schema from './schema';

dotenv.config({ path: '.env.local' });
dotenv.config(); // fallback to .env

const connectionString = process.env.DATABASE_URL || '';

// HTTP client optimized for serverless without WebSocket connection overhead
const sql = neon(connectionString);

export const db = drizzle(sql, { schema });
