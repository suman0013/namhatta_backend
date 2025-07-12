@echo off
echo Setting up MySQL database for Namhatta Management System...

echo.
echo 1. Make sure MySQL is installed and running
echo 2. Run this command in MySQL:
echo    mysql -u root -p
echo 3. Then run: SOURCE setup-mysql.sql;
echo.

echo Creating database schema...
npx drizzle-kit push --config=drizzle.config.mysql.ts

echo.
echo MySQL setup completed!
echo Update your .env file with your MySQL credentials:
echo DATABASE_URL=mysql://root:yourpassword@localhost:3306/namhatta_management
echo.
pause