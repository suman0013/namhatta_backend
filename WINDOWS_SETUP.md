# Windows Setup Guide

This guide helps you run the Namhatta Management System on Windows.

## Issue: NODE_ENV Command Not Recognized

Windows Command Prompt doesn't recognize `NODE_ENV=development` syntax. Here are several solutions:

## Solution 1: Use PowerShell (Recommended)

1. **Open PowerShell** (not Command Prompt)
2. **Navigate to your project directory**:
   ```powershell
   cd D:\CODES\GIT\NH_FE
   ```
3. **Run the development server**:
   ```powershell
   $env:NODE_ENV="development"; npm run dev
   ```

## Solution 2: Use cross-env (Alternative)

If you prefer to use Command Prompt, you can install `cross-env`:

1. **Install cross-env** (if not already installed):
   ```bash
   npm install --save-dev cross-env
   ```

2. **Create a Windows-compatible script** by adding this to your `package.json`:
   ```json
   {
     "scripts": {
       "dev:windows": "cross-env NODE_ENV=development tsx server/index.ts",
       "dev": "NODE_ENV=development tsx server/index.ts"
     }
   }
   ```

3. **Run the Windows-compatible command**:
   ```bash
   npm run dev:windows
   ```

## Solution 3: Create a .env File (Easiest)

1. **Create a `.env` file** in your project root:
   ```env
   NODE_ENV=development
   DATABASE_URL=./namhatta.db
   VITE_API_BASE_URL=http://localhost:5000
   ```

2. **Run the regular npm command**:
   ```bash
   npm run dev
   ```

## Solution 4: Use Git Bash

If you have Git for Windows installed:

1. **Open Git Bash**
2. **Navigate to your project**:
   ```bash
   cd /d/CODES/GIT/NH_FE
   ```
3. **Run the development server**:
   ```bash
   npm run dev
   ```

## MySQL Configuration on Windows

If you want to use MySQL on Windows:

1. **Install MySQL** on Windows (if not already installed)
2. **Create the database**:
   ```sql
   CREATE DATABASE namhatta_management;
   ```
3. **Update your `.env` file**:
   ```env
   NODE_ENV=development
   DATABASE_URL=mysql://username:password@localhost:3306/namhatta_management
   VITE_API_BASE_URL=http://localhost:5000
   ```
4. **Push the schema**:
   ```bash
   npx drizzle-kit push --config=drizzle.config.mysql.ts
   ```

## Recommended Development Setup for Windows

1. **Use PowerShell or Git Bash** instead of Command Prompt
2. **Create a `.env` file** for environment variables
3. **Install Windows Terminal** for better terminal experience
4. **Use VS Code** with PowerShell integrated terminal

## Common Windows Issues and Solutions

### Issue: Permission Denied
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Issue: npm not found
Make sure Node.js is installed and added to your PATH.

### Issue: Database connection failed
- Ensure MySQL service is running
- Check Windows Firewall settings
- Verify database credentials

## Step-by-Step Setup

1. **Open PowerShell as Administrator**
2. **Navigate to your project**:
   ```powershell
   cd D:\CODES\GIT\NH_FE
   ```
3. **Create .env file**:
   ```powershell
   echo "NODE_ENV=development" > .env
   echo "DATABASE_URL=./namhatta.db" >> .env
   echo "VITE_API_BASE_URL=http://localhost:5000" >> .env
   ```
4. **Install dependencies**:
   ```powershell
   npm install
   ```
5. **Run the application**:
   ```powershell
   npm run dev
   ```

## Running Scripts on Windows

For TypeScript files, you need to use `npx tsx` instead of `node`:

**Seed Script:**
```bash
# Option 1: Use the runner script
node run-seed.js

# Option 2: Use the batch file
seed.bat

# Option 3: Use npx directly
npx tsx seed-script.ts
```

**Development Server:**
```bash
# Option 1: Use the runner script
node run-dev.js

# Option 2: Use the batch file
start-dev.bat

# Option 3: Use PowerShell
$env:NODE_ENV="development"; npm run dev
```

The application should now start successfully on Windows!