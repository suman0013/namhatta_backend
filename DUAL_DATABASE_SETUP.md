# Dual Database Setup Guide

This application supports both MySQL (local development) and PostgreSQL (Replit production) with automatic detection based on the `DATABASE_URL` environment variable.

## ✅ Completed Changes

**SQLite Removal:**
- ✅ Removed `better-sqlite3` dependency
- ✅ Deleted `namhatta.db` file
- ✅ Removed `shared/schema.ts` (SQLite schema)
- ✅ Removed `drizzle.config.sqlite.ts`

**Database Support Added:**
- ✅ Added PostgreSQL support with `shared/schema-postgres.ts`
- ✅ Added `pg` and `@types/pg` dependencies
- ✅ Updated `server/db.ts` for automatic MySQL/PostgreSQL detection
- ✅ Created `drizzle.config.postgres.ts` for PostgreSQL migrations

## 🔧 Configuration

### Environment Variables (.env)

```env
# Environment Configuration
NODE_ENV=development
VITE_API_BASE_URL=http://localhost:5000

# Database Configuration
# For Local Windows MySQL:
DATABASE_URL=mysql://root:@localhost:3306/namhatta_management

# For Replit PostgreSQL (uncomment when using Replit):
# DATABASE_URL=postgresql://username:password@host:5432/database
```

## 🖥️ Local Windows MySQL Setup

### 1. Prerequisites
- MySQL 8.0+ installed on Windows
- MySQL service running

### 2. Database Setup
```sql
-- Connect to MySQL
mysql -u root -p

-- Create database
CREATE DATABASE IF NOT EXISTS namhatta_management;

-- Verify database
SHOW DATABASES;
```

### 3. Environment Configuration
Update your `.env` file:
```env
DATABASE_URL=mysql://root:yourpassword@localhost:3306/namhatta_management
```

### 4. Database Migration
```bash
# Push MySQL schema
npx drizzle-kit push --config=drizzle.config.mysql.ts

# Verify tables
mysql -u root -p -e "USE namhatta_management; SHOW TABLES;"
```

### 5. Start Application
```bash
npm run dev:windows
```

You should see: "🔗 Connected to MySQL database"

## 🌐 Replit PostgreSQL Setup

### 1. Database Provisioning
In Replit:
1. Open project settings
2. Go to "Database" tab
3. Create PostgreSQL database
4. Copy connection string

### 2. Environment Configuration
Update your `.env` file:
```env
DATABASE_URL=postgresql://username:password@host:5432/database
```

### 3. Database Migration
```bash
# Push PostgreSQL schema
npx drizzle-kit push --config=drizzle.config.postgres.ts
```

### 4. Start Application
```bash
npm run dev
```

You should see: "🔗 Connected to PostgreSQL database"

## 🔄 Automatic Detection

The application automatically detects the database type based on the `DATABASE_URL`:

- **MySQL**: URLs starting with `mysql://` or `mysql2://`
- **PostgreSQL**: URLs starting with `postgresql://` or `postgres://`

## 📁 Database Schema Files

- `shared/schema-mysql.ts` - MySQL schema and types
- `shared/schema-postgres.ts` - PostgreSQL schema and types
- `drizzle.config.mysql.ts` - MySQL Drizzle configuration
- `drizzle.config.postgres.ts` - PostgreSQL Drizzle configuration

## 🚀 Running the Application

### Local Development (Windows + MySQL)
```bash
# Set up MySQL database
mysql -u root -p < setup-mysql.sql

# Update .env for MySQL
DATABASE_URL=mysql://root:password@localhost:3306/namhatta_management

# Push schema
npx drizzle-kit push --config=drizzle.config.mysql.ts

# Start application
npm run dev:windows
```

### Replit Production (PostgreSQL)
```bash
# Update .env for PostgreSQL
DATABASE_URL=postgresql://username:password@host:5432/database

# Push schema
npx drizzle-kit push --config=drizzle.config.postgres.ts

# Start application
npm run dev
```

## 🔧 Database Commands

### MySQL Commands
```bash
# Push schema
npx drizzle-kit push --config=drizzle.config.mysql.ts

# Generate migration
npx drizzle-kit generate --config=drizzle.config.mysql.ts

# Run seed script
npx tsx seed-script.ts
```

### PostgreSQL Commands
```bash
# Push schema
npx drizzle-kit push --config=drizzle.config.postgres.ts

# Generate migration
npx drizzle-kit generate --config=drizzle.config.postgres.ts

# Run seed script
npx tsx seed-script.ts
```

## 📊 Database Tables

Both databases will have the same tables:
- `devotees` - Devotee information
- `namhattas` - Namhatta centers
- `devotional_statuses` - Spiritual hierarchy levels
- `addresses` - Geographic addresses
- `devotee_addresses` - Devotee address mappings
- `namhatta_addresses` - Namhatta address mappings
- `status_history` - Status change history
- `namhatta_updates` - Program updates
- `leaders` - Leadership hierarchy
- `shraddhakutirs` - Regional administrative units

## 🐛 Troubleshooting

### MySQL Connection Issues
- Ensure MySQL service is running
- Check credentials in DATABASE_URL
- Verify database exists
- Check firewall settings

### PostgreSQL Connection Issues
- Verify connection string format
- Check network connectivity
- Ensure database is provisioned in Replit
- Verify credentials

### Schema Issues
- Run `npx drizzle-kit push` to sync schema
- Check migration files in `migrations/` directory
- Verify environment variables are set correctly