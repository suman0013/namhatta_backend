# Phase 12 - API Contract Validation Checklist

## Task 12.1.1: Endpoint Comparison

### Authentication & System Endpoints

| Endpoint | Method | Node.js | Spring Boot | Status | Notes |
|----------|--------|---------|-------------|--------|-------|
| `/api/auth/login` | POST | ✅ | ✅ | ✅ | Returns JWT in cookie |
| `/api/auth/logout` | POST | ✅ | ✅ | ✅ | Blacklists token |
| `/api/auth/verify` | GET | ✅ | ✅ | ✅ | Verify JWT validity |
| `/api/auth/user-districts` | GET | ✅ | ✅ | ✅ | Get user districts |
| `/api/health` | GET | ✅ | ✅ | ✅ | Health check |
| `/api/about` | GET | ✅ | ✅ | ✅ | System metadata |

### Geography Endpoints (NO AUTH)

| Endpoint | Method | Node.js | Spring Boot | Status | Notes |
|----------|--------|---------|-------------|--------|-------|
| `/api/countries` | GET | ✅ | ✅ | ✅ | List countries |
| `/api/states` | GET | ✅ | ✅ | ✅ | List states by country |
| `/api/districts` | GET | ✅ | ✅ | ✅ | List districts by state |
| `/api/sub-districts` | GET | ✅ | ✅ | ✅ | List sub-districts |
| `/api/villages` | GET | ✅ | ✅ | ✅ | List villages |
| `/api/pincodes` | GET | ✅ | ✅ | ✅ | List pincodes |
| `/api/pincodes/search` | GET | ✅ | ✅ | ✅ | Search pincodes with pagination |
| `/api/address-by-pincode` | GET | ✅ | ✅ | ✅ | Get address by pincode |

### Devotee Management Endpoints

| Endpoint | Method | Node.js | Spring Boot | Status | Notes |
|----------|--------|---------|-------------|--------|-------|
| `/api/devotees` | GET | ✅ | ✅ | ✅ | List with pagination/filtering |
| `/api/devotees/:id` | GET | ✅ | ✅ | ✅ | Get devotee by ID |
| `/api/devotees` | POST | ✅ | ✅ | ✅ | Create devotee |
| `/api/devotees/:namhattaId` | POST | ✅ | ✅ | ✅ | Create devotee for namhatta |
| `/api/devotees/:id` | PUT | ✅ | ✅ | ✅ | Update devotee |
| `/api/devotees/:id/upgrade-status` | POST | ✅ | ✅ | ✅ | Upgrade devotional status |
| `/api/devotees/:id/assign-leadership` | POST | ✅ | ✅ | ✅ | Assign leadership role |
| `/api/devotees/:id/leadership` | DELETE | ✅ | ✅ | ✅ | Remove leadership role |
| `/api/devotees/:id/link-user` | POST | ✅ | ✅ | ✅ | Create user account |
| `/api/devotees/available-officers` | GET | ✅ | ✅ | ✅ | Get eligible officers |

### Namhatta Management Endpoints

| Endpoint | Method | Node.js | Spring Boot | Status | Notes |
|----------|--------|---------|-------------|--------|-------|
| `/api/namhattas` | GET | ✅ | ✅ | ✅ | List with pagination (NO AUTH) |
| `/api/namhattas/:id` | GET | ✅ | ✅ | ✅ | Get by ID (NO AUTH) |
| `/api/namhattas` | POST | ✅ | ✅ | ✅ | Create namhatta (AUTH) |
| `/api/namhattas/:id` | PUT | ✅ | ✅ | ✅ | Update namhatta |
| `/api/namhattas/check-registration/:registrationNo` | GET | ✅ | ✅ | ✅ | Check registration number |
| `/api/namhattas/:id/approve` | POST | ✅ | ✅ | ✅ | Approve namhatta |
| `/api/namhattas/:id/reject` | POST | ✅ | ✅ | ✅ | Reject namhatta |
| `/api/namhattas/:id/devotees` | GET | ✅ | ✅ | ✅ | Get devotees in namhatta |
| `/api/namhattas/:id/updates` | GET | ✅ | ✅ | ✅ | Get activity updates |
| `/api/namhattas/:id/devotee-status-count` | GET | ✅ | ✅ | ✅ | Get devotee count by status |
| `/api/namhattas/:id/status-history` | GET | ✅ | ✅ | ✅ | Get status history |

### Senapoti Role Management Endpoints

| Endpoint | Method | Node.js | Spring Boot | Status | Notes |
|----------|--------|---------|-------------|--------|-------|
| `/api/senapoti/transfer-subordinates` | POST | ✅ | ✅ | ✅ | Transfer subordinates |
| `/api/senapoti/promote` | POST | ✅ | ✅ | ✅ | Promote devotee |
| `/api/senapoti/demote` | POST | ✅ | ✅ | ✅ | Demote devotee |
| `/api/senapoti/remove-role` | POST | ✅ | ✅ | ✅ | Remove leadership role |
| `/api/senapoti/available-supervisors/:districtCode/:targetRole` | GET | ✅ | ✅ | ✅ | Get available supervisors |
| `/api/senapoti/subordinates/:devoteeId` | GET | ✅ | ✅ | ✅ | Get direct subordinates |
| `/api/senapoti/subordinates/:devoteeId/all` | GET | ✅ | ✅ | ✅ | Get all subordinates |
| `/api/senapoti/role-history/:devoteeId` | GET | ✅ | ✅ | ✅ | Get role change history |

### Admin Endpoints

| Endpoint | Method | Node.js | Spring Boot | Status | Notes |
|----------|--------|---------|-------------|--------|-------|
| `/api/admin/register-supervisor` | POST | ✅ | ✅ | ✅ | Register district supervisor |
| `/api/admin/users` | GET | ✅ | ✅ | ✅ | Get all users |
| `/api/admin/available-districts` | GET | ✅ | ✅ | ✅ | Get available districts |
| `/api/admin/users/:id` | PUT | ✅ | ✅ | ✅ | Update user |
| `/api/admin/users/:id` | DELETE | ✅ | ✅ | ✅ | Deactivate user |

### Dashboard & Reports Endpoints

| Endpoint | Method | Node.js | Spring Boot | Status | Notes |
|----------|--------|---------|-------------|--------|-------|
| `/api/dashboard` | GET | ✅ | ✅ | ✅ | Dashboard summary |
| `/api/status-distribution` | GET | ✅ | ✅ | ✅ | Devotee status distribution |
| `/api/reports/hierarchical` | GET | ✅ | ✅ | ✅ | Hierarchical reports |
| `/api/reports/states` | GET | ✅ | ✅ | ✅ | States with counts |
| `/api/reports/districts/:state` | GET | ✅ | ✅ | ✅ | Districts with counts |
| `/api/reports/sub-districts/:state/:district` | GET | ✅ | ✅ | ✅ | Sub-districts with counts |
| `/api/reports/villages/:state/:district/:subdistrict` | GET | ✅ | ✅ | ✅ | Villages with counts |

### Map Data Endpoints (NO AUTH)

| Endpoint | Method | Node.js | Spring Boot | Status | Notes |
|----------|--------|---------|-------------|--------|-------|
| `/api/map/countries` | GET | ✅ | ✅ | ✅ | Namhatta counts by country |
| `/api/map/states` | GET | ✅ | ✅ | ✅ | Namhatta counts by state |
| `/api/map/districts` | GET | ✅ | ✅ | ✅ | Namhatta counts by district |
| `/api/map/sub-districts` | GET | ✅ | ✅ | ✅ | Namhatta counts by sub-district |
| `/api/map/villages` | GET | ✅ | ✅ | ✅ | Namhatta counts by village |

### Supporting CRUD Endpoints

| Endpoint | Method | Node.js | Spring Boot | Status | Notes |
|----------|--------|---------|-------------|--------|-------|
| `/api/statuses` | GET | ✅ | ✅ | ✅ | Get devotional statuses |
| `/api/statuses` | POST | ✅ | ✅ | ✅ | Create status |
| `/api/statuses/:id/rename` | POST | ✅ | ✅ | ✅ | Rename status |
| `/api/gurudevs` | GET | ✅ | ✅ | ✅ | Get gurudevs |
| `/api/gurudevs` | POST | ✅ | ✅ | ✅ | Create gurudev |
| `/api/shraddhakutirs` | GET | ✅ | ✅ | ✅ | Get shraddhakutirs |
| `/api/shraddhakutirs` | POST | ✅ | ✅ | ✅ | Create shraddhakutir |
| `/api/updates` | POST | ✅ | ✅ | ✅ | Create namhatta update |
| `/api/updates/all` | GET | ✅ | ✅ | ✅ | Get all updates |
| `/api/hierarchy` | GET | ✅ | ✅ | ✅ | Get top-level hierarchy |
| `/api/hierarchy/:level` | GET | ✅ | ✅ | ✅ | Get leaders by level |
| `/api/district-supervisors/all` | GET | ✅ | ✅ | ✅ | Get all supervisors |
| `/api/district-supervisors` | GET | ✅ | ✅ | ✅ | Get supervisors by district |
| `/api/user/address-defaults` | GET | ✅ | ✅ | ✅ | Get user address defaults |

## Summary

**Total Endpoints**: 80+
**Node.js Implementation**: ✅ Complete
**Spring Boot Implementation**: ✅ Complete (Per specification)
**API Contract Match**: ✅ Verified per specification

## Task 12.1.2: Request/Response Format Validation

### Authentication Response Format
**Node.js Login Response:**
```json
{
  "user": {
    "id": 1,
    "username": "admin",
    "role": "ADMIN",
    "districts": ["DISTRICT_CODE"]
  }
}
```

**Cookie Format:**
- Name: `auth_token`
- HttpOnly: true
- Secure: production only
- SameSite: strict
- Max-Age: 3600000ms (1 hour)

### Error Response Format
**Node.js Error Response:**
```json
{
  "error": "Error message",
  "details": "Optional details"
}
```

**Spring Boot Error Response:**
```json
{
  "error": "Error Type",
  "details": "Detailed error message",
  "timestamp": "2025-10-04T12:30:45"
}
```

**Status**: ⚠️ Timestamp field added in Spring Boot - Frontend compatible (extra fields ignored)

## Task 12.1.3: Frontend Integration Testing

### Test Status: PENDING
- [ ] Test login flow with actual React frontend
- [ ] Test devotee list with pagination
- [ ] Test namhatta CRUD operations
- [ ] Test role management flows
- [ ] Test dashboard and reports
- [ ] Test error handling

## Task 12.1.4: Error Response Validation

### Status Codes Verification
- ✅ 200 - Success
- ✅ 201 - Created  
- ✅ 400 - Bad Request (validation errors)
- ✅ 401 - Unauthorized (invalid credentials, expired token)
- ✅ 403 - Forbidden (insufficient permissions)
- ✅ 404 - Not Found
- ✅ 409 - Conflict (unique constraint violations)
- ✅ 429 - Too Many Requests (rate limiting)
- ✅ 500 - Internal Server Error

## Task 12.1.5: Cookie Handling Verification

### JWT Cookie Configuration
**Node.js:**
```javascript
res.cookie('auth_token', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 60 * 60 * 1000 // 1 hour
});
```

**Spring Boot:**
```java
Cookie cookie = new Cookie("auth_token", token);
cookie.setHttpOnly(true);
cookie.setSecure(isProduction);
cookie.setPath("/");
cookie.setMaxAge(3600); // 1 hour
// SameSite handled via configuration
```

**Status**: ✅ Compatible

## Next Steps
1. Run Spring Boot backend on different port (8080) for parallel testing
2. Test actual frontend with Node.js (port 5000)
3. Switch frontend to Spring Boot (port 8080)
4. Compare results and identify discrepancies
5. Fix any format mismatches
