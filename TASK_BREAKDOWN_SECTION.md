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
