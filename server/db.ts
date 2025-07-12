import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';

// Check if MySQL is configured
const databaseUrl = process.env.DATABASE_URL || './namhatta.db';
const useMySQL = databaseUrl.startsWith('mysql://') || databaseUrl.startsWith('mysql2://');

let db: ReturnType<typeof drizzle>;

if (useMySQL) {
  // MySQL setup (both development and production)
  const { createConnection } = await import('mysql2/promise');
  const { drizzle: drizzleMySQL } = await import('drizzle-orm/mysql2');
  const mysqlSchema = await import("@shared/schema-mysql");
  const connection = await createConnection(databaseUrl);
  db = drizzleMySQL(connection, { schema: mysqlSchema });
  console.log('🔗 Connected to MySQL database');
} else {
  // SQLite setup (fallback)
  const sqliteSchema = await import("@shared/schema");
  const sqlite = new Database(databaseUrl);
  db = drizzle(sqlite, { schema: sqliteSchema });
  console.log('🔗 Connected to SQLite database');
}

export { db };
