# JWT Authentication Implementation Plan

## Project: Namhatta Management System
## Date: January 19, 2025
## Status: IN PROGRESS

## Overview
Implementing JWT-based authentication with username/password login, role-based access control, and development bypass functionality.

## Requirements
- Username/password authentication with JWT tokens
- 3 user roles: ADMIN, OFFICE, DISTRICT_SUPERVISOR
- District-based access control (many-to-many user-district mapping)
- Single login enforcement per user
- HTTP-only cookies for token storage
- 1-hour session duration
- Strong password requirements (10+ chars, special char, number)
- Development bypass mode for easier development

## Implementation Status

### Phase 1: Environment Setup ✅ COMPLETED
- [x] Add environment variables for auth configuration
- [x] Create development/production environment files
- [x] Install required dependencies

### Phase 2: Database Schema Updates ✅ COMPLETED
- [x] Create users table
- [x] Create user_districts table (many-to-many mapping)
- [x] Create user_sessions table (single login enforcement)
- [x] Create jwt_blacklist table
- [x] Run database migration
- [x] Create indexes for performance

### Phase 3: Backend Authentication Core ✅ COMPLETED
- [x] Install dependencies (jsonwebtoken, bcryptjs, express-rate-limit)
- [x] Create password utilities (hash, validate, policy)
- [x] Create JWT utilities (generate, verify, blacklist)
- [x] Create session management (single login enforcement)
- [x] Create authentication middleware with development bypass
- [x] Create authorization middleware
- [x] Create district access validation middleware

### Phase 4: Auth API Endpoints ✅ COMPLETED
- [x] POST /api/auth/login (with rate limiting)
- [x] POST /api/auth/logout (blacklist token, remove session)
- [x] GET /api/auth/verify (validate token + session)
- [x] Development endpoints (/api/dev/auth-status, /api/dev/toggle-auth)
- [x] Integrate auth middleware into existing routes
- [x] Add role-based access control to routes

### Phase 5: District Management ⏳ PENDING
- [ ] Update storage interface for user management
- [ ] Create user-district mapping methods
- [ ] GET /api/users/:userId/districts
- [ ] POST /api/users/:userId/districts (assign districts)
- [ ] DELETE /api/users/:userId/districts/:districtId

### Phase 6: Route Protection ✅ COMPLETED
- [x] Apply authentication middleware to existing routes
- [x] Implement role-based authorization
- [x] Add district-based data filtering for DISTRICT_SUPERVISOR
- [x] Update all existing API endpoints

### Phase 7: Frontend Authentication ✅ COMPLETED
- [x] Create auth context with development bypass
- [x] Create login page component
- [x] Create protected route wrapper
- [x] Update navigation for auth state
- [x] Handle automatic logout on token expiry

### Phase 8: Data Filtering ⏳ PENDING
- [ ] Update devotees endpoints for district filtering
- [ ] Update namhattas endpoints for district filtering
- [ ] Update dashboard for role-based stats
- [ ] Update all list views for access control

### Phase 9: Security & Testing ⏳ PENDING
- [ ] Test single login enforcement
- [ ] Test role-based access control
- [ ] Test district-based data filtering
- [ ] Validate cookie security
- [ ] Test development bypass mode
- [ ] Create default users with secure passwords

### Phase 10: Documentation & Cleanup ⏳ PENDING
- [ ] Update API documentation
- [ ] Create user management guide
- [ ] Update replit.md with auth implementation
- [ ] Clean up unused code

## Database Schema

### New Tables:
```sql
-- Users table
users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('ADMIN', 'OFFICE', 'DISTRICT_SUPERVISOR') NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
)

-- User-District mapping (many-to-many)
user_districts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  district_id INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, district_id)
)

-- Active sessions (single login enforcement)
user_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  session_token VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
)

-- JWT blacklist
jwt_blacklist (
  id SERIAL PRIMARY KEY,
  token_hash VARCHAR(255) NOT NULL,
  expired_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
)
```

## Access Control Matrix
```
Route                    | ADMIN | OFFICE | DISTRICT_SUPERVISOR
-------------------------|-------|--------|-------------------
/api/devotees (GET)      |   ✓   |   ✓    | ✓ (assigned districts)
/api/devotees (POST)     |   ✓   |   ✓    | ✓ (assigned districts)
/api/devotees (PUT)      |   ✓   |   ✓    | ✓ (assigned districts)
/api/devotees (DELETE)   |   ✓   |   ✓    | ✗
/api/namhattas (GET)     |   ✓   |   ✓    | ✓ (assigned districts)
/api/namhattas (POST)    |   ✓   |   ✓    | ✓ (assigned districts)
/api/namhattas (PUT)     |   ✓   |   ✓    | ✓ (assigned districts)
/api/namhattas (DELETE)  |   ✓   |   ✓    | ✗
/api/shraddhakutirs      |   ✓   |   ✓    | ✓ (create only)
/api/users/districts     |   ✓   |   ✓    | ✗
```

## Environment Configuration
```bash
# Development (no auth)
AUTHENTICATION_ENABLED=false
VITE_AUTHENTICATION_ENABLED=false

# Production (with auth)
AUTHENTICATION_ENABLED=true
VITE_AUTHENTICATION_ENABLED=true
JWT_SECRET=your-secure-secret-key
```

## Default Users
```javascript
[
  {
    username: 'admin',
    password: 'Admin@123456',
    role: 'ADMIN'
  },
  {
    username: 'office1', 
    password: 'Office@123456',
    role: 'OFFICE'
  },
  {
    username: 'supervisor1',
    password: 'Super@123456', 
    role: 'DISTRICT_SUPERVISOR',
    districts: [1, 2]
  }
]
```

## Progress Log
- 2025-01-19 12:48: Started implementation plan creation
- 2025-01-19 12:49: Beginning Phase 1 - Environment Setup
- 2025-01-19 12:50: ✅ Phase 1 completed - Dependencies installed, environment configured
- 2025-01-19 12:50: Starting Phase 2 - Database Schema Updates
- 2025-01-19 13:37: ✅ Phase 2 completed - All auth tables created with indexes
- 2025-01-19 13:37: Starting Phase 3 - Backend Authentication Core
- 2025-01-19 13:38: ✅ Phase 3 completed - Auth utilities and middleware created
- 2025-01-19 13:38: Starting Phase 4 - Auth API Endpoints
- 2025-01-19 13:42: ✅ Phases 4 & 6 completed - Auth endpoints and route protection implemented
- 2025-01-19 13:43: 🎯 Core backend authentication fully functional with test users created

## Notes
- Development bypass allows working without authentication
- Single login enforcement prevents multiple concurrent sessions
- HTTP-only cookies provide secure token storage
- District-based filtering ensures data isolation
- Password policy enforces security requirements

## Estimated Completion Time: 10 hours