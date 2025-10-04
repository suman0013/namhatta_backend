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

## Next Steps: Phase 2
- Create base entities and enums
- Implement User, Devotee, Namhatta entities
- Set up repository layer
- Configure entity relationships

## Migration Progress
- [x] **Phase 1**: Project Setup & Configuration
- [ ] **Phase 2**: Data Model & Entities
- [ ] **Phase 3**: Repository Layer
- [ ] **Phase 4**: Security Implementation
- [ ] **Phase 5**: Service Layer - Core Services
- [ ] **Phase 6**: Service Layer - Role Management
- [ ] **Phase 7**: Service Layer - Supporting Services
- [ ] **Phase 8**: Controller Layer
- [ ] **Phase 9**: Exception Handling & Validation
- [ ] **Phase 10**: Testing
- [ ] **Phase 11**: Configuration & Deployment Prep
- [ ] **Phase 12**: Migration Validation & Cutover

## Development Notes
- Database schema is **read-only** - no modifications allowed
- All API endpoints must maintain compatibility with existing React frontend
- JWT authentication uses HTTP-only cookies
- Session management enforces single login per user
