import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { dash } from '@better-auth/infra';
import { db } from '@/lib/db';
import * as schema from '@/lib/db/schema';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    async sendResetPassword(data) {
      // Log reset URL for development and audit trail
      console.log(`[AUTH] Reset password request for ${data.user.email}: token=${data.token}`);
    },
  },
  plugins: [
    dash(),
  ],
});
