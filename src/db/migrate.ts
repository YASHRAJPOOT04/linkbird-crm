import { drizzle } from 'drizzle-orm/neon-serverless';
import { neon } from '@neondatabase/serverless';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';

// This script will be used to run migrations on the production database
async function main() {
  console.log('Running migrations...');
  
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql);
  
  await migrate(db, { migrationsFolder: 'drizzle' });
  
  console.log('Migrations completed successfully!');
  process.exit(0);
}

main().catch((err) => {
  console.error('Migration failed!');
  console.error(err);
  process.exit(1);
});