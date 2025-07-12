@echo off
echo ========================================
echo  Namhatta Management System Setup
echo  MySQL Configuration for Windows
echo ========================================
echo.

echo 1. Checking MySQL installation...
mysql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ MySQL is not installed or not in PATH
    echo Please install MySQL from: https://dev.mysql.com/downloads/installer/
    pause
    exit /b 1
)
echo ✅ MySQL is installed

echo.
echo 2. Creating database...
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS namhatta_management;"
if %errorlevel% neq 0 (
    echo ❌ Failed to create database
    echo Please check your MySQL credentials
    pause
    exit /b 1
)
echo ✅ Database created

echo.
echo 3. Verifying database...
mysql -u root -p -e "SHOW DATABASES;" | findstr namhatta_management
if %errorlevel% neq 0 (
    echo ❌ Database verification failed
    pause
    exit /b 1
)
echo ✅ Database verified

echo.
echo 4. Updating environment configuration...
echo # Environment Configuration > .env
echo NODE_ENV=development >> .env
echo VITE_API_BASE_URL=http://localhost:5000 >> .env
echo. >> .env
echo # Database Configuration >> .env
echo DATABASE_URL=mysql://root:@localhost:3306/namhatta_management >> .env
echo ✅ Environment configured

echo.
echo 5. Installing dependencies...
npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)
echo ✅ Dependencies installed

echo.
echo 6. Pushing database schema...
npx drizzle-kit push --config=drizzle.config.mysql.ts
if %errorlevel% neq 0 (
    echo ❌ Failed to push schema
    pause
    exit /b 1
)
echo ✅ Schema pushed

echo.
echo 7. Verifying database tables...
mysql -u root -p -e "USE namhatta_management; SHOW TABLES;"
echo ✅ Tables verified

echo.
echo ========================================
echo  Setup Complete! 
echo ========================================
echo.
echo To start the application:
echo   npm run dev:windows
echo.
echo To run seed script:
echo   npx tsx seed-script.ts
echo.
echo Database URL: mysql://root:@localhost:3306/namhatta_management
echo.
pause