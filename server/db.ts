import dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from "@shared/schema";

// Load environment variables from .env file
dotenv.config();

// Force use of your specific database URL (overrides any system environment variable)
const connectionString = 'postgresql://neondb_owner:npg_5MIwCD4YhSdP@ep-calm-silence-a15zko7l-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

console.log('Using database connection string:', connectionString.replace(/:[^:@]*@/, ':***@'));

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required for database connection');
}

const sql = neon(connectionString);
const db = drizzle(sql, { schema });

export { db };
