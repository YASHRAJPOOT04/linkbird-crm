import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

// Initialize the Neon SQL client
const sql = neon(process.env.DATABASE_URL!);

// Initialize the Drizzle ORM client with schema
export const db = drizzle(sql, { schema });

// We don't need the custom query builder anymore since we're passing the schema to drizzle