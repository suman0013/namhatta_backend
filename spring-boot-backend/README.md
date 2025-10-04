# Namhatta Management System - Spring Boot Backend

## Project Overview
This is the Spring Boot 3 backend reimplementation of the Namhatta Management System, migrated from Node.js/Express with TypeScript while maintaining complete API compatibility.

## Technology Stack
- **Java**: OpenJDK 17
- **Framework**: Spring Boot 3.2.0
- **Build Tool**: Maven 3.9.9
- **Database**: PostgreSQL (Neon serverless)
- **Security**: Spring Security with JWT
- **ORM**: Spring Data JPA with Hibernate

## Phase 1: Setup & Configuration ✅ COMPLETED

### Accomplishments
1. **Project Initialization**
   - Created Spring Boot 3.x project with Maven
   - Configured Java 17
   - Added all required dependencies (Web, JPA, Security, Validation, PostgreSQL, JWT)

2. **Application Configuration**
   - `application.properties` - Default configuration
   - `application-dev.properties` - Development environment
   - `application-prod.properties` - Production environment
   - Configured Logback for structured logging
   - Set server port to 5000

3. **Database Connection**
   - Successfully connected to Neon PostgreSQL
   - Configured HikariCP connection pooling
   - Set JPA/Hibernate to `validate` mode (NO schema changes)
   - Verified connectivity with automated test ✅

## Project Structure
```
spring-boot-backend/
├── src/
│   ├── main/
│   │   ├── java/com/namhatta/
│   │   │   ├── NamhattaManagementSystemApplication.java
│   │   │   └── controller/
│   │   │       └── HealthController.java
│   │   └── resources/
│   │       ├── application.properties
│   │       ├── application-dev.properties
│   │       ├── application-prod.properties
│   │       └── logback-spring.xml
│   └── test/
│       └── java/com/namhatta/
│           └── DatabaseConnectivityTest.java
├── pom.xml
└── .gitignore
```

## Build & Run

### Prerequisites
- Java 17
- Maven 3.9+
- Access to Neon PostgreSQL database

### Build
```bash
mvn clean package
```

### Run Tests
```bash
mvn test
```

### Run Application
```bash
mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=dev"
```

## Database Configuration
The application connects to Neon PostgreSQL using the JDBC connection string:
```
jdbc:postgresql://ep-calm-silence-a15zko7l-pooler.ap-southeast-1.aws.neon.tech/neondb
```

### Connection Pool Settings
- Maximum pool size: 10 (dev) / 20 (prod)
- Minimum idle: 5 (dev) / 10 (prod)
- Connection timeout: 30 seconds
- Idle timeout: 10 minutes
- Max lifetime: 30 minutes

## API Endpoints (Phase 1)
- `GET /api/health` - Health check endpoint
- `GET /api/db-check` - Database connectivity check

## Phase 8: Controller Layer ✅ COMPLETED

### Accomplishments
All REST API controllers have been fully implemented:

#### Authentication & System Controllers
- **AuthController** - Login, logout, token verification, user districts
- **SystemController** - Health check, about endpoint
- **GeographyController** - Countries, states, districts, pincodes, address lookup

#### Core Business Controllers
- **DevoteeController** - Full CRUD, status upgrade, leadership assignment, user linking
- **NamhattaController** - CRUD, approval/rejection, devotee listing, updates, status history
- **NamhattaUpdateController** - Create and retrieve namhatta program updates

#### Role Management Controllers
- **SenapotiController** - Promote, demote, transfer subordinates, role history
- **DistrictSupervisorController** - List supervisors, address defaults

#### Administrative Controllers
- **AdminController** - Register supervisors, manage users, available districts
- **DashboardController** - Summary statistics, status distribution
- **ReportController** - Hierarchical reports, state/district/village breakdowns
- **MapDataController** - Geographic distribution of namhattas

#### Supporting Controllers
- **DevotionalStatusController** - Manage devotional statuses
- **GurudevController** - Manage gurudev records
- **ShraddhakutirController** - Manage shraddhakutir centers
- **HierarchyController** - Leader hierarchy management

### API Endpoints Summary
- ✅ 17 Controller classes implemented
- ✅ 80+ REST endpoints configured
- ✅ Complete authentication & authorization with JWT
- ✅ Role-based access control (@PreAuthorize)
- ✅ Request validation with JSR-303
- ✅ Full pagination support
- ✅ District-based access filtering for DISTRICT_SUPERVISOR role

## Phase 9: Exception Handling & Validation ✅ COMPLETED

### Accomplishments
Complete exception handling and validation infrastructure:

#### Custom Exception Classes
- **NotFoundException** - For resource not found errors (404)
- **ConflictException** - For unique constraint violations (409)
- **ValidationException** - For business validation errors (400)
- **CircularReferenceException** - For hierarchy circular reference detection
- **InsufficientPermissionException** - For authorization failures (403)

#### Global Exception Handler
- **GlobalExceptionHandler** (@ControllerAdvice)
  - Handles all custom exceptions with appropriate HTTP status codes
  - Handles JSR-303 validation failures (MethodArgumentNotValidException)
  - Handles Spring Security exceptions (AccessDeniedException, BadCredentialsException)
  - Generic exception handler for unexpected errors (logs details, returns generic message)
  - Returns standardized ErrorResponse DTOs

#### Custom Validation Annotations
- **@ValidPassword** - Password strength validation (min 8 chars, uppercase, lowercase, number)
- **@ValidUsername** - Username format validation (3-50 chars, alphanumeric + underscore)
- **@ValidLeadershipRole** - Enum validation for leadership roles
- Corresponding validators: PasswordValidator, UsernameValidator, LeadershipRoleValidator

#### Input Sanitization
- **InputSanitizer** utility class for XSS prevention
  - HTML escaping for special characters
  - Trim whitespace
  - SQL injection pattern removal
- **RequestSanitizationInterceptor** for future request-level sanitization hooks

### Error Response Format
```json
{
  "error": "Error Type",
  "details": "Detailed error message",
  "timestamp": "2025-10-04T12:30:45"
}
```

### Validation Error Format
```json
{
  "error": "Validation Failed",
  "fieldErrors": {
    "fieldName": "error message"
  },
  "timestamp": "2025-10-04T12:30:45"
}
```

## Next Steps: Phase 10
- Unit tests for service layer
- Integration tests for API endpoints
- Security tests for authentication/authorization
- Database repository tests

## Migration Progress
- [x] **Phase 1**: Project Setup & Configuration ✅
- [x] **Phase 2**: Data Model & Entities ✅
- [x] **Phase 3**: Repository Layer ✅
- [x] **Phase 4**: Security Implementation ✅
- [x] **Phase 5**: Service Layer - Core Services ✅
- [x] **Phase 6**: Service Layer - Role Management ✅
- [x] **Phase 7**: Service Layer - Supporting Services ✅
- [x] **Phase 8**: Controller Layer ✅
- [x] **Phase 9**: Exception Handling & Validation ✅
- [ ] **Phase 10**: Testing
- [ ] **Phase 11**: Configuration & Deployment Prep
- [ ] **Phase 12**: Migration Validation & Cutover

## Development Notes
- Database schema is **read-only** - no modifications allowed
- All API endpoints must maintain compatibility with existing React frontend
- JWT authentication uses HTTP-only cookies
- Session management enforces single login per user
