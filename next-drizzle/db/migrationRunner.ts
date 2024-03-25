import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config({
  path: '.env.local',
});

const connectionString = process.env.DRIZZLE_DATABASE_URL_ON_NEON!;
const sql = postgres(connectionString, { max: 1 });
const db = drizzle(sql);

migrate(db, { migrationsFolder: 'drizzle' });

sql.end();
