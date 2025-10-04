# Namhatta Management System - Spring Boot Migration Specification

**Document Version:** 2.0  
**Last Updated:** October 2, 2025  
**Purpose:** Complete backend specification for Spring Boot 3 reimplementation with Java 17

**Source System:** Node.js Express.js + TypeScript  
**Target System:** Spring Boot 3 + Java 17  
**Database:** PostgreSQL (Neon) - **NO CHANGES ALLOWED**  
**Database Connection:** `jdbc:postgresql://ep-calm-silence-a15zko7l-pooler.ap-southeast-1.aws.neon.tech/neondb?user=neondb_owner&password=npg_5MIwCD4YhSdP&sslmode=require&channelBinding=require`

---

## IMPORTANT INSTRUCTIONS FOR IMPLEMENTING AGENT

### Task Status Management
Each task has a status field. **YOU MUST UPDATE** the status as you work:
- **NOT_STARTED**: Task not yet begun
- **IN_PROGRESS**: Currently working on this task
- **COMPLETED**: Task fully implemented and tested

### Task Dependencies
- Tasks are ordered to ensure prerequisites are met
- **DO NOT** start a task until all its prerequisites are COMPLETED
- Check the "Prerequisites" field for each task
- If a task has no prerequisites listed, you may begin immediately

### Implementation Rules
1. **Follow the exact task order** - Tasks are sequenced to avoid dependency issues
2. **Update status immediately** when you start or complete a task
3. **Test each phase** before moving to the next
4. **No database schema changes** - Use existing Neon PostgreSQL database as-is
5. **Maintain API compatibility** - Frontend expects exact same API contracts
6. **Implement ALL features** - Do not skip any functionality from the Node.js version

---

## TASK BREAKDOWN & IMPLEMENTATION CHECKLIST

### **PHASE 1: PROJECT SETUP & CONFIGURATION**
**Status**: COMPLETED  
**Duration**: 1 day  
**Prerequisites**: None

#### Task 1.1: Initialize Spring Boot Project
**Status**: COMPLETED  
**Prerequisites**: None
- [x] 1.1.1: Create Spring Boot 3.x project with Maven/Gradle
- [x] 1.1.2: Set Java version to 17 in build configuration
- [x] 1.1.3: Add core dependencies: spring-boot-starter-web, spring-boot-starter-data-jpa
- [x] 1.1.4: Add PostgreSQL driver dependency
- [x] 1.1.5: Add Spring Security starter dependency
- [x] 1.1.6: Add validation starter (spring-boot-starter-validation)
- [x] 1.1.7: Create main application class with @SpringBootApplication
- [x] 1.1.8: Set server.port=5000 in configuration

#### Task 1.2: Configure Application Properties
**Status**: COMPLETED  
**Prerequisites**: Task 1.1
- [x] 1.2.1: Create application.properties (or .yml) for default configuration
- [x] 1.2.2: Create application-dev.properties for development environment
- [x] 1.2.3: Create application-prod.properties for production environment
- [x] 1.2.4: Configure logging (SLF4J + Logback) with appropriate log levels
- [x] 1.2.5: Setup environment-specific profiles

#### Task 1.3: Configure Database Connection
**Status**: COMPLETED  
**Prerequisites**: Task 1.2
- [x] 1.3.1: Configure PostgreSQL datasource URL using JDBC connection string from spec header
- [x] 1.3.2: Setup JPA/Hibernate properties (dialect: PostgreSQL, ddl-auto: **validate** - NO SCHEMA CHANGES)
- [x] 1.3.3: Configure HikariCP connection pooling (pool size: 10-20)
- [x] 1.3.4: Setup connection timeout and idle timeout settings
- [x] 1.3.5: Test database connectivity with a simple query
- [x] 1.3.6: Add environment variables for connection credentials (use connection string from header)

---

### **PHASE 2: DATA MODEL & ENTITIES**
**Status**: COMPLETED  
**Duration**: 2-3 days  
**Prerequisites**: Phase 1 completed

#### Task 2.1: Create Base Entity and Enums
**Status**: COMPLETED  
**Prerequisites**: Task 1.3
- [x] 2.1.1: Create BaseEntity abstract class with id, createdAt, updatedAt fields
- [x] 2.1.2: Create UserRole enum (ADMIN, OFFICE, DISTRICT_SUPERVISOR)
- [x] 2.1.3: Create LeadershipRole enum (MALA_SENAPOTI, MAHA_CHAKRA_SENAPOTI, CHAKRA_SENAPOTI, UPA_CHAKRA_SENAPOTI)
- [x] 2.1.4: Create Gender enum (MALE, FEMALE, OTHER)
- [x] 2.1.5: Create MaritalStatus enum (MARRIED, UNMARRIED, WIDOWED)
- [x] 2.1.6: Create NamhattaStatus enum (PENDING_APPROVAL, APPROVED, REJECTED)
- [x] 2.1.7: Create AddressType enum (PRESENT, PERMANENT)
- [x] 2.1.8: Create LeaderRole enum (FOUNDER_ACHARYA, GBC, REGIONAL_DIRECTOR, CO_REGIONAL_DIRECTOR, DISTRICT_SUPERVISOR)

#### Task 2.2: Create User-Related Entities
**Status**: COMPLETED  
**Prerequisites**: Task 2.1
- [x] 2.2.1: Create User entity (@Entity, table="users") with all fields (id, username, passwordHash, fullName, email, role, devoteeId, isActive, timestamps)
- [x] 2.2.2: Add @Column annotations with constraints (unique username, unique email, nullable, length)
- [x] 2.2.3: Add @ManyToOne relationship to Devotee (devoteeId, nullable)
- [x] 2.2.4: Create UserDistrict entity (table="user_districts") with userId, districtCode, districtNameEnglish, isDefaultDistrictSupervisor
- [x] 2.2.5: Add @ManyToOne relationship from UserDistrict to User
- [x] 2.2.6: Add unique constraint on (userId, districtCode) in UserDistrict
- [x] 2.2.7: Create UserSession entity (table="user_sessions") with userId (unique), sessionToken, expiresAt
- [x] 2.2.8: Add @OneToOne relationship from UserSession to User
- [x] 2.2.9: Create JwtBlacklist entity (table="jwt_blacklist") with tokenHash, expiredAt

#### Task 2.3: Create Devotee Entity
**Status**: COMPLETED  
**Prerequisites**: Task 2.2
- [x] 2.3.1: Create Devotee entity (table="devotees") with personal fields (legalName, name, dob, email, phone, gender, bloodGroup, maritalStatus)
- [x] 2.3.2: Add family fields (fatherName, motherName, husbandName)
- [x] 2.3.3: Add spiritual fields (devotionalStatusId, harinamInitiationGurudevId, pancharatrikInitiationGurudevId, initiatedName, harinamDate, pancharatrikDate, education, occupation)
- [x] 2.3.4: Add devotionalCourses field as JSONB type (use @Type annotation for JSON handling)
- [x] 2.3.5: Add leadership fields (leadershipRole, reportingToDevoteeId, hasSystemAccess, appointedDate, appointedBy)
- [x] 2.3.6: Add additionalComments, shraddhakutirId, namhattaId fields
- [x] 2.3.7: Add self-referencing @ManyToOne relationship for hierarchy (reportingToDevotee)
- [x] 2.3.8: Add @ManyToOne relationships (namhattaId, devotionalStatusId, gurudevs, shraddhakutirId, appointedBy)

#### Task 2.4: Create Address Entities
**Status**: COMPLETED  
**Prerequisites**: Task 2.3
- [x] 2.4.1: Create Address entity (table="addresses") with country, stateCode, stateNameEnglish, districtCode, districtNameEnglish, subdistrictCode, subdistrictNameEnglish, villageCode, villageNameEnglish, pincode
- [x] 2.4.2: Set @ColumnDefault("India") for country field
- [x] 2.4.3: Create DevoteeAddress junction entity (table="devotee_addresses") with devoteeId, addressId, addressType (enum), landmark
- [x] 2.4.4: Add @ManyToOne relationships in DevoteeAddress to Devotee and Address
- [x] 2.4.5: Create NamhattaAddress junction entity (table="namhatta_addresses") with namhattaId, addressId, landmark
- [x] 2.4.6: Add @ManyToOne relationships in NamhattaAddress to Namhatta and Address

#### Task 2.5: Create Namhatta Entity
**Status**: COMPLETED  
**Prerequisites**: Task 2.4
- [x] 2.5.1: Create Namhatta entity (table="namhattas") with code (unique), name, meetingDay, meetingTime
- [x] 2.5.2: Add leadership position fields (malaSenapotiId, mahaChakraSenapotiId, chakraSenapotiId, upaChakraSenapotiId)
- [x] 2.5.3: Add officer fields (secretaryId, presidentId, accountantId)
- [x] 2.5.4: Add districtSupervisorId (required, references User), status (enum, default PENDING_APPROVAL), registrationNo (unique), registrationDate
- [x] 2.5.5: Add @ManyToOne relationships for all devotee position foreign keys
- [x] 2.5.6: Add @ManyToOne relationship to User (districtSupervisorId)
- [x] 2.5.7: Add unique constraints on code and registrationNo

#### Task 2.6: Create Supporting Entities
**Status**: COMPLETED  
**Prerequisites**: Task 2.5
- [x] 2.6.1: Create DevotionalStatus entity (table="devotional_statuses") with id, name (unique), createdAt
- [x] 2.6.2: Create StatusHistory entity (table="status_history") with devoteeId, previousStatus, newStatus, comment, updatedAt
- [x] 2.6.3: Add @ManyToOne relationship from StatusHistory to Devotee
- [x] 2.6.4: Create Gurudev entity (table="gurudevs") with id, name (unique), title, createdAt
- [x] 2.6.5: Create Shraddhakutir entity (table="shraddhakutirs") with id, name, districtCode, createdAt
- [x] 2.6.6: Create NamhattaUpdate entity (table="namhatta_updates") with namhattaId, programType, date, attendance, prasadDistribution, nagarKirtan, bookDistribution, chanting, arati, bhagwatPath, specialAttraction, imageUrls (JSONB), facebookLink, youtubeLink, createdAt
- [x] 2.6.7: Add @ManyToOne relationship from NamhattaUpdate to Namhatta
- [x] 2.6.8: Create Leader entity (table="leaders") with id, name, role (enum), reportingTo (self-reference), location (JSONB), createdAt
- [x] 2.6.9: Add self-referencing @ManyToOne for Leader hierarchy
- [x] 2.6.10: Create RoleChangeHistory entity (table="role_change_history") with devoteeId, previousRole, newRole, previousReportingTo, newReportingTo, changedBy (userId), reason, districtCode, subordinatesTransferred, createdAt
- [x] 2.6.11: Add @ManyToOne relationships from RoleChangeHistory to Devotee and User

---

### **PHASE 3: REPOSITORY LAYER**
**Status**: NOT_STARTED  
**Duration**: 1-2 days  
**Prerequisites**: Phase 2 completed

#### Task 3.1: Create User Repositories
**Status**: COMPLETED  
**Prerequisites**: Task 2.6
- [x] 3.1.1: Create UserRepository extends JpaRepository<User, Long>
- [x] 3.1.2: Add method: Optional<User> findByUsername(String username)
- [x] 3.1.3: Add method: Optional<User> findByEmail(String email)
- [x] 3.1.4: Add method: List<User> findByIsActiveTrue()
- [x] 3.1.5: Add method: List<User> findByRole(UserRole role)
- [x] 3.1.6: Create UserDistrictRepository extends JpaRepository<UserDistrict, Long>
- [x] 3.1.7: Add method: List<UserDistrict> findByUserId(Long userId)
- [x] 3.1.8: Add method: List<UserDistrict> findByDistrictCode(String districtCode)
- [x] 3.1.9: Add method: Optional<UserDistrict> findByUserIdAndDistrictCode(Long userId, String districtCode)
- [x] 3.1.10: Create UserSessionRepository extends JpaRepository<UserSession, Long>
- [x] 3.1.11: Add method: Optional<UserSession> findByUserId(Long userId)
- [x] 3.1.12: Add method: void deleteByUserId(Long userId)
- [x] 3.1.13: Add method: void deleteByExpiresAtBefore(LocalDateTime dateTime)
- [x] 3.1.14: Create JwtBlacklistRepository extends JpaRepository<JwtBlacklist, Long>
- [x] 3.1.15: Add method: boolean existsByTokenHash(String tokenHash)
- [x] 3.1.16: Add method: void deleteByExpiredAtBefore(LocalDateTime dateTime)

#### Task 3.2: Create Devotee and Namhatta Repositories
**Status**: COMPLETED  
**Prerequisites**: Task 3.1
- [x] 3.2.1: Create DevoteeRepository extends JpaRepository<Devotee, Long>
- [x] 3.2.2: Add @Query method for pagination and filtering by search term, country, state, district, statusId
- [x] 3.2.3: Add method: List<Devotee> findByNamhattaId(Long namhattaId)
- [x] 3.2.4: Add method: List<Devotee> findByReportingToDevoteeId(Long id)
- [x] 3.2.5: Add method: List<Devotee> findByLeadershipRoleNotNull()
- [x] 3.2.6: Add method: List<Devotee> findByLeadershipRole(LeadershipRole role)
- [x] 3.2.7: Create NamhattaRepository extends JpaRepository<Namhatta, Long>
- [x] 3.2.8: Add method: Optional<Namhatta> findByCode(String code)
- [x] 3.2.9: Add method: Optional<Namhatta> findByRegistrationNo(String registrationNo)
- [x] 3.2.10: Add method: boolean existsByCode(String code)
- [x] 3.2.11: Add method: boolean existsByRegistrationNo(String registrationNo)
- [x] 3.2.12: Add @Query method for pagination and filtering by search, country, state, district, status

#### Task 3.3: Create Address and Supporting Repositories
**Status**: COMPLETED  
**Prerequisites**: Task 3.2
- [x] 3.3.1: Create AddressRepository extends JpaRepository<Address, Long>
- [x] 3.3.2: Add @Query method for exact match (country, stateCode, districtCode, subdistrictCode, villageCode, pincode - handle nulls)
- [x] 3.3.3: Add method: List<String> findDistinctCountries()
- [x] 3.3.4: Add method: List<String> findDistinctStatesByCountry(String country)
- [x] 3.3.5: Add method: List<String> findDistinctDistrictsByState(String state)
- [x] 3.3.6: Add @Query for pincode search with pagination
- [x] 3.3.7: Create DevoteeAddressRepository extends JpaRepository<DevoteeAddress, Long>
- [x] 3.3.8: Add method: List<DevoteeAddress> findByDevoteeId(Long devoteeId)
- [x] 3.3.9: Add method: Optional<DevoteeAddress> findByDevoteeIdAndAddressType(Long devoteeId, AddressType type)
- [x] 3.3.10: Create NamhattaAddressRepository extends JpaRepository<NamhattaAddress, Long>
- [x] 3.3.11: Add method: Optional<NamhattaAddress> findByNamhattaId(Long namhattaId)
- [x] 3.3.12: Create DevotionalStatusRepository extends JpaRepository<DevotionalStatus, Long>
- [x] 3.3.13: Add method: Optional<DevotionalStatus> findByName(String name)
- [x] 3.3.14: Create StatusHistoryRepository extends JpaRepository<StatusHistory, Long>
- [x] 3.3.15: Add method: List<StatusHistory> findByDevoteeIdOrderByUpdatedAtDesc(Long devoteeId)
- [x] 3.3.16: Add @Query for paginated status history with devotee info
- [x] 3.3.17: Create GurudevRepository extends JpaRepository<Gurudev, Long>
- [x] 3.3.18: Add method: Optional<Gurudev> findByName(String name)
- [x] 3.3.19: Create ShraddhakutirRepository extends JpaRepository<Shraddhakutir, Long>
- [x] 3.3.20: Add method: List<Shraddhakutir> findByDistrictCode(String districtCode)
- [x] 3.3.21: Create NamhattaUpdateRepository extends JpaRepository<NamhattaUpdate, Long>
- [x] 3.3.22: Add method: List<NamhattaUpdate> findByNamhattaIdOrderByDateDesc(Long namhattaId)
- [x] 3.3.23: Add method: List<NamhattaUpdate> findAllByOrderByDateDesc()
- [x] 3.3.24: Create LeaderRepository extends JpaRepository<Leader, Long>
- [x] 3.3.25: Add method: List<Leader> findByRole(LeaderRole role)
- [x] 3.3.26: Add method: List<Leader> findByReportingToIsNull() (top-level leaders)
- [x] 3.3.27: Create RoleChangeHistoryRepository extends JpaRepository<RoleChangeHistory, Long>
- [x] 3.3.28: Add @Query for paginated role history by devoteeId

#### Task 3.4: Create Database Indexes (Verification Only)
**Status**: NOT_STARTED  
**Prerequisites**: Task 3.3
- [ ] 3.4.1: Verify index exists on users(username) - for login performance
- [ ] 3.4.2: Verify index exists on users(email) - for uniqueness check
- [ ] 3.4.3: Verify indexes exist on devotees(legal_name, email, namhatta_id, leadership_role, reporting_to_devotee_id)
- [ ] 3.4.4: Verify indexes exist on namhattas(code, registration_no, district_supervisor_id, status)
- [ ] 3.4.5: Verify indexes exist on addresses(country, state_name_english, district_name_english, pincode)
- [ ] 3.4.6: Verify index exists on jwt_blacklist(token_hash, expired_at) - for cleanup
- [ ] 3.4.7: **IMPORTANT**: Do NOT create new indexes - only verify existing ones

---

### **PHASE 4: SECURITY IMPLEMENTATION**
**Status**: NOT_STARTED  
**Duration**: 3-4 days  
**Prerequisites**: Phase 3 completed

#### Task 4.1: Password Management
**Status**: NOT_STARTED  
**Prerequisites**: Task 3.4
- [ ] 4.1.1: Create PasswordService class with @Service annotation
- [ ] 4.1.2: Configure BCryptPasswordEncoder bean in SecurityConfig
- [ ] 4.1.3: Implement hashPassword(String plainPassword) method using BCrypt
- [ ] 4.1.4: Implement verifyPassword(String plain, String hashed) method
- [ ] 4.1.5: Create password validation regex: min 8 chars, must contain uppercase, lowercase, number
- [ ] 4.1.6: Implement validatePasswordStrength(String password) method
- [ ] 4.1.7: Throw ValidationException if password doesn't meet criteria

#### Task 4.2: JWT Token Management
**Status**: NOT_STARTED  
**Prerequisites**: Task 4.1
- [ ] 4.2.1: Create JwtTokenProvider class with @Component annotation
- [ ] 4.2.2: Configure JWT secret from environment variable (JWT_SECRET)
- [ ] 4.2.3: Implement generateToken(UserDetails, List<String> districts, String sessionToken) method
- [ ] 4.2.4: Set JWT payload: userId, username, role, districts, sessionToken
- [ ] 4.2.5: Set token expiration to 1 hour (3600000ms)
- [ ] 4.2.6: Implement validateToken(String token) method - verify signature and expiration
- [ ] 4.2.7: Implement getUserIdFromToken(String token) method
- [ ] 4.2.8: Implement getClaimsFromToken(String token) method
- [ ] 4.2.9: Implement hashToken(String token) method using SHA-256 for blacklist storage

#### Task 4.3: Token Blacklist Service
**Status**: NOT_STARTED  
**Prerequisites**: Task 4.2
- [ ] 4.3.1: Create TokenBlacklistService class with @Service annotation
- [ ] 4.3.2: Inject JwtBlacklistRepository
- [ ] 4.3.3: Implement blacklistToken(String token) method - hash token with SHA-256 and store
- [ ] 4.3.4: Implement isTokenBlacklisted(String tokenHash) method - check repository
- [ ] 4.3.5: Implement cleanupExpiredTokens() method - delete where expiredAt < now
- [ ] 4.3.6: Add @Scheduled(cron = "0 0 2 * * ?") annotation for daily cleanup at 2 AM

#### Task 4.4: Session Management
**Status**: NOT_STARTED  
**Prerequisites**: Task 4.3
- [ ] 4.4.1: Create SessionService class with @Service annotation
- [ ] 4.4.2: Inject UserSessionRepository
- [ ] 4.4.3: Implement createSession(Long userId) method:
  - Delete existing session for userId (single login enforcement)
  - Generate random sessionToken (UUID or SecureRandom hex)
  - Set expiresAt to current time + 1 hour
  - Save new UserSession
  - Return sessionToken
- [ ] 4.4.4: Implement validateSession(Long userId, String sessionToken) method:
  - Find UserSession by userId
  - Check if sessionToken matches
  - Check if not expired
  - Return true/false
- [ ] 4.4.5: Implement removeSession(Long userId) method - delete session
- [ ] 4.4.6: Implement cleanupExpiredSessions() method
- [ ] 4.4.7: Add @Scheduled(cron = "0 0 * * * ?") annotation for hourly cleanup

#### Task 4.5: Spring Security Configuration
**Status**: NOT_STARTED  
**Prerequisites**: Task 4.4
- [ ] 4.5.1: Create SecurityConfig class with @Configuration and @EnableWebSecurity
- [ ] 4.5.2: Create SecurityFilterChain bean
- [ ] 4.5.3: Configure public endpoints (permitAll):
  - /api/auth/login, /api/auth/logout, /api/auth/dev/**
  - /api/health, /api/about
  - /api/countries, /api/states, /api/districts, /api/sub-districts, /api/villages, /api/pincodes/**, /api/address-by-pincode
  - /api/map/** (all map endpoints)
  - GET /api/namhattas, GET /api/namhattas/{id}
- [ ] 4.5.4: Configure authenticated endpoints (all others) - anyRequest().authenticated()
- [ ] 4.5.5: Disable CSRF (using JWT, stateless)
- [ ] 4.5.6: Set session management to STATELESS
- [ ] 4.5.7: Configure CORS to allow credentials and specific origins
- [ ] 4.5.8: Add security headers (Helmet-like): XSS protection, Content-Type options, Frame options

#### Task 4.6: JWT Authentication Filter
**Status**: NOT_STARTED  
**Prerequisites**: Task 4.5
- [ ] 4.6.1: Create JwtAuthenticationFilter extends OncePerRequestFilter
- [ ] 4.6.2: Inject JwtTokenProvider, TokenBlacklistService, SessionService, UserRepository, UserDistrictRepository
- [ ] 4.6.3: In doFilterInternal:
  - Extract JWT from cookie named "auth_token"
  - If no token, continue filter chain (public endpoints allowed)
  - Validate JWT using JwtTokenProvider.validateToken()
  - Extract userId from token
  - Get tokenHash and check if blacklisted
  - Get sessionToken from JWT claims
  - Validate session using SessionService.validateSession(userId, sessionToken)
  - Load User from repository, check isActive
  - Load user districts from UserDistrictRepository
  - Create CustomUserDetails object
  - Create UsernamePasswordAuthenticationToken with authorities
  - Set authentication in SecurityContext
  - Continue filter chain
- [ ] 4.6.4: Handle exceptions and return 401 for invalid/expired/blacklisted tokens
- [ ] 4.6.5: Register filter in SecurityConfig before UsernamePasswordAuthenticationFilter

#### Task 4.7: Custom UserDetailsService (if needed)
**Status**: NOT_STARTED  
**Prerequisites**: Task 4.6
- [ ] 4.7.1: Create CustomUserDetails class implements UserDetails
- [ ] 4.7.2: Add fields: userId, username, role, districts
- [ ] 4.7.3: Implement getAuthorities() to return role-based authority
- [ ] 4.7.4: Create constructor to build from User entity and district list

#### Task 4.8: Authorization Components
**Status**: NOT_STARTED  
**Prerequisites**: Task 4.7
- [ ] 4.8.1: Enable method security with @EnableMethodSecurity in SecurityConfig
- [ ] 4.8.2: Create DistrictAccessValidator component with @Component annotation
- [ ] 4.8.3: Implement validateDevoteeAccess(Long devoteeId, List<String> userDistricts) method:
  - Get devotee's address districts
  - Check if any match userDistricts
  - Throw AccessDeniedException if no match
- [ ] 4.8.4: Implement filterByDistricts(Specification, List<String> districts) method for queries
- [ ] 4.8.5: Create utility method to get current user's districts from SecurityContext
- [ ] 4.8.6: Create @PreAuthorize helpers for common role checks

---

### **PHASE 5: SERVICE LAYER - CORE SERVICES**
**Status**: NOT_STARTED  
**Duration**: 4-5 days  
**Prerequisites**: Phase 4 completed

#### Task 5.1: Authentication Service
**Status**: NOT_STARTED  
**Prerequisites**: Task 4.8
- [ ] 5.1.1: Create AuthenticationService class with @Service annotation
- [ ] 5.1.2: Inject UserRepository, UserDistrictRepository, PasswordService, JwtTokenProvider, SessionService
- [ ] 5.1.3: Implement login(LoginRequest) → LoginResponse method:
  - Validate username and password not empty
  - Find user by username
  - Check if user exists and isActive=true
  - Verify password using PasswordService
  - Throw BadCredentialsException if invalid
  - Create new session using SessionService (deletes old session)
  - Get user districts from UserDistrictRepository
  - Generate JWT using JwtTokenProvider with userId, username, role, districts, sessionToken
  - Return LoginResponse with user info (id, username, role, districts) and token
- [ ] 5.1.4: Implement logout(String token) method:
  - Blacklist token using TokenBlacklistService
  - Get userId from token
  - Remove session using SessionService.removeSession(userId)
- [ ] 5.1.5: Implement verifyToken(String token) → UserInfo method:
  - Validate JWT using JwtTokenProvider
  - Check if blacklisted
  - Get userId and sessionToken from claims
  - Validate session using SessionService
  - Get current user from repository, check isActive
  - Get current districts (may have changed since login)
  - Return UserInfo with id, username, role, districts

#### Task 5.2: User Management Service
**Status**: NOT_STARTED  
**Prerequisites**: Task 5.1
- [ ] 5.2.1: Create UserService class with @Service annotation
- [ ] 5.2.2: Inject UserRepository, UserDistrictRepository, PasswordService
- [ ] 5.2.3: Implement getAllUsers() → List<UserDTO> method:
  - Get all users
  - Convert to DTOs (hide passwordHash)
  - Return list
- [ ] 5.2.4: Implement createDistrictSupervisor(RegisterRequest) → UserDTO method:
  - Validate request (username unique, email unique, password strength)
  - Hash password using PasswordService
  - Create User entity with role=DISTRICT_SUPERVISOR, isActive=true
  - Save user
  - Create UserDistrict entries for each assigned district
  - Save UserDistricts
  - Return UserDTO
- [ ] 5.2.5: Implement updateUser(Long id, UpdateRequest) → UserDTO method:
  - Find user by id
  - Update allowed fields (fullName, email, role)
  - If districts changed, update UserDistrict entries
  - Save and return DTO
- [ ] 5.2.6: Implement deactivateUser(Long id) method:
  - Find user by id
  - Set isActive=false (soft delete)
  - Save user
- [ ] 5.2.7: Implement getUserDistricts(Long userId) → List<DistrictDTO> method:
  - Find UserDistricts by userId
  - Map to DTOs with code and name
  - Return list
- [ ] 5.2.8: Implement getAvailableDistricts() → List<DistrictDTO> method:
  - Query distinct districts from addresses table
  - Return list of district codes and names

#### Task 5.3: Address Service
**Status**: NOT_STARTED  
**Prerequisites**: Task 5.2
- [ ] 5.3.1: Create AddressService class with @Service annotation
- [ ] 5.3.2: Inject AddressRepository, DevoteeAddressRepository, NamhattaAddressRepository
- [ ] 5.3.3: Implement findOrCreateAddress(AddressData) → Long method:
  - Build exact match criteria (including null values for all fields)
  - Query AddressRepository for existing address
  - If found, return address id
  - If not found, create new Address entity
  - Save and return id
- [ ] 5.3.4: Implement linkDevoteeAddress(devoteeId, addressId, type, landmark) method:
  - Check if link already exists
  - If exists, update landmark
  - If not, create new DevoteeAddress
  - Save
- [ ] 5.3.5: Implement linkNamhattaAddress(namhattaId, addressId, landmark) method:
  - Check if link exists, update or create
  - Save
- [ ] 5.3.6: Implement getCountries() → List<String> method - query distinct countries
- [ ] 5.3.7: Implement getStates(String country) → List<String> method - query distinct states filtered by country
- [ ] 5.3.8: Implement getDistricts(String state) → List<String> method - query distinct districts filtered by state
- [ ] 5.3.9: Implement getSubDistricts(String district, String pincode) → List<String> method
- [ ] 5.3.10: Implement getVillages(String subDistrict, String pincode) → List<String> method
- [ ] 5.3.11: Implement getPincodes(String village, String district, String subDistrict) → List<String> method
- [ ] 5.3.12: Implement searchPincodes(country, search, page, limit) → PincodeSearchResult method:
  - Validate country required
  - Cap limit at 100
  - Build query with LIKE on pincode, village, district, subdistrict
  - Paginate results
  - Return pincodes array, total count, hasMore flag
- [ ] 5.3.13: Implement getAddressByPincode(String pincode) → AddressDetails method:
  - Query addresses by pincode
  - Return country, state, district, subDistricts array, villages array

#### Task 5.4: Devotee Service
**Status**: NOT_STARTED  
**Prerequisites**: Task 5.3
- [ ] 5.4.1: Create DevoteeService class with @Service annotation
- [ ] 5.4.2: Inject DevoteeRepository, AddressService, DevoteeAddressRepository, StatusHistoryRepository, DistrictAccessValidator
- [ ] 5.4.3: Implement getDevotees(Pageable, filters, userRole, userDistricts) → Page<DevoteeDTO> method:
  - Build Specification with filters (search on legalName/name/email, country, state, district, statusId)
  - If role=DISTRICT_SUPERVISOR, add district filter using userDistricts
  - Apply pagination and sorting
  - Fetch devotees with addresses (join queries)
  - Convert to DTOs with presentAddress and permanentAddress
  - Return Page
- [ ] 5.4.4: Implement getDevotee(Long id) → DevoteeDTO method:
  - Find devotee by id or throw NotFoundException
  - Fetch addresses
  - Convert to DTO
  - Return
- [ ] 5.4.5: Implement createDevotee(CreateDevoteeRequest) → DevoteeDTO method:
  - Validate input (legalName required, email format, numeric IDs positive)
  - Sanitize string inputs (trim, HTML escape)
  - Process presentAddress: call AddressService.findOrCreateAddress()
  - Process permanentAddress: call AddressService.findOrCreateAddress()
  - Create Devotee entity with all fields
  - Save devotee
  - Link addresses using AddressService.linkDevoteeAddress() for both present and permanent
  - Return DTO
- [ ] 5.4.6: Implement updateDevotee(Long id, UpdateRequest, userRole, userDistricts) → DevoteeDTO method:
  - Find devotee by id
  - If role=DISTRICT_SUPERVISOR: validate access using DistrictAccessValidator.validateDevoteeAccess()
  - Update provided fields (partial update)
  - If addresses changed, update address links
  - Save devotee
  - Return DTO
- [ ] 5.4.7: Implement upgradeDevoteeStatus(id, newStatusId, notes) method:
  - Find devotee
  - Get previous status
  - Update devotionalStatusId
  - Create StatusHistory record with previousStatus, newStatus, comment=notes
  - Save both
- [ ] 5.4.8: Implement assignLeadership(id, LeadershipRequest) method:
  - Find devotee
  - Validate leadershipRole is valid enum
  - Validate reportingToDevoteeId exists if provided
  - Update leadershipRole, reportingToDevoteeId, hasSystemAccess
  - Save
- [ ] 5.4.9: Implement removeLeadership(Long id) method:
  - Find devotee
  - Set leadershipRole=null, reportingToDevoteeId=null, hasSystemAccess=false
  - Save
- [ ] 5.4.10: Implement linkUserToDevotee(devoteeId, CreateUserRequest) → UserDTO:
  - Validate devotee exists
  - Validate username, password, email
  - Check if devotee already linked to user (unless force=true)
  - Hash password
  - Create User entity with provided role (DISTRICT_SUPERVISOR or OFFICE)
  - Set user.devoteeId = devotee.id
  - Save user
  - Return UserDTO
- [ ] 5.4.11: Implement getAvailableOfficers() → List<DevoteeDTO> method:
  - Query devotees eligible for officer positions (criteria: active, specific status levels)
  - Return list

#### Task 5.5: Namhatta Service
**Status**: NOT_STARTED  
**Prerequisites**: Task 5.4
- [ ] 5.5.1: Create NamhattaService class with @Service annotation
- [ ] 5.5.2: Inject NamhattaRepository, AddressService, NamhattaAddressRepository, DevoteeRepository, NamhattaUpdateRepository, UserRepository
- [ ] 5.5.3: Implement getNamhattas(Pageable, filters) → Page<NamhattaDTO>:
  - Build Specification with filters (search on name/code, country, state, district, status)
  - Apply pagination
  - Fetch namhattas with address
  - Convert to DTOs
  - Return Page
- [ ] 5.5.4: Implement getNamhatta(Long id) → NamhattaDTO:
  - Find by id or throw NotFoundException
  - Fetch address
  - Convert to DTO with address, all position IDs
  - Return
- [ ] 5.5.5: Implement createNamhatta(CreateRequest) → NamhattaDTO:
  - Validate code is unique (throw ConflictException if exists)
  - Validate districtSupervisorId references valid active user with DISTRICT_SUPERVISOR role
  - Validate all senapoti/officer IDs reference valid devotees if provided
  - Process address using AddressService.findOrCreateAddress()
  - Create Namhatta entity with code, name, meetingDay, meetingTime, all position IDs, districtSupervisorId, status=PENDING_APPROVAL (default)
  - Save namhatta
  - Link address using AddressService.linkNamhattaAddress()
  - Return DTO
- [ ] 5.5.6: Implement updateNamhatta(Long id, UpdateRequest) → NamhattaDTO:
  - Find namhatta by id
  - Update provided fields
  - If address changed, update address link
  - Save
  - Return DTO
- [ ] 5.5.7: Implement checkRegistrationNo(String regNo) → boolean:
  - Return namhattaRepository.existsByRegistrationNo(regNo)
- [ ] 5.5.8: Implement approveNamhatta(id, ApproveRequest) method:
  - Find namhatta by id
  - Validate registrationNo is unique (throw ConflictException if exists)
  - Validate registrationNo and registrationDate are provided
  - Update status=APPROVED, set registrationNo and registrationDate
  - Save
- [ ] 5.5.9: Implement rejectNamhatta(id, reason) method:
  - Find namhatta
  - Update status=REJECTED
  - Save (optionally log reason)
- [ ] 5.5.10: Implement getDevoteesByNamhatta(id, Pageable, statusId) → Page<DevoteeDTO>:
  - Find devotees by namhattaId with optional statusId filter
  - Paginate
  - Convert to DTOs
  - Return Page
- [ ] 5.5.11: Implement getNamhattaUpdates(Long id) → List<UpdateDTO>:
  - Find updates by namhattaId ordered by date desc
  - Convert to DTOs
  - Return list
- [ ] 5.5.12: Implement getDevoteeStatusCount(Long id) → Map<String, Integer>:
  - Query devotees by namhattaId grouped by devotionalStatus
  - Count each status
  - Return map of statusName -> count
- [ ] 5.5.13: Implement getStatusHistory(id, Pageable) → Page<StatusHistoryDTO>:
  - Query StatusHistory for devotees in this namhatta
  - Join with devotee info
  - Paginate
  - Return Page

---

### **PHASE 6: SERVICE LAYER - ROLE MANAGEMENT**
**Status**: NOT_STARTED  
**Duration**: 3-4 days  
**Prerequisites**: Phase 5 completed

#### Task 6.1: Role Hierarchy Rules Utility
**Status**: NOT_STARTED  
**Prerequisites**: Task 5.5
- [ ] 6.1.1: Create RoleHierarchyRules utility class (can be @Component or static utility)
- [ ] 6.1.2: Define ROLE_HIERARCHY constant Map with entries for each LeadershipRole:
  - MALA_SENAPOTI: { level: 1, reportsTo: DISTRICT_SUPERVISOR, canPromoteTo: null, canDemoteTo: [MAHA_CHAKRA, CHAKRA, UPA_CHAKRA], manages: [MAHA_CHAKRA] }
  - MAHA_CHAKRA_SENAPOTI: { level: 2, reportsTo: MALA, canPromoteTo: [MALA], canDemoteTo: [CHAKRA, UPA_CHAKRA], manages: [CHAKRA] }
  - CHAKRA_SENAPOTI: { level: 3, reportsTo: MAHA_CHAKRA, canPromoteTo: [MAHA_CHAKRA], canDemoteTo: [UPA_CHAKRA], manages: [UPA_CHAKRA] }
  - UPA_CHAKRA_SENAPOTI: { level: 4, reportsTo: CHAKRA, canPromoteTo: [CHAKRA], canDemoteTo: null, manages: [] }
- [ ] 6.1.3: Implement canPromote(LeadershipRole from, LeadershipRole to) → boolean method:
  - Get hierarchy entry for 'from' role
  - Check if 'to' is in canPromoteTo list
  - Return true/false
- [ ] 6.1.4: Implement canDemote(LeadershipRole from, LeadershipRole to) → boolean method:
  - Get hierarchy entry for 'from' role
  - Check if 'to' is in canDemoteTo list
  - Return true/false
- [ ] 6.1.5: Implement getReportingRole(LeadershipRole role) → LeadershipRole method:
  - Return reportsTo from hierarchy
- [ ] 6.1.6: Implement getManagedRoles(LeadershipRole role) → List<LeadershipRole> method:
  - Return manages list from hierarchy

#### Task 6.2: Role Management Service - Validation
**Status**: NOT_STARTED  
**Prerequisites**: Task 6.1
- [ ] 6.2.1: Create RoleManagementService class with @Service annotation
- [ ] 6.2.2: Inject DevoteeRepository, RoleChangeHistoryRepository, RoleHierarchyRules
- [ ] 6.2.3: Create ValidationResult inner class with fields: isValid (boolean), errors (List<String>), warnings (List<String>)
- [ ] 6.2.4: Implement validateHierarchyChange(currentRole, targetRole, changeType) → ValidationResult:
  - changeType enum: PROMOTE, DEMOTE, REMOVE, REPLACE
  - If REMOVE: validate current role exists
  - If PROMOTE: call RoleHierarchyRules.canPromote(current, target), add error if false
  - If DEMOTE: call RoleHierarchyRules.canDemote(current, target), add error if false
  - Add warnings if applicable
  - Return ValidationResult
- [ ] 6.2.5: Implement checkCircularReference(devoteeId, newReportingId) → boolean:
  - If newReportingId is null, return false (no circular possible)
  - If devoteeId == newReportingId, return true (self-reference)
  - Create visited Set<Long>
  - Start traversal from newReportingId
  - While currentId not null and not in visited:
    - Add currentId to visited
    - If currentId == devoteeId, return true (circular found)
    - Get currentId's reportingToDevoteeId
    - Set currentId to that value
  - Return false (no circular)

#### Task 6.3: Role Management Service - Subordinate Transfer
**Status**: NOT_STARTED  
**Prerequisites**: Task 6.2
- [ ] 6.3.1: Implement getDirectSubordinates(Long devoteeId) → List<Devotee>:
  - Query devoteeRepository.findByReportingToDevoteeId(devoteeId)
  - Return list
- [ ] 6.3.2: Implement validateSubordinateTransfer(fromDevoteeId, toDevoteeId, subordinateIds) → ValidationResult:
  - Get all subordinates of fromDevoteeId
  - Check if all subordinateIds are actually reporting to fromDevoteeId
  - If toDevoteeId provided:
    - Check toDevotee exists and has leadership role
    - For each subordinate, check circular reference with toDevoteeId
  - Add errors/warnings to ValidationResult
  - Return result
- [ ] 6.3.3: Implement transferSubordinates(TransferRequest, userId) → TransferResult:
  - Validate transfer using validateSubordinateTransfer()
  - If invalid, throw ValidationException
  - For each subordinateId:
    - Update devotee.reportingToDevoteeId = toDevoteeId
    - Save devotee
    - Create RoleChangeHistory record with reason, changedBy=userId
  - Return TransferResult with count and updated subordinates

#### Task 6.4: Role Management Service - Promotions/Demotions
**Status**: NOT_STARTED  
**Prerequisites**: Task 6.3
- [ ] 6.4.1: Implement promoteDevotee(PromoteRequest, userId) → RoleChangeResult:
  - Get devotee by id
  - Validate hierarchy allows promotion using validateHierarchyChange(currentRole, targetRole, PROMOTE)
  - Check circular reference for newReportingTo
  - Get subordinates
  - If subordinates exist and role change requires transfer:
    - Transfer subordinates to new supervisor
  - Update devotee: leadershipRole=targetRole, reportingToDevoteeId=newReportingTo
  - Save devotee
  - Create RoleChangeHistory with previousRole, newRole, previousReportingTo, newReportingTo, changedBy=userId, reason="Promotion: " + request.reason, subordinatesTransferred=count
  - Return RoleChangeResult with updated devotee, subordinatesTransferred count, roleChangeRecord
- [ ] 6.4.2: Implement demoteDevotee(DemoteRequest, userId) → RoleChangeResult:
  - Similar to promote but validate demotion is allowed
  - Handle subordinate transfers
  - Update role
  - Create history with reason="Demotion: " + request.reason
  - Return result
- [ ] 6.4.3: Implement removeRole(devoteeId, reason, userId) → RoleChangeResult:
  - Get devotee by id
  - Get all subordinates
  - If subordinates exist, require newSupervisorId in request
  - Transfer all subordinates
  - Update devotee: leadershipRole=null, reportingToDevoteeId=null, hasSystemAccess=false
  - Save
  - Create history with reason="Role Removal: " + reason
  - Return result

#### Task 6.5: Role Management Service - Queries
**Status**: NOT_STARTED  
**Prerequisites**: Task 6.4
- [ ] 6.5.1: Implement getAvailableSupervisors(districtCode, targetRole, excludeIds) → List<DevoteeDTO>:
  - Determine required supervisor role based on targetRole hierarchy
  - Query devotees in districtCode with required leadershipRole
  - Exclude IDs in excludeIds list
  - Convert to DTOs
  - Return list
- [ ] 6.5.2: Implement getDirectSubordinates(Long devoteeId) → List<DevoteeDTO>:
  - Already implemented in 6.3.1, add DTO conversion
  - Return list
- [ ] 6.5.3: Implement getAllSubordinates(Long devoteeId) → List<DevoteeDTO>:
  - Get direct subordinates
  - For each subordinate, recursively get their subordinates
  - Collect all in Set to avoid duplicates
  - Convert to DTOs
  - Return list
- [ ] 6.5.4: Implement getRoleHistory(devoteeId, Pageable) → Page<RoleChangeHistoryDTO>:
  - Query RoleChangeHistoryRepository by devoteeId with pagination
  - Convert to DTOs
  - Return Page

---

### **PHASE 7: SERVICE LAYER - SUPPORTING SERVICES**
**Status**: NOT_STARTED  
**Duration**: 2-3 days  
**Prerequisites**: Phase 6 completed

#### Task 7.1: Dashboard and Report Services
**Status**: NOT_STARTED  
**Prerequisites**: Task 6.5
- [ ] 7.1.1: Create DashboardService class with @Service annotation
- [ ] 7.1.2: Inject DevoteeRepository, NamhattaRepository, NamhattaUpdateRepository
- [ ] 7.1.3: Implement getDashboardSummary(userRole, userDistricts) → DashboardDTO:
  - Count total devotees (filtered by districts if DISTRICT_SUPERVISOR)
  - Count total namhattas (filtered by districts if DISTRICT_SUPERVISOR)
  - Get recent updates (top 10) ordered by date desc
  - Return DashboardDTO with totals and recent updates list
- [ ] 7.1.4: Implement getStatusDistribution(userRole, userDistricts) → List<StatusDistributionDTO>:
  - Query devotees grouped by devotionalStatus
  - Filter by districts if DISTRICT_SUPERVISOR
  - Count each status
  - Return list of {statusName, count}
- [ ] 7.1.5: Create ReportService class with @Service annotation
- [ ] 7.1.6: Inject DevoteeRepository, NamhattaRepository, AddressRepository, DevoteeAddressRepository, NamhattaAddressRepository
- [ ] 7.1.7: Implement getHierarchicalReports(userRole, userDistricts) → HierarchicalReportDTO:
  - Aggregate devotee and namhatta counts by country, state, district
  - Filter by userDistricts if DISTRICT_SUPERVISOR
  - Build hierarchical structure
  - Return nested structure
- [ ] 7.1.8: Implement getAllStatesWithCounts(userRole, userDistricts) → List<StateReportDTO>:
  - Query distinct states from devotee/namhatta addresses
  - For each state, count devotees and namhattas
  - Filter by userDistricts if DISTRICT_SUPERVISOR
  - Return list
- [ ] 7.1.9: Implement getDistrictsByState(state, userRole, userDistricts) → List<DistrictReportDTO>:
  - Query districts in given state
  - Count devotees and namhattas per district
  - Filter by userDistricts if DISTRICT_SUPERVISOR
  - Return list
- [ ] 7.1.10: Implement getSubDistrictsByDistrict(state, district, userRole, userDistricts) → List<SubDistrictReportDTO>:
  - Query sub-districts in given state and district
  - Count devotees and namhattas
  - Filter by userDistricts if DISTRICT_SUPERVISOR
  - Return list
- [ ] 7.1.11: Implement getVillagesBySubDistrict(state, district, subDistrict, userRole, userDistricts) → List<VillageReportDTO>:
  - Query villages in given location
  - Count devotees and namhattas
  - Filter by userDistricts if DISTRICT_SUPERVISOR
  - Return list

#### Task 7.2: Map Data Service
**Status**: NOT_STARTED  
**Prerequisites**: Task 7.1
- [ ] 7.2.1: Create MapDataService class with @Service annotation
- [ ] 7.2.2: Inject NamhattaRepository, NamhattaAddressRepository, AddressRepository
- [ ] 7.2.3: Implement getNamhattaCountsByCountry() → List<CountryCountDTO>:
  - Query namhattas joined with addresses
  - Group by country
  - Count namhattas per country
  - Return list of {country, count}
- [ ] 7.2.4: Implement getNamhattaCountsByState() → List<StateCountDTO>:
  - Group by state
  - Count namhattas
  - Return list
- [ ] 7.2.5: Implement getNamhattaCountsByDistrict() → List<DistrictCountDTO>:
  - Group by district
  - Count namhattas
  - Return list with {districtCode, districtName, count}
- [ ] 7.2.6: Implement getNamhattaCountsBySubDistrict() → List<SubDistrictCountDTO>
- [ ] 7.2.7: Implement getNamhattaCountsByVillage() → List<VillageCountDTO>

#### Task 7.3: Simple CRUD Services
**Status**: NOT_STARTED  
**Prerequisites**: Task 7.2
- [ ] 7.3.1: Create DevotionalStatusService class with @Service annotation
- [ ] 7.3.2: Inject DevotionalStatusRepository
- [ ] 7.3.3: Implement getAllStatuses(), createStatus(name), renameStatus(id, newName) methods
- [ ] 7.3.4: Create GurudevService class with @Service annotation
- [ ] 7.3.5: Inject GurudevRepository
- [ ] 7.3.6: Implement getAllGurudevs(), createGurudev(name, title) methods
- [ ] 7.3.7: Create ShraddhakutirService class with @Service annotation
- [ ] 7.3.8: Inject ShraddhakutirRepository
- [ ] 7.3.9: Implement getAllShraddhakutirs(), getByDistrictCode(district), createShraddhakutir(name, districtCode) methods
- [ ] 7.3.10: Create NamhattaUpdateService class with @Service annotation
- [ ] 7.3.11: Inject NamhattaUpdateRepository
- [ ] 7.3.12: Implement createUpdate(NamhattaUpdateRequest), getAllUpdates(), getByNamhatta(id) methods
- [ ] 7.3.13: Create HierarchyService class with @Service annotation
- [ ] 7.3.14: Inject LeaderRepository
- [ ] 7.3.15: Implement getTopLevelLeaders() (where reportingTo is null), getLeadersByLevel(role) methods

#### Task 7.4: Validation and Utility Classes
**Status**: NOT_STARTED  
**Prerequisites**: Task 7.3
- [ ] 7.4.1: Create ValidationUtils utility class
- [ ] 7.4.2: Implement validateEmail(String email) method - regex pattern check
- [ ] 7.4.3: Implement validatePhone(String phone) method - basic format check
- [ ] 7.4.4: Implement validatePassword(String password) method - min 8, uppercase, lowercase, number
- [ ] 7.4.5: Implement validateUsername(String username) method - alphanumeric + underscore, 3-50 chars
- [ ] 7.4.6: Implement sanitizeInput(String input) method - HTML escape, trim whitespace
- [ ] 7.4.7: Create DateUtils utility class
- [ ] 7.4.8: Implement formatDate, parseDate methods for consistent date handling
- [ ] 7.4.9: Create JsonUtils utility class (if needed)
- [ ] 7.4.10: Implement methods to handle JSONB fields (devotionalCourses, imageUrls, location)

---

### **PHASE 8: CONTROLLER LAYER**
**Status**: NOT_STARTED  
**Duration**: 4-5 days  
**Prerequisites**: Phase 7 completed

#### Task 8.1: DTOs and Request/Response Objects
**Status**: NOT_STARTED  
**Prerequisites**: Task 7.4
- [ ] 8.1.1: Create LoginRequest DTO (username, password)
- [ ] 8.1.2: Create LoginResponse DTO (user: UserDTO)
- [ ] 8.1.3: Create UserDTO (id, username, fullName, email, role, districts, isActive)
- [ ] 8.1.4: Create RegisterSupervisorRequest DTO with validation annotations
- [ ] 8.1.5: Create DevoteeDTO with all fields including presentAddress and permanentAddress
- [ ] 8.1.6: Create CreateDevoteeRequest and UpdateDevoteeRequest DTOs
- [ ] 8.1.7: Create NamhattaDTO with address and all position fields
- [ ] 8.1.8: Create CreateNamhattaRequest and UpdateNamhattaRequest DTOs
- [ ] 8.1.9: Create ApproveNamhattaRequest DTO (registrationNo, registrationDate)
- [ ] 8.1.10: Create PromoteDevoteeRequest, DemoteDevoteeRequest, RemoveRoleRequest DTOs
- [ ] 8.1.11: Create TransferSubordinatesRequest DTO
- [ ] 8.1.12: Add JSR-303 validation annotations (@NotNull, @NotBlank, @Email, @Size, @Pattern) to all request DTOs
- [ ] 8.1.13: Create custom validators for complex fields (password, leadership role)
- [ ] 8.1.14: Setup ModelMapper bean for entity-DTO conversion
- [ ] 8.1.15: Create mapper methods in a MapperUtil class

#### Task 8.2: Authentication Controller
**Status**: NOT_STARTED  
**Prerequisites**: Task 8.1
- [ ] 8.2.1: Create AuthController class with @RestController and @RequestMapping("/api/auth")
- [ ] 8.2.2: Inject AuthenticationService
- [ ] 8.2.3: Implement POST /login endpoint:
  - Accept @Valid @RequestBody LoginRequest
  - Call authenticationService.login()
  - Create ResponseCookie for JWT (name="auth_token", httpOnly=true, secure=true in prod, sameSite=Strict, maxAge=1 hour)
  - Add cookie to response headers
  - Return ResponseEntity with UserDTO
- [ ] 8.2.4: Implement POST /logout endpoint:
  - Extract JWT from cookie using @CookieValue("auth_token")
  - Call authenticationService.logout(token)
  - Create expired cookie to clear it
  - Return success message
- [ ] 8.2.5: Implement GET /verify endpoint:
  - Extract JWT from cookie
  - Call authenticationService.verifyToken(token)
  - Return UserInfo
  - Handle 401 for invalid/expired tokens
- [ ] 8.2.6: Implement GET /user-districts endpoint:
  - Get authenticated user from SecurityContext (Authentication.getPrincipal())
  - Call userService.getUserDistricts(userId)
  - Return list of {code, name}

#### Task 8.3: System and Geography Controllers
**Status**: NOT_STARTED  
**Prerequisites**: Task 8.2
- [ ] 8.3.1: Create SystemController class with @RestController
- [ ] 8.3.2: Implement GET /api/health endpoint (no auth):
  - Return {status: "OK"}
- [ ] 8.3.3: Implement GET /api/about endpoint (no auth):
  - Return {name: "Namhatta Management System", version: "1.0.0", description: "..."}
- [ ] 8.3.4: Create GeographyController class with @RestController and @RequestMapping("/api")
- [ ] 8.3.5: Inject AddressService
- [ ] 8.3.6: Implement GET /countries endpoint (no auth):
  - Call addressService.getCountries()
  - Return List<String>
- [ ] 8.3.7: Implement GET /states endpoint with @RequestParam(required=false) country:
  - Call addressService.getStates(country)
  - Return List<String>
- [ ] 8.3.8: Implement GET /districts endpoint with @RequestParam(required=false) state
- [ ] 8.3.9: Implement GET /sub-districts endpoint with @RequestParam district, pincode
- [ ] 8.3.10: Implement GET /villages endpoint with @RequestParam subDistrict, pincode
- [ ] 8.3.11: Implement GET /pincodes endpoint with @RequestParam village, district, subDistrict
- [ ] 8.3.12: Implement GET /pincodes/search endpoint (no auth):
  - Accept @RequestParam country (required), search, page (default 1), limit (default 25, max 100)
  - Call addressService.searchPincodes()
  - Return {pincodes: [], total: number, hasMore: boolean}
- [ ] 8.3.13: Implement GET /address-by-pincode endpoint (no auth):
  - Accept @RequestParam pincode (required, 6 digits)
  - Call addressService.getAddressByPincode()
  - Return {country, state, district, subDistricts: [], villages: []}

#### Task 8.4: Devotee Controller
**Status**: NOT_STARTED  
**Prerequisites**: Task 8.3
- [ ] 8.4.1: Create DevoteeController class with @RestController and @RequestMapping("/api/devotees")
- [ ] 8.4.2: Inject DevoteeService
- [ ] 8.4.3: Implement GET / endpoint:
  - Add @PreAuthorize("isAuthenticated()")
  - Accept Pageable, @RequestParam filters (search, country, state, district, statusId)
  - Get user role and districts from SecurityContext
  - Call devoteeService.getDevotees(pageable, filters, userRole, userDistricts)
  - Return Page<DevoteeDTO>
- [ ] 8.4.4: Implement GET /:id endpoint:
  - Add @PreAuthorize("isAuthenticated()")
  - Call devoteeService.getDevotee(id)
  - Return DevoteeDTO
- [ ] 8.4.5: Implement POST / endpoint:
  - Add @PreAuthorize("hasAnyRole('ADMIN', 'OFFICE')")
  - Accept @Valid @RequestBody CreateDevoteeRequest
  - Call devoteeService.createDevotee(request)
  - Return 201 Created with DevoteeDTO
- [ ] 8.4.6: Implement POST /:namhattaId endpoint:
  - Add @PreAuthorize("hasAnyRole('ADMIN', 'OFFICE')")
  - Accept namhattaId from path, request body
  - Set request.namhattaId = namhattaId
  - Call devoteeService.createDevotee(request)
  - Return 201 Created
- [ ] 8.4.7: Implement PUT /:id endpoint:
  - Add @PreAuthorize("hasAnyRole('ADMIN', 'OFFICE', 'DISTRICT_SUPERVISOR')")
  - Accept @PathVariable id, @Valid @RequestBody UpdateDevoteeRequest
  - Get user role and districts from SecurityContext
  - Call devoteeService.updateDevotee(id, request, userRole, userDistricts)
  - Return DevoteeDTO
  - Handle 403 if DISTRICT_SUPERVISOR lacks access
- [ ] 8.4.8: Implement POST /:id/upgrade-status endpoint:
  - Add @PreAuthorize("hasAnyRole('ADMIN', 'OFFICE')")
  - Accept @RequestBody {newStatusId, notes}
  - Call devoteeService.upgradeDevoteeStatus(id, newStatusId, notes)
  - Return success message
- [ ] 8.4.9: Implement POST /:id/assign-leadership endpoint:
  - Add @PreAuthorize("hasAnyRole('ADMIN', 'OFFICE')")
  - Accept @RequestBody LeadershipRequest (leadershipRole, reportingToDevoteeId, hasSystemAccess)
  - Call devoteeService.assignLeadership(id, request)
  - Return success message
- [ ] 8.4.10: Implement DELETE /:id/leadership endpoint:
  - Add @PreAuthorize("hasAnyRole('ADMIN', 'OFFICE')")
  - Call devoteeService.removeLeadership(id)
  - Return success message
- [ ] 8.4.11: Implement POST /:id/link-user endpoint (create user for devotee):
  - Add @PreAuthorize("hasRole('ADMIN')")
  - Accept @RequestBody CreateUserRequest (username, password, email, role, force)
  - Call devoteeService.linkUserToDevotee(id, request)
  - Return 201 Created with UserDTO
- [ ] 8.4.12: Implement GET /available-officers endpoint:
  - Add @PreAuthorize("isAuthenticated()")
  - Call devoteeService.getAvailableOfficers()
  - Return List<DevoteeDTO>

#### Task 8.5: Namhatta Controller
**Status**: NOT_STARTED  
**Prerequisites**: Task 8.4
- [ ] 8.5.1: Create NamhattaController class with @RestController and @RequestMapping("/api/namhattas")
- [ ] 8.5.2: Inject NamhattaService
- [ ] 8.5.3: Implement GET / endpoint (NO AUTH REQUIRED):
  - Accept Pageable, @RequestParam filters (search, country, state, district, status)
  - Call namhattaService.getNamhattas(pageable, filters)
  - Return Page<NamhattaDTO>
- [ ] 8.5.4: Implement GET /:id endpoint (NO AUTH REQUIRED):
  - Call namhattaService.getNamhatta(id)
  - Return NamhattaDTO
- [ ] 8.5.5: Implement POST / endpoint:
  - Add @PreAuthorize("hasAnyRole('ADMIN', 'OFFICE')")
  - Accept @Valid @RequestBody CreateNamhattaRequest
  - Call namhattaService.createNamhatta(request)
  - Return 201 Created with NamhattaDTO
  - Handle 409 Conflict if code already exists
- [ ] 8.5.6: Implement PUT /:id endpoint:
  - Add @PreAuthorize("hasAnyRole('ADMIN', 'OFFICE')")
  - Accept @PathVariable id, @Valid @RequestBody UpdateNamhattaRequest
  - Call namhattaService.updateNamhatta(id, request)
  - Return NamhattaDTO
- [ ] 8.5.7: Implement GET /check-registration/:registrationNo endpoint:
  - Add @PreAuthorize("hasAnyRole('ADMIN', 'OFFICE')")
  - Call namhattaService.checkRegistrationNo(registrationNo)
  - Return {exists: boolean}
- [ ] 8.5.8: Implement POST /:id/approve endpoint:
  - Add @PreAuthorize("hasAnyRole('ADMIN', 'OFFICE')")
  - Accept @RequestBody ApproveNamhattaRequest (registrationNo, registrationDate)
  - Call namhattaService.approveNamhatta(id, request)
  - Return success message
  - Handle 400 if registrationNo already exists
- [ ] 8.5.9: Implement POST /:id/reject endpoint:
  - Add @PreAuthorize("hasAnyRole('ADMIN', 'OFFICE')")
  - Accept @RequestBody {reason} (optional)
  - Call namhattaService.rejectNamhatta(id, reason)
  - Return success message
- [ ] 8.5.10: Implement GET /:id/devotees endpoint (NO AUTH REQUIRED):
  - Accept @PathVariable id, Pageable, @RequestParam statusId
  - Call namhattaService.getDevoteesByNamhatta(id, pageable, statusId)
  - Return Page<DevoteeDTO>
- [ ] 8.5.11: Implement GET /:id/updates endpoint (NO AUTH REQUIRED):
  - Call namhattaService.getNamhattaUpdates(id)
  - Return List<UpdateDTO>
- [ ] 8.5.12: Implement GET /:id/devotee-status-count endpoint (NO AUTH REQUIRED):
  - Call namhattaService.getDevoteeStatusCount(id)
  - Return Map<String, Integer>
- [ ] 8.5.13: Implement GET /:id/status-history endpoint (NO AUTH REQUIRED):
  - Accept Pageable
  - Call namhattaService.getStatusHistory(id, pageable)
  - Return Page<StatusHistoryDTO>

#### Task 8.6: Senapoti Role Management Controller
**Status**: NOT_STARTED  
**Prerequisites**: Task 8.5
- [ ] 8.6.1: Create SenapotiController class with @RestController and @RequestMapping("/api/senapoti")
- [ ] 8.6.2: Inject RoleManagementService
- [ ] 8.6.3: Implement POST /transfer-subordinates endpoint:
  - Add @PreAuthorize("hasAnyRole('ADMIN', 'DISTRICT_SUPERVISOR')")
  - Accept @Valid @RequestBody TransferSubordinatesRequest
  - Get userId from SecurityContext
  - Call roleManagementService.transferSubordinates(request, userId)
  - Return TransferResult
- [ ] 8.6.4: Implement POST /promote endpoint:
  - Add @PreAuthorize("hasAnyRole('ADMIN', 'DISTRICT_SUPERVISOR')")
  - Accept @Valid @RequestBody PromoteDevoteeRequest
  - Get userId from SecurityContext
  - Call roleManagementService.promoteDevotee(request, userId)
  - Return RoleChangeResult
- [ ] 8.6.5: Implement POST /demote endpoint:
  - Add @PreAuthorize("hasAnyRole('ADMIN', 'DISTRICT_SUPERVISOR')")
  - Accept @Valid @RequestBody DemoteDevoteeRequest
  - Get userId from SecurityContext
  - Call roleManagementService.demoteDevotee(request, userId)
  - Return RoleChangeResult
- [ ] 8.6.6: Implement POST /remove-role endpoint:
  - Add @PreAuthorize("hasAnyRole('ADMIN', 'DISTRICT_SUPERVISOR')")
  - Accept @Valid @RequestBody RemoveRoleRequest
  - Get userId from SecurityContext
  - Call roleManagementService.removeRole(request.devoteeId, request.reason, userId)
  - Return RoleChangeResult
- [ ] 8.6.7: Implement GET /available-supervisors/:districtCode/:targetRole endpoint:
  - Add @PreAuthorize("hasAnyRole('ADMIN', 'DISTRICT_SUPERVISOR')")
  - Accept @PathVariable districtCode, targetRole, @RequestParam(required=false) excludeIds
  - Call roleManagementService.getAvailableSupervisors(districtCode, targetRole, excludeIds)
  - Return List<DevoteeDTO>
- [ ] 8.6.8: Implement GET /subordinates/:devoteeId endpoint:
  - Add @PreAuthorize("hasAnyRole('ADMIN', 'DISTRICT_SUPERVISOR')")
  - Call roleManagementService.getDirectSubordinates(devoteeId)
  - Return {devoteeId, subordinates: [], count}
- [ ] 8.6.9: Implement GET /subordinates/:devoteeId/all endpoint:
  - Add @PreAuthorize("hasAnyRole('ADMIN', 'DISTRICT_SUPERVISOR')")
  - Call roleManagementService.getAllSubordinates(devoteeId)
  - Return {devoteeId, allSubordinates: [], count}
- [ ] 8.6.10: Implement GET /role-history/:devoteeId endpoint:
  - Add @PreAuthorize("hasAnyRole('ADMIN', 'DISTRICT_SUPERVISOR')")
  - Accept Pageable
  - Call roleManagementService.getRoleHistory(devoteeId, pageable)
  - Return Page<RoleChangeHistoryDTO>

#### Task 8.7: Admin Controller
**Status**: NOT_STARTED  
**Prerequisites**: Task 8.6
- [ ] 8.7.1: Create AdminController class with @RestController and @RequestMapping("/api/admin")
- [ ] 8.7.2: Inject UserService
- [ ] 8.7.3: Implement POST /register-supervisor endpoint:
  - Add @PreAuthorize("hasRole('ADMIN')")
  - Accept @Valid @RequestBody RegisterSupervisorRequest (username, password, email, fullName, districts: [{code, name}])
  - Call userService.createDistrictSupervisor(request)
  - Return 201 Created with UserDTO
- [ ] 8.7.4: Implement GET /users endpoint:
  - Add @PreAuthorize("hasRole('ADMIN')")
  - Call userService.getAllUsers()
  - Return List<UserDTO>
- [ ] 8.7.5: Implement GET /available-districts endpoint:
  - Add @PreAuthorize("hasRole('ADMIN')")
  - Call userService.getAvailableDistricts()
  - Return List<DistrictDTO>
- [ ] 8.7.6: Implement PUT /users/:id endpoint:
  - Add @PreAuthorize("hasRole('ADMIN')")
  - Accept @PathVariable id, @Valid @RequestBody UpdateUserRequest
  - Call userService.updateUser(id, request)
  - Return UserDTO
- [ ] 8.7.7: Implement DELETE /users/:id endpoint:
  - Add @PreAuthorize("hasRole('ADMIN')")
  - Call userService.deactivateUser(id)
  - Return success message

#### Task 8.8: District Supervisor Controller
**Status**: NOT_STARTED  
**Prerequisites**: Task 8.7
- [ ] 8.8.1: Create DistrictSupervisorController class with @RestController and @RequestMapping("/api/district-supervisors")
- [ ] 8.8.2: Inject UserService, UserDistrictRepository
- [ ] 8.8.3: Implement GET /all endpoint:
  - Add @PreAuthorize("isAuthenticated()")
  - Query all users with role=DISTRICT_SUPERVISOR
  - Include their linked devotee info
  - Return List<DistrictSupervisorDTO>
- [ ] 8.8.4: Implement GET / endpoint (with ?district query param):
  - Add @PreAuthorize("isAuthenticated()")
  - Accept @RequestParam(required=true) district
  - Query UserDistrict by districtCode
  - Get users with role=DISTRICT_SUPERVISOR
  - Return List<DistrictSupervisorDTO>
- [ ] 8.8.5: Implement GET /user/address-defaults endpoint:
  - Add @PreAuthorize("isAuthenticated()")
  - Get userId from SecurityContext
  - If role=DISTRICT_SUPERVISOR:
    - Get first assigned district
    - Query address info for that district
    - Return {country, state, district}
  - Else return {country: null, state: null, district: null}

#### Task 8.9: Dashboard and Report Controllers
**Status**: NOT_STARTED  
**Prerequisites**: Task 8.8
- [ ] 8.9.1: Create DashboardController class with @RestController and @RequestMapping("/api")
- [ ] 8.9.2: Inject DashboardService
- [ ] 8.9.3: Implement GET /dashboard endpoint:
  - Add @PreAuthorize("isAuthenticated()")
  - Get user role and districts from SecurityContext
  - Call dashboardService.getDashboardSummary(userRole, userDistricts)
  - Return {totalDevotees, totalNamhattas, recentUpdates: []}
- [ ] 8.9.4: Implement GET /status-distribution endpoint:
  - Add @PreAuthorize("isAuthenticated()")
  - Get user role and districts from SecurityContext
  - Call dashboardService.getStatusDistribution(userRole, userDistricts)
  - Return List<{statusName, count}>
- [ ] 8.9.5: Create ReportController class with @RestController and @RequestMapping("/api/reports")
- [ ] 8.9.6: Inject ReportService
- [ ] 8.9.7: Implement GET /hierarchical endpoint:
  - Add @PreAuthorize("hasAnyRole('ADMIN', 'OFFICE', 'DISTRICT_SUPERVISOR')")
  - Get user role and districts from SecurityContext
  - Call reportService.getHierarchicalReports(userRole, userDistricts)
  - Add Cache-Control: no-cache headers
  - Return hierarchical report structure
- [ ] 8.9.8: Implement GET /states endpoint:
  - Add @PreAuthorize("hasAnyRole('ADMIN', 'OFFICE', 'DISTRICT_SUPERVISOR')")
  - Get user context
  - Call reportService.getAllStatesWithCounts(userRole, userDistricts)
  - Return List<StateReportDTO>
- [ ] 8.9.9: Implement GET /districts/:state endpoint:
  - Add @PreAuthorize("hasAnyRole('ADMIN', 'OFFICE', 'DISTRICT_SUPERVISOR')")
  - Get user context
  - Call reportService.getDistrictsByState(state, userRole, userDistricts)
  - Return List<DistrictReportDTO>
- [ ] 8.9.10: Implement GET /sub-districts/:state/:district endpoint:
  - Add @PreAuthorize("hasAnyRole('ADMIN', 'OFFICE', 'DISTRICT_SUPERVISOR')")
  - Get user context
  - Call reportService.getSubDistrictsByDistrict(state, district, userRole, userDistricts)
  - Return List<SubDistrictReportDTO>
- [ ] 8.9.11: Implement GET /villages/:state/:district/:subdistrict endpoint:
  - Add @PreAuthorize("hasAnyRole('ADMIN', 'OFFICE', 'DISTRICT_SUPERVISOR')")
  - Get user context
  - Call reportService.getVillagesBySubDistrict(state, district, subdistrict, userRole, userDistricts)
  - Return List<VillageReportDTO>

#### Task 8.10: Map Data Controller
**Status**: NOT_STARTED  
**Prerequisites**: Task 8.9
- [ ] 8.10.1: Create MapDataController class with @RestController and @RequestMapping("/api/map")
- [ ] 8.10.2: Inject MapDataService
- [ ] 8.10.3: Implement GET /countries endpoint (NO AUTH):
  - Call mapDataService.getNamhattaCountsByCountry()
  - Return List<{country, count}>
- [ ] 8.10.4: Implement GET /states endpoint (NO AUTH):
  - Call mapDataService.getNamhattaCountsByState()
  - Return List<{state, count}>
- [ ] 8.10.5: Implement GET /districts endpoint (NO AUTH):
  - Call mapDataService.getNamhattaCountsByDistrict()
  - Return List<{districtCode, districtName, count}>
- [ ] 8.10.6: Implement GET /sub-districts endpoint (NO AUTH):
  - Call mapDataService.getNamhattaCountsBySubDistrict()
  - Return List<{subDistrict, count}>
- [ ] 8.10.7: Implement GET /villages endpoint (NO AUTH):
  - Call mapDataService.getNamhattaCountsByVillage()
  - Return List<{village, count}>

#### Task 8.11: Supporting CRUD Controllers
**Status**: NOT_STARTED  
**Prerequisites**: Task 8.10
- [ ] 8.11.1: Create DevotionalStatusController with @RestController and @RequestMapping("/api/statuses")
- [ ] 8.11.2: Implement GET /, POST /, POST /:id/rename endpoints for DevotionalStatus
- [ ] 8.11.3: Create GurudevController with @RestController and @RequestMapping("/api/gurudevs")
- [ ] 8.11.4: Implement GET /, POST / endpoints for Gurudev
- [ ] 8.11.5: Create ShraddhakutirController with @RestController and @RequestMapping("/api/shraddhakutirs")
- [ ] 8.11.6: Implement GET / (with ?district filter), POST / endpoints for Shraddhakutir
- [ ] 8.11.7: Create NamhattaUpdateController with @RestController and @RequestMapping("/api/updates")
- [ ] 8.11.8: Implement POST /, GET /all endpoints for NamhattaUpdate
- [ ] 8.11.9: Create HierarchyController with @RestController and @RequestMapping("/api/hierarchy")
- [ ] 8.11.10: Implement GET / (top-level), GET /:level endpoints for Leader hierarchy

---

### **PHASE 9: EXCEPTION HANDLING & VALIDATION**
**Status**: NOT_STARTED  
**Duration**: 1 day  
**Prerequisites**: Phase 8 completed

#### Task 9.1: Global Exception Handler
**Status**: NOT_STARTED  
**Prerequisites**: Task 8.11
- [ ] 9.1.1: Create GlobalExceptionHandler class with @ControllerAdvice
- [ ] 9.1.2: Create ErrorResponse DTO (error: string, details: string, timestamp: LocalDateTime)
- [ ] 9.1.3: Add @ExceptionHandler for NotFoundException:
  - Return 404 with ErrorResponse
- [ ] 9.1.4: Add @ExceptionHandler for ConflictException (unique constraint violations):
  - Return 409 with ErrorResponse
- [ ] 9.1.5: Add @ExceptionHandler for ValidationException:
  - Return 400 with ErrorResponse
- [ ] 9.1.6: Add @ExceptionHandler for MethodArgumentNotValidException (JSR-303 validation failures):
  - Extract field errors
  - Return 400 with list of validation errors
- [ ] 9.1.7: Add @ExceptionHandler for AccessDeniedException:
  - Return 403 with ErrorResponse
- [ ] 9.1.8: Add @ExceptionHandler for BadCredentialsException:
  - Return 401 with ErrorResponse
- [ ] 9.1.9: Add @ExceptionHandler for generic Exception:
  - Log error with stack trace
  - Return 500 with generic "Internal server error" (don't expose details)

#### Task 9.2: Custom Exceptions
**Status**: NOT_STARTED  
**Prerequisites**: Task 9.1
- [ ] 9.2.1: Create NotFoundException extends RuntimeException
- [ ] 9.2.2: Create ConflictException extends RuntimeException
- [ ] 9.2.3: Create ValidationException extends RuntimeException
- [ ] 9.2.4: Create CircularReferenceException extends ValidationException
- [ ] 9.2.5: Create InsufficientPermissionException extends RuntimeException
- [ ] 9.2.6: Use these exceptions throughout service layer instead of generic RuntimeException

#### Task 9.3: Input Validation and Sanitization
**Status**: NOT_STARTED  
**Prerequisites**: Task 9.2
- [ ] 9.3.1: Create @ValidPassword custom annotation with validator
- [ ] 9.3.2: Create @ValidUsername custom annotation with validator
- [ ] 9.3.3: Create @ValidLeadershipRole custom annotation
- [ ] 9.3.4: Apply custom annotations to request DTOs
- [ ] 9.3.5: Create InputSanitizerAspect with @Aspect
- [ ] 9.3.6: Add @Before advice on controller methods to sanitize string inputs:
  - Trim whitespace
  - HTML escape using OWASP library or custom implementation
- [ ] 9.3.7: Test sanitization with sample payloads

---

### **PHASE 10: TESTING**
**Status**: NOT_STARTED  
**Duration**: 3-4 days  
**Prerequisites**: Phase 9 completed

#### Task 10.1: Unit Tests - Service Layer
**Status**: NOT_STARTED  
**Prerequisites**: Task 9.3
- [ ] 10.1.1: Setup test dependencies (JUnit 5, Mockito, AssertJ)
- [ ] 10.1.2: Create AuthenticationServiceTest:
  - Test successful login
  - Test login with invalid credentials
  - Test logout
  - Test token verification
- [ ] 10.1.3: Create DevoteeServiceTest:
  - Test create devotee
  - Test update devotee with district access check
  - Test get devotees with pagination
  - Test upgrade status
- [ ] 10.1.4: Create RoleManagementServiceTest:
  - Test promotion validation
  - Test demotion validation
  - Test circular reference detection
  - Test subordinate transfer
- [ ] 10.1.5: Create NamhattaServiceTest:
  - Test create namhatta with unique code
  - Test approval workflow
  - Test rejection

#### Task 10.2: Integration Tests - API Layer
**Status**: NOT_STARTED  
**Prerequisites**: Task 10.1
- [ ] 10.2.1: Setup @SpringBootTest with @AutoConfigureMockMvc
- [ ] 10.2.2: Create AuthControllerIntegrationTest:
  - Test POST /api/auth/login
  - Test POST /api/auth/logout
  - Test GET /api/auth/verify
- [ ] 10.2.3: Create DevoteeControllerIntegrationTest:
  - Test GET /api/devotees with pagination
  - Test POST /api/devotees (ADMIN/OFFICE only)
  - Test PUT /api/devotees/:id with district access
- [ ] 10.2.4: Create NamhattaControllerIntegrationTest:
  - Test GET /api/namhattas (public)
  - Test POST /api/namhattas (auth required)
  - Test approval endpoints
- [ ] 10.2.5: Create SenapotiControllerIntegrationTest:
  - Test promote endpoint
  - Test demote endpoint
  - Test transfer subordinates
- [ ] 10.2.6: Use @WithMockUser to simulate different roles in tests

#### Task 10.3: Security Tests
**Status**: NOT_STARTED  
**Prerequisites**: Task 10.2
- [ ] 10.3.1: Test JWT filter with valid token
- [ ] 10.3.2: Test JWT filter with blacklisted token
- [ ] 10.3.3: Test JWT filter with expired token
- [ ] 10.3.4: Test session validation with mismatched sessionToken
- [ ] 10.3.5: Test role-based authorization with @PreAuthorize
- [ ] 10.3.6: Test district access validation for DISTRICT_SUPERVISOR

#### Task 10.4: Database Tests
**Status**: NOT_STARTED  
**Prerequisites**: Task 10.3
- [ ] 10.4.1: Setup @DataJpaTest for repository layer tests
- [ ] 10.4.2: Test DevoteeRepository custom queries
- [ ] 10.4.3: Test NamhattaRepository unique constraints
- [ ] 10.4.4: Test Address exact match query
- [ ] 10.4.5: Test RoleChangeHistory queries
- [ ] 10.4.6: Use H2 in-memory database for tests or Testcontainers with PostgreSQL

---

### **PHASE 11: CONFIGURATION & DEPLOYMENT PREP**
**Status**: NOT_STARTED  
**Duration**: 1-2 days  
**Prerequisites**: Phase 10 completed

#### Task 11.1: Environment Configuration
**Status**: NOT_STARTED  
**Prerequisites**: Task 10.4
- [ ] 11.1.1: Configure application-dev.properties:
  - Set logging.level.root=INFO
  - Set logging.level.com.namhatta=DEBUG
  - Set spring.jpa.show-sql=true
  - Set server.port=5000
- [ ] 11.1.2: Configure application-prod.properties:
  - Set logging.level.root=WARN
  - Set logging.level.com.namhatta=INFO
  - Set spring.jpa.show-sql=false
  - Disable dev endpoints
- [ ] 11.1.3: Externalize sensitive config to environment variables:
  - DATABASE_URL, DB_USERNAME, DB_PASSWORD
  - JWT_SECRET
- [ ] 11.1.4: Add validation for required environment variables at startup

#### Task 11.2: CORS and Security Headers
**Status**: NOT_STARTED  
**Prerequisites**: Task 11.1
- [ ] 11.2.1: Configure CORS in SecurityConfig:
  - Allow credentials
  - Allowed origins: same-origin + configured domains
  - Allowed methods: GET, POST, PUT, DELETE, PATCH
  - Allowed headers: Content-Type, Authorization, X-Requested-With, Cache-Control
  - Max age: 86400 (24 hours)
- [ ] 11.2.2: Add security headers in SecurityConfig:
  - X-Content-Type-Options: nosniff
  - X-Frame-Options: DENY
  - X-XSS-Protection: 1; mode=block
  - Content-Security-Policy (appropriate for app)

#### Task 11.3: Rate Limiting
**Status**: NOT_STARTED  
**Prerequisites**: Task 11.2
- [ ] 11.3.1: Add Bucket4j or similar rate limiting library dependency
- [ ] 11.3.2: Create RateLimitFilter for login endpoint:
  - 5 requests per 15 minutes per IP
  - Return 429 Too Many Requests if exceeded
- [ ] 11.3.3: Create RateLimitFilter for data modification endpoints:
  - 10 requests per minute per IP
  - Apply to POST, PUT, DELETE methods

#### Task 11.4: Logging and Monitoring
**Status**: NOT_STARTED  
**Prerequisites**: Task 11.3
- [ ] 11.4.1: Configure logback-spring.xml with:
  - Console appender for dev
  - File appender for prod (rolling files)
  - JSON format for structured logging (optional)
- [ ] 11.4.2: Add request/response logging filter:
  - Log method, path, status code, duration for /api/** requests
  - Truncate long responses (max 80 chars)
- [ ] 11.4.3: Add MDC (Mapped Diagnostic Context) for userId in requests
- [ ] 11.4.4: Setup health check actuator endpoints (optional):
  - /actuator/health
  - /actuator/info

#### Task 11.5: Documentation
**Status**: NOT_STARTED  
**Prerequisites**: Task 11.4
- [ ] 11.5.1: Add SpringDoc OpenAPI dependency (springdoc-openapi-starter-webmvc-ui)
- [ ] 11.5.2: Configure OpenAPI info (title, version, description)
- [ ] 11.5.3: Add @Operation and @ApiResponse annotations to key endpoints
- [ ] 11.5.4: Group endpoints by tag (@Tag annotation on controllers)
- [ ] 11.5.5: Access Swagger UI at /swagger-ui.html for API documentation

---

### **PHASE 12: MIGRATION VALIDATION & CUTOVER**
**Status**: NOT_STARTED  
**Duration**: 2-3 days  
**Prerequisites**: Phase 11 completed

#### Task 12.1: API Contract Validation
**Status**: NOT_STARTED  
**Prerequisites**: Task 11.5
- [ ] 12.1.1: Create comparison checklist of all Node.js endpoints vs Spring Boot endpoints
- [ ] 12.1.2: Validate request/response formats match exactly for each endpoint
- [ ] 12.1.3: Test with actual frontend application
- [ ] 12.1.4: Validate error responses match expected formats
- [ ] 12.1.5: Check cookie handling (JWT in auth_token cookie)

#### Task 12.2: Data Integrity Verification
**Status**: NOT_STARTED  
**Prerequisites**: Task 12.1
- [ ] 12.2.1: Run both Node.js and Spring Boot against same database
- [ ] 12.2.2: Compare query results for:
  - GET /api/devotees
  - GET /api/namhattas
  - GET /api/dashboard
  - GET /api/reports/hierarchical
- [ ] 12.2.3: Verify data mutations (create, update) produce identical database state
- [ ] 12.2.4: Test complex flows: create devotee → assign leadership → promote → transfer subordinates

#### Task 12.3: Performance Testing
**Status**: NOT_STARTED  
**Prerequisites**: Task 12.2
- [ ] 12.3.1: Setup JMeter or Gatling for load testing
- [ ] 12.3.2: Test authentication endpoint (login) under load
- [ ] 12.3.3: Test devotee list endpoint with pagination under load
- [ ] 12.3.4: Test report endpoints with large datasets
- [ ] 12.3.5: Compare performance metrics with Node.js version
- [ ] 12.3.6: Optimize slow queries if needed (add indexes, improve JOINs)

#### Task 12.4: Security Audit
**Status**: NOT_STARTED  
**Prerequisites**: Task 12.3
- [ ] 12.4.1: Verify all sensitive endpoints require authentication
- [ ] 12.4.2: Verify role-based authorization works correctly
- [ ] 12.4.3: Test JWT expiration and refresh
- [ ] 12.4.4: Test single login enforcement (logout old session on new login)
- [ ] 12.4.5: Test token blacklisting on logout
- [ ] 12.4.6: Verify SQL injection protection (use parameterized queries)
- [ ] 12.4.7: Verify XSS protection (input sanitization)

#### Task 12.5: Deployment Preparation
**Status**: NOT_STARTED  
**Prerequisites**: Task 12.4
- [ ] 12.5.1: Build production JAR: `mvn clean package -DskipTests` or `gradle build`
- [ ] 12.5.2: Test production JAR locally with prod profile
- [ ] 12.5.3: Verify all environment variables are documented
- [ ] 12.5.4: Create deployment guide:
  - Prerequisites (Java 17, PostgreSQL access)
  - Environment variables to set
  - Command to run JAR: `java -jar app.jar --spring.profiles.active=prod`
- [ ] 12.5.5: Configure process manager (systemd service file or equivalent)
- [ ] 12.5.6: Setup reverse proxy (Nginx/Apache) if needed
- [ ] 12.5.7: Bind Spring Boot to port 5000 (matching current setup)

#### Task 12.6: Cutover and Rollback Plan
**Status**: NOT_STARTED  
**Prerequisites**: Task 12.5
- [ ] 12.6.1: Document cutover steps:
  1. Stop Node.js application
  2. Backup database
  3. Start Spring Boot application
  4. Verify health endpoint
  5. Test critical flows
- [ ] 12.6.2: Document rollback steps:
  1. Stop Spring Boot application
  2. Restore database if needed
  3. Start Node.js application
  4. Verify functionality
- [ ] 12.6.3: Identify critical success criteria:
  - Login works
  - Devotee and Namhatta lists load
  - Dashboard shows correct data
  - Role management functions
- [ ] 12.6.4: Schedule cutover window (low-traffic period)
- [ ] 12.6.5: Execute cutover
- [ ] 12.6.6: Monitor application for 24-48 hours
- [ ] 12.6.7: Address any issues found
- [ ] 12.6.8: Declare migration complete

---

## APPENDIX: API REFERENCE

### Authentication APIs
- POST `/api/auth/login` - Authenticate user, return JWT in cookie
- POST `/api/auth/logout` - Blacklist token, remove session
- GET `/api/auth/verify` - Verify JWT validity
- GET `/api/auth/user-districts` - Get authenticated user's districts

### System APIs
- GET `/api/health` - Health check
- GET `/api/about` - System metadata

### Geography APIs
- GET `/api/countries` - List countries
- GET `/api/states?country=X` - List states
- GET `/api/districts?state=X` - List districts
- GET `/api/sub-districts?district=X&pincode=Y` - List sub-districts
- GET `/api/villages?subDistrict=X&pincode=Y` - List villages
- GET `/api/pincodes?village=X&district=Y&subDistrict=Z` - List pincodes
- GET `/api/pincodes/search?country=X&search=Y&page=1&limit=25` - Search pincodes with pagination
- GET `/api/address-by-pincode?pincode=X` - Get address details by pincode

### Devotee Management APIs
- GET `/api/devotees` - List devotees with pagination/filtering
- GET `/api/devotees/:id` - Get devotee by ID
- POST `/api/devotees` - Create devotee
- POST `/api/devotees/:namhattaId` - Create devotee for namhatta
- PUT `/api/devotees/:id` - Update devotee
- POST `/api/devotees/:id/upgrade-status` - Upgrade devotional status
- POST `/api/devotees/:id/assign-leadership` - Assign leadership role
- DELETE `/api/devotees/:id/leadership` - Remove leadership role
- POST `/api/devotees/:id/link-user` - Create user account for devotee
- GET `/api/devotees/available-officers` - Get devotees eligible for officer positions

### Namhatta Management APIs
- GET `/api/namhattas` - List namhattas with pagination/filtering
- GET `/api/namhattas/:id` - Get namhatta by ID
- POST `/api/namhattas` - Create namhatta
- PUT `/api/namhattas/:id` - Update namhatta
- GET `/api/namhattas/check-registration/:registrationNo` - Check if registration number exists
- POST `/api/namhattas/:id/approve` - Approve namhatta
- POST `/api/namhattas/:id/reject` - Reject namhatta
- GET `/api/namhattas/:id/devotees` - Get devotees in namhatta
- GET `/api/namhattas/:id/updates` - Get activity updates
- GET `/api/namhattas/:id/devotee-status-count` - Get devotee count by status
- GET `/api/namhattas/:id/status-history` - Get status history

### Senapoti Role Management APIs
- POST `/api/senapoti/transfer-subordinates` - Transfer subordinates between supervisors
- POST `/api/senapoti/promote` - Promote devotee to higher role
- POST `/api/senapoti/demote` - Demote devotee to lower role
- POST `/api/senapoti/remove-role` - Remove leadership role
- GET `/api/senapoti/available-supervisors/:districtCode/:targetRole` - Get available supervisors
- GET `/api/senapoti/subordinates/:devoteeId` - Get direct subordinates
- GET `/api/senapoti/subordinates/:devoteeId/all` - Get all subordinates (recursive)
- GET `/api/senapoti/role-history/:devoteeId` - Get role change history

### Admin APIs
- POST `/api/admin/register-supervisor` - Register district supervisor
- GET `/api/admin/users` - Get all users
- GET `/api/admin/available-districts` - Get available districts
- PUT `/api/admin/users/:id` - Update user
- DELETE `/api/admin/users/:id` - Deactivate user

### Dashboard & Report APIs
- GET `/api/dashboard` - Get dashboard summary
- GET `/api/status-distribution` - Get devotee status distribution
- GET `/api/reports/hierarchical` - Get hierarchical reports
- GET `/api/reports/states` - Get states with counts (lazy loading)
- GET `/api/reports/districts/:state` - Get districts with counts
- GET `/api/reports/sub-districts/:state/:district` - Get sub-districts with counts
- GET `/api/reports/villages/:state/:district/:subdistrict` - Get villages with counts

### Map Data APIs
- GET `/api/map/countries` - Get namhatta counts by country
- GET `/api/map/states` - Get namhatta counts by state
- GET `/api/map/districts` - Get namhatta counts by district
- GET `/api/map/sub-districts` - Get namhatta counts by sub-district
- GET `/api/map/villages` - Get namhatta counts by village

### Supporting APIs
- GET `/api/statuses` - Get all devotional statuses
- POST `/api/statuses` - Create devotional status
- POST `/api/statuses/:id/rename` - Rename status
- GET `/api/gurudevs` - Get all gurudevs
- POST `/api/gurudevs` - Create gurudev
- GET `/api/shraddhakutirs` - Get shraddhakutirs (with district filter)
- POST `/api/shraddhakutirs` - Create shraddhakutir
- POST `/api/updates` - Create namhatta update
- GET `/api/updates/all` - Get all namhatta updates
- GET `/api/hierarchy` - Get top-level organizational hierarchy
- GET `/api/hierarchy/:level` - Get leaders by hierarchical level
- GET `/api/district-supervisors/all` - Get all district supervisors
- GET `/api/district-supervisors?district=X` - Get supervisors for district
- GET `/api/user/address-defaults` - Get user's default address

---

## END OF DOCUMENT

**Total Estimated Duration:** 20-25 working days  
**Number of Tasks:** 12 Phases, 350+ individual subtasks  
**Implementation Order:** Sequential by phase, parallel within phases where possible

**REMEMBER:**
- Update task status as you progress
- Test thoroughly after each phase
- No database schema modifications allowed
- Maintain exact API compatibility with Node.js version
- Use provided JDBC connection string
