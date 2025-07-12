// Database connection with automatic MySQL/PostgreSQL detection
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required. Please set your database connection string.");
}

const useMySQL = databaseUrl.startsWith('mysql://') || databaseUrl.startsWith('mysql2://');
const usePostgreSQL = databaseUrl.startsWith('postgresql://') || databaseUrl.startsWith('postgres://');

let db: any;
let client: any;

if (useMySQL) {
  // MySQL setup (local development)
  const { createConnection } = await import('mysql2/promise');
  const { drizzle: drizzleMySQL } = await import('drizzle-orm/mysql2');
  const mysqlSchema = await import("@shared/schema-mysql");
  const connection = await createConnection(databaseUrl);
  db = drizzleMySQL(connection, { schema: mysqlSchema });
  console.log('🔗 Connected to MySQL database');
} else if (usePostgreSQL) {
  // PostgreSQL setup (Replit production) with connection pooling
  const { Pool } = await import('pg');
  const { drizzle: drizzlePostgreSQL } = await import('drizzle-orm/node-postgres');
  const postgresSchema = await import("@shared/schema-postgres");
  
  // Use connection pooling instead of single client
  const pool = new Pool({ 
    connectionString: databaseUrl,
    max: 20, // Maximum number of connections
    idleTimeoutMillis: 30000, // 30 seconds
    connectionTimeoutMillis: 10000, // 10 seconds
    acquireTimeoutMillis: 60000, // 60 seconds
    createTimeoutMillis: 30000, // 30 seconds
    destroyTimeoutMillis: 5000, // 5 seconds
    reapIntervalMillis: 1000, // 1 second
    createRetryIntervalMillis: 200, // 200ms
  });
  
  // Handle pool events
  pool.on('error', (err) => {
    console.error('Database pool error:', err);
  });
  
  db = drizzlePostgreSQL(pool, { schema: postgresSchema });
  client = pool;
  console.log('🔗 Connected to PostgreSQL database');
} else {
  throw new Error("Unsupported database URL. Please use MySQL or PostgreSQL connection string.");
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down database connection...');
  if (client && client.end) {
    await client.end();
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down database connection...');
  if (client && client.end) {
    await client.end();
  }
  process.exit(0);
});

export { db };
