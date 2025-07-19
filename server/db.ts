import dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from "@shared/schema";

// Load environment variables from .env file
dotenv.config();

// Get database connection string from environment variable
const connectionString = process.env.DATABASE_URL;

console.log('Using database connection string:', connectionString?.replace(/:[^:@]*@/, ':***@'));

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required for database connection');
}

const sql = neon(connectionString);
const db = drizzle(sql, { schema });

export { db };
