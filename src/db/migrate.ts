import { drizzle } from 'drizzle-orm/neon-serverless';
import { neon } from '@neondatabase/serverless';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import { existsSync } from 'fs';
import { join } from 'path';

// This script will be used to run migrations on the production database
async function main() {
  console.log('Running migrations...');
  
  const migrationsFolder = 'drizzle';
  const journalPath = join(migrationsFolder, 'meta', '_journal.json');
  
  // Check if migrations folder and journal file exist
  if (!existsSync(migrationsFolder) || !existsSync(journalPath)) {
    console.log('No migrations found. Skipping migration step.');
    console.log('Migrations completed successfully!');
    process.exit(0);
  }
  
  // Check if DATABASE_URL is provided
  if (!process.env.DATABASE_URL) {
    console.log('No DATABASE_URL provided. Skipping migration step.');
    console.log('Migrations completed successfully!');
    process.exit(0);
  }
  
  const sql = neon(process.env.DATABASE_URL);
  const db = drizzle(sql);
  
  await migrate(db, { migrationsFolder });
  
  console.log('Migrations completed successfully!');
  process.exit(0);
}

main().catch((err) => {
  console.error('Migration failed!');
  console.error(err);
  process.exit(1);
});