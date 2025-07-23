import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// For migration, create a mock db object that won't be used
console.log('Migration mode: Database connection disabled');

const db = null as any; // Mock db for migration

export { db };
