import type { Config } from 'drizzle-kit';

export default {
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    // Use empty string if DATABASE_URL is not defined during build/generate.
    // drizzle-kit generate does not require a live DB connection.
    url: process.env.DATABASE_URL || '',
  },
} satisfies Config;