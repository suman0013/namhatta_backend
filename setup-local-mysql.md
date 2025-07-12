# Local MySQL Setup Guide (Windows)

This guide helps you set up MySQL database locally on your Windows machine.

## Prerequisites

1. **Install MySQL** on Windows:
   - Download from https://dev.mysql.com/downloads/mysql/
   - Or use MySQL Installer: https://dev.mysql.com/downloads/installer/
   - Or use XAMPP: https://www.apachefriends.org/

## Setup Steps

### 1. Start MySQL Service

**Option A: Using MySQL Workbench**
- Open MySQL Workbench
- Connect to Local instance MySQL80 (or your version)

**Option B: Using Command Line**
```bash
# Start MySQL service
net start mysql

# Connect to MySQL
mysql -u root -p
```

**Option C: Using XAMPP**
- Open XAMPP Control Panel
- Start MySQL service

### 2. Create Database

Connect to MySQL and run:
```sql
CREATE DATABASE IF NOT EXISTS namhatta_management;
USE namhatta_management;
SHOW DATABASES;
```

### 3. Update Environment Variables

Create or update your `.env` file:
```env
NODE_ENV=development
DATABASE_URL=mysql://root:yourpassword@localhost:3306/namhatta_management
VITE_API_BASE_URL=http://localhost:5000
```

Replace `yourpassword` with your actual MySQL root password.

### 4. Push Database Schema

```bash
# Push the MySQL schema
npx drizzle-kit push --config=drizzle.config.mysql.ts

# Verify tables were created
mysql -u root -p -e "USE namhatta_management; SHOW TABLES;"
```

### 5. Run the Application

```bash
npm run dev:windows
```

You should see: "🔗 Connected to MySQL database"

## Troubleshooting

### Error: Access denied for user 'root'@'localhost'
- Check your MySQL password
- Update the DATABASE_URL in .env file

### Error: Unknown database 'namhatta_management'
- Make sure you created the database (Step 2)
- Check database name spelling

### Error: connect ECONNREFUSED
- MySQL service is not running
- Start MySQL service (Step 1)

### Error: Client does not support authentication protocol
```sql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'yourpassword';
FLUSH PRIVILEGES;
```

## Database Schema

The application will create these tables:
- devotees
- namhattas
- devotional_statuses
- addresses
- devotee_addresses
- namhatta_addresses
- status_history
- namhatta_updates
- leaders
- shraddhakutirs

## Sample Data

To add sample data, run:
```bash
npx tsx seed-script.ts
```

## MySQL Configuration Files

- `drizzle.config.mysql.ts` - Database configuration
- `shared/schema-mysql.ts` - Database schema
- `server/db.ts` - Database connection logic