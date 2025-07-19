import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from "@shared/schema";

// Use the provided Neon PostgreSQL connection string from environment variables
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required for database connection');
}

const sql = neon(connectionString);
const db = drizzle(sql, { schema });

export { db };
