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

## 6. Task Breakdown (Spring Boot Implementation Plan)

### 6.1 Setup & Foundations (Week 1)

#### 6.1.1 Project Setup
- [ ] Create Spring Boot project with Maven/Gradle
- [ ] Configure dependencies:
  - Spring Web
  - Spring Data JPA
  - Spring Security
  - PostgreSQL driver
  - Lombok
  - Validation API
  - Jackson for JSON
- [ ] Setup project structure (packages: config, controller, service, repository, model, dto, security, exception)
- [ ] Configure application.properties for dev/prod profiles
- [ ] Setup logging (SLF4J + Logback)

#### 6.1.2 Database Configuration
- [ ] Configure PostgreSQL datasource
- [ ] Setup JPA properties (hibernate, dialect, ddl-auto: validate)
- [ ] Configure connection pooling (HikariCP)
- [ ] Test database connectivity

#### 6.1.3 Define Core Data Models
- [ ] Create base entity class with common fields (id, createdAt, updatedAt)
- [ ] Define enums: UserRole, LeadershipRole, Gender, MaritalStatus, NamhattaStatus, AddressType
- [ ] Map entities (see section 3.1 for all entities)

### 6.2 Data Layer (Week 1-2)

#### 6.2.1 Create JPA Entities
- [ ] User entity with relationships
- [ ] UserDistrict entity
- [ ] UserSession entity
- [ ] JwtBlacklist entity
- [ ] Devotee entity with self-referencing hierarchy
- [ ] Address entity
- [ ] DevoteeAddress entity
- [ ] NamhattaAddress entity
- [ ] Namhatta entity with multiple FK relationships
- [ ] DevotionalStatus entity
- [ ] StatusHistory entity
- [ ] Gurudev entity
- [ ] Shraddhakutir entity
- [ ] NamhattaUpdate entity
- [ ] Leader entity
- [ ] RoleChangeHistory entity

#### 6.2.2 Create Repositories
- [ ] UserRepository extends JpaRepository
  - findByUsername(String username)
  - findByEmail(String email)
- [ ] UserDistrictRepository
  - findByUserId(Long userId)
  - findByDistrictCode(String districtCode)
- [ ] UserSessionRepository
  - findByUserId(Long userId)
  - deleteByUserId(Long userId)
- [ ] JwtBlacklistRepository
  - findByTokenHash(String hash)
  - deleteByExpiredAtBefore(LocalDateTime dateTime)
- [ ] DevoteeRepository
  - Custom query methods for filtering, pagination
  - findByNamhattaId(Long namhattaId)
  - findByReportingToDevoteeId(Long id)
- [ ] NamhattaRepository
  - findByCode(String code)
  - findByRegistrationNo(String regNo)
  - Custom query for filtering
- [ ] AddressRepository
  - Custom findByExactMatch method
- [ ] Other repositories for remaining entities

#### 6.2.3 Database Indexes
- [ ] Create indexes on User (username, email)
- [ ] Create indexes on Devotee (legalName, email, namhattaId, leadershipRole, reportingToDevoteeId)
- [ ] Create indexes on Namhatta (code, registrationNo, districtSupervisorId, status)
- [ ] Create indexes on Address (country, stateNameEnglish, districtNameEnglish, pincode)
- [ ] Create indexes on JwtBlacklist (tokenHash, expiredAt)

### 6.3 Security Layer (Week 2)

#### 6.3.1 JWT Implementation
- [ ] Create JwtTokenProvider class
  - generateToken(UserDetails) method
  - validateToken(String token) method
  - getUserIdFromToken(String token) method
  - extractClaims(String token) method
- [ ] Create TokenBlacklistService
  - blacklistToken(String token) method
  - isTokenBlacklisted(String token) method
  - cleanupExpiredTokens() scheduled task

#### 6.3.2 Password Management
- [ ] Create PasswordService using BCryptPasswordEncoder
- [ ] Define password validation regex (10+ chars, uppercase, lowercase, number, special char)
- [ ] hashPassword(String plainPassword) method
- [ ] verifyPassword(String plain, String hashed) method

#### 6.3.3 Session Management
- [ ] Create SessionService
  - createSession(Long userId) - delete old session, create new
  - validateSession(Long userId, String sessionToken)
  - removeSession(Long userId)
  - cleanupExpiredSessions() scheduled task

#### 6.3.4 Spring Security Configuration
- [ ] Configure SecurityFilterChain
  - Permit public endpoints (login, health, about, geography)
  - Require authentication for protected endpoints
  - Disable CSRF (using JWT)
  - Stateless session management
- [ ] Create JwtAuthenticationFilter extends OncePerRequestFilter
  - Extract JWT from cookie
  - Validate JWT
  - Check blacklist
  - Validate session
  - Set SecurityContext
- [ ] Create CustomUserDetailsService implements UserDetailsService
  - loadUserByUsername method
  - Fetch user with districts

#### 6.3.5 Authorization Configuration
- [ ] Create @PreAuthorize annotations for role checks
- [ ] Create DistrictAccessValidator component
  - validateDevoteeAccess(Long devoteeId, List<String> userDistricts)
  - filterByDistricts(List<String> districts) for queries
- [ ] Create @DistrictAccess custom annotation for automatic filtering

### 6.4 Service Layer (Week 3-4)

#### 6.4.1 Core Services

**AuthenticationService**:
- [ ] login(String username, String password) → LoginResponse
  - Validate credentials
  - Create session
  - Generate JWT
  - Return user info
- [ ] logout(String token)
  - Blacklist token
  - Remove session
- [ ] verifyToken(String token) → UserInfo
  - Validate JWT
  - Check blacklist
  - Validate session
  - Return current user

**UserService**:
- [ ] getAllUsers() → List<UserDTO>
- [ ] createDistrictSupervisor(RegisterSupervisorRequest) → UserDTO
- [ ] updateUser(Long id, UpdateUserRequest) → UserDTO
- [ ] deactivateUser(Long id)
- [ ] getUserDistricts(Long userId) → List<DistrictDTO>
- [ ] getAvailableDistricts() → List<DistrictDTO>

**DevoteeService**:
- [ ] getDevotees(PageRequest, DevoteeFilter) → Page<DevoteeDTO>
- [ ] getDevotee(Long id) → DevoteeDTO
- [ ] createDevotee(CreateDevoteeRequest) → DevoteeDTO
  - Handle address normalization
  - Create address links
- [ ] updateDevotee(Long id, UpdateDevoteeRequest) → DevoteeDTO
  - Check district access for DISTRICT_SUPERVISOR
- [ ] upgradeDevoteeStatus(Long id, Long newStatusId, String notes)
- [ ] assignLeadership(Long id, LeadershipRequest)
- [ ] removeLeadership(Long id)
- [ ] linkUserToDevotee(Long devoteeId, CreateUserRequest) → UserDTO
- [ ] getAvailableOfficers() → List<DevoteeDTO>

**NamhattaService**:
- [ ] getNamhattas(PageRequest, NamhattaFilter) → Page<NamhattaDTO>
- [ ] getNamhatta(Long id) → NamhattaDTO
- [ ] createNamhatta(CreateNamhattaRequest) → NamhattaDTO
  - Validate unique code
  - Handle address normalization
  - Link officers/senapotis
- [ ] updateNamhatta(Long id, UpdateNamhattaRequest) → NamhattaDTO
- [ ] checkRegistrationNo(String regNo) → boolean
- [ ] approveNamhatta(Long id, ApproveRequest)
  - Check unique registrationNo
  - Update status
- [ ] rejectNamhatta(Long id, String reason)
- [ ] getDevoteesByNamhatta(Long id, PageRequest, Long statusId) → Page<DevoteeDTO>
- [ ] getNamhattaUpdates(Long id) → List<NamhattaUpdateDTO>
- [ ] getDevoteeStatusCount(Long id) → Map<String, Integer>
- [ ] getStatusHistory(Long id, PageRequest) → Page<StatusHistoryDTO>

**AddressService**:
- [ ] findOrCreateAddress(AddressData) → Long
  - Exact match logic (including nulls)
  - Create if not exists
- [ ] linkDevoteeAddress(Long devoteeId, Long addressId, AddressType type, String landmark)
- [ ] linkNamhattaAddress(Long namhattaId, Long addressId, String landmark)
- [ ] getCountries() → List<String>
- [ ] getStates(String country) → List<String>
- [ ] getDistricts(String state) → List<String>
- [ ] getSubDistricts(String district, String pincode) → List<String>
- [ ] getVillages(String subDistrict, String pincode) → List<String>
- [ ] getPincodes(String village, String district, String subDistrict) → List<String>
- [ ] searchPincodes(String country, String search, int page, int limit) → PincodeSearchResult
- [ ] getAddressByPincode(String pincode) → AddressInfo

**RoleManagementService**:
- [ ] transferSubordinates(TransferRequest, Long userId) → TransferResult
  - Validate transfer (circular ref, subordinates belong to from)
  - Update reporting for each subordinate
  - Create history records
- [ ] promoteDevotee(PromoteRequest, Long userId) → RoleChangeResult
  - Validate hierarchy rules
  - Transfer subordinates if needed
  - Update role
  - Create history
- [ ] demoteDevotee(DemoteRequest, Long userId) → RoleChangeResult
  - Validate demotion allowed
  - Handle subordinates
  - Update role
- [ ] removeRole(Long devoteeId, String reason, Long userId) → RoleChangeResult
  - Transfer all subordinates
  - Nullify role fields
- [ ] getAvailableSupervisors(String districtCode, LeadershipRole targetRole, List<Long> excludeIds) → List<DevoteeDTO>
- [ ] getDirectSubordinates(Long devoteeId) → List<DevoteeDTO>
- [ ] getAllSubordinates(Long devoteeId) → List<DevoteeDTO> (recursive)
- [ ] getRoleHistory(Long devoteeId, PageRequest) → Page<RoleChangeHistoryDTO>
- [ ] validateHierarchyChange(LeadershipRole current, LeadershipRole target, ChangeType type) → ValidationResult
- [ ] checkCircularReference(Long devoteeId, Long newReportingId) → boolean

**DashboardService**:
- [ ] getDashboardSummary() → DashboardDTO
- [ ] getStatusDistribution() → List<StatusDistributionDTO>

**ReportService**:
- [ ] getHierarchicalReports(List<String> allowedDistricts) → HierarchicalReportDTO
- [ ] getAllStates(List<String> allowedDistricts) → List<StateReportDTO>
- [ ] getDistrictsByState(String state, List<String> allowedDistricts) → List<DistrictReportDTO>
- [ ] getSubDistrictsByDistrict(String state, String district, List<String> allowedDistricts) → List<SubDistrictReportDTO>
- [ ] getVillagesBySubDistrict(String state, String district, String subdistrict, List<String> allowedDistricts) → List<VillageReportDTO>

**Other Services** (simpler):
- [ ] DevotionalStatusService: CRUD operations
- [ ] GurudevService: CRUD operations
- [ ] ShraddhakutirService: CRUD + filter by district
- [ ] NamhattaUpdateService: create, getAll, getByNamhatta
- [ ] HierarchyService: getTopLevel, getByLevel

#### 6.4.2 Business Logic Implementation

**RoleHierarchyRules** (utility class):
- [ ] Define ROLE_HIERARCHY map with levels, reportsTo, canPromoteTo, canDemoteTo
- [ ] canPromote(from, to) method
- [ ] canDemote(from, to) method
- [ ] getReportingRole(role) method
- [ ] getManagedRoles(role) method

**ValidationUtils** (utility class):
- [ ] validateEmail(String email)
- [ ] validatePhone(String phone)
- [ ] validatePassword(String password) - complexity rules
- [ ] validateUsername(String username)
- [ ] sanitizeInput(String input) - HTML escape

### 6.5 Controller Layer (Week 4-5)

#### 6.5.1 Authentication Controller (`/api/auth`)
- [ ] POST /login - @PostMapping, @RateLimited(5, 15min)
- [ ] POST /logout - @PostMapping
- [ ] GET /verify - @GetMapping, @Authenticated
- [ ] GET /user-districts - @GetMapping, @Authenticated

#### 6.5.2 System Controllers
- [ ] GET /api/health - @GetMapping (public)
- [ ] GET /api/about - @GetMapping (public)

#### 6.5.3 Geography Controller (`/api`)
- [ ] GET /countries
- [ ] GET /states
- [ ] GET /districts
- [ ] GET /sub-districts
- [ ] GET /villages
- [ ] GET /pincodes
- [ ] GET /pincodes/search
- [ ] GET /address-by-pincode

#### 6.5.4 Devotee Controller (`/api/devotees`)
- [ ] GET / - @Authenticated, @DistrictAccess
- [ ] GET /:id - @Authenticated
- [ ] POST / - @Authenticated, @RoleRequired({ADMIN, OFFICE}), @RateLimited
- [ ] POST /:namhattaId - @Authenticated, @RoleRequired({ADMIN, OFFICE}), @RateLimited
- [ ] PUT /:id - @Authenticated, @RoleRequired({ADMIN, OFFICE, DISTRICT_SUPERVISOR}), @RateLimited, @DistrictAccess
- [ ] POST /:id/upgrade-status - @Authenticated, @RoleRequired({ADMIN, OFFICE})
- [ ] POST /:id/assign-leadership - @Authenticated, @RoleRequired({ADMIN, OFFICE})
- [ ] DELETE /:id/leadership - @Authenticated, @RoleRequired({ADMIN, OFFICE})
- [ ] POST /:id/link-user - @Authenticated, @RoleRequired({ADMIN})
- [ ] GET /available-officers - @Authenticated

#### 6.5.5 Namhatta Controller (`/api/namhattas`)
- [ ] GET /
- [ ] GET /:id
- [ ] POST / - @RoleRequired, @RateLimited
- [ ] PUT /:id - @RoleRequired, @RateLimited
- [ ] GET /check-registration/:registrationNo - @Authenticated, @RoleRequired
- [ ] POST /:id/approve - @Authenticated, @RoleRequired({ADMIN, OFFICE})
- [ ] POST /:id/reject - @Authenticated, @RoleRequired({ADMIN, OFFICE})
- [ ] GET /:id/devotees
- [ ] GET /:id/updates
- [ ] GET /:id/devotee-status-count
- [ ] GET /:id/status-history

#### 6.5.6 District Supervisor Controller (`/api`)
- [ ] GET /district-supervisors/all - @Authenticated
- [ ] GET /district-supervisors - @Authenticated
- [ ] GET /user/address-defaults - @Authenticated

#### 6.5.7 Dashboard & Reports Controller (`/api`)
- [ ] GET /dashboard - @Authenticated
- [ ] GET /status-distribution - @Authenticated
- [ ] GET /reports/hierarchical - @Authenticated, @RoleRequired, @DistrictAccess
- [ ] GET /reports/states - @Authenticated, @RoleRequired, @DistrictAccess
- [ ] GET /reports/districts/:state - @Authenticated, @RoleRequired, @DistrictAccess
- [ ] GET /reports/sub-districts/:state/:district - @Authenticated, @RoleRequired, @DistrictAccess
- [ ] GET /reports/villages/:state/:district/:subdistrict - @Authenticated, @RoleRequired, @DistrictAccess

#### 6.5.8 Status, Gurudev, Shraddhakutir Controllers
- [ ] DevotionalStatusController: GET /, POST /, POST /:id/rename
- [ ] GurudevController: GET /, POST /
- [ ] ShraddhakutirController: GET /, POST /

#### 6.5.9 Updates Controller (`/api/updates`)
- [ ] POST / - create update
- [ ] GET /all - get all updates

#### 6.5.10 Hierarchy Controller (`/api/hierarchy`)
- [ ] GET / - get top level
- [ ] GET /:level - get by level

#### 6.5.11 Admin User Controller (`/api/admin`)
- [ ] POST /register-supervisor - @Authenticated, @RoleRequired({ADMIN})
- [ ] GET /users - @Authenticated, @RoleRequired({ADMIN})
- [ ] GET /available-districts - @Authenticated, @RoleRequired({ADMIN})
- [ ] PUT /users/:id - @Authenticated, @RoleRequired({ADMIN})
- [ ] DELETE /users/:id - @Authenticated, @RoleRequired({ADMIN})

#### 6.5.12 Senapoti Role Management Controller (`/api/senapoti`)
- [ ] POST /transfer-subordinates - @Authenticated, @RoleRequired({ADMIN, DISTRICT_SUPERVISOR}), @RateLimited
- [ ] POST /promote - @Authenticated, @RoleRequired({ADMIN, DISTRICT_SUPERVISOR}), @RateLimited
- [ ] POST /demote - @Authenticated, @RoleRequired({ADMIN, DISTRICT_SUPERVISOR}), @RateLimited
- [ ] POST /remove-role - @Authenticated, @RoleRequired({ADMIN, DISTRICT_SUPERVISOR}), @RateLimited
- [ ] GET /available-supervisors/:districtCode/:targetRole - @Authenticated, @RoleRequired
- [ ] GET /subordinates/:devoteeId - @Authenticated, @RoleRequired
- [ ] GET /role-history/:devoteeId - @Authenticated, @RoleRequired
- [ ] GET /subordinates/:devoteeId/all - @Authenticated, @RoleRequired

#### 6.5.13 Global Exception Handler
- [ ] @ControllerAdvice class
- [ ] Handle ValidationException → 400
- [ ] Handle UnauthorizedException → 401
- [ ] Handle ForbiddenException → 403
- [ ] Handle NotFoundException → 404
- [ ] Handle ConflictException → 409
- [ ] Handle all Exception → 500
- [ ] Sanitize error messages (no internal details to client)
- [ ] Log full stack trace server-side

### 6.6 Cross-Cutting Concerns (Week 5)

#### 6.6.1 Rate Limiting
- [ ] Create RateLimitingFilter
- [ ] Track requests by IP in-memory (or Redis for distributed)
- [ ] Configure limits per endpoint type:
  - Login: 5/15min
  - Modifications: 10/1min
  - General: 100/15min
- [ ] Return 429 with Retry-After header

#### 6.6.2 Input Validation
- [ ] Use @Valid on all request DTOs
- [ ] Define validation constraints:
  - @NotNull, @NotBlank
  - @Email, @Pattern
  - @Min, @Max, @Size
  - Custom validators where needed
- [ ] Create custom validators:
  - @ValidPassword (complexity check)
  - @ValidUsername (alphanumeric + underscore)
  - @ValidLeadershipRole (enum validation)

#### 6.6.3 DTO Mapping
- [ ] Create DTOs for all request/response types
- [ ] Use MapStruct or ModelMapper for entity-DTO conversion
- [ ] Exclude sensitive fields in DTOs (passwordHash, sessionToken, etc.)

#### 6.6.4 CORS Configuration
- [ ] Configure CorsConfiguration bean
- [ ] Development: allow all origins
- [ ] Production: whitelist specific domains
  - Same-origin
  - *.replit.app pattern
  - Environment-configured list
- [ ] Allow credentials: true
- [ ] Allowed methods: GET, POST, PUT, DELETE, PATCH
- [ ] Allowed headers: Content-Type, Authorization, etc.

#### 6.6.5 Logging & Monitoring
- [ ] Configure logback.xml with appropriate patterns
- [ ] Create RequestLoggingFilter
  - Log method, URL, status, duration
  - Log user ID if authenticated
  - Sanitize sensitive data (passwords, tokens)
- [ ] Create service-level logging
- [ ] Setup log rotation and retention policy

### 6.7 Testing (Week 6)

#### 6.7.1 Unit Tests (Services)
- [ ] AuthenticationService tests
  - Valid login
  - Invalid credentials
  - Logout
  - Token verification
- [ ] UserService tests
  - CRUD operations
  - District assignment
  - Deactivation
- [ ] DevoteeService tests
  - CRUD with address handling
  - Status upgrade
  - Leadership assignment
  - District access filtering
- [ ] NamhattaService tests
  - Creation with address
  - Approval workflow
  - Registration number uniqueness
- [ ] RoleManagementService tests
  - Promotion validation
  - Demotion validation
  - Subordinate transfer
  - Circular reference check
  - Role removal
- [ ] AddressService tests
  - Find-or-create logic
  - Exact match including nulls

#### 6.7.2 Integration Tests (Controllers)
- [ ] Authentication flow end-to-end
- [ ] Devotee CRUD with district filtering
- [ ] Namhatta approval workflow
- [ ] Role management operations
- [ ] Report generation with district filters

#### 6.7.3 Security Tests
- [ ] JWT generation and validation
- [ ] Password hashing and verification
- [ ] Session single-login enforcement
- [ ] Token blacklisting
- [ ] Role-based access control
- [ ] District access filtering
- [ ] Rate limiting

#### 6.7.4 Repository Tests
- [ ] Custom query methods
- [ ] Pagination
- [ ] Complex filters
- [ ] Cascading operations

### 6.8 Deployment Preparation (Week 7)

#### 6.8.1 Configuration Externalization
- [ ] Move secrets to environment variables:
  - DATABASE_URL
  - JWT_SECRET
  - SESSION_SECRET
- [ ] Create application-dev.properties
- [ ] Create application-prod.properties
- [ ] Use Spring Profiles for environment switching

#### 6.8.2 Database Migration
- [ ] Setup Flyway or Liquibase
- [ ] Create initial schema migration script
- [ ] Create seed data migration (devotional statuses, gurudevs, leaders)
- [ ] Test migration on fresh database

#### 6.8.3 Scheduled Jobs
- [ ] Create @Scheduled task for JWT blacklist cleanup
  - Run daily
  - Delete entries where expiredAt < now
- [ ] Create @Scheduled task for session cleanup
  - Run hourly
  - Delete expired sessions
- [ ] Ensure jobs are idempotent (safe to run on multiple instances)

#### 6.8.4 Health Checks & Metrics
- [ ] Implement Spring Actuator
- [ ] Enable health endpoint
- [ ] Add custom health indicator for database
- [ ] Add custom metrics for:
  - Login attempts (success/failure)
  - Active sessions count
  - API request counts by endpoint
  - Role management operations

#### 6.8.5 Docker & Deployment
- [ ] Create Dockerfile
  - Multi-stage build (Maven + JRE)
  - Expose port 8080
- [ ] Create docker-compose.yml for local testing
  - App container
  - PostgreSQL container
- [ ] Create deployment guide
  - Environment variables
  - Database setup
  - Migration steps

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
