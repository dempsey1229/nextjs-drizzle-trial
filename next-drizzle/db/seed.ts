import * as schema from './schema/schema';
import { drizzle } from 'drizzle-orm/neon-http';
import { faker } from '@faker-js/faker';
import { neon } from '@neondatabase/serverless';
import { sql } from 'drizzle-orm';
import * as dotenv from 'dotenv';
dotenv.config({ path: './.env.local' });

if (!('DRIZZLE_DATABASE_URL_ON_NEON' in process.env))
  throw new Error('DRIZZLE_DATABASE_URL_ON_NEON not found on .env.local');
const connectionString = process.env.DRIZZLE_DATABASE_URL_ON_NEON!;
const dbInstance = drizzle(neon(connectionString), { schema });

async function truncateAllTable() {
  const query = sql`SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE';
  `;

  const queryResult = await dbInstance.execute(query); // retrieve tables
  const tablesName = queryResult.rows.map((row) => row['table_name']);
  //   console.log(tablesName);
  await Promise.all(
    tablesName.map((tName) => {
      const query = sql.raw(`TRUNCATE TABLE ${tName} CASCADE;`);
      return dbInstance.execute(query);
    })
  );
}

async function addSeedFile() {
  /* Add seedfile below. Use db.insert */
}

const main = async () => {
  await truncateAllTable();
  await addSeedFile();
};

main();
