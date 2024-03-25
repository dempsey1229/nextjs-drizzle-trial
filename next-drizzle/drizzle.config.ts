import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config({
  path: '.env.local',
});

export default {
  schema: './db/schema',
  out: './migrations',
  driver: 'pg', // 'pg' | 'mysql2' | 'better-sqlite' | 'libsql' | 'turso'
  dbCredentials: {
    connectionString: process.env.DRIZZLE_DATABASE_URL_ON_NEON!,
  },
} satisfies Config;
