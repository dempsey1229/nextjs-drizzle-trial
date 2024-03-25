import * as schema from './schema/schema';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as dotenv from 'dotenv';

dotenv.config({
  path: '.env.local',
});
const connectionString = process.env.DRIZZLE_DATABASE_URL_ON_NEON!;

const sql = neon(connectionString);
const dbInstance = drizzle(sql, { schema });

export default dbInstance;
