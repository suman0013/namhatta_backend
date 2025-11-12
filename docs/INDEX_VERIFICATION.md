# Database Index Verification

## Overview
This document outlines the database indexes required for optimal performance of the Namhatta Management System.

## Important Notes
- **DO NOT CREATE NEW INDEXES**: All required indexes already exist in the PostgreSQL database
- This verification is only to confirm their presence
- The Spring Boot migration maintains the existing database schema without changes

## Required Indexes

### Users Table
- `users(username)` - For login performance
- `users(email)` - For uniqueness check and user lookup

### Devotees Table
- `devotees(legal_name)` - For name-based searches
- `devotees(email)` - For email-based lookup
- `devotees(namhatta_id)` - For filtering devotees by Namhatta
- `devotees(leadership_role)` - For filtering by leadership role
- `devotees(reporting_to_devotee_id)` - For hierarchy traversal

### Namhattas Table
- `namhattas(code)` - For unique code lookup
- `namhattas(registration_no)` - For unique registration number lookup
- `namhattas(district_supervisor_id)` - For filtering by district supervisor
- `namhattas(status)` - For filtering by approval status

### Addresses Table
- `addresses(country)` - For geographic filtering
- `addresses(state_name_english)` - For state-level filtering
- `addresses(district_name_english)` - For district-level filtering
- `addresses(pincode)` - For pincode-based searches

### JWT Blacklist Table
- `jwt_blacklist(token_hash)` - For fast token validation
- `jwt_blacklist(expired_at)` - For cleanup operations

## Verification Instructions

### Using SQL Script
Run the verification script to check all indexes:
```bash
psql -U <username> -d <database> -f src/main/resources/sql/verify-indexes.sql
```

### Using Database Tool
1. Connect to the PostgreSQL database
2. Run the following query to list all indexes:
```sql
SELECT schemaname, tablename, indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

## Expected Results
- All listed indexes should show status: **EXISTS**
- If any index shows **MISSING**, verify the database schema matches the original Node.js/Drizzle setup

## Performance Considerations
- These indexes are critical for query performance
- JPA/Hibernate will utilize these indexes automatically through the repository methods
- No additional index hints are needed in JPQL queries
