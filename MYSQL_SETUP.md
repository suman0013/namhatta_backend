# MySQL Database Setup Guide

This guide will help you configure the Namhatta Management System to use your local MySQL database instead of the default SQLite.

## Prerequisites

- MySQL 8.0+ installed on your local machine
- MySQL server running
- MySQL client or MySQL Workbench (optional, for GUI management)

## Step 1: Create MySQL Database

### Option A: Using MySQL Command Line

1. **Connect to MySQL server:**
   ```bash
   mysql -u root -p
   ```

2. **Create database:**
   ```sql
   CREATE DATABASE namhatta_management;
   ```

3. **Create user (optional but recommended):**
   ```sql
   CREATE USER 'namhatta_user'@'localhost' IDENTIFIED BY 'your_password_here';
   GRANT ALL PRIVILEGES ON namhatta_management.* TO 'namhatta_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

4. **Exit MySQL:**
   ```sql
   EXIT;
   ```

### Option B: Using MySQL Workbench

1. Open MySQL Workbench
2. Connect to your MySQL server
3. Create a new schema named `namhatta_management`
4. (Optional) Create a new user with appropriate permissions

## Step 2: Configure Environment Variables

Create a `.env` file in your project root directory:

```env
# MySQL Database Configuration
DATABASE_URL=mysql://namhatta_user:your_password_here@localhost:3306/namhatta_management

# Alternative format (if you're using root user)
# DATABASE_URL=mysql://root:your_root_password@localhost:3306/namhatta_management

# Other optional configurations
NODE_ENV=development
VITE_API_BASE_URL=http://localhost:5000
```

**Important:** Replace the following placeholders:
- `your_password_here` - Your MySQL user password
- `your_root_password` - Your MySQL root password (if using root)
- `localhost:3306` - Your MySQL host and port (default is localhost:3306)

## Step 3: Install MySQL Dependencies

The project already includes `mysql2` dependency. If you need to install it manually:

```bash
npm install mysql2
```

## Step 4: Generate Database Schema

Run the database migration to create tables in your MySQL database:

```bash
# For MySQL migrations
npx drizzle-kit push --config=drizzle.config.mysql.ts
```

This will create all necessary tables in your MySQL database:
- `devotees`
- `namhattas`
- `devotional_statuses`
- `shraddhakutirs`
- `status_history`
- `namhatta_updates`
- `leaders`
- `addresses`

## Step 5: Start the Application

```bash
npm run dev
```

The application will automatically detect your MySQL configuration and connect to your database.

## Step 6: Verify Connection

Check the console output when starting the application. You should see:
```
🔗 Connected to MySQL database
```

## Database Schema Overview

### Main Tables

1. **devotees** - Personal information, spiritual status, addresses
2. **namhattas** - Spiritual centers information and leadership
3. **devotional_statuses** - Spiritual hierarchy levels
4. **status_history** - Track devotee status changes
5. **namhatta_updates** - Activities and events
6. **leaders** - Leadership hierarchy
7. **addresses** - Geographic data
8. **shraddhakutirs** - Regional administrative units

### Data Types

- **JSON columns** for complex data (addresses, devotional courses)
- **TIMESTAMP** for created/updated dates
- **TEXT** for variable-length strings
- **INT** for identifiers and numbers
- **BOOLEAN** for true/false values

## Troubleshooting

### Common Issues

1. **Connection refused**
   - Ensure MySQL server is running
   - Check host, port, username, and password in DATABASE_URL
   - Verify MySQL is accepting connections on the specified port

2. **Authentication failed**
   - Verify username and password are correct
   - Check if user has proper permissions on the database
   - Try connecting with MySQL client to test credentials

3. **Database not found**
   - Ensure the database `namhatta_management` exists
   - Check database name spelling in DATABASE_URL

4. **Table doesn't exist**
   - Run the migration command: `npx drizzle-kit push --config=drizzle.config.mysql.ts`
   - Verify tables were created in MySQL

### Testing Connection

You can test your MySQL connection manually:

```bash
# Test connection
mysql -u namhatta_user -p -h localhost -P 3306 -D namhatta_management

# Show tables
SHOW TABLES;

# Check a specific table
DESCRIBE devotees;
```

## Data Migration from SQLite

If you want to migrate existing data from SQLite to MySQL:

1. **Export data from SQLite:**
   ```bash
   sqlite3 namhatta.db .dump > data_export.sql
   ```

2. **Clean up the SQL file** (remove SQLite-specific commands)

3. **Import to MySQL:**
   ```bash
   mysql -u namhatta_user -p namhatta_management < data_export.sql
   ```

## Performance Recommendations

1. **Indexing** - Add indexes for frequently queried columns
2. **Connection pooling** - Configure connection pool size
3. **Query optimization** - Use proper WHERE clauses and joins

## Security Best Practices

1. **Don't use root user** - Create dedicated application user
2. **Strong passwords** - Use complex passwords
3. **Network security** - Restrict network access if needed
4. **Regular backups** - Set up automated backups
5. **Keep credentials secure** - Never commit .env files

## Backup and Restore

### Create Backup
```bash
mysqldump -u namhatta_user -p namhatta_management > backup.sql
```

### Restore from Backup
```bash
mysql -u namhatta_user -p namhatta_management < backup.sql
```

## Switching Back to SQLite

To switch back to SQLite, simply remove or rename the `.env` file:
```bash
mv .env .env.backup
```

The application will automatically fall back to SQLite mode.