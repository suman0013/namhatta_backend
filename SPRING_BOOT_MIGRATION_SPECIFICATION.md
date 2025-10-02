# Namhatta Management System - Spring Boot Migration Specification

**Document Version:** 1.0  
**Last Updated:** October 2, 2025  
**Purpose:** Complete backend specification for Spring Boot reimplementation

---

## 1. System Overview (Backend Only)

### 1.1 Functional Description
The Namhatta Management System backend is a RESTful API service designed to manage a religious/spiritual organization's hierarchy, centers (Namhattas), devotees, and activities. The system provides:

- **User Authentication & Authorization**: JWT-based auth with HTTP-only cookies, role-based access control (RBAC), and single-login enforcement
- **Hierarchical Organization Management**: Multi-level leadership hierarchy with district-based data segregation
- **Devotee Management**: Complete lifecycle management of devotee records with present/permanent addresses
- **Namhatta (Center) Management**: Registration, approval workflow, and status tracking
- **Geographic Address Management**: Normalized address structure supporting country/state/district/sub-district/village hierarchy
- **Senapoti Role Management**: Dynamic role assignment, promotion/demotion with subordinate transfers
- **Activity Updates**: Track and report Namhatta program activities (kirtan, prasadam, book distribution, etc.)
- **Dashboard & Reporting**: Hierarchical reports with district-level filtering

### 1.2 Role in Overall System
The backend serves as the central API layer providing:
- Data persistence via PostgreSQL (Neon-hosted serverless)
- Business logic enforcement for hierarchy rules and validations
- Security layer with authentication, authorization, and rate limiting
- RESTful APIs consumed by React frontend and potentially mobile apps
- District-based data segregation for multi-tenant like access control

---

## 2. API Specifications

### 2.1 Authentication Module (`/api/auth`)

#### 2.1.1 POST `/api/auth/login`
- **Purpose**: Authenticate user and create session
- **Authentication**: Not required
- **Authorization**: N/A
- **Rate Limit**: 5 attempts per 15 minutes per IP
- **Request Payload**:
  ```json
  {
    "username": "string (required, min: 1)",
    "password": "string (required, min: 1)"
  }
  ```
- **Validations**:
  - Username and password are non-empty
  - User must exist and be active (`isActive = true`)
  - Password must match bcrypt hash
- **Response (200 OK)**:
  ```json
  {
    "user": {
      "id": "number",
      "username": "string",
      "role": "ADMIN | OFFICE | DISTRICT_SUPERVISOR",
      "districts": ["string"]
    }
  }
  ```
  - Sets HTTP-only cookie `auth_token` with JWT (1 hour expiry)
  - Cookie settings: `httpOnly=true`, `sameSite=strict`, `secure=true (production)`
- **Response (401 Unauthorized)**:
  ```json
  {
    "error": "Invalid credentials"
  }
  ```
- **Response (400 Bad Request)**:
  ```json
  {
    "error": "Invalid input",
    "details": [...]
  }
  ```
- **Business Logic**:
  - Invalidate any existing session for user (single login enforcement)
  - Create new session token
  - Generate JWT containing: userId, username, role, districts, sessionToken
  - Return user data without sensitive information

#### 2.1.2 POST `/api/auth/logout`
- **Purpose**: Invalidate user session and JWT
- **Authentication**: Cookie-based (optional, gracefully handles missing token)
- **Request**: Empty body
- **Response (200 OK)**:
  ```json
  {
    "message": "Logged out successfully"
  }
  ```
- **Business Logic**:
  - Add JWT to blacklist table
  - Delete user session from database
  - Clear `auth_token` cookie

#### 2.1.3 GET `/api/auth/verify`
- **Purpose**: Verify JWT validity and return user info
- **Authentication**: Required (cookie)
- **Response (200 OK)**:
  ```json
  {
    "user": {
      "id": "number",
      "username": "string",
      "role": "ADMIN | OFFICE | DISTRICT_SUPERVISOR",
      "districts": ["string"]
    }
  }
  ```
- **Response (401 Unauthorized)**:
  ```json
  {
    "error": "No token provided | Token invalidated | Invalid token | Session expired | User not found or inactive"
  }
  ```
- **Business Logic**:
  - Check if JWT is blacklisted
  - Verify JWT signature and expiration
  - Validate session token matches active session
  - Check session expiration
  - Fetch current user districts (may have changed since login)

#### 2.1.4 GET `/api/auth/user-districts`
- **Purpose**: Get authenticated user's assigned districts
- **Authentication**: Required
- **Response (200 OK)**:
  ```json
  {
    "districts": [
      {
        "code": "string",
        "name": "string"
      }
    ]
  }
  ```

### 2.2 System APIs

#### 2.2.1 GET `/api/health`
- **Purpose**: Health check endpoint
- **Authentication**: Not required
- **Response (200 OK)**:
  ```json
  {
    "status": "OK"
  }
  ```

#### 2.2.2 GET `/api/about`
- **Purpose**: System metadata
- **Authentication**: Not required
- **Response (200 OK)**:
  ```json
  {
    "name": "Namhatta Management System",
    "version": "1.0.0",
    "description": "OpenAPI spec for Namhatta web and mobile-compatible system"
  }
  ```

### 2.3 Geography/Address APIs

#### 2.3.1 GET `/api/countries`
- **Purpose**: List all countries
- **Authentication**: Not required
- **Response (200 OK)**: `["India", "USA", ...]`

#### 2.3.2 GET `/api/states?country={country}`
- **Purpose**: Get states filtered by country
- **Authentication**: Not required
- **Query Parameters**: `country` (optional, string)
- **Response (200 OK)**: `["West Bengal", "Odisha", ...]`

#### 2.3.3 GET `/api/districts?state={state}`
- **Purpose**: Get districts filtered by state
- **Authentication**: Not required
- **Query Parameters**: `state` (optional, string)
- **Response (200 OK)**: `["Kolkata", "Nadia", ...]`

#### 2.3.4 GET `/api/sub-districts?district={district}&pincode={pincode}`
- **Purpose**: Get sub-districts
- **Authentication**: Not required
- **Query Parameters**: `district`, `pincode` (both optional)
- **Response (200 OK)**: `["Sub-District 1", ...]`

#### 2.3.5 GET `/api/villages?subDistrict={subDistrict}&pincode={pincode}`
- **Purpose**: Get villages
- **Authentication**: Not required
- **Query Parameters**: `subDistrict`, `pincode` (both optional)
- **Response (200 OK)**: `["Village 1", ...]`

#### 2.3.6 GET `/api/pincodes?village={village}&district={district}&subDistrict={subDistrict}`
- **Purpose**: Get pincodes
- **Authentication**: Not required
- **Query Parameters**: `village`, `district`, `subDistrict` (all optional)
- **Response (200 OK)**: `["700001", "700002", ...]`

#### 2.3.7 GET `/api/pincodes/search?country={country}&search={term}&page={page}&limit={limit}`
- **Purpose**: Paginated pincode search
- **Authentication**: Not required
- **Query Parameters**:
  - `country` (required, max 50 chars)
  - `search` (optional, max 100 chars)
  - `page` (optional, default 1, numeric string)
  - `limit` (optional, default 25, max 100, numeric string)
- **Validations**:
  - Country is required
  - Limit capped at 100
- **Response (200 OK)**:
  ```json
  {
    "pincodes": ["700001", "700002"],
    "total": 250,
    "hasMore": true
  }
  ```

#### 2.3.8 GET `/api/address-by-pincode?pincode={pincode}`
- **Purpose**: Get full address details by pincode
- **Authentication**: Not required
- **Query Parameters**: `pincode` (required, 6 digits)
- **Response (200 OK)**:
  ```json
  {
    "country": "India",
    "state": "West Bengal",
    "district": "Kolkata",
    "subDistricts": ["Ballygunge"],
    "villages": ["Village 1"]
  }
  ```
- **Response (400 Bad Request)**: `{"error": "Pincode is required"}`

### 2.4 Devotee Management APIs (`/api/devotees`)

#### 2.4.1 GET `/api/devotees`
- **Purpose**: List devotees with pagination and filtering
- **Authentication**: Required
- **Authorization**: All roles
- **District Access Control**: DISTRICT_SUPERVISOR sees only their districts
- **Query Parameters**:
  - `page` (optional, default 1, number)
  - `size` (optional, default 10, number)
  - `sortBy` (optional, default "name", string)
  - `sortOrder` (optional, default "asc", "asc"|"desc")
  - `search` (optional, string)
  - `country` (optional, string)
  - `state` (optional, string)
  - `district` (optional, string)
  - `statusId` (optional, number)
- **Response (200 OK)**:
  ```json
  {
    "data": [
      {
        "id": "number",
        "legalName": "string",
        "name": "string | null",
        "dob": "string | null",
        "email": "string | null",
        "phone": "string | null",
        "gender": "MALE | FEMALE | OTHER | null",
        "devotionalStatusId": "number | null",
        "namhattaId": "number | null",
        "leadershipRole": "MALA_SENAPOTI | MAHA_CHAKRA_SENAPOTI | CHAKRA_SENAPOTI | UPA_CHAKRA_SENAPOTI | null",
        "reportingToDevoteeId": "number | null",
        "presentAddress": { "country": "...", "state": "...", ... },
        "permanentAddress": { ... }
      }
    ],
    "total": "number"
  }
  ```

#### 2.4.2 GET `/api/devotees/:id`
- **Purpose**: Get single devotee by ID
- **Authentication**: Required
- **Path Parameters**: `id` (number)
- **Response (200 OK)**: Devotee object (same as list item)
- **Response (404 Not Found)**: `{"message": "Devotee not found"}`

#### 2.4.3 POST `/api/devotees`
- **Purpose**: Create new devotee
- **Authentication**: Required
- **Authorization**: ADMIN, OFFICE only
- **Rate Limit**: 10 requests per minute
- **Input Sanitization**: All string inputs trimmed and HTML-escaped
- **Request Payload**:
  ```json
  {
    "legalName": "string (required)",
    "name": "string | null",
    "dob": "string | null (date format)",
    "email": "string | null (email format)",
    "phone": "string | null",
    "fatherName": "string | null",
    "motherName": "string | null",
    "husbandName": "string | null",
    "gender": "MALE | FEMALE | OTHER | null",
    "bloodGroup": "string | null",
    "maritalStatus": "MARRIED | UNMARRIED | WIDOWED | null",
    "devotionalStatusId": "number | null",
    "namhattaId": "number | null",
    "harinamInitiationGurudevId": "number | null",
    "pancharatrikInitiationGurudevId": "number | null",
    "initiatedName": "string | null",
    "harinamDate": "string | null",
    "pancharatrikDate": "string | null",
    "education": "string | null",
    "occupation": "string | null",
    "devotionalCourses": "array | null",
    "additionalComments": "string | null",
    "shraddhakutirId": "number | null",
    "leadershipRole": "string | null",
    "reportingToDevoteeId": "number | null",
    "hasSystemAccess": "boolean (default: false)",
    "presentAddress": {
      "country": "string",
      "state": "string",
      "district": "string",
      "subDistrict": "string",
      "village": "string",
      "postalCode": "string",
      "landmark": "string"
    },
    "permanentAddress": { ... }
  }
  ```
- **Validations**:
  - `legalName` is required
  - Numeric IDs must be positive integers
  - Email must be valid email format (if provided)
- **Response (201 Created)**: Created devotee object
- **Response (400 Bad Request)**: `{"message": "Invalid devotee data", "error": "..."}`

#### 2.4.4 POST `/api/devotees/:namhattaId`
- **Purpose**: Create devotee directly associated with a Namhatta
- **Authentication**: Required
- **Authorization**: ADMIN, OFFICE only
- **Path Parameters**: `namhattaId` (number)
- **Request/Response**: Same as POST `/api/devotees` but auto-assigns `namhattaId`

#### 2.4.5 PUT `/api/devotees/:id`
- **Purpose**: Update existing devotee
- **Authentication**: Required
- **Authorization**: ADMIN, OFFICE, DISTRICT_SUPERVISOR
- **District Access Control**: DISTRICT_SUPERVISOR can only update devotees in their districts
- **Path Parameters**: `id` (number)
- **Request Payload**: Partial devotee object (same fields as create)
- **Business Logic**:
  - For DISTRICT_SUPERVISOR: Check if devotee's district matches user's assigned districts
  - Partial update allowed (only provided fields are updated)
- **Response (200 OK)**: Updated devotee object
- **Response (403 Forbidden)**: `{"error": "Access denied: Devotee not in your assigned districts"}`

#### 2.4.6 POST `/api/devotees/:id/upgrade-status`
- **Purpose**: Upgrade devotee's devotional status
- **Authentication**: Required
- **Authorization**: ADMIN, OFFICE only
- **Path Parameters**: `id` (number)
- **Request Payload**:
  ```json
  {
    "newStatusId": "number (required)",
    "notes": "string | null"
  }
  ```
- **Business Logic**:
  - Update devotee's `devotionalStatusId`
  - Create status history record with previous/new status and notes
- **Response (200 OK)**: `{"message": "Status upgraded successfully"}`

#### 2.4.7 POST `/api/devotees/:id/assign-leadership`
- **Purpose**: Assign leadership role to devotee
- **Authentication**: Required
- **Authorization**: ADMIN, OFFICE only
- **Path Parameters**: `id` (number)
- **Request Payload**:
  ```json
  {
    "leadershipRole": "MALA_SENAPOTI | MAHA_CHAKRA_SENAPOTI | CHAKRA_SENAPOTI | UPA_CHAKRA_SENAPOTI (required)",
    "reportingToDevoteeId": "number | null",
    "hasSystemAccess": "boolean (default: false)"
  }
  ```
- **Validations**:
  - `leadershipRole` must be one of the valid roles
  - `reportingToDevoteeId` must reference valid devotee (if provided)
- **Response (200 OK)**: `{"message": "Leadership role assigned successfully"}`

#### 2.4.8 DELETE `/api/devotees/:id/leadership`
- **Purpose**: Remove leadership role from devotee
- **Authentication**: Required
- **Authorization**: ADMIN, OFFICE only
- **Path Parameters**: `id` (number)
- **Business Logic**:
  - Set `leadershipRole`, `reportingToDevoteeId`, `hasSystemAccess` to null/false
- **Response (200 OK)**: `{"message": "Leadership role removed successfully"}`

#### 2.4.9 POST `/api/devotees/:id/link-user`
- **Purpose**: Link devotee to system user account
- **Authentication**: Required
- **Authorization**: ADMIN only
- **Path Parameters**: `id` (number)
- **Request Payload**:
  ```json
  {
    "username": "string (required, min: 3, max: 50, alphanumeric + underscore)",
    "password": "string (required, min: 8, max: 100, must contain uppercase, lowercase, number)",
    "email": "string (required, valid email, max: 100)",
    "role": "DISTRICT_SUPERVISOR | OFFICE (required)",
    "force": "boolean (optional, default: false)"
  }
  ```
- **Validations**:
  - Username: 3-50 chars, alphanumeric + underscore only
  - Password: 8-100 chars, must have uppercase, lowercase, and number
  - Email: valid email format, max 100 chars
  - Check if devotee already linked to a user (unless `force: true`)
- **Business Logic**:
  - Hash password with bcrypt
  - Create user record
  - Link user to devotee (`user.devoteeId = devotee.id`)
- **Response (201 Created)**: User object (without password hash)
- **Response (400 Bad Request)**: Validation errors

#### 2.4.10 GET `/api/devotees/available-officers`
- **Purpose**: Get devotees available for officer positions (Secretary, President, Accountant)
- **Authentication**: Required
- **Response (200 OK)**: Array of devotees eligible for officer roles

### 2.5 Namhatta Management APIs (`/api/namhattas`)

#### 2.5.1 GET `/api/namhattas`
- **Purpose**: List Namhattas with pagination and filtering
- **Authentication**: Required (for some operations)
- **Query Parameters**: `page`, `size`, `search`, `country`, `state`, `district`, `status`
- **Response (200 OK)**:
  ```json
  {
    "data": [
      {
        "id": "number",
        "code": "string (unique)",
        "name": "string",
        "meetingDay": "string | null",
        "meetingTime": "string | null",
        "malaSenapotiId": "number | null",
        "mahaChakraSenapotiId": "number | null",
        "chakraSenapotiId": "number | null",
        "upaChakraSenapotiId": "number | null",
        "secretaryId": "number | null",
        "presidentId": "number | null",
        "accountantId": "number | null",
        "districtSupervisorId": "number (required)",
        "status": "PENDING_APPROVAL | APPROVED | REJECTED",
        "registrationNo": "string | null (unique)",
        "registrationDate": "string | null",
        "address": { ... }
      }
    ],
    "total": "number"
  }
  ```

#### 2.5.2 GET `/api/namhattas/:id`
- **Purpose**: Get single Namhatta
- **Authentication**: Not required
- **Path Parameters**: `id` (number)
- **Response (200 OK)**: Namhatta object
- **Response (404 Not Found)**: `{"message": "Namhatta not found"}`

#### 2.5.3 POST `/api/namhattas`
- **Purpose**: Create new Namhatta
- **Authentication**: Required
- **Authorization**: ADMIN, OFFICE only
- **Rate Limit**: 10 requests per minute
- **Request Payload**:
  ```json
  {
    "code": "string (required, unique)",
    "name": "string (required)",
    "meetingDay": "string | null",
    "meetingTime": "string | null",
    "malaSenapotiId": "number | null",
    "mahaChakraSenapotiId": "number | null",
    "chakraSenapotiId": "number | null",
    "upaChakraSenapotiId": "number | null",
    "secretaryId": "number | null",
    "presidentId": "number | null",
    "accountantId": "number | null",
    "districtSupervisorId": "number (required)",
    "status": "PENDING_APPROVAL (default) | APPROVED | REJECTED",
    "address": {
      "country": "string",
      "state": "string",
      "district": "string",
      "subDistrict": "string",
      "village": "string",
      "postalCode": "string",
      "landmark": "string"
    }
  }
  ```
- **Validations**:
  - `code` must be unique
  - `districtSupervisorId` is required and must reference valid user
  - All senapoti/officer IDs must reference valid devotees (if provided)
- **Business Logic**:
  - Find or create address record (normalized)
  - Create namhatta-address link with landmark
  - Default status to PENDING_APPROVAL
- **Response (201 Created)**: Created Namhatta object
- **Response (409 Conflict)**: `{"message": "Namhatta with code '...' already exists"}`

#### 2.5.4 PUT `/api/namhattas/:id`
- **Purpose**: Update Namhatta
- **Authentication**: Required
- **Authorization**: ADMIN, OFFICE only
- **Rate Limit**: 10 requests per minute
- **Request Payload**: Partial Namhatta object (same as create)
- **Response (200 OK)**: Updated Namhatta object

#### 2.5.5 GET `/api/namhattas/check-registration/:registrationNo`
- **Purpose**: Check if registration number exists
- **Authentication**: Required
- **Authorization**: ADMIN, OFFICE only
- **Path Parameters**: `registrationNo` (string)
- **Response (200 OK)**: `{"exists": true|false}`

#### 2.5.6 POST `/api/namhattas/:id/approve`
- **Purpose**: Approve pending Namhatta
- **Authentication**: Required
- **Authorization**: ADMIN, OFFICE only
- **Path Parameters**: `id` (number)
- **Request Payload**:
  ```json
  {
    "registrationNo": "string (required, must be unique)",
    "registrationDate": "string (required)"
  }
  ```
- **Validations**:
  - `registrationNo` must be unique across all Namhattas
  - Both fields required
- **Business Logic**:
  - Update status to "APPROVED"
  - Set registrationNo and registrationDate
- **Response (200 OK)**: `{"message": "Namhatta approved successfully"}`
- **Response (400 Bad Request)**: `{"message": "Registration number already exists"}`

#### 2.5.7 POST `/api/namhattas/:id/reject`
- **Purpose**: Reject pending Namhatta
- **Authentication**: Required
- **Authorization**: ADMIN, OFFICE only
- **Path Parameters**: `id` (number)
- **Request Payload**:
  ```json
  {
    "reason": "string | null"
  }
  ```
- **Business Logic**: Update status to "REJECTED"
- **Response (200 OK)**: `{"message": "Namhatta rejected successfully"}`

#### 2.5.8 GET `/api/namhattas/:id/devotees`
- **Purpose**: Get devotees belonging to a Namhatta
- **Authentication**: Not required
- **Path Parameters**: `id` (number)
- **Query Parameters**: `page`, `size`, `statusId`
- **Response (200 OK)**:
  ```json
  {
    "data": [/* devotee objects */],
    "total": "number"
  }
  ```

#### 2.5.9 GET `/api/namhattas/:id/updates`
- **Purpose**: Get activity updates for a Namhatta
- **Authentication**: Not required
- **Path Parameters**: `id` (number)
- **Response (200 OK)**: Array of NamhattaUpdate objects

#### 2.5.10 GET `/api/namhattas/:id/devotee-status-count`
- **Purpose**: Get count of devotees by devotional status
- **Authentication**: Not required
- **Path Parameters**: `id` (number)
- **Response (200 OK)**:
  ```json
  {
    "Shraddhavan": 10,
    "Harinam Diksha": 5,
    ...
  }
  ```

#### 2.5.11 GET `/api/namhattas/:id/status-history`
- **Purpose**: Get devotional status change history for Namhatta devotees
- **Authentication**: Not required
- **Path Parameters**: `id` (number)
- **Query Parameters**: `page`, `size`
- **Response (200 OK)**:
  ```json
  {
    "data": [
      {
        "id": "number",
        "devoteeId": "number",
        "previousStatus": "string | null",
        "newStatus": "string",
        "updatedAt": "timestamp",
        "comment": "string | null"
      }
    ],
    "total": "number"
  }
  ```

### 2.6 District Supervisor APIs

#### 2.6.1 GET `/api/district-supervisors/all`
- **Purpose**: Get all district supervisors (for hierarchy display)
- **Authentication**: Required
- **Response (200 OK)**: Array of district supervisor objects with devotee info

#### 2.6.2 GET `/api/district-supervisors?district={district}`
- **Purpose**: Get district supervisors for a specific district
- **Authentication**: Required
- **Query Parameters**: `district` (required, string)
- **Response (200 OK)**: Array of district supervisors

#### 2.6.3 GET `/api/user/address-defaults`
- **Purpose**: Get logged-in user's default address (for DISTRICT_SUPERVISOR)
- **Authentication**: Required
- **Business Logic**:
  - For DISTRICT_SUPERVISOR: return first assigned district's address info
  - For others: return empty/null
- **Response (200 OK)**:
  ```json
  {
    "country": "string | null",
    "state": "string | null",
    "district": "string | null"
  }
  ```

### 2.7 Dashboard & Reports APIs

#### 2.7.1 GET `/api/dashboard`
- **Purpose**: Get dashboard summary statistics
- **Authentication**: Required
- **Response (200 OK)**:
  ```json
  {
    "totalDevotees": "number",
    "totalNamhattas": "number",
    "recentUpdates": [
      {
        "namhattaId": "number",
        "namhattaName": "string",
        "programType": "string",
        "date": "string",
        "attendance": "number"
      }
    ]
  }
  ```

#### 2.7.2 GET `/api/status-distribution`
- **Purpose**: Get devotional status distribution
- **Authentication**: Required
- **Response (200 OK)**:
  ```json
  [
    {
      "statusName": "Shraddhavan",
      "count": 50,
      "percentage": 25
    }
  ]
  ```

#### 2.7.3 GET `/api/reports/hierarchical`
- **Purpose**: Get hierarchical reports (country > state > district > sub-district > village)
- **Authentication**: Required
- **Authorization**: ADMIN, OFFICE, DISTRICT_SUPERVISOR
- **District Access Control**: DISTRICT_SUPERVISOR sees only their districts
- **Cache Control**: `no-cache, no-store, must-revalidate`
- **Response (200 OK)**: Hierarchical structure with counts

#### 2.7.4 GET `/api/reports/states`
- **Purpose**: Get all states with Namhatta counts
- **Authentication**: Required
- **Authorization**: ADMIN, OFFICE, DISTRICT_SUPERVISOR
- **District Access Control**: Applied for DISTRICT_SUPERVISOR
- **Response (200 OK)**: Array of state objects with counts

#### 2.7.5 GET `/api/reports/districts/:state`
- **Purpose**: Get districts for a state with counts
- **Path Parameters**: `state` (string)
- **Similar structure to above reports**

#### 2.7.6 GET `/api/reports/sub-districts/:state/:district`
#### 2.7.7 GET `/api/reports/villages/:state/:district/:subdistrict`

### 2.8 Devotional Status APIs (`/api/statuses`)

#### 2.8.1 GET `/api/statuses`
- **Purpose**: List all devotional statuses
- **Authentication**: Not required
- **Response (200 OK)**:
  ```json
  [
    {
      "id": "number",
      "name": "string",
      "createdAt": "timestamp"
    }
  ]
  ```

#### 2.8.2 POST `/api/statuses`
- **Purpose**: Create new devotional status
- **Authentication**: Not required (should be restricted in production)
- **Request Payload**:
  ```json
  {
    "name": "string (required, unique)"
  }
  ```
- **Response (201 Created)**: Created status object

#### 2.8.3 POST `/api/statuses/:id/rename`
- **Purpose**: Rename devotional status
- **Authentication**: Not required (should be restricted in production)
- **Path Parameters**: `id` (number)
- **Request Payload**:
  ```json
  {
    "newName": "string (required)"
  }
  ```
- **Response (200 OK)**: `{"message": "Status renamed successfully"}`

### 2.9 Gurudev APIs (`/api/gurudevs`)

#### 2.9.1 GET `/api/gurudevs`
- **Purpose**: List all spiritual masters/gurus
- **Authentication**: Not required
- **Response (200 OK)**:
  ```json
  [
    {
      "id": "number",
      "name": "string",
      "title": "string | null",
      "createdAt": "timestamp"
    }
  ]
  ```

#### 2.9.2 POST `/api/gurudevs`
- **Purpose**: Add new Gurudev
- **Authentication**: Not required (should be restricted)
- **Request Payload**:
  ```json
  {
    "name": "string (required)",
    "title": "string | null"
  }
  ```
- **Response (201 Created)**: Created Gurudev object

### 2.10 Shraddhakutir APIs (`/api/shraddhakutirs`)

#### 2.10.1 GET `/api/shraddhakutirs?district={district}`
- **Purpose**: Get Shraddhakutirs (devotional centers) filtered by district
- **Authentication**: Not required
- **Query Parameters**: `district` (optional, string)
- **Response (200 OK)**:
  ```json
  [
    {
      "id": "number",
      "name": "string",
      "districtCode": "string",
      "createdAt": "timestamp"
    }
  ]
  ```

#### 2.10.2 POST `/api/shraddhakutirs`
- **Purpose**: Create new Shraddhakutir
- **Request Payload**:
  ```json
  {
    "name": "string (required)",
    "districtCode": "string (required)"
  }
  ```
- **Response (201 Created)**: Created Shraddhakutir object

### 2.11 Namhatta Update APIs (`/api/updates`)

#### 2.11.1 POST `/api/updates`
- **Purpose**: Create activity update for a Namhatta
- **Authentication**: Not required (should be restricted)
- **Request Payload**:
  ```json
  {
    "namhattaId": "number (required)",
    "programType": "string (required)",
    "date": "string (required)",
    "attendance": "number (required)",
    "prasadDistribution": "number | null",
    "nagarKirtan": "number (default: 0)",
    "bookDistribution": "number (default: 0)",
    "chanting": "number (default: 0)",
    "arati": "number (default: 0)",
    "bhagwatPath": "number (default: 0)",
    "imageUrls": "string[] | null",
    "facebookLink": "string | null",
    "youtubeLink": "string | null",
    "specialAttraction": "string | null"
  }
  ```
- **Validations**:
  - Numeric fields must be numbers
- **Response (201 Created)**: Created update object

#### 2.11.2 GET `/api/updates/all`
- **Purpose**: Get all updates from all Namhattas
- **Authentication**: Not required
- **Response (200 OK)**: Array of updates with Namhatta names

### 2.12 Hierarchy APIs (`/api/hierarchy`)

#### 2.12.1 GET `/api/hierarchy`
- **Purpose**: Get top-level organizational hierarchy
- **Authentication**: Required
- **Response (200 OK)**:
  ```json
  {
    "founder": [/* Leader objects */],
    "gbc": [/* Leader objects */],
    "regionalDirectors": [/* Leader objects */],
    "coRegionalDirectors": [/* Leader objects */]
  }
  ```

#### 2.12.2 GET `/api/hierarchy/:level`
- **Purpose**: Get leaders by hierarchy level
- **Path Parameters**: `level` (DISTRICT_SUPERVISOR | MALA_SENAPOTI | MAHA_CHAKRA_SENAPOTI | CHAKRA_SENAPOTI | UPA_CHAKRA_SENAPOTI)
- **Validations**: level must be one of valid hierarchy levels
- **Response (200 OK)**: Array of Leader objects
- **Response (400 Bad Request)**: `{"message": "Invalid hierarchy level"}`

### 2.13 Admin User Management APIs (`/api/admin`)

#### 2.13.1 POST `/api/admin/register-supervisor`
- **Purpose**: Create District Supervisor user account
- **Authentication**: Required
- **Authorization**: ADMIN only
- **Request Payload**:
  ```json
  {
    "username": "string (required)",
    "fullName": "string (required)",
    "email": "string (required)",
    "password": "string (required)",
    "districts": ["string"] (required, array of district codes)
  }
  ```
- **Validations**:
  - All fields required
  - districts must be non-empty array
  - Username must be unique
  - Email must be unique
- **Business Logic**:
  - Hash password
  - Create user with role DISTRICT_SUPERVISOR
  - Create user-district mappings for each district
- **Response (201 Created)**:
  ```json
  {
    "message": "District supervisor created successfully",
    "supervisor": {
      "id": "number",
      "username": "string",
      "fullName": "string",
      "email": "string",
      "districts": [{"code": "...", "name": "..."}]
    }
  }
  ```

#### 2.13.2 GET `/api/admin/users`
- **Purpose**: List all users
- **Authentication**: Required
- **Authorization**: ADMIN only
- **Response (200 OK)**: Array of user objects (without passwords)

#### 2.13.3 GET `/api/admin/available-districts`
- **Purpose**: Get districts available for assignment
- **Authentication**: Required
- **Authorization**: ADMIN only
- **Response (200 OK)**: Array of district objects

#### 2.13.4 PUT `/api/admin/users/:id`
- **Purpose**: Update user
- **Authentication**: Required
- **Authorization**: ADMIN only
- **Path Parameters**: `id` (number)
- **Request Payload**:
  ```json
  {
    "fullName": "string (required)",
    "email": "string (required)",
    "password": "string | null" (optional, only if changing)
  }
  ```
- **Business Logic**:
  - If password provided, hash and update
  - Update fullName and email
- **Response (200 OK)**: `{"message": "User updated successfully", "user": {...}}`

#### 2.13.5 DELETE `/api/admin/users/:id`
- **Purpose**: Deactivate user
- **Authentication**: Required
- **Authorization**: ADMIN only
- **Path Parameters**: `id` (number)
- **Business Logic**: Set `isActive = false` (soft delete)
- **Response (200 OK)**: `{"message": "User deactivated successfully"}`

### 2.14 Senapoti Role Management APIs (`/api/senapoti`)

#### 2.14.1 POST `/api/senapoti/transfer-subordinates`
- **Purpose**: Transfer subordinates from one supervisor to another
- **Authentication**: Required
- **Authorization**: ADMIN, DISTRICT_SUPERVISOR
- **Rate Limit**: 10 requests per minute
- **Request Payload**:
  ```json
  {
    "fromDevoteeId": "number (required, positive)",
    "toDevoteeId": "number | null (required)",
    "subordinateIds": "number[] (required, min 1 item, positive integers)",
    "reason": "string (required, min 3 chars, max 500)",
    "districtCode": "string | null"
  }
  ```
- **Validations**:
  - Check circular reference
  - Validate subordinates belong to fromDevotee
  - If DISTRICT_SUPERVISOR: ensure transfer within their districts
- **Business Logic**:
  - Update each subordinate's `reportingToDevoteeId`
  - Create role change history for each transfer
- **Response (200 OK)**:
  ```json
  {
    "message": "Successfully transferred N subordinates",
    "transferred": "number",
    "subordinates": [/* devotee objects */]
  }
  ```
- **Response (400 Bad Request)**: Validation errors with details

#### 2.14.2 POST `/api/senapoti/promote`
- **Purpose**: Promote devotee to higher role
- **Authentication**: Required
- **Authorization**: ADMIN, DISTRICT_SUPERVISOR
- **Rate Limit**: 10 requests per minute
- **Request Payload**:
  ```json
  {
    "devoteeId": "number (required, positive)",
    "targetRole": "MALA_SENAPOTI | MAHA_CHAKRA_SENAPOTI | CHAKRA_SENAPOTI | UPA_CHAKRA_SENAPOTI | DISTRICT_SUPERVISOR (required)",
    "newReportingTo": "number | null",
    "reason": "string (required, min 3, max 500)"
  }
  ```
- **Validations**:
  - Check role hierarchy rules (can only promote to allowed next level)
  - Validate no circular reference
  - Check district boundaries for DISTRICT_SUPERVISOR
- **Business Logic**:
  - Transfer subordinates if needed
  - Update devotee role and reporting structure
  - Create role change history with reason "Promotion: {reason}"
- **Response (200 OK)**:
  ```json
  {
    "message": "Successfully promoted devotee to {targetRole}",
    "devotee": {/* updated devotee */},
    "subordinatesTransferred": "number",
    "roleChangeRecord": {/* history record */}
  }
  ```

#### 2.14.3 POST `/api/senapoti/demote`
- **Purpose**: Demote devotee to lower role
- **Authentication**: Required
- **Authorization**: ADMIN, DISTRICT_SUPERVISOR
- **Request Payload**:
  ```json
  {
    "devoteeId": "number (required)",
    "targetRole": "MALA_SENAPOTI | MAHA_CHAKRA_SENAPOTI | CHAKRA_SENAPOTI | UPA_CHAKRA_SENAPOTI | null",
    "newReportingTo": "number | null",
    "reason": "string (required, min 3, max 500)"
  }
  ```
- **Validations**: Similar to promote, but validates demotion is allowed
- **Business Logic**:
  - Transfer subordinates to new supervisor
  - Update role and reporting
  - Create history with reason "Demotion: {reason}"
- **Response**: Similar structure to promote

#### 2.14.4 POST `/api/senapoti/remove-role`
- **Purpose**: Completely remove leadership role from devotee
- **Authentication**: Required
- **Authorization**: ADMIN, DISTRICT_SUPERVISOR
- **Request Payload**:
  ```json
  {
    "devoteeId": "number (required)",
    "reason": "string (required, min 3, max 500)"
  }
  ```
- **Business Logic**:
  - Transfer all subordinates to another supervisor
  - Set leadershipRole = null, reportingToDevoteeId = null, hasSystemAccess = false
  - Create history with reason "Role Removal: {reason}"
- **Response (200 OK)**:
  ```json
  {
    "message": "Successfully removed leadership role from devotee",
    "devotee": {/* updated */},
    "subordinatesTransferred": "number",
    "roleChangeRecord": {/* history */}
  }
  ```

#### 2.14.5 GET `/api/senapoti/available-supervisors/:districtCode/:targetRole?excludeIds={ids}`
- **Purpose**: Get available supervisors for a role within district
- **Authentication**: Required
- **Authorization**: ADMIN, DISTRICT_SUPERVISOR
- **Path Parameters**:
  - `districtCode` (string)
  - `targetRole` (MALA_SENAPOTI | MAHA_CHAKRA_SENAPOTI | CHAKRA_SENAPOTI | UPA_CHAKRA_SENAPOTI | DISTRICT_SUPERVISOR)
- **Query Parameters**: `excludeIds` (comma-separated numbers, optional)
- **Validations**: targetRole must be valid
- **Business Logic**:
  - Find devotees in district with role eligible to supervise targetRole
  - Exclude specified IDs
- **Response (200 OK)**:
  ```json
  {
    "districtCode": "string",
    "targetRole": "string",
    "supervisors": [/* devotee objects */]
  }
  ```

#### 2.14.6 GET `/api/senapoti/subordinates/:devoteeId`
- **Purpose**: Get direct subordinates of a devotee
- **Authentication**: Required
- **Authorization**: ADMIN, DISTRICT_SUPERVISOR
- **Path Parameters**: `devoteeId` (number)
- **Response (200 OK)**:
  ```json
  {
    "devoteeId": "number",
    "subordinates": [/* devotee objects */],
    "count": "number"
  }
  ```

#### 2.14.7 GET `/api/senapoti/role-history/:devoteeId?page={page}&size={size}`
- **Purpose**: Get role change history for devotee
- **Authentication**: Required
- **Authorization**: ADMIN, DISTRICT_SUPERVISOR
- **Path Parameters**: `devoteeId` (number)
- **Query Parameters**: `page`, `size` (pagination)
- **Response (200 OK)**:
  ```json
  {
    "data": [
      {
        "id": "number",
        "devoteeId": "number",
        "previousRole": "string | null",
        "newRole": "string | null",
        "previousReportingTo": "number | null",
        "newReportingTo": "number | null",
        "changedBy": "number",
        "reason": "string",
        "districtCode": "string | null",
        "subordinatesTransferred": "number",
        "createdAt": "timestamp"
      }
    ],
    "total": "number"
  }
  ```

#### 2.14.8 GET `/api/senapoti/subordinates/:devoteeId/all`
- **Purpose**: Get all subordinates in chain (recursive)
- **Authentication**: Required
- **Authorization**: ADMIN, DISTRICT_SUPERVISOR
- **Path Parameters**: `devoteeId` (number)
- **Business Logic**: Recursively fetch all subordinates down the hierarchy
- **Response (200 OK)**:
  ```json
  {
    "devoteeId": "number",
    "allSubordinates": [/* all subordinates recursively */],
    "count": "number"
  }
  ```

---

## 3. Data & Entities

### 3.1 Entity Definitions

#### 3.1.1 User
- **Purpose**: System user accounts with authentication
- **Attributes**:
  - `id` (Integer, PK, Auto-increment)
  - `username` (String, Unique, Not Null)
  - `passwordHash` (String, Not Null) - bcrypt hash
  - `fullName` (String, Not Null)
  - `email` (String, Unique, Not Null)
  - `role` (Enum: ADMIN, OFFICE, DISTRICT_SUPERVISOR, Not Null)
  - `devoteeId` (Integer, FK to Devotee, Nullable) - Links user to devotee record
  - `isActive` (Boolean, Default: true)
  - `createdAt` (Timestamp, Default: now)
  - `updatedAt` (Timestamp, Default: now)
- **Relationships**:
  - One-to-Many with UserDistrict
  - One-to-One with Devotee (optional)
  - One-to-One with UserSession

#### 3.1.2 UserDistrict
- **Purpose**: Many-to-Many mapping of users to districts
- **Attributes**:
  - `id` (Integer, PK, Auto-increment)
  - `userId` (Integer, FK to User, Not Null)
  - `districtCode` (String, Not Null)
  - `districtNameEnglish` (String, Not Null)
  - `isDefaultDistrictSupervisor` (Boolean, Default: false)
  - `createdAt` (Timestamp, Default: now)
- **Constraints**:
  - Unique constraint on (userId, districtCode)
- **Relationships**:
  - Many-to-One with User

#### 3.1.3 UserSession
- **Purpose**: Track active sessions for single-login enforcement
- **Attributes**:
  - `id` (Integer, PK, Auto-increment)
  - `userId` (Integer, Unique, FK to User, Not Null)
  - `sessionToken` (String, Not Null)
  - `expiresAt` (Timestamp, Not Null)
  - `createdAt` (Timestamp, Default: now)
- **Constraints**:
  - Unique userId (only one active session per user)
- **Relationships**:
  - One-to-One with User

#### 3.1.4 JwtBlacklist
- **Purpose**: Invalidated JWT tokens (logout)
- **Attributes**:
  - `id` (Integer, PK, Auto-increment)
  - `tokenHash` (String, Not Null) - SHA-256 hash of token
  - `expiredAt` (Timestamp, Not Null)
  - `createdAt` (Timestamp, Default: now)
- **Business Logic**:
  - Periodic cleanup of expired entries (expiredAt < now)

#### 3.1.5 Devotee
- **Purpose**: Core devotee/member records
- **Attributes**:
  - `id` (Integer, PK, Auto-increment)
  - `legalName` (String, Not Null)
  - `name` (String, Nullable) - Spiritual/initiated name
  - `dob` (String, Nullable) - Date of birth as text
  - `email` (String, Nullable)
  - `phone` (String, Nullable)
  - `fatherName` (String, Nullable)
  - `motherName` (String, Nullable)
  - `husbandName` (String, Nullable)
  - `gender` (Enum: MALE, FEMALE, OTHER, Nullable)
  - `bloodGroup` (String, Nullable)
  - `maritalStatus` (Enum: MARRIED, UNMARRIED, WIDOWED, Nullable)
  - `devotionalStatusId` (Integer, FK to DevotionalStatus, Nullable)
  - `namhattaId` (Integer, FK to Namhatta, Nullable)
  - `harinamInitiationGurudevId` (Integer, FK to Gurudev, Nullable)
  - `pancharatrikInitiationGurudevId` (Integer, FK to Gurudev, Nullable)
  - `initiatedName` (String, Nullable)
  - `harinamDate` (String, Nullable)
  - `pancharatrikDate` (String, Nullable)
  - `education` (String, Nullable)
  - `occupation` (String, Nullable)
  - `devotionalCourses` (JSONB, Nullable) - Array of {name, date, institute}
  - `additionalComments` (String, Nullable)
  - `shraddhakutirId` (Integer, FK to Shraddhakutir, Nullable)
  - **Leadership fields**:
    - `leadershipRole` (Enum: MALA_SENAPOTI, MAHA_CHAKRA_SENAPOTI, CHAKRA_SENAPOTI, UPA_CHAKRA_SENAPOTI, Nullable)
    - `reportingToDevoteeId` (Integer, FK to Devotee, Nullable) - Self-referencing hierarchy
    - `hasSystemAccess` (Boolean, Default: false)
    - `appointedDate` (String, Nullable)
    - `appointedBy` (Integer, FK to User, Nullable)
  - `createdAt` (Timestamp, Default: now)
  - `updatedAt` (Timestamp, Default: now)
- **Relationships**:
  - Many-to-One with DevotionalStatus
  - Many-to-One with Namhatta
  - Many-to-One with Gurudev (2 FKs)
  - Many-to-One with Shraddhakutir
  - Self-referencing Many-to-One (reporting hierarchy)
  - One-to-Many with DevoteeAddress
  - One-to-One with User (reverse)

#### 3.1.6 Address
- **Purpose**: Normalized address master table
- **Attributes**:
  - `id` (Integer, PK, Auto-increment)
  - `country` (String, Not Null, Default: "India")
  - `stateCode` (String, Nullable)
  - `stateNameEnglish` (String, Nullable)
  - `districtCode` (String, Nullable)
  - `districtNameEnglish` (String, Nullable)
  - `subdistrictCode` (String, Nullable)
  - `subdistrictNameEnglish` (String, Nullable)
  - `villageCode` (String, Nullable)
  - `villageNameEnglish` (String, Nullable)
  - `pincode` (String, Nullable)
  - `createdAt` (Timestamp, Default: now)
- **Business Logic**:
  - Exact match lookup before creating new address (including null values)
  - Shared across Devotee and Namhatta entities

#### 3.1.7 DevoteeAddress
- **Purpose**: Junction table for Devotee-Address relationship
- **Attributes**:
  - `id` (Integer, PK, Auto-increment)
  - `devoteeId` (Integer, FK to Devotee, Not Null)
  - `addressId` (Integer, FK to Address, Not Null)
  - `addressType` (Enum: 'present', 'permanent', Not Null)
  - `landmark` (String, Nullable)
  - `createdAt` (Timestamp, Default: now)
- **Relationships**:
  - Many-to-One with Devotee
  - Many-to-One with Address

#### 3.1.8 NamhattaAddress
- **Purpose**: Junction table for Namhatta-Address relationship
- **Attributes**:
  - `id` (Integer, PK, Auto-increment)
  - `namhattaId` (Integer, FK to Namhatta, Not Null)
  - `addressId` (Integer, FK to Address, Not Null)
  - `landmark` (String, Nullable)
  - `createdAt` (Timestamp, Default: now)
- **Relationships**:
  - Many-to-One with Namhatta
  - Many-to-One with Address

#### 3.1.9 Namhatta
- **Purpose**: Spiritual center/group records
- **Attributes**:
  - `id` (Integer, PK, Auto-increment)
  - `code` (String, Unique, Not Null)
  - `name` (String, Not Null)
  - `meetingDay` (String, Nullable)
  - `meetingTime` (String, Nullable)
  - **Leadership positions** (all Nullable, FK to Devotee):
    - `malaSenapotiId`
    - `mahaChakraSenapotiId`
    - `chakraSenapotiId`
    - `upaChakraSenapotiId`
    - `secretaryId`
    - `presidentId`
    - `accountantId`
  - `districtSupervisorId` (Integer, Not Null) - References User, not Devotee
  - `status` (Enum: PENDING_APPROVAL, APPROVED, REJECTED, Default: PENDING_APPROVAL)
  - `registrationNo` (String, Unique, Nullable)
  - `registrationDate` (String, Nullable)
  - `createdAt` (Timestamp, Default: now)
  - `updatedAt` (Timestamp, Default: now)
- **Constraints**:
  - Unique `code`
  - Unique `registrationNo` (when not null)
- **Relationships**:
  - Many-to-One with User (via districtSupervisorId)
  - Many-to-One with Devotee (multiple FKs for positions)
  - One-to-Many with Devotee (via namhattaId)
  - One-to-Many with NamhattaAddress
  - One-to-Many with NamhattaUpdate

#### 3.1.10 DevotionalStatus
- **Purpose**: Spiritual progress levels
- **Attributes**:
  - `id` (Integer, PK, Auto-increment)
  - `name` (String, Unique, Not Null)
  - `createdAt` (Timestamp, Default: now)
- **Examples**: Shraddhavan, Sadhusangi, Harinam Diksha, Pancharatrik Diksha

#### 3.1.11 StatusHistory
- **Purpose**: Track devotional status changes
- **Attributes**:
  - `id` (Integer, PK, Auto-increment)
  - `devoteeId` (Integer, FK to Devotee, Not Null)
  - `previousStatus` (String, Nullable)
  - `newStatus` (String, Not Null)
  - `updatedAt` (Timestamp, Default: now)
  - `comment` (String, Nullable)
- **Relationships**:
  - Many-to-One with Devotee

#### 3.1.12 Gurudev
- **Purpose**: Spiritual masters/gurus
- **Attributes**:
  - `id` (Integer, PK, Auto-increment)
  - `name` (String, Unique, Not Null)
  - `title` (String, Nullable) - e.g., "His Holiness", "His Grace"
  - `createdAt` (Timestamp, Default: now)

#### 3.1.13 Shraddhakutir
- **Purpose**: Devotional centers/temples
- **Attributes**:
  - `id` (Integer, PK, Auto-increment)
  - `name` (String, Not Null)
  - `districtCode` (String, Not Null)
  - `createdAt` (Timestamp, Default: now)

#### 3.1.14 NamhattaUpdate
- **Purpose**: Activity/program updates for Namhattas
- **Attributes**:
  - `id` (Integer, PK, Auto-increment)
  - `namhattaId` (Integer, FK to Namhatta, Not Null)
  - `programType` (String, Not Null)
  - `date` (String, Not Null)
  - `attendance` (Integer, Not Null)
  - `prasadDistribution` (Integer, Nullable)
  - `nagarKirtan` (Integer, Default: 0)
  - `bookDistribution` (Integer, Default: 0)
  - `chanting` (Integer, Default: 0)
  - `arati` (Integer, Default: 0)
  - `bhagwatPath` (Integer, Default: 0)
  - `imageUrls` (JSONB, Nullable) - Array of strings
  - `facebookLink` (String, Nullable)
  - `youtubeLink` (String, Nullable)
  - `specialAttraction` (String, Nullable)
  - `createdAt` (Timestamp, Default: now)
- **Relationships**:
  - Many-to-One with Namhatta

#### 3.1.15 Leader
- **Purpose**: Top-level organizational hierarchy (GBC, Regional Directors, etc.)
- **Attributes**:
  - `id` (Integer, PK, Auto-increment)
  - `name` (String, Not Null)
  - `role` (Enum: FOUNDER_ACHARYA, GBC, REGIONAL_DIRECTOR, CO_REGIONAL_DIRECTOR, DISTRICT_SUPERVISOR)
  - `reportingTo` (Integer, FK to Leader, Nullable) - Self-referencing
  - `location` (JSONB, Nullable) - {country, state, district}
  - `createdAt` (Timestamp, Default: now)

#### 3.1.16 RoleChangeHistory
- **Purpose**: Audit trail for Senapoti role changes
- **Attributes**:
  - `id` (Integer, PK, Auto-increment)
  - `devoteeId` (Integer, FK to Devotee, Not Null)
  - `previousRole` (String, Nullable)
  - `newRole` (String, Nullable)
  - `previousReportingTo` (Integer, Nullable)
  - `newReportingTo` (Integer, Nullable)
  - `changedBy` (Integer, FK to User, Not Null)
  - `reason` (String, Not Null)
  - `districtCode` (String, Nullable)
  - `subordinatesTransferred` (Integer, Default: 0)
  - `createdAt` (Timestamp, Default: now)
- **Relationships**:
  - Many-to-One with Devotee
  - Many-to-One with User

### 3.2 Entity-CRUD-API Mapping

| Entity | Create | Read | Update | Delete |
|--------|--------|------|--------|--------|
| User | POST /api/admin/register-supervisor | GET /api/admin/users | PUT /api/admin/users/:id | DELETE /api/admin/users/:id (soft) |
| Devotee | POST /api/devotees | GET /api/devotees, GET /api/devotees/:id | PUT /api/devotees/:id | N/A |
| Namhatta | POST /api/namhattas | GET /api/namhattas, GET /api/namhattas/:id | PUT /api/namhattas/:id | N/A |
| DevotionalStatus | POST /api/statuses | GET /api/statuses | POST /api/statuses/:id/rename | N/A |
| Gurudev | POST /api/gurudevs | GET /api/gurudevs | N/A | N/A |
| Shraddhakutir | POST /api/shraddhakutirs | GET /api/shraddhakutirs | N/A | N/A |
| NamhattaUpdate | POST /api/updates | GET /api/namhattas/:id/updates, GET /api/updates/all | N/A | N/A |
| Leader | N/A (pre-seeded) | GET /api/hierarchy | N/A | N/A |
| StatusHistory | Auto-created on status upgrade | GET /api/namhattas/:id/status-history | N/A | N/A |
| RoleChangeHistory | Auto-created on role change | GET /api/senapoti/role-history/:devoteeId | N/A | N/A |

---

## 4. Business Logic & Rules

### 4.1 Authentication & Authorization

#### 4.1.1 Password Policy
- **Minimum Length**: 10 characters
- **Complexity**: Must contain:
  - At least 1 uppercase letter
  - At least 1 lowercase letter
  - At least 1 number
  - At least 1 special character: `!@#$%^&*()_+-=[]{};':"\\|,.<>/?`
- **Storage**: Bcrypt hash with salt (cost factor: default bcrypt)

#### 4.1.2 JWT Token Management
- **Algorithm**: HS256 (HMAC with SHA-256)
- **Expiration**: 1 hour from issuance
- **Payload**:
  ```json
  {
    "userId": "number",
    "username": "string",
    "role": "ADMIN | OFFICE | DISTRICT_SUPERVISOR",
    "districts": ["string"],
    "sessionToken": "string",
    "iat": "timestamp",
    "exp": "timestamp"
  }
  ```
- **Blacklisting**:
  - On logout, add token hash (SHA-256) to `jwtBlacklist` table
  - Check blacklist on every authenticated request
  - Periodic cleanup: Delete entries where `expiredAt < now`

#### 4.1.3 Session Management
- **Single Login Enforcement**:
  - Each user can have only ONE active session
  - On new login: delete existing session, create new one
  - Session timeout: 1 hour
- **Session Validation**:
  - On each request: verify session token matches active session
  - If mismatch: return 401 "Session expired or invalid"
  - If expired: auto-delete session and return 401

#### 4.1.4 Role-Based Access Control (RBAC)

**Role Hierarchy** (highest to lowest permission):
1. ADMIN - Full system access, user management
2. OFFICE - Data entry and management, no user admin
3. DISTRICT_SUPERVISOR - Limited to assigned districts only

**Permission Matrix**:

| Resource/Action | ADMIN | OFFICE | DISTRICT_SUPERVISOR |
|----------------|-------|--------|---------------------|
| Create/Edit Users | ✓ | ✗ | ✗ |
| Create/Edit Devotees | ✓ | ✓ | ✓ (own districts) |
| Create/Edit Namhattas | ✓ | ✓ | ✗ |
| Approve Namhattas | ✓ | ✓ | ✗ |
| View All Data | ✓ | ✓ | ✗ (districts only) |
| Senapoti Role Mgmt | ✓ | ✗ | ✓ (own districts) |
| View Reports | ✓ | ✓ | ✓ (districts only) |

#### 4.1.5 District-Based Access Control

**For DISTRICT_SUPERVISOR role**:
- User has many-to-many relationship with districts via `UserDistrict` table
- On data queries: automatically filter by `allowedDistricts`
- Implementation:
  - Middleware adds `allowedDistricts` array to request context
  - Storage layer filters queries: `WHERE district IN (allowedDistricts)`
- Access check examples:
  - **Devotee update**: Check if devotee's address district is in user's districts
  - **Reports**: Only aggregate data from user's assigned districts
  - **Role changes**: Can only manage devotees within their districts

### 4.2 Senapoti Role Hierarchy & Management

#### 4.2.1 Role Hierarchy Definition

```
DISTRICT_SUPERVISOR (highest)
    ↓
MALA_SENAPOTI (level 1)
    ↓
MAHA_CHAKRA_SENAPOTI (level 2)
    ↓
CHAKRA_SENAPOTI (level 3)
    ↓
UPA_CHAKRA_SENAPOTI (level 4, lowest)
```

**Hierarchy Rules**:
- Each role reports to the one above it
- MALA_SENAPOTI reports to DISTRICT_SUPERVISOR
- Cannot skip levels in hierarchy

#### 4.2.2 Role Promotion Rules

**Allowed Promotions**:
- UPA_CHAKRA_SENAPOTI → CHAKRA_SENAPOTI
- CHAKRA_SENAPOTI → MAHA_CHAKRA_SENAPOTI
- MAHA_CHAKRA_SENAPOTI → MALA_SENAPOTI
- MALA_SENAPOTI → Cannot be promoted further

**Validation Steps**:
1. Check current role exists in hierarchy
2. Check target role exists in hierarchy
3. Verify target role is in `canPromoteTo` array of current role
4. Verify no circular reference in reporting structure
5. Check district boundaries (if DISTRICT_SUPERVISOR making change)

#### 4.2.3 Role Demotion Rules

**Allowed Demotions**:
- MALA_SENAPOTI → MAHA_CHAKRA_SENAPOTI, CHAKRA_SENAPOTI, UPA_CHAKRA_SENAPOTI
- MAHA_CHAKRA_SENAPOTI → CHAKRA_SENAPOTI, UPA_CHAKRA_SENAPOTI
- CHAKRA_SENAPOTI → UPA_CHAKRA_SENAPOTI
- UPA_CHAKRA_SENAPOTI → Cannot be demoted (can only be removed)

**Validation Steps**:
1. Check current role allows demotion
2. Verify target role is in `canDemoteTo` array
3. Handle subordinates (transfer to new supervisor)
4. Check no circular reference
5. Record reason for audit trail

#### 4.2.4 Subordinate Transfer Logic

**When subordinates need transfer**:
- Role removal (all subordinates transferred)
- Demotion where role no longer manages current subordinates
- Explicit subordinate reassignment

**Transfer Validation**:
1. Check all `subordinateIds` belong to `fromDevoteeId`
2. Verify `toDevoteeId` is eligible to supervise (correct role level)
3. Check no circular reference (toDevotee not reporting to any subordinate)
4. For DISTRICT_SUPERVISOR: ensure all devotees in same district
5. Minimum 1 subordinate must be transferred

**Transfer Process**:
1. Update each subordinate's `reportingToDevoteeId` to `toDevoteeId`
2. Create `RoleChangeHistory` record for each subordinate
3. Return count of transferred subordinates

#### 4.2.5 Circular Reference Prevention

**Check Algorithm**:
```
function checkCircular(devoteeId, newReportingToId):
  if newReportingToId is null: return valid
  if devoteeId == newReportingToId: return invalid (self-reference)
  
  visited = Set()
  currentId = newReportingToId
  
  while currentId not null and currentId not in visited:
    visited.add(currentId)
    if currentId == devoteeId:
      return invalid (circular reference)
    currentId = getReportingTo(currentId)
  
  return valid
```

**Applied at**:
- Role promotion
- Role demotion
- Subordinate transfer
- Direct role assignment

#### 4.2.6 Role Change Audit Trail

**RoleChangeHistory Record Created On**:
- Promotion
- Demotion
- Role removal
- Subordinate transfer

**Required Fields**:
- `devoteeId`: Who changed
- `previousRole`, `newRole`: Role transition
- `previousReportingTo`, `newReportingTo`: Supervisor change
- `changedBy`: User who made change
- `reason`: Mandatory explanation (min 3 chars)
- `districtCode`: Where change occurred
- `subordinatesTransferred`: Count if applicable

### 4.3 Namhatta Management

#### 4.3.1 Namhatta Creation Rules
- **Unique Code**: Must be unique across all Namhattas
- **District Supervisor**: Required field, must reference valid active user with DISTRICT_SUPERVISOR role
- **Status**: Defaults to PENDING_APPROVAL
- **Address Normalization**:
  - Find existing address record with exact match (including nulls)
  - If not found, create new address
  - Create NamhattaAddress link with optional landmark

#### 4.3.2 Namhatta Approval Workflow
**States**: PENDING_APPROVAL → APPROVED | REJECTED

**Approval Requirements**:
- Only ADMIN or OFFICE can approve/reject
- For approval: registrationNo and registrationDate required
- registrationNo must be unique across all Namhattas
- On approval: status → APPROVED, set registrationNo, registrationDate
- On rejection: status → REJECTED, reason optional

**Business Rules**:
- Cannot approve if registrationNo already exists
- Once APPROVED, registrationNo cannot be changed
- Rejected Namhattas can be edited and resubmitted

#### 4.3.3 Leadership Position Assignment
**Officer Roles** (non-hierarchical):
- Secretary, President, Accountant
- Can be any devotee (not required to have leadership role)

**Senapoti Roles** (hierarchical):
- Mala Senapoti, Maha Chakra Senapoti, Chakra Senapoti, Upa Chakra Senapoti
- Must be devotees with matching `leadershipRole`
- Automatically link devotee to Namhatta if not already assigned

**Constraints**:
- Same devotee cannot hold multiple positions in same Namhatta
- Devotee can be officer/senapoti in multiple Namhattas

### 4.4 Address Management

#### 4.4.1 Address Normalization
**Find-or-Create Logic**:
```
function findOrCreateAddress(addressData):
  // Normalize: empty strings → null, default country to "India"
  normalized = {
    country: addressData.country || "India",
    state: addressData.state || null,
    district: addressData.district || null,
    subDistrict: addressData.subDistrict || null,
    village: addressData.village || null,
    postalCode: addressData.postalCode || null
  }
  
  // Exact match including null values
  existing = findWhere(
    country = normalized.country AND
    (state = normalized.state OR (state IS NULL AND normalized.state IS NULL)) AND
    ... // similar for all fields
  )
  
  if existing:
    return existing.id
  else:
    create new address with normalized data
    return new id
```

#### 4.4.2 Devotee Address Linking
- **Two address types**: present, permanent
- Each devotee can have 0-2 addresses (one of each type)
- Create `DevoteeAddress` records with:
  - `devoteeId`: Reference to devotee
  - `addressId`: Reference to normalized address
  - `addressType`: 'present' or 'permanent'
  - `landmark`: Devotee-specific landmark

#### 4.4.3 Namhatta Address Linking
- One address per Namhatta
- Create `NamhattaAddress` with:
  - `namhattaId`: Reference to Namhatta
  - `addressId`: Reference to normalized address
  - `landmark`: Namhatta-specific landmark

### 4.5 Devotee Management

#### 4.5.1 Devotee Creation/Update
**Required Fields**:
- `legalName`: Must be provided

**Optional Complex Fields**:
- `devotionalCourses`: JSONB array of {name, date, institute}
- `presentAddress`, `permanentAddress`: Normalized and linked separately

**Validation Rules**:
- Email: valid email format if provided
- Phone: valid phone format if provided  
- Numeric IDs: must be positive integers
- Gender: must be MALE, FEMALE, or OTHER
- Marital Status: must be MARRIED, UNMARRIED, or WIDOWED

**Address Handling on Create/Update**:
1. Extract `presentAddress` and `permanentAddress` from request
2. Validate devotee fields against schema
3. For each address type:
   - Find or create Address record
   - Create/update DevoteeAddress link
4. Save devotee with address IDs

#### 4.5.2 Devotee-User Linking
**Requirements**:
- Only ADMIN can create user accounts for devotees
- User creation requires:
  - Valid username (3-50 chars, alphanumeric + underscore)
  - Strong password (8-100 chars, complexity rules)
  - Valid unique email
  - Role: DISTRICT_SUPERVISOR or OFFICE
- One devotee can link to only one user (unless force flag)
- One user can link to only one devotee

**Process**:
1. Validate all user fields
2. Check if devotee already has linked user (unless `force: true`)
3. Hash password with bcrypt
4. Create User record with `devoteeId` reference
5. If role is DISTRICT_SUPERVISOR: prompt for district assignment

#### 4.5.3 Devotional Status Upgrade
**Business Rule**:
- Status progression typically follows spiritual advancement
- No enforced progression order (flexible for different paths)
- Create StatusHistory record on every change
- History includes: devoteeId, previous status, new status, timestamp, optional notes

### 4.6 Data Integrity & Validation

#### 4.6.1 Input Sanitization
**Applied to**: POST, PUT, PATCH requests

**Sanitization Steps**:
1. Trim all string values
2. HTML-escape special characters to prevent XSS
3. Recursively sanitize nested objects and arrays
4. Preserve null/undefined values

**Implemented via middleware**: Applied before request validation

#### 4.6.2 Unique Constraints
| Field | Entity | Enforcement |
|-------|--------|-------------|
| username | User | Database + validation |
| email | User | Database + validation |
| code | Namhatta | Database + validation |
| registrationNo | Namhatta | Database + validation (when not null) |
| name | DevotionalStatus | Database unique |
| name | Gurudev | Database unique |
| (userId, districtCode) | UserDistrict | Database composite unique |

#### 4.6.3 Referential Integrity
**Cascade Rules**:
- User deletion: Set devotee.devoteeId → NULL (if exists)
- Devotee deletion: Not implemented (soft delete recommended)
- Address deletion: Not allowed if referenced by DevoteeAddress or NamhattaAddress
- Status deletion: Not allowed if referenced by Devotee

**Orphan Prevention**:
- Cannot delete district supervisor if assigned to Namhattas
- Cannot delete devotee if serving as Namhatta officer/senapoti
- Cannot delete status if assigned to devotees

---

## 5. Non-Functional Requirements

### 5.1 Security

#### 5.1.1 Authentication Security
- **Password Storage**: Bcrypt hashing (never store plain text)
- **JWT Secret**: Strong secret key (min 32 chars), environment-configured
- **Session Secret**: Separate strong secret for session management
- **Token Transport**: HTTP-only cookies (not localStorage) to prevent XSS
- **Cookie Settings**:
  - `httpOnly: true` - JavaScript cannot access
  - `secure: true` - HTTPS only in production
  - `sameSite: 'strict'` - CSRF protection
  - Max age: 1 hour

#### 5.1.2 Authorization Security
- **Role Enforcement**: Check on every protected endpoint
- **District Filtering**: Server-side enforcement for DISTRICT_SUPERVISOR
- **Token Validation**: Verify JWT signature, expiration, blacklist status
- **Session Validation**: Check active session matches token

#### 5.1.3 Input Validation & Sanitization
- **Validation**: Zod schemas for all input data
- **Sanitization**: HTML escape on all string inputs
- **SQL Injection Prevention**: Use parameterized queries (JPA)
- **XSS Prevention**: Sanitize and escape user inputs
- **CSRF Protection**: SameSite cookie policy

#### 5.1.4 Rate Limiting
| Endpoint Type | Limit | Window |
|---------------|-------|--------|
| Login | 5 attempts | 15 minutes |
| Data modification (POST/PUT/DELETE) | 10 requests | 1 minute |
| General API | 100 requests | 15 minutes |

**Implementation**:
- Track by IP address
- Return 429 Too Many Requests when exceeded
- Include retry-after header

#### 5.1.5 CORS Configuration
**Development**:
- Allow all origins

**Production**:
- Whitelist specific domains:
  - Same-origin (repl.co domain)
  - *.replit.app pattern
  - Environment-configured additional origins
- Credentials: true (for cookies)
- Methods: GET, POST, PUT, DELETE, PATCH
- Headers: Content-Type, Authorization, X-Requested-With, Cache-Control

#### 5.1.6 Security Headers (Helmet.js equivalent)
**Production**:
- Content-Security-Policy: Strict (no unsafe-inline/unsafe-eval)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Strict-Transport-Security: max-age=31536000; includeSubDomains
- Referrer-Policy: strict-origin-when-cross-origin

**Development**:
- Relaxed CSP for HMR/debugging (allow unsafe-inline, unsafe-eval, ws:)

### 5.2 Performance

#### 5.2.1 Database Optimization
- **Indexes**: Create on:
  - User: username, email
  - Devotee: legalName, email, namhattaId, leadershipRole, reportingToDevoteeId
  - Namhatta: code, registrationNo, districtSupervisorId, status
  - Address: country, stateNameEnglish, districtNameEnglish, pincode
  - UserDistrict: userId, districtCode
  - JwtBlacklist: tokenHash, expiredAt
- **Query Optimization**:
  - Use pagination for all list endpoints (default: 10 items)
  - Limit result sets (max 100 items per request)
  - Lazy load related entities where appropriate

#### 5.2.2 Caching Strategy
**No Cache** (real-time data):
- Dashboard statistics
- Reports
- Devotee/Namhatta lists

**Cache Headers**:
- Reports: `Cache-Control: no-cache, no-store, must-revalidate`
- Static reference data (statuses, gurudevs): Cache for 1 hour

#### 5.2.3 Response Time Targets
- Authentication endpoints: < 200ms
- List queries (paginated): < 500ms
- Single record fetch: < 100ms
- Complex reports: < 2s
- Role management operations: < 1s

### 5.3 Error Handling & Logging

#### 5.3.1 Error Response Format
**Client Errors (4xx)**:
```json
{
  "error": "Human-readable error message",
  "details": [/* optional validation details */]
}
```

**Server Errors (5xx)**:
```json
{
  "error": "Internal Server Error"
}
```
- Never expose stack traces or internal details to client
- Log full error details server-side only

#### 5.3.2 Logging Requirements
**Log Levels**:
- ERROR: Failed operations, exceptions, security issues
- WARN: Deprecated usage, soft errors, unusual conditions
- INFO: Successful operations, user actions, system events
- DEBUG: Detailed flow, variable states (dev only)

**Logged Information**:
- Timestamp
- Log level
- User ID (if authenticated)
- Request method and URL
- Error message and stack trace
- IP address (for security events)
- Request/response payload (sanitized, no sensitive data)

**What NOT to log**:
- Passwords (plain or hashed)
- JWT tokens
- Session tokens
- Full credit card numbers
- Personal identifiable information (beyond user ID)

#### 5.3.3 Error Handling Strategy
1. **Validation Errors**: Return 400 with details
2. **Authentication Failures**: Return 401 with generic message
3. **Authorization Failures**: Return 403 with generic message
4. **Not Found**: Return 404 with resource type
5. **Conflict**: Return 409 with conflict details
6. **Server Errors**: Return 500, log details, alert team
7. **Database Errors**: Wrap in generic 500, log query (sanitized)

### 5.4 Scalability Considerations

#### 5.4.1 Database Connection Pooling
- **Connection Pool**: 10-20 connections (adjust based on load)
- **Timeout**: 30 seconds for query execution
- **Idle Timeout**: 10 minutes for idle connections
- **Max Lifetime**: 30 minutes per connection

#### 5.4.2 Stateless Architecture
- JWT for authentication (no server-side session storage except for single-login)
- User session stored in database (not in-memory) for multi-instance support
- All user state in JWT or database

#### 5.4.3 Horizontal Scaling Readiness
- No in-memory state (except request context)
- Database-backed sessions for single-login enforcement
- JWT blacklist in database (not in-memory)
- Cleanup jobs can run on any instance

---

## 6. Implementation Task Breakdown

**Instructions for Agent**:
- Update task status as you complete each item
- Mark tasks as IN_PROGRESS when you start working on them
- Mark as COMPLETED only after implementation and testing
- Follow task order - each task builds on previous ones
- Do not skip ahead - complete prerequisites first

### Status Definitions
- **NOT_STARTED**: Task has not been started
- **IN_PROGRESS**: Task is currently being worked on
- **COMPLETED**: Task is fully implemented and tested

---

### **PHASE 1: PROJECT SETUP & CONFIGURATION**
**Status**: NOT_STARTED  
**Duration**: 1-2 days  
**Prerequisites**: None

#### Task 1.1: Initialize Spring Boot Project
**Status**: NOT_STARTED
- [ ] 1.1.1: Create new Spring Boot project using Spring Initializr (Maven, Java 17+)
- [ ] 1.1.2: Add core dependencies: Spring Web, Spring Data JPA, Spring Security
- [ ] 1.1.3: Add database dependencies: PostgreSQL Driver, HikariCP
- [ ] 1.1.4: Add utility dependencies: Lombok, Validation API, Jackson
- [ ] 1.1.5: Configure project structure with packages: config, controller, service, repository, model, dto, security, exception, util

#### Task 1.2: Configure Application Properties
**Status**: NOT_STARTED  
**Prerequisites**: Task 1.1
- [ ] 1.2.1: Create application.properties (or .yml) for default configuration
- [ ] 1.2.2: Create application-dev.properties for development environment
- [ ] 1.2.3: Create application-prod.properties for production environment
- [ ] 1.2.4: Configure logging (SLF4J + Logback) with appropriate log levels
- [ ] 1.2.5: Setup environment-specific profiles

#### Task 1.3: Configure Database Connection
**Status**: NOT_STARTED  
**Prerequisites**: Task 1.2
- [ ] 1.3.1: Configure PostgreSQL datasource URL (use environment variable)
- [ ] 1.3.2: Setup JPA/Hibernate properties (dialect: PostgreSQL, ddl-auto: validate)
- [ ] 1.3.3: Configure HikariCP connection pooling (pool size: 10-20)
- [ ] 1.3.4: Setup connection timeout and idle timeout settings
- [ ] 1.3.5: Test database connectivity with a simple health check

---

### **PHASE 2: DATA MODEL & ENTITIES**
**Status**: NOT_STARTED  
**Duration**: 2-3 days  
**Prerequisites**: Phase 1 completed

#### Task 2.1: Create Base Entity and Enums
**Status**: NOT_STARTED  
**Prerequisites**: Task 1.3
- [ ] 2.1.1: Create BaseEntity abstract class with id, createdAt, updatedAt fields
- [ ] 2.1.2: Create UserRole enum (ADMIN, OFFICE, DISTRICT_SUPERVISOR)
- [ ] 2.1.3: Create LeadershipRole enum (MALA_SENAPOTI, MAHA_CHAKRA_SENAPOTI, CHAKRA_SENAPOTI, UPA_CHAKRA_SENAPOTI)
- [ ] 2.1.4: Create Gender enum (MALE, FEMALE, OTHER)
- [ ] 2.1.5: Create MaritalStatus enum (MARRIED, UNMARRIED, WIDOWED)
- [ ] 2.1.6: Create NamhattaStatus enum (PENDING_APPROVAL, APPROVED, REJECTED)
- [ ] 2.1.7: Create AddressType enum (PRESENT, PERMANENT)

#### Task 2.2: Create User-Related Entities
**Status**: NOT_STARTED  
**Prerequisites**: Task 2.1
- [ ] 2.2.1: Create User entity (@Entity) with all fields (id, username, passwordHash, fullName, email, role, devoteeId, isActive, timestamps)
- [ ] 2.2.2: Add @Column annotations with constraints (unique, nullable, length)
- [ ] 2.2.3: Create UserDistrict entity with userId, districtCode, districtNameEnglish, isDefaultDistrictSupervisor
- [ ] 2.2.4: Add unique constraint on (userId, districtCode) in UserDistrict
- [ ] 2.2.5: Create UserSession entity with userId (unique), sessionToken, expiresAt
- [ ] 2.2.6: Create JwtBlacklist entity with tokenHash, expiredAt

#### Task 2.3: Create Devotee Entity
**Status**: NOT_STARTED  
**Prerequisites**: Task 2.2
- [ ] 2.3.1: Create Devotee entity with personal fields (legalName, name, dob, email, phone, etc.)
- [ ] 2.3.2: Add family fields (fatherName, motherName, husbandName)
- [ ] 2.3.3: Add spiritual fields (devotionalStatusId, gurudev IDs, initiation dates)
- [ ] 2.3.4: Add leadership fields (leadershipRole, reportingToDevoteeId, hasSystemAccess, appointedDate, appointedBy)
- [ ] 2.3.5: Add self-referencing @ManyToOne relationship for hierarchy (reportingToDevotee)
- [ ] 2.3.6: Add foreign key relationships (namhattaId, devotionalStatusId, etc.)

#### Task 2.4: Create Address Entities
**Status**: NOT_STARTED  
**Prerequisites**: Task 2.3
- [ ] 2.4.1: Create Address entity with country, state, district, subdistrict, village, pincode fields
- [ ] 2.4.2: Set default value for country = "India"
- [ ] 2.4.3: Create DevoteeAddress junction table with devoteeId, addressId, addressType, landmark
- [ ] 2.4.4: Create NamhattaAddress junction table with namhattaId, addressId, landmark

#### Task 2.5: Create Namhatta Entity
**Status**: NOT_STARTED  
**Prerequisites**: Task 2.4
- [ ] 2.5.1: Create Namhatta entity with code (unique), name, meetingDay, meetingTime
- [ ] 2.5.2: Add leadership position fields (malaSenapotiId, mahaChakraSenapotiId, chakraSenapotiId, upaChakraSenapotiId)
- [ ] 2.5.3: Add officer fields (secretaryId, presidentId, accountantId)
- [ ] 2.5.4: Add districtSupervisorId (required), status, registrationNo (unique), registrationDate
- [ ] 2.5.5: Add @ManyToOne relationships for all foreign keys
- [ ] 2.5.6: Add unique constraints on code and registrationNo

#### Task 2.6: Create Supporting Entities
**Status**: NOT_STARTED  
**Prerequisites**: Task 2.5
- [ ] 2.6.1: Create DevotionalStatus entity (id, name unique, createdAt)
- [ ] 2.6.2: Create StatusHistory entity (devoteeId, previousStatus, newStatus, comment, updatedAt)
- [ ] 2.6.3: Create Gurudev entity (id, name unique, title, createdAt)
- [ ] 2.6.4: Create Shraddhakutir entity (id, name, districtCode, createdAt)
- [ ] 2.6.5: Create NamhattaUpdate entity with all activity fields (attendance, prasad, kirtan, etc.)
- [ ] 2.6.6: Create Leader entity (id, name, role, reportingTo, location as JSON, createdAt)
- [ ] 2.6.7: Create RoleChangeHistory entity with all audit fields

---

### **PHASE 3: REPOSITORY LAYER**
**Status**: NOT_STARTED  
**Duration**: 1-2 days  
**Prerequisites**: Phase 2 completed

#### Task 3.1: Create User Repositories
**Status**: NOT_STARTED  
**Prerequisites**: Task 2.6
- [ ] 3.1.1: Create UserRepository extends JpaRepository<User, Long>
- [ ] 3.1.2: Add method: Optional<User> findByUsername(String username)
- [ ] 3.1.3: Add method: Optional<User> findByEmail(String email)
- [ ] 3.1.4: Add method: List<User> findByIsActiveTrue()
- [ ] 3.1.5: Create UserDistrictRepository with findByUserId and findByDistrictCode methods
- [ ] 3.1.6: Create UserSessionRepository with findByUserId and deleteByUserId methods
- [ ] 3.1.7: Create JwtBlacklistRepository with findByTokenHash and deleteByExpiredAtBefore methods

#### Task 3.2: Create Devotee and Namhatta Repositories
**Status**: NOT_STARTED  
**Prerequisites**: Task 3.1
- [ ] 3.2.1: Create DevoteeRepository extends JpaRepository<Devotee, Long>
- [ ] 3.2.2: Add pagination and filtering query methods (@Query annotations)
- [ ] 3.2.3: Add method: List<Devotee> findByNamhattaId(Long namhattaId)
- [ ] 3.2.4: Add method: List<Devotee> findByReportingToDevoteeId(Long id)
- [ ] 3.2.5: Create NamhattaRepository with findByCode and findByRegistrationNo
- [ ] 3.2.6: Add Namhatta filtering query methods

#### Task 3.3: Create Address and Supporting Repositories
**Status**: NOT_STARTED  
**Prerequisites**: Task 3.2
- [ ] 3.3.1: Create AddressRepository with custom exact match query method
- [ ] 3.3.2: Create DevoteeAddressRepository
- [ ] 3.3.3: Create NamhattaAddressRepository
- [ ] 3.3.4: Create DevotionalStatusRepository
- [ ] 3.3.5: Create StatusHistoryRepository
- [ ] 3.3.6: Create GurudevRepository
- [ ] 3.3.7: Create ShraddhakutirRepository with findByDistrictCode
- [ ] 3.3.8: Create NamhattaUpdateRepository with findByNamhattaId
- [ ] 3.3.9: Create LeaderRepository with findByRole
- [ ] 3.3.10: Create RoleChangeHistoryRepository with findByDevoteeId

#### Task 3.4: Create Database Indexes
**Status**: NOT_STARTED  
**Prerequisites**: Task 3.3
- [ ] 3.4.1: Create index on User (username) - for login performance
- [ ] 3.4.2: Create index on User (email) - for uniqueness check
- [ ] 3.4.3: Create indexes on Devotee (legalName, email, namhattaId, leadershipRole, reportingToDevoteeId)
- [ ] 3.4.4: Create indexes on Namhatta (code, registrationNo, districtSupervisorId, status)
- [ ] 3.4.5: Create indexes on Address (country, stateNameEnglish, districtNameEnglish, pincode)
- [ ] 3.4.6: Create index on JwtBlacklist (tokenHash, expiredAt) - for cleanup

---

### **PHASE 4: SECURITY IMPLEMENTATION**
**Status**: NOT_STARTED  
**Duration**: 3-4 days  
**Prerequisites**: Phase 3 completed

#### Task 4.1: Password Management
**Status**: NOT_STARTED  
**Prerequisites**: Task 3.4
- [ ] 4.1.1: Create PasswordService class
- [ ] 4.1.2: Configure BCryptPasswordEncoder bean
- [ ] 4.1.3: Implement hashPassword(String plainPassword) method
- [ ] 4.1.4: Implement verifyPassword(String plain, String hashed) method
- [ ] 4.1.5: Create password validation regex (10+ chars, uppercase, lowercase, number, special char)
- [ ] 4.1.6: Implement validatePasswordStrength(String password) method

#### Task 4.2: JWT Token Management
**Status**: NOT_STARTED  
**Prerequisites**: Task 4.1
- [ ] 4.2.1: Create JwtTokenProvider class
- [ ] 4.2.2: Configure JWT secret from environment variable
- [ ] 4.2.3: Implement generateToken(UserDetails, districts, sessionToken) method
- [ ] 4.2.4: Implement validateToken(String token) method
- [ ] 4.2.5: Implement getUserIdFromToken(String token) method
- [ ] 4.2.6: Implement extractClaims(String token) method
- [ ] 4.2.7: Set token expiration to 1 hour

#### Task 4.3: Token Blacklist Service
**Status**: NOT_STARTED  
**Prerequisites**: Task 4.2
- [ ] 4.3.1: Create TokenBlacklistService class
- [ ] 4.3.2: Implement blacklistToken(String token) - hash token and store
- [ ] 4.3.3: Implement isTokenBlacklisted(String tokenHash) method
- [ ] 4.3.4: Implement cleanupExpiredTokens() method
- [ ] 4.3.5: Add @Scheduled annotation for daily cleanup job

#### Task 4.4: Session Management
**Status**: NOT_STARTED  
**Prerequisites**: Task 4.3
- [ ] 4.4.1: Create SessionService class
- [ ] 4.4.2: Implement createSession(Long userId) - delete old, create new (single login)
- [ ] 4.4.3: Implement validateSession(Long userId, String sessionToken) method
- [ ] 4.4.4: Implement removeSession(Long userId) method
- [ ] 4.4.5: Implement cleanupExpiredSessions() method
- [ ] 4.4.6: Add @Scheduled annotation for hourly cleanup

#### Task 4.5: Spring Security Configuration
**Status**: NOT_STARTED  
**Prerequisites**: Task 4.4
- [ ] 4.5.1: Create SecurityConfig class with @Configuration and @EnableWebSecurity
- [ ] 4.5.2: Create SecurityFilterChain bean
- [ ] 4.5.3: Configure public endpoints (login, health, about, geography APIs)
- [ ] 4.5.4: Configure authenticated endpoints (all others)
- [ ] 4.5.5: Disable CSRF (using JWT)
- [ ] 4.5.6: Set session management to STATELESS

#### Task 4.6: JWT Authentication Filter
**Status**: NOT_STARTED  
**Prerequisites**: Task 4.5
- [ ] 4.6.1: Create JwtAuthenticationFilter extends OncePerRequestFilter
- [ ] 4.6.2: Extract JWT from cookie (auth_token)
- [ ] 4.6.3: Validate JWT using JwtTokenProvider
- [ ] 4.6.4: Check if token is blacklisted
- [ ] 4.6.5: Validate session using SessionService
- [ ] 4.6.6: Create Authentication object and set in SecurityContext
- [ ] 4.6.7: Continue filter chain

#### Task 4.7: Custom UserDetailsService
**Status**: NOT_STARTED  
**Prerequisites**: Task 4.6
- [ ] 4.7.1: Create CustomUserDetailsService implements UserDetailsService
- [ ] 4.7.2: Implement loadUserByUsername(String username) method
- [ ] 4.7.3: Fetch User from UserRepository
- [ ] 4.7.4: Fetch user districts from UserDistrictRepository
- [ ] 4.7.5: Create UserDetails object with roles and districts
- [ ] 4.7.6: Handle user not found exception

#### Task 4.8: Authorization Components
**Status**: NOT_STARTED  
**Prerequisites**: Task 4.7
- [ ] 4.8.1: Create @PreAuthorize annotations for role checks
- [ ] 4.8.2: Create DistrictAccessValidator component
- [ ] 4.8.3: Implement validateDevoteeAccess(Long devoteeId, List<String> userDistricts)
- [ ] 4.8.4: Implement filterByDistricts(List<String> districts) for queries
- [ ] 4.8.5: Create @DistrictAccess custom annotation
- [ ] 4.8.6: Create DistrictAccessAspect for AOP-based filtering

---

### **PHASE 5: SERVICE LAYER - CORE SERVICES**
**Status**: NOT_STARTED  
**Duration**: 4-5 days  
**Prerequisites**: Phase 4 completed

#### Task 5.1: Authentication Service
**Status**: NOT_STARTED  
**Prerequisites**: Task 4.8
- [ ] 5.1.1: Create AuthenticationService class with @Service annotation
- [ ] 5.1.2: Implement login(LoginRequest) → LoginResponse method
  - Validate credentials using PasswordService
  - Create session using SessionService
  - Generate JWT using JwtTokenProvider
  - Return user info with token
- [ ] 5.1.3: Implement logout(String token) method
  - Blacklist token
  - Remove session
- [ ] 5.1.4: Implement verifyToken(String token) → UserInfo method
  - Validate JWT
  - Check blacklist
  - Validate session
  - Return current user info

#### Task 5.2: User Management Service
**Status**: NOT_STARTED  
**Prerequisites**: Task 5.1
- [ ] 5.2.1: Create UserService class with @Service annotation
- [ ] 5.2.2: Implement getAllUsers() → List<UserDTO> method
- [ ] 5.2.3: Implement createDistrictSupervisor(RegisterRequest) → UserDTO method
  - Validate unique username and email
  - Hash password
  - Create user with DISTRICT_SUPERVISOR role
  - Create user-district mappings
- [ ] 5.2.4: Implement updateUser(Long id, UpdateRequest) → UserDTO method
- [ ] 5.2.5: Implement deactivateUser(Long id) method (soft delete)
- [ ] 5.2.6: Implement getUserDistricts(Long userId) → List<DistrictDTO> method
- [ ] 5.2.7: Implement getAvailableDistricts() → List<DistrictDTO> method

#### Task 5.3: Address Service
**Status**: NOT_STARTED  
**Prerequisites**: Task 5.2
- [ ] 5.3.1: Create AddressService class with @Service annotation
- [ ] 5.3.2: Implement findOrCreateAddress(AddressData) → Long method
  - Build exact match conditions (including null values)
  - Query for existing address
  - Create new if not found
  - Return address ID
- [ ] 5.3.3: Implement linkDevoteeAddress(devoteeId, addressId, type, landmark) method
- [ ] 5.3.4: Implement linkNamhattaAddress(namhattaId, addressId, landmark) method
- [ ] 5.3.5: Implement geography methods: getCountries, getStates, getDistricts, etc.
- [ ] 5.3.6: Implement searchPincodes(country, search, page, limit) method
- [ ] 5.3.7: Implement getAddressByPincode(String pincode) method

#### Task 5.4: Devotee Service
**Status**: NOT_STARTED  
**Prerequisites**: Task 5.3
- [ ] 5.4.1: Create DevoteeService class with @Service annotation
- [ ] 5.4.2: Implement getDevotees(PageRequest, filters) → Page<DevoteeDTO> method
  - Apply pagination
  - Apply filters (search, country, state, district, status)
  - For DISTRICT_SUPERVISOR: filter by allowed districts
- [ ] 5.4.3: Implement getDevotee(Long id) → DevoteeDTO method
- [ ] 5.4.4: Implement createDevotee(CreateDevoteeRequest) → DevoteeDTO method
  - Validate input
  - Process addresses (find-or-create)
  - Create devotee record
  - Link addresses
- [ ] 5.4.5: Implement updateDevotee(Long id, UpdateRequest) → DevoteeDTO method
  - Check district access for DISTRICT_SUPERVISOR
  - Update devotee fields
  - Update addresses if changed
- [ ] 5.4.6: Implement upgradeDevoteeStatus(id, statusId, notes) method
  - Update devotionalStatusId
  - Create StatusHistory record
- [ ] 5.4.7: Implement assignLeadership(id, LeadershipRequest) method
- [ ] 5.4.8: Implement removeLeadership(Long id) method
- [ ] 5.4.9: Implement linkUserToDevotee(devoteeId, CreateUserRequest) → UserDTO
- [ ] 5.4.10: Implement getAvailableOfficers() → List<DevoteeDTO> method

#### Task 5.5: Namhatta Service
**Status**: NOT_STARTED  
**Prerequisites**: Task 5.4
- [ ] 5.5.1: Create NamhattaService class with @Service annotation
- [ ] 5.5.2: Implement getNamhattas(PageRequest, filters) → Page<NamhattaDTO>
- [ ] 5.5.3: Implement getNamhatta(Long id) → NamhattaDTO
- [ ] 5.5.4: Implement createNamhatta(CreateRequest) → NamhattaDTO
  - Validate unique code
  - Process address
  - Create namhatta record
  - Link officers/senapotis
- [ ] 5.5.5: Implement updateNamhatta(Long id, UpdateRequest) → NamhattaDTO
- [ ] 5.5.6: Implement checkRegistrationNo(String regNo) → boolean
- [ ] 5.5.7: Implement approveNamhatta(id, ApproveRequest) method
  - Validate unique registrationNo
  - Update status to APPROVED
  - Set registration number and date
- [ ] 5.5.8: Implement rejectNamhatta(id, reason) method
- [ ] 5.5.9: Implement getDevoteesByNamhatta(id, page, statusId) → Page<DevoteeDTO>
- [ ] 5.5.10: Implement getNamhattaUpdates(Long id) → List<UpdateDTO>
- [ ] 5.5.11: Implement getDevoteeStatusCount(Long id) → Map<String, Integer>
- [ ] 5.5.12: Implement getStatusHistory(id, page) → Page<StatusHistoryDTO>

---

### **PHASE 6: SERVICE LAYER - ROLE MANAGEMENT**
**Status**: NOT_STARTED  
**Duration**: 3-4 days  
**Prerequisites**: Phase 5 completed

#### Task 6.1: Role Hierarchy Rules Utility
**Status**: NOT_STARTED  
**Prerequisites**: Task 5.5
- [ ] 6.1.1: Create RoleHierarchyRules utility class
- [ ] 6.1.2: Define ROLE_HIERARCHY map with level, reportsTo, canPromoteTo, canDemoteTo
- [ ] 6.1.3: Implement canPromote(LeadershipRole from, LeadershipRole to) method
- [ ] 6.1.4: Implement canDemote(LeadershipRole from, LeadershipRole to) method
- [ ] 6.1.5: Implement getReportingRole(LeadershipRole role) method
- [ ] 6.1.6: Implement getManagedRoles(LeadershipRole role) method

#### Task 6.2: Role Management Service - Validation
**Status**: NOT_STARTED  
**Prerequisites**: Task 6.1
- [ ] 6.2.1: Create RoleManagementService class with @Service annotation
- [ ] 6.2.2: Implement validateHierarchyChange(current, target, changeType) → ValidationResult
  - Check if promotion/demotion is allowed
  - Return errors/warnings
- [ ] 6.2.3: Implement checkCircularReference(devoteeId, newReportingId) → boolean
  - Traverse reporting chain
  - Detect circular references
  - Return true if circular, false otherwise

#### Task 6.3: Role Management Service - Subordinate Transfer
**Status**: NOT_STARTED  
**Prerequisites**: Task 6.2
- [ ] 6.3.1: Implement validateSubordinateTransfer(TransferRequest) → ValidationResult
  - Check all subordinates belong to fromDevotee
  - Validate toDevotee is eligible supervisor
  - Check no circular references
  - For DISTRICT_SUPERVISOR: validate same district
- [ ] 6.3.2: Implement transferSubordinates(TransferRequest, userId) → TransferResult
  - Validate transfer
  - Update reportingToDevoteeId for each subordinate
  - Create RoleChangeHistory records
  - Return transfer count and updated subordinates

#### Task 6.4: Role Management Service - Promotions/Demotions
**Status**: NOT_STARTED  
**Prerequisites**: Task 6.3
- [ ] 6.4.1: Implement promoteDevotee(PromoteRequest, userId) → RoleChangeResult
  - Validate hierarchy rules allow promotion
  - Check no circular reference
  - Transfer subordinates if role manages different level
  - Update devotee role and reportingTo
  - Create RoleChangeHistory with reason
- [ ] 6.4.2: Implement demoteDevotee(DemoteRequest, userId) → RoleChangeResult
  - Validate demotion is allowed
  - Handle subordinate transfers
  - Update role
  - Create history record
- [ ] 6.4.3: Implement removeRole(devoteeId, reason, userId) → RoleChangeResult
  - Transfer all subordinates to new supervisor
  - Set role fields to null
  - Create history with reason

#### Task 6.5: Role Management Service - Queries
**Status**: NOT_STARTED  
**Prerequisites**: Task 6.4
- [ ] 6.5.1: Implement getAvailableSupervisors(districtCode, targetRole, excludeIds) → List<DevoteeDTO>
  - Find devotees in district with appropriate role
  - Exclude specified IDs
- [ ] 6.5.2: Implement getDirectSubordinates(Long devoteeId) → List<DevoteeDTO>
- [ ] 6.5.3: Implement getAllSubordinates(Long devoteeId) → List<DevoteeDTO>
  - Recursive query to get entire subordinate chain
- [ ] 6.5.4: Implement getRoleHistory(devoteeId, page) → Page<RoleChangeHistoryDTO>

---

### **PHASE 7: SERVICE LAYER - SUPPORTING SERVICES**
**Status**: NOT_STARTED  
**Duration**: 2-3 days  
**Prerequisites**: Phase 6 completed

#### Task 7.1: Dashboard and Report Services
**Status**: NOT_STARTED  
**Prerequisites**: Task 6.5
- [ ] 7.1.1: Create DashboardService with @Service annotation
- [ ] 7.1.2: Implement getDashboardSummary() → DashboardDTO
  - Get total devotees, namhattas
  - Get recent updates
- [ ] 7.1.3: Implement getStatusDistribution() → List<StatusDistributionDTO>
- [ ] 7.1.4: Create ReportService with @Service annotation
- [ ] 7.1.5: Implement getHierarchicalReports(allowedDistricts) → HierarchicalReportDTO
- [ ] 7.1.6: Implement getAllStates(allowedDistricts) → List<StateReportDTO>
- [ ] 7.1.7: Implement getDistrictsByState(state, allowedDistricts) → List<DistrictReportDTO>
- [ ] 7.1.8: Implement getSubDistrictsByDistrict(...) → List<SubDistrictReportDTO>
- [ ] 7.1.9: Implement getVillagesBySubDistrict(...) → List<VillageReportDTO>

#### Task 7.2: Simple CRUD Services
**Status**: NOT_STARTED  
**Prerequisites**: Task 7.1
- [ ] 7.2.1: Create DevotionalStatusService with CRUD operations
- [ ] 7.2.2: Create GurudevService with CRUD operations
- [ ] 7.2.3: Create ShraddhakutirService with CRUD + district filter
- [ ] 7.2.4: Create NamhattaUpdateService with create, getAll, getByNamhatta methods
- [ ] 7.2.5: Create HierarchyService with getTopLevel and getByLevel methods

#### Task 7.3: Validation Utilities
**Status**: NOT_STARTED  
**Prerequisites**: Task 7.2
- [ ] 7.3.1: Create ValidationUtils utility class
- [ ] 7.3.2: Implement validateEmail(String email) method
- [ ] 7.3.3: Implement validatePhone(String phone) method
- [ ] 7.3.4: Implement validatePassword(String password) with complexity rules
- [ ] 7.3.5: Implement validateUsername(String username) - alphanumeric + underscore
- [ ] 7.3.6: Implement sanitizeInput(String input) - HTML escape

---

### **PHASE 8: CONTROLLER LAYER**
**Status**: NOT_STARTED  
**Duration**: 4-5 days  
**Prerequisites**: Phase 7 completed

#### Task 8.1: DTOs and Request/Response Objects
**Status**: NOT_STARTED  
**Prerequisites**: Task 7.3
- [ ] 8.1.1: Create request DTOs for all POST/PUT endpoints
- [ ] 8.1.2: Create response DTOs for all endpoints
- [ ] 8.1.3: Add @Valid annotations for validation
- [ ] 8.1.4: Add JSR-303 constraints (@NotNull, @NotBlank, @Email, @Size, @Pattern)
- [ ] 8.1.5: Create custom validators for password, username, leadership role
- [ ] 8.1.6: Setup ModelMapper or MapStruct for entity-DTO conversion

#### Task 8.2: Authentication Controller
**Status**: NOT_STARTED  
**Prerequisites**: Task 8.1
- [ ] 8.2.1: Create AuthController with @RestController and @RequestMapping("/api/auth")
- [ ] 8.2.2: Implement POST /login endpoint
  - Accept LoginRequest
  - Call AuthenticationService.login()
  - Set JWT in HTTP-only cookie
  - Return user info
- [ ] 8.2.3: Implement POST /logout endpoint
  - Extract token from cookie
  - Call AuthenticationService.logout()
  - Clear cookie
- [ ] 8.2.4: Implement GET /verify endpoint
  - Extract token from cookie
  - Call AuthenticationService.verifyToken()
  - Return user info
- [ ] 8.2.5: Implement GET /user-districts endpoint
  - Get authenticated user from SecurityContext
  - Return user's districts

#### Task 8.3: System and Geography Controllers
**Status**: NOT_STARTED  
**Prerequisites**: Task 8.2
- [ ] 8.3.1: Create SystemController with @RestController
- [ ] 8.3.2: Implement GET /api/health endpoint (no auth required)
- [ ] 8.3.3: Implement GET /api/about endpoint (no auth required)
- [ ] 8.3.4: Create GeographyController with @RestController and @RequestMapping("/api")
- [ ] 8.3.5: Implement GET /countries endpoint
- [ ] 8.3.6: Implement GET /states endpoint with country query param
- [ ] 8.3.7: Implement GET /districts endpoint with state query param
- [ ] 8.3.8: Implement GET /sub-districts endpoint
- [ ] 8.3.9: Implement GET /villages endpoint
- [ ] 8.3.10: Implement GET /pincodes endpoint
- [ ] 8.3.11: Implement GET /pincodes/search endpoint with pagination
- [ ] 8.3.12: Implement GET /address-by-pincode endpoint

#### Task 8.4: Devotee Controller
**Status**: NOT_STARTED  
**Prerequisites**: Task 8.3
- [ ] 8.4.1: Create DevoteeController with @RestController and @RequestMapping("/api/devotees")
- [ ] 8.4.2: Implement GET / endpoint - list with pagination, filtering, district access
- [ ] 8.4.3: Implement GET /:id endpoint - get single devotee
- [ ] 8.4.4: Implement POST / endpoint - create devotee (ADMIN, OFFICE only)
- [ ] 8.4.5: Implement POST /:namhattaId endpoint - create devotee for namhatta
- [ ] 8.4.6: Implement PUT /:id endpoint - update devotee (with district check)
- [ ] 8.4.7: Implement POST /:id/upgrade-status endpoint
- [ ] 8.4.8: Implement POST /:id/assign-leadership endpoint
- [ ] 8.4.9: Implement DELETE /:id/leadership endpoint
- [ ] 8.4.10: Implement POST /:id/link-user endpoint (ADMIN only)
- [ ] 8.4.11: Implement GET /available-officers endpoint

#### Task 8.5: Namhatta Controller
**Status**: NOT_STARTED  
**Prerequisites**: Task 8.4
- [ ] 8.5.1: Create NamhattaController with @RestController and @RequestMapping("/api/namhattas")
- [ ] 8.5.2: Implement GET / endpoint - list with pagination and filtering
- [ ] 8.5.3: Implement GET /:id endpoint - get single namhatta
- [ ] 8.5.4: Implement POST / endpoint - create namhatta
- [ ] 8.5.5: Implement PUT /:id endpoint - update namhatta
- [ ] 8.5.6: Implement GET /check-registration/:registrationNo endpoint
- [ ] 8.5.7: Implement POST /:id/approve endpoint
- [ ] 8.5.8: Implement POST /:id/reject endpoint
- [ ] 8.5.9: Implement GET /:id/devotees endpoint
- [ ] 8.5.10: Implement GET /:id/updates endpoint
- [ ] 8.5.11: Implement GET /:id/devotee-status-count endpoint
- [ ] 8.5.12: Implement GET /:id/status-history endpoint

#### Task 8.6: District Supervisor Controller
**Status**: NOT_STARTED  
**Prerequisites**: Task 8.5
- [ ] 8.6.1: Create DistrictSupervisorController with @RestController
- [ ] 8.6.2: Implement GET /api/district-supervisors/all endpoint
- [ ] 8.6.3: Implement GET /api/district-supervisors endpoint with district filter
- [ ] 8.6.4: Implement GET /api/user/address-defaults endpoint

#### Task 8.7: Dashboard and Reports Controller
**Status**: NOT_STARTED  
**Prerequisites**: Task 8.6
- [ ] 8.7.1: Create DashboardController with @RestController
- [ ] 8.7.2: Implement GET /api/dashboard endpoint
- [ ] 8.7.3: Implement GET /api/status-distribution endpoint
- [ ] 8.7.4: Create ReportController with @RestController
- [ ] 8.7.5: Implement GET /api/reports/hierarchical endpoint with district filtering
- [ ] 8.7.6: Implement GET /api/reports/states endpoint
- [ ] 8.7.7: Implement GET /api/reports/districts/:state endpoint
- [ ] 8.7.8: Implement GET /api/reports/sub-districts/:state/:district endpoint
- [ ] 8.7.9: Implement GET /api/reports/villages/:state/:district/:subdistrict endpoint
- [ ] 8.7.10: Add Cache-Control headers (no-cache) to all report endpoints

#### Task 8.8: Simple Entity Controllers
**Status**: NOT_STARTED  
**Prerequisites**: Task 8.7
- [ ] 8.8.1: Create DevotionalStatusController with GET /, POST /, POST /:id/rename
- [ ] 8.8.2: Create GurudevController with GET / and POST /
- [ ] 8.8.3: Create ShraddhakutirController with GET / and POST /
- [ ] 8.8.4: Create NamhattaUpdateController with POST / and GET /all
- [ ] 8.8.5: Create HierarchyController with GET / and GET /:level

#### Task 8.9: Admin User Management Controller
**Status**: NOT_STARTED  
**Prerequisites**: Task 8.8
- [ ] 8.9.1: Create AdminController with @RestController and @RequestMapping("/api/admin")
- [ ] 8.9.2: Implement POST /register-supervisor endpoint (ADMIN only)
- [ ] 8.9.3: Implement GET /users endpoint (ADMIN only)
- [ ] 8.9.4: Implement GET /available-districts endpoint (ADMIN only)
- [ ] 8.9.5: Implement PUT /users/:id endpoint (ADMIN only)
- [ ] 8.9.6: Implement DELETE /users/:id endpoint (ADMIN only) - soft delete

#### Task 8.10: Senapoti Role Management Controller
**Status**: NOT_STARTED  
**Prerequisites**: Task 8.9
- [ ] 8.10.1: Create SenapotiRoleController with @RestController and @RequestMapping("/api/senapoti")
- [ ] 8.10.2: Implement POST /transfer-subordinates endpoint
- [ ] 8.10.3: Implement POST /promote endpoint
- [ ] 8.10.4: Implement POST /demote endpoint
- [ ] 8.10.5: Implement POST /remove-role endpoint
- [ ] 8.10.6: Implement GET /available-supervisors/:districtCode/:targetRole endpoint
- [ ] 8.10.7: Implement GET /subordinates/:devoteeId endpoint
- [ ] 8.10.8: Implement GET /role-history/:devoteeId endpoint
- [ ] 8.10.9: Implement GET /subordinates/:devoteeId/all endpoint (recursive)

---

### **PHASE 9: CROSS-CUTTING CONCERNS**
**Status**: NOT_STARTED  
**Duration**: 2-3 days  
**Prerequisites**: Phase 8 completed

#### Task 9.1: Rate Limiting
**Status**: NOT_STARTED  
**Prerequisites**: Task 8.10
- [ ] 9.1.1: Create RateLimitingFilter component
- [ ] 9.1.2: Implement in-memory request tracking by IP (or Redis for distributed)
- [ ] 9.1.3: Configure login endpoint: 5 requests per 15 minutes
- [ ] 9.1.4: Configure modification endpoints: 10 requests per 1 minute
- [ ] 9.1.5: Configure general API: 100 requests per 15 minutes
- [ ] 9.1.6: Return 429 Too Many Requests with Retry-After header
- [ ] 9.1.7: Add @RateLimit annotation for easy application

#### Task 9.2: CORS Configuration
**Status**: NOT_STARTED  
**Prerequisites**: Task 9.1
- [ ] 9.2.1: Create CorsConfig class with @Configuration
- [ ] 9.2.2: Create CorsConfigurationSource bean
- [ ] 9.2.3: For development: allow all origins
- [ ] 9.2.4: For production: whitelist specific domains from environment variable
- [ ] 9.2.5: Allow credentials: true (for cookies)
- [ ] 9.2.6: Configure allowed methods: GET, POST, PUT, DELETE, PATCH
- [ ] 9.2.7: Configure allowed headers: Content-Type, Authorization, etc.

#### Task 9.3: Global Exception Handler
**Status**: NOT_STARTED  
**Prerequisites**: Task 9.2
- [ ] 9.3.1: Create GlobalExceptionHandler with @ControllerAdvice
- [ ] 9.3.2: Handle ValidationException → 400 Bad Request
- [ ] 9.3.3: Handle UnauthorizedException → 401 Unauthorized
- [ ] 9.3.4: Handle ForbiddenException → 403 Forbidden
- [ ] 9.3.5: Handle NotFoundException → 404 Not Found
- [ ] 9.3.6: Handle ConflictException → 409 Conflict
- [ ] 9.3.7: Handle generic Exception → 500 Internal Server Error
- [ ] 9.3.8: Sanitize error messages (don't expose internal details)
- [ ] 9.3.9: Log full stack trace server-side only

#### Task 9.4: Request Logging
**Status**: NOT_STARTED  
**Prerequisites**: Task 9.3
- [ ] 9.4.1: Create RequestLoggingFilter component
- [ ] 9.4.2: Log method, URL, status code, duration for each request
- [ ] 9.4.3: Log user ID if authenticated
- [ ] 9.4.4: Sanitize sensitive data (passwords, tokens) from logs
- [ ] 9.4.5: Configure logback.xml with appropriate log levels and patterns
- [ ] 9.4.6: Setup log rotation and retention

#### Task 9.5: Input Sanitization
**Status**: NOT_STARTED  
**Prerequisites**: Task 9.4
- [ ] 9.5.1: Create InputSanitizationFilter for POST/PUT/PATCH requests
- [ ] 9.5.2: Trim all string inputs
- [ ] 9.5.3: HTML-escape special characters
- [ ] 9.5.4: Handle nested objects and arrays recursively
- [ ] 9.5.5: Apply before validation

---

### **PHASE 10: TESTING**
**Status**: NOT_STARTED  
**Duration**: 3-4 days  
**Prerequisites**: Phase 9 completed

#### Task 10.1: Unit Tests - Services
**Status**: NOT_STARTED  
**Prerequisites**: Task 9.5
- [ ] 10.1.1: Write tests for AuthenticationService (login, logout, verify)
- [ ] 10.1.2: Write tests for UserService (CRUD, district assignment)
- [ ] 10.1.3: Write tests for DevoteeService (CRUD, status upgrade, leadership)
- [ ] 10.1.4: Write tests for NamhattaService (CRUD, approval workflow)
- [ ] 10.1.5: Write tests for RoleManagementService (promotion, demotion, transfers)
- [ ] 10.1.6: Write tests for AddressService (find-or-create logic)
- [ ] 10.1.7: Use @MockBean for repositories in service tests

#### Task 10.2: Integration Tests - Controllers
**Status**: NOT_STARTED  
**Prerequisites**: Task 10.1
- [ ] 10.2.1: Write integration tests for authentication flow (login → verify → logout)
- [ ] 10.2.2: Write integration tests for devotee CRUD with district filtering
- [ ] 10.2.3: Write integration tests for namhatta approval workflow
- [ ] 10.2.4: Write integration tests for role management operations
- [ ] 10.2.5: Write integration tests for report generation
- [ ] 10.2.6: Use @SpringBootTest and @AutoConfigureMockMvc
- [ ] 10.2.7: Use test database (H2 or test PostgreSQL)

#### Task 10.3: Security Tests
**Status**: NOT_STARTED  
**Prerequisites**: Task 10.2
- [ ] 10.3.1: Test JWT generation and validation
- [ ] 10.3.2: Test password hashing and verification
- [ ] 10.3.3: Test session single-login enforcement
- [ ] 10.3.4: Test token blacklisting
- [ ] 10.3.5: Test role-based access control (@PreAuthorize)
- [ ] 10.3.6: Test district access filtering for DISTRICT_SUPERVISOR
- [ ] 10.3.7: Test unauthorized access returns 401/403

#### Task 10.4: Repository Tests
**Status**: NOT_STARTED  
**Prerequisites**: Task 10.3
- [ ] 10.4.1: Test custom query methods in repositories
- [ ] 10.4.2: Test pagination functionality
- [ ] 10.4.3: Test complex filters and joins
- [ ] 10.4.4: Test cascading operations
- [ ] 10.4.5: Use @DataJpaTest for repository layer tests

---

### **PHASE 11: DEPLOYMENT PREPARATION**
**Status**: NOT_STARTED  
**Duration**: 2-3 days  
**Prerequisites**: Phase 10 completed

#### Task 11.1: Configuration Externalization
**Status**: NOT_STARTED  
**Prerequisites**: Task 10.4
- [ ] 11.1.1: Move all secrets to environment variables (DATABASE_URL, JWT_SECRET, SESSION_SECRET)
- [ ] 11.1.2: Create comprehensive application-prod.properties
- [ ] 11.1.3: Setup Spring Profiles for environment switching
- [ ] 11.1.4: Document all required environment variables
- [ ] 11.1.5: Create .env.example file

#### Task 11.2: Database Migration Setup
**Status**: NOT_STARTED  
**Prerequisites**: Task 11.1
- [ ] 11.2.1: Choose migration tool (Flyway or Liquibase)
- [ ] 11.2.2: Create initial schema migration script (V1__initial_schema.sql)
- [ ] 11.2.3: Create seed data migration (V2__seed_data.sql)
  - Insert devotional statuses
  - Insert gurudevs
  - Insert leaders
  - Create admin user
- [ ] 11.2.4: Test migration on fresh database
- [ ] 11.2.5: Test rollback capability

#### Task 11.3: Scheduled Jobs Configuration
**Status**: NOT_STARTED  
**Prerequisites**: Task 11.2
- [ ] 11.3.1: Enable @EnableScheduling in main application class
- [ ] 11.3.2: Configure JWT blacklist cleanup job (daily at 2 AM)
- [ ] 11.3.3: Configure session cleanup job (hourly)
- [ ] 11.3.4: Ensure jobs are idempotent (safe on multiple instances)
- [ ] 11.3.5: Add logging for scheduled job execution

#### Task 11.4: Health Checks and Metrics
**Status**: NOT_STARTED  
**Prerequisites**: Task 11.3
- [ ] 11.4.1: Add Spring Actuator dependency
- [ ] 11.4.2: Configure /actuator/health endpoint
- [ ] 11.4.3: Create custom health indicator for database connectivity
- [ ] 11.4.4: Add custom metrics: login attempts, active sessions, API requests
- [ ] 11.4.5: Add custom metrics: role management operations
- [ ] 11.4.6: Configure metrics export (Prometheus/Micrometer)

#### Task 11.5: Docker Configuration
**Status**: NOT_STARTED  
**Prerequisites**: Task 11.4
- [ ] 11.5.1: Create Dockerfile with multi-stage build
  - Stage 1: Maven build
  - Stage 2: JRE runtime with JAR
- [ ] 11.5.2: Expose port 8080
- [ ] 11.5.3: Create docker-compose.yml for local testing
  - App container
  - PostgreSQL container
  - Environment variables
- [ ] 11.5.4: Create .dockerignore file
- [ ] 11.5.5: Test Docker build and run

#### Task 11.6: Documentation
**Status**: NOT_STARTED  
**Prerequisites**: Task 11.5
- [ ] 11.6.1: Create deployment guide (DEPLOYMENT.md)
  - Environment setup
  - Database setup
  - Migration steps
  - Running the application
- [ ] 11.6.2: Document all environment variables
- [ ] 11.6.3: Create API documentation (Swagger/OpenAPI)
- [ ] 11.6.4: Update README with setup instructions
- [ ] 11.6.5: Document known issues and troubleshooting

---

### **PHASE 12: FINAL VERIFICATION & DEPLOYMENT**
**Status**: NOT_STARTED  
**Duration**: 1-2 days  
**Prerequisites**: Phase 11 completed

#### Task 12.1: End-to-End Testing
**Status**: NOT_STARTED  
**Prerequisites**: Task 11.6
- [ ] 12.1.1: Test complete authentication flow
- [ ] 12.1.2: Test devotee management with all roles
- [ ] 12.1.3: Test namhatta creation and approval
- [ ] 12.1.4: Test role management (promotions, demotions, transfers)
- [ ] 12.1.5: Test district-based access control
- [ ] 12.1.6: Test all reports generation
- [ ] 12.1.7: Verify all APIs work as documented

#### Task 12.2: Performance Testing
**Status**: NOT_STARTED  
**Prerequisites**: Task 12.1
- [ ] 12.2.1: Test with sample dataset (1000+ devotees, 100+ namhattas)
- [ ] 12.2.2: Verify pagination performance
- [ ] 12.2.3: Verify complex query performance (reports)
- [ ] 12.2.4: Test concurrent user sessions
- [ ] 12.2.5: Verify rate limiting works correctly

#### Task 12.3: Security Audit
**Status**: NOT_STARTED  
**Prerequisites**: Task 12.2
- [ ] 12.3.1: Verify all sensitive endpoints require authentication
- [ ] 12.3.2: Verify role-based access control is enforced
- [ ] 12.3.3: Verify district access filtering works correctly
- [ ] 12.3.4: Check for SQL injection vulnerabilities
- [ ] 12.3.5: Check for XSS vulnerabilities
- [ ] 12.3.6: Verify secrets are not exposed in logs or responses
- [ ] 12.3.7: Verify CORS configuration is secure

#### Task 12.4: Production Deployment
**Status**: NOT_STARTED  
**Prerequisites**: Task 12.3
- [ ] 12.4.1: Setup production database (PostgreSQL)
- [ ] 12.4.2: Run database migrations
- [ ] 12.4.3: Configure environment variables
- [ ] 12.4.4: Deploy application to production server
- [ ] 12.4.5: Verify application starts successfully
- [ ] 12.4.6: Test critical flows in production
- [ ] 12.4.7: Setup monitoring and alerting

---

## Implementation Progress Tracking

### Overall Progress
- **Total Phases**: 12
- **Completed Phases**: 0
- **In Progress Phases**: 0
- **Total Tasks**: 140+
- **Completed Tasks**: 0

### Phase Status Summary

| Phase | Name | Status | Tasks | Completed |
|-------|------|--------|-------|-----------|
| 1 | Project Setup & Configuration | NOT_STARTED | 12 | 0 |
| 2 | Data Model & Entities | NOT_STARTED | 30 | 0 |
| 3 | Repository Layer | NOT_STARTED | 20 | 0 |
| 4 | Security Implementation | NOT_STARTED | 25 | 0 |
| 5 | Service Layer - Core | NOT_STARTED | 35 | 0 |
| 6 | Service Layer - Role Management | NOT_STARTED | 15 | 0 |
| 7 | Service Layer - Supporting | NOT_STARTED | 12 | 0 |
| 8 | Controller Layer | NOT_STARTED | 45 | 0 |
| 9 | Cross-Cutting Concerns | NOT_STARTED | 15 | 0 |
| 10 | Testing | NOT_STARTED | 16 | 0 |
| 11 | Deployment Preparation | NOT_STARTED | 20 | 0 |
| 12 | Final Verification | NOT_STARTED | 12 | 0 |

### Critical Path
1. Phase 1 → Phase 2 → Phase 3 → Phase 4 (Security is critical)
2. Phase 4 → Phase 5 → Phase 6 → Phase 7 (Services build on security)
3. Phase 7 → Phase 8 (Controllers need services)
4. Phase 8 → Phase 9 → Phase 10 (Testing needs implementation)
5. Phase 10 → Phase 11 → Phase 12 (Deployment needs tested code)

### Agent Instructions
1. Start with Phase 1, Task 1.1
2. Complete each subtask in order
3. Update task status when starting (IN_PROGRESS) and completing (COMPLETED)
4. Do not proceed to next phase until all tasks in current phase are COMPLETED
5. Run tests after each major component
6. Commit code after each completed task
7. Document any deviations or issues encountered

---
## 7. Assumptions / Clarifications

### 7.1 Ambiguities Requiring Stakeholder Input

#### 7.1.1 Data Model Clarifications
- **Leader vs Devotee Hierarchy**:
  - Current system has separate `leaders` table for GBC/Regional Directors
  - Is this separate from devotee hierarchy, or should be unified?
  - Recommend: Keep separate for organizational vs operational hierarchy

- **Namhatta Officer Positions**:
  - Can a devotee hold multiple officer positions in same Namhatta?
  - Can a devotee be officer in multiple Namhattas?
  - Current assumption: Same devotee cannot hold multiple positions in one Namhatta, but can in different Namhattas

- **Address Normalization**:
  - Should identical addresses with different landmarks be separate or linked?
  - Current approach: Separate address for each unique combination (including nulls), landmark stored in junction table

#### 7.1.2 Business Rules Requiring Confirmation

- **Devotee Deletion**:
  - Hard delete or soft delete?
  - What happens to linked Namhatta positions?
  - Recommendation: Soft delete (isActive flag), prevent if holding active position

- **Status Progression**:
  - Is there a fixed progression path for devotional statuses?
  - Can devotees skip levels?
  - Can devotees regress?
  - Current assumption: Flexible progression, any status can upgrade to any other

- **Role Removal Without Replacement**:
  - If removing a role, is specifying replacement supervisor mandatory?
  - Current assumption: Yes, all subordinates must be reassigned before removal

- **District Boundary Crossing**:
  - Can a devotee be transferred between districts?
  - Does this require special permission?
  - Current assumption: Not explicitly prevented, but role changes stay within district for DISTRICT_SUPERVISOR

#### 7.1.3 Security & Authorization

- **Public Endpoints**:
  - Geography APIs currently public - should they require authentication?
  - Map data APIs public - security concern for exposing counts?
  - Recommendation: Keep geography public, require auth for maps

- **Status & Gurudev Management**:
  - Who can create/edit devotional statuses?
  - Who can add Gurudevs?
  - Current implementation: No auth check (needs restriction to ADMIN)

- **Updates Creation**:
  - Who can create Namhatta updates?
  - Should updates be editable/deletable?
  - Current: No auth required (needs fixing)

#### 7.1.4 Performance & Scale

- **Expected Load**:
  - Number of concurrent users?
  - Total devotees/Namhattas expected?
  - Current pagination: 10 items default, 100 max - sufficient?

- **Report Caching**:
  - Hierarchical reports set to no-cache - is real-time data required?
  - Can we cache for 5-15 minutes to improve performance?

#### 7.1.5 Missing Functionality

- **User Profile Management**:
  - Can users update their own profile?
  - Password reset/forgot password flow?
  - Email verification?

- **Audit Trail**:
  - RoleChangeHistory exists, but what about:
    - Devotee edit history?
    - Namhatta approval history?
    - User action logs?

- **Notifications**:
  - Email notifications on approval/rejection?
  - Alerts for role changes?
  - System notifications?

- **File Upload**:
  - NamhattaUpdate has imageUrls - where are images stored?
  - Size limits?
  - Allowed formats?

#### 7.1.6 Data Migration

- **Existing Data**:
  - Is there existing data to migrate from another system?
  - If yes, what format (CSV, SQL dump, API)?
  - Data cleaning/validation requirements?

- **Seed Data**:
  - Should system come pre-populated with:
    - Devotional statuses?
    - Gurudevs?
    - Leaders?
    - Admin user?

### 7.2 Recommended Enhancements (Out of Scope for Initial Implementation)

1. **Two-Factor Authentication (2FA)** for admin users
2. **Password Reset Flow** via email
3. **Email Verification** on user registration
4. **Comprehensive Audit Logging** for all data changes
5. **File Upload Service** for Namhatta update images
6. **Notification System** (email/SMS) for key events
7. **Advanced Search** with full-text search on devotee names
8. **Export Functionality** (CSV/Excel) for reports
9. **Batch Operations** (bulk upload, bulk update)
10. **Mobile App APIs** (additional endpoints optimized for mobile)
11. **WebSocket Support** for real-time updates
12. **Advanced Analytics** dashboard with charts

---

## Document End

**Next Steps**:
1. Review this specification with stakeholders
2. Clarify ambiguities listed in Section 7
3. Prioritize enhancements for future phases
4. Begin Spring Boot implementation following task breakdown in Section 6
5. Establish continuous integration/deployment pipeline
6. Plan user acceptance testing (UAT) phase

**Implementation Timeline**:
- Week 1-2: Setup + Data Layer
- Week 2-3: Security Layer
- Week 3-4: Service Layer
- Week 4-5: Controller Layer
- Week 5: Cross-cutting Concerns
- Week 6: Testing
- Week 7: Deployment Prep

**Total Estimated Duration**: 7 weeks (full-time development)

**Success Criteria**:
- All APIs functional and tested
- Security measures in place (JWT, RBAC, rate limiting)
- District-based access control working
- Role management system operational
- Data integrity maintained
- Performance targets met
- Production-ready deployment
