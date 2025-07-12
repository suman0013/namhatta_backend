// Database connection with automatic MySQL/PostgreSQL detection
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required. Please set your database connection string.");
}

const useMySQL = databaseUrl.startsWith('mysql://') || databaseUrl.startsWith('mysql2://');
const usePostgreSQL = databaseUrl.startsWith('postgresql://') || databaseUrl.startsWith('postgres://');

let db: any;

if (useMySQL) {
  // MySQL setup (local development)
  const { createConnection } = await import('mysql2/promise');
  const { drizzle: drizzleMySQL } = await import('drizzle-orm/mysql2');
  const mysqlSchema = await import("@shared/schema-mysql");
  const connection = await createConnection(databaseUrl);
  db = drizzleMySQL(connection, { schema: mysqlSchema });
  console.log('🔗 Connected to MySQL database');
} else if (usePostgreSQL) {
  // PostgreSQL setup (Replit production)
  const { Client } = await import('pg');
  const { drizzle: drizzlePostgreSQL } = await import('drizzle-orm/node-postgres');
  const postgresSchema = await import("@shared/schema-postgres");
  const client = new Client({ connectionString: databaseUrl });
  await client.connect();
  db = drizzlePostgreSQL(client, { schema: postgresSchema });
  console.log('🔗 Connected to PostgreSQL database');
} else {
  throw new Error("Unsupported database URL. Please use MySQL or PostgreSQL connection string.");
}

export { db };
