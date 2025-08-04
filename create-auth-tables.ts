import { db } from './server/db';
import { sql } from 'drizzle-orm';

async function createAuthTables() {
  console.log('Creating authentication tables...');
  
  try {
    // Create users table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        is_active BOOLEAN DEFAULT TRUE
      )
    `);
    console.log('✓ Users table created');

    // Create user_districts table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS user_districts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        district_code VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, district_code)
      )
    `);
    console.log('✓ User districts table created');

    // Create user_sessions table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL UNIQUE,
        session_token VARCHAR(255) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✓ User sessions table created');

    // Create jwt_blacklist table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS jwt_blacklist (
        id SERIAL PRIMARY KEY,
        token_hash VARCHAR(255) NOT NULL,
        expired_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✓ JWT blacklist table created');

    // Create indexes for performance
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_user_districts_user_id ON user_districts(user_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_user_districts_district_code ON user_districts(district_code)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_jwt_blacklist_token_hash ON jwt_blacklist(token_hash)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_jwt_blacklist_expired_at ON jwt_blacklist(expired_at)`);
    console.log('✓ Indexes created');

    console.log('🎉 All authentication tables created successfully!');
  } catch (error) {
    console.error('Error creating tables:', error);
  }
}

createAuthTables();