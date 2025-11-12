# Spring Boot Backend Setup Guide for Replit

This guide explains how to run the Namhatta Management System with the **Spring Boot backend** instead of the Node.js backend.

## Overview

The project has two backend implementations:
- **Node.js/Express** (original) - Located in `server/` directory
- **Spring Boot/Java** (new) - Located in `spring-boot-backend/` directory

Both share the same React frontend and PostgreSQL database.

## Architecture When Using Spring Boot

```
┌─────────────────────────────────────────────────────────────┐
│  Port 5000: Vite Dev Server (Frontend only)                 │
│  - Serves React application                                 │
│  - Hot Module Replacement (HMR)                             │
│  - Proxies API calls to Spring Boot on port 8080           │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Port 8080: Spring Boot Backend                             │
│  - REST API endpoints (/api/*)                              │
│  - JWT Authentication                                        │
│  - PostgreSQL Database Connection                           │
└─────────────────────────────────────────────────────────────┘
```

## Prerequisites

The following are already installed in this Replit:
- ✅ Java 17 (OpenJDK)
- ✅ Maven 3.9+
- ✅ Node.js 20
- ✅ PostgreSQL connection (Neon database)

## Configuration Files

### 1. Environment Variables

Create or update `.env.springboot` file with:
```bash
# Point frontend to Spring Boot backend
VITE_API_BASE_URL=http://localhost:8080

# Database connection (already configured)
DATABASE_URL=postgresql://neondb_owner:npg_5MIwCD4YhSdP@ep-calm-silence-a15zko7l-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# JWT and Session secrets (reusing existing values)
JWT_SECRET=42d236149a7fe69b8f2f5ec7093f4805873e6569098cacbdc076eae0f80eef53
SESSION_SECRET=5fcddc0a4c6ed316629c871d768422995efc66aff8fa0c658c1f0006db3c2351

# Authentication enabled
AUTHENTICATION_ENABLED=true
VITE_AUTHENTICATION_ENABLED=true
```

### 2. Spring Boot Port Configuration

The Spring Boot backend is configured in `spring-boot-backend/src/main/resources/application-dev.properties`:
- Default port: **8080** (application.properties)
- Dev profile port: Can be set to **8080** for clarity

### 3. Vite Configuration

The frontend Vite server will:
- Run on port 5000 (for user access)
- Make API calls to `http://localhost:8080` when `VITE_API_BASE_URL` is set
- Use relative URLs when `VITE_API_BASE_URL` is not set (Node.js mode)

## Starting the Application with Spring Boot

### Option 1: Using Workflows (Recommended for Replit)

1. **Configure Workflows**:
   - **Frontend Workflow**: 
     - Name: "Frontend (Vite)"
     - Command: `npm run dev -- --port 5000 --host 0.0.0.0`
     - Port: 5000
     - Output: webview
   
   - **Spring Boot Workflow**:
     - Name: "Spring Boot Backend"
     - Command: `cd spring-boot-backend && mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=dev --server.port=8080"`
     - Port: 8080
     - Output: console

2. **Set Environment Variable**:
   ```bash
   export VITE_API_BASE_URL=http://localhost:8080
   ```

3. **Start Both Workflows**:
   - Start "Spring Boot Backend" workflow first
   - Wait for Spring Boot to fully start (watch for "Started NamhattaManagementSystemApplication")
   - Start "Frontend (Vite)" workflow
   - Access application at port 5000

### Option 2: Manual Command Line

1. **Terminal 1 - Spring Boot Backend**:
   ```bash
   cd spring-boot-backend
   mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=dev --server.port=8080"
   ```

2. **Terminal 2 - Frontend with Spring Boot API URL**:
   ```bash
   export VITE_API_BASE_URL=http://localhost:8080
   npm run dev -- --port 5000 --host 0.0.0.0
   ```

3. Access the application at `http://localhost:5000`

### Option 3: Using Environment File

1. **Load Spring Boot environment**:
   ```bash
   source .env.springboot  # or export $(cat .env.springboot | xargs)
   ```

2. **Start Spring Boot**:
   ```bash
   cd spring-boot-backend && mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=dev --server.port=8080"
   ```

3. **Start Frontend** (in another terminal):
   ```bash
   source .env.springboot
   npm run dev -- --port 5000 --host 0.0.0.0
   ```

## Verifying the Setup

### Check Spring Boot is Running
```bash
curl http://localhost:8080/api/health
```
Expected response: `{"status":"UP"}`

### Check Frontend Can Reach Backend
1. Open browser to `http://localhost:5000`
2. Open browser console (F12)
3. Look for: `🚀 API Configuration: {baseUrl: "http://localhost:8080", ...}`
4. Try logging in - should hit Spring Boot endpoints

### Check Logs
- **Spring Boot logs**: Look for "Started NamhattaManagementSystemApplication in X seconds"
- **Frontend logs**: Look for "[vite] connected" and API configuration showing port 8080

## Switching Back to Node.js Backend

To switch back to the original Node.js/Express backend:

1. **Remove or unset** the environment variable:
   ```bash
   unset VITE_API_BASE_URL
   ```
   OR update `.env.local` and remove `VITE_API_BASE_URL`

2. **Stop Spring Boot workflow** (if running)

3. **Start the original workflow**:
   ```bash
   npm run dev
   ```
   This runs both Node.js backend and frontend on port 5000

## Troubleshooting

### Issue: "Connection Refused" on port 8080
- **Solution**: Spring Boot is not running. Start the Spring Boot workflow/process.

### Issue: Frontend shows "No token provided" but can't login
- **Solution**: Check that `VITE_API_BASE_URL=http://localhost:8080` is set and frontend restarted.

### Issue: CORS errors in browser console
- **Solution**: Spring Boot CORS is already configured. Ensure you're accessing via `localhost:5000` not `0.0.0.0:5000`.

### Issue: 404 on all API calls
- **Solution**: Check API URL in browser console. Should show `http://localhost:8080/api/...` in Network tab.

### Issue: Database connection errors
- **Solution**: Ensure `DATABASE_URL` environment variable is set for Spring Boot. Check `application-dev.properties`.

### Issue: Port 8080 already in use
- **Solution**: 
  ```bash
  lsof -ti:8080 | xargs kill -9
  ```
  Or choose a different port and update `VITE_API_BASE_URL` accordingly.

## Quick Reference Commands

```bash
# Check what's running on ports
lsof -i :5000
lsof -i :8080

# Kill processes on specific port
kill -9 $(lsof -ti:8080)

# Build Spring Boot JAR
cd spring-boot-backend && mvn clean package

# Run Spring Boot from JAR
java -jar spring-boot-backend/target/namhatta-management-system-*.jar --spring.profiles.active=dev --server.port=8080

# Check environment variables
env | grep VITE_API_BASE_URL
env | grep DATABASE_URL
```

## Notes for Replit Agents

When a user asks to "use Spring Boot backend":

1. ✅ Create/update `.env.springboot` with `VITE_API_BASE_URL=http://localhost:8080`
2. ✅ Update Spring Boot's `application-dev.properties` to use port 8080 if needed
3. ✅ Create two workflows: "Spring Boot Backend" (port 8080, console) and "Frontend (Vite)" (port 5000, webview)
4. ✅ Start Spring Boot first, then frontend
5. ✅ Verify both are running and frontend can reach backend
6. ⚠️ Remember: Frontend must be on port 5000 with webview for user to see it
7. ⚠️ Remember: Set environment variable before starting frontend so it knows to call port 8080

## API Endpoint Compatibility

The Spring Boot backend implements **100% API compatibility** with the Node.js backend:
- Same endpoint paths (`/api/*`)
- Same request/response formats
- Same authentication mechanism (JWT in HTTP-only cookies)
- Same database schema (no changes)
- Same role-based access control

This means the React frontend works with **either** backend without code changes.
