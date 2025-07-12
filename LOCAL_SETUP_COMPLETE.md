# Complete Local Setup Guide for Windows + MySQL

## ✅ What We've Accomplished

**Complete SQLite Removal:**
- ✅ Removed `better-sqlite3` dependency
- ✅ Deleted `namhatta.db` file
- ✅ Removed all SQLite schema files
- ✅ Updated all imports to use dynamic schema loading

**Dual Database Architecture:**
- ✅ MySQL support for local Windows development
- ✅ PostgreSQL support for Replit production
- ✅ Automatic database detection based on `DATABASE_URL`
- ✅ Separate schema files for each database type

## 🛠️ Your Next Steps (Windows Local Setup)

### 1. Prerequisites
- Windows 10/11
- MySQL 8.0+ installed
- Node.js 20+ installed
- Git installed

### 2. MySQL Setup
```bash
# Start MySQL service
net start mysql

# Connect to MySQL
mysql -u root -p

# Create database
CREATE DATABASE IF NOT EXISTS namhatta_management;
SHOW DATABASES;
exit
```

### 3. Project Configuration
```bash
# Clone/download the project
cd D:\CODES\GIT\NH_FE

# Install dependencies
npm install

# Create .env file
echo NODE_ENV=development > .env
echo VITE_API_BASE_URL=http://localhost:5000 >> .env
echo DATABASE_URL=mysql://root:yourpassword@localhost:3306/namhatta_management >> .env
```

**Replace `yourpassword` with your actual MySQL root password.**

### 4. Database Schema Setup
```bash
# Push MySQL schema to database
npx drizzle-kit push --config=drizzle.config.mysql.ts

# Verify tables were created
mysql -u root -p -e "USE namhatta_management; SHOW TABLES;"
```

### 5. Start Application
```bash
# Start development server
npm run dev:windows

# Alternative: Use cross-platform runner
node run-dev.js
```

### 6. Seed Database (Optional)
```bash
# Add sample data
npx tsx seed-script.ts
```

## 📁 Project Structure

```
NH_FE/
├── shared/
│   ├── schema-mysql.ts        # MySQL database schema
│   └── schema-postgres.ts     # PostgreSQL database schema
├── server/
│   ├── db.ts                  # Auto-detecting database connection
│   ├── routes.ts              # API routes with dynamic schemas
│   ├── storage-db.ts          # Database storage implementation
│   └── seed-data.ts           # Sample data seeding
├── drizzle.config.mysql.ts    # MySQL Drizzle configuration
├── drizzle.config.postgres.ts # PostgreSQL Drizzle configuration
├── .env                       # Environment configuration
└── setup-windows-mysql.bat    # Automated Windows setup
```

## 🚀 Quick Start Commands

### Windows Command Prompt
```bash
# Automated setup
setup-windows-mysql.bat

# Manual setup
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS namhatta_management;"
npx drizzle-kit push --config=drizzle.config.mysql.ts
npm run dev:windows
```

### Windows PowerShell
```powershell
# Manual setup
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS namhatta_management;"
npx drizzle-kit push --config=drizzle.config.mysql.ts
$env:NODE_ENV="development"; npm run dev
```

## 🔧 Configuration Files

### .env Configuration
```env
NODE_ENV=development
VITE_API_BASE_URL=http://localhost:5000
DATABASE_URL=mysql://root:yourpassword@localhost:3306/namhatta_management
```

### MySQL Connection Examples
```env
# No password
DATABASE_URL=mysql://root:@localhost:3306/namhatta_management

# With password
DATABASE_URL=mysql://root:mypassword@localhost:3306/namhatta_management

# Custom user
DATABASE_URL=mysql://user:password@localhost:3306/namhatta_management

# Different port
DATABASE_URL=mysql://root:password@localhost:3307/namhatta_management
```

## 🎯 Expected Results

When everything is working correctly, you should see:
```
🔗 Connected to MySQL database
[timestamp] [express] serving on port 5000
```

And the application will be available at: `http://localhost:5000`

## 📊 Database Tables

The application will create these tables in MySQL:
- `devotees` - Devotee information and spiritual data
- `namhattas` - Namhatta centers and meeting details
- `devotional_statuses` - Spiritual hierarchy levels
- `shraddhakutirs` - Regional administrative units
- `namhatta_updates` - Program and event updates
- `leaders` - Leadership hierarchy structure
- `addresses` - Geographic address information
- `devotee_addresses` - Devotee address mappings
- `namhatta_addresses` - Namhatta address mappings
- `status_history` - Status change tracking

## 🐛 Troubleshooting

### Common Issues

**Error: "DATABASE_URL is required"**
- Make sure `.env` file exists in project root
- Check DATABASE_URL format is correct

**Error: "Access denied for user 'root'"**
- Check MySQL password in DATABASE_URL
- Verify MySQL service is running

**Error: "Unknown database 'namhatta_management'"**
- Create database manually: `CREATE DATABASE namhatta_management;`
- Check database name spelling

**Error: "connect ECONNREFUSED"**
- Start MySQL service: `net start mysql`
- Check if MySQL is running on port 3306

### Database Verification
```bash
# Check if database exists
mysql -u root -p -e "SHOW DATABASES;" | findstr namhatta

# Check tables
mysql -u root -p -e "USE namhatta_management; SHOW TABLES;"

# Check sample data
mysql -u root -p -e "USE namhatta_management; SELECT COUNT(*) FROM devotees;"
```

## 🔄 Environment Switching

The application automatically detects your database type:
- **MySQL**: `mysql://` URLs → Uses `schema-mysql.ts`
- **PostgreSQL**: `postgresql://` URLs → Uses `schema-postgres.ts`

## 📞 Support

If you encounter issues:
1. Check the error logs in the terminal
2. Verify MySQL service is running
3. Confirm database credentials
4. Check the complete setup guide in `DUAL_DATABASE_SETUP.md`

Your application is now ready for local development with MySQL!