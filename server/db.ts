import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from "@shared/schema";

// Use SQLite for development, MySQL for production
const dbPath = process.env.DATABASE_URL || './namhatta.db';
const isProduction = process.env.NODE_ENV === 'production';

let db: ReturnType<typeof drizzle>;

if (isProduction && process.env.DATABASE_URL?.startsWith('mysql://')) {
  // Production MySQL setup
  const { createConnection } = await import('mysql2/promise');
  const { drizzle: drizzleMySQL } = await import('drizzle-orm/mysql2');
  const connection = await createConnection(process.env.DATABASE_URL);
  db = drizzleMySQL(connection, { schema });
} else {
  // Development SQLite setup
  const sqlite = new Database(dbPath);
  db = drizzle(sqlite, { schema });
}

export { db };
