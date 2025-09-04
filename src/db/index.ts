import { drizzle } from 'drizzle-orm/neon-serverless';
import { neon } from '@neondatabase/serverless';

// Initialize the Neon SQL client
const sql = neon(process.env.DATABASE_URL!);

// Initialize the Drizzle ORM client
export const db = drizzle(sql);