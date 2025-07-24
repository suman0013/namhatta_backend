# Spring Boot Migration Plan for Namhatta Management System

## Overview
This document outlines a comprehensive plan to migrate the Namhatta Management System backend from Node.js/Express to Spring Boot while maintaining all existing functionality including authentication, role-based access control, and geographic data management.

## Current Architecture Analysis

### Current Tech Stack
- **Runtime**: Node.js 20 with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL (Neon serverless) with Drizzle ORM
- **Authentication**: JWT tokens with HTTP-only cookies, bcrypt password hashing
- **Session Management**: PostgreSQL-based sessions with single login enforcement
- **Authorization**: Role-based access control (ADMIN, OFFICE, DISTRICT_SUPERVISOR)

### Database Schema (12 main tables)
1. **devotees** - Personal information, spiritual status, courses
2. **namhattas** - Spiritual centers with organizational details
3. **devotional_statuses** - Hierarchical spiritual levels
4. **shraddhakutirs** - Regional spiritual administrative units
5. **leaders** - Hierarchical leadership structure
6. **addresses** - Normalized address data
7. **devotee_addresses** - Junction table for devotee addresses
8. **namhatta_addresses** - Junction table for namhatta addresses
9. **users** - Authentication users with roles
10. **user_districts** - Many-to-many user-district mapping
11. **user_sessions** - Single login enforcement
12. **jwt_blacklist** - Token invalidation

### Current API Endpoints (25+ endpoints)
- `/api/auth/*` - Authentication system
- `/api/devotees/*` - Devotee management
- `/api/namhattas/*` - Namhatta management
- `/api/statuses/*` - Status management
- `/api/hierarchy/*` - Leadership hierarchy
- `/api/geography/*` - Location data
- `/api/dashboard/*` - Statistics

## Migration Strategy

### Phase 1: Project Setup & Infrastructure (Day 1-2)

#### 1.1 Initialize Spring Boot Project
```bash
# Create new Spring Boot project structure
mkdir namhatta-springboot
cd namhatta-springboot

# Initialize with Spring Initializr equivalent
```

**Dependencies to include:**
- Spring Boot Starter Web
- Spring Boot Starter Data JPA
- Spring Boot Starter Security
- PostgreSQL Driver
- Spring Boot Starter Validation
- Spring Boot Starter Test
- JWT Library (io.jsonwebtoken)
- BCrypt (included in Spring Security)
- Flyway Migration
- Swagger/OpenAPI 3

#### 1.2 Project Structure
```
src/
├── main/
│   ├── java/com/namhatta/
│   │   ├── NamhattaApplication.java
│   │   ├── config/
│   │   │   ├── SecurityConfig.java
│   │   │   ├── DatabaseConfig.java
│   │   │   └── SwaggerConfig.java
│   │   ├── entity/
│   │   │   ├── Devotee.java
│   │   │   ├── Namhatta.java
│   │   │   ├── User.java
│   │   │   └── ... (all entities)
│   │   ├── repository/
│   │   │   ├── DevoteeRepository.java
│   │   │   ├── NamhattaRepository.java
│   │   │   └── ... (all repositories)
│   │   ├── service/
│   │   │   ├── DevoteeService.java
│   │   │   ├── NamhattaService.java
│   │   │   ├── AuthService.java
│   │   │   └── ... (all services)
│   │   ├── controller/
│   │   │   ├── DevoteeController.java
│   │   │   ├── NamhattaController.java
│   │   │   ├── AuthController.java
│   │   │   └── ... (all controllers)
│   │   ├── dto/
│   │   │   ├── DevoteeDto.java
│   │   │   ├── NamhattaDto.java
│   │   │   └── ... (all DTOs)
│   │   ├── security/
│   │   │   ├── JwtAuthenticationFilter.java
│   │   │   ├── JwtTokenProvider.java
│   │   │   └── UserDetailsServiceImpl.java
│   │   └── exception/
│   │       ├── GlobalExceptionHandler.java
│   │       └── CustomExceptions.java
│   └── resources/
│       ├── application.yml
│       ├── application-dev.yml
│       ├── application-prod.yml
│       └── db/migration/
│           └── (Flyway migration files)
```

### Phase 2: Database Migration & Entities (Day 2-3)

#### 2.1 Entity Mapping
Create JPA entities for all 12 tables with proper relationships:

**Key Entity Examples:**
```java
@Entity
@Table(name = "devotees")
public class Devotee {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "legal_name", nullable = false)
    private String legalName;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "devotional_status_id")
    private DevotionalStatus devotionalStatus;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "namhatta_id")
    private Namhatta namhatta;
    
    @OneToMany(mappedBy = "devotee", cascade = CascadeType.ALL)
    private List<DevoteeAddress> addresses;
    
    // ... other fields, getters, setters
}

@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String username;
    
    @Column(name = "password_hash", nullable = false)
    private String passwordHash;
    
    @Enumerated(EnumType.STRING)
    private UserRole role; // ADMIN, OFFICE, DISTRICT_SUPERVISOR
    
    @ManyToMany
    @JoinTable(name = "user_districts",
               joinColumns = @JoinColumn(name = "user_id"),
               inverseJoinColumns = @JoinColumn(name = "district_code"))
    private Set<District> districts;
    
    // ... other fields
}
```

#### 2.2 Repository Layer
Create Spring Data JPA repositories with custom queries:

```java
@Repository
public interface DevoteeRepository extends JpaRepository<Devotee, Long> {
    
    @Query("SELECT d FROM Devotee d JOIN d.addresses da JOIN da.address a " +
           "WHERE (:district IS NULL OR a.districtNameEnglish IN :allowedDistricts)")
    Page<Devotee> findFilteredDevotees(
        @Param("allowedDistricts") List<String> allowedDistricts,
        Pageable pageable
    );
    
    List<Devotee> findByNamhattaId(Long namhattaId);
    
    @Query("SELECT COUNT(d) FROM Devotee d WHERE d.devotionalStatus.id = :statusId")
    long countByStatusId(Long statusId);
}
```

### Phase 3: Security & Authentication (Day 3-4)

#### 3.1 Spring Security Configuration
```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/health").permitAll()
                .requestMatchers("/api/countries", "/api/states").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/devotees/**").hasAnyRole("ADMIN", "OFFICE", "DISTRICT_SUPERVISOR")
                .requestMatchers(HttpMethod.POST, "/api/devotees/**").hasAnyRole("ADMIN", "OFFICE")
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class)
            .build();
    }
}
```

#### 3.2 JWT Implementation
```java
@Component
public class JwtTokenProvider {
    
    public String createToken(User user, String sessionToken) {
        Claims claims = Jwts.claims().setSubject(user.getUsername());
        claims.put("userId", user.getId());
        claims.put("role", user.getRole().name());
        claims.put("sessionToken", sessionToken);
        claims.put("districts", user.getDistricts().stream()
            .map(District::getCode).collect(Collectors.toList()));
        
        return Jwts.builder()
            .setClaims(claims)
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis() + TOKEN_VALIDITY))
            .signWith(SignatureAlgorithm.HS512, secret)
            .compact();
    }
}
```

### Phase 4: Service Layer Implementation (Day 4-6)

#### 4.1 Core Services
Implement all business logic services:

```java
@Service
@Transactional
public class DevoteeService {
    
    private final DevoteeRepository devoteeRepository;
    private final AddressService addressService;
    
    public Page<Devotee> getFilteredDevotees(
            List<String> allowedDistricts, 
            String status,
            String search,
            Pageable pageable) {
        
        // Implement complex filtering logic similar to current storage-db.ts
        return devoteeRepository.findFilteredDevotees(allowedDistricts, pageable);
    }
    
    @PreAuthorize("hasRole('ADMIN') or hasRole('OFFICE')")
    public Devotee createDevotee(CreateDevoteeDto dto) {
        // Implement devotee creation with address handling
    }
}

@Service
public class NamhattaService {
    
    public Page<Namhatta> getFilteredNamhattas(
            List<String> allowedDistricts,
            String status,
            String search,
            String sortBy,
            String sortOrder,
            Pageable pageable) {
        
        // Implement filtering with district-based access control
    }
}
```

#### 4.2 Geographic Services
```java
@Service
public class GeographicService {
    
    public List<String> getCountries() {
        return addressRepository.findDistinctCountries();
    }
    
    public List<String> getStatesByCountry(String country) {
        return addressRepository.findDistinctStatesByCountry(country);
    }
    
    // Implement all geographic filtering methods
}
```

### Phase 5: REST Controllers (Day 6-7)

#### 5.1 Controller Implementation
Convert all Express routes to Spring Boot controllers:

```java
@RestController
@RequestMapping("/api/devotees")
@Validated
public class DevoteeController {
    
    @GetMapping
    public ResponseEntity<PagedResponse<DevoteeDto>> getDevotees(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            Authentication auth) {
        
        UserPrincipal user = (UserPrincipal) auth.getPrincipal();
        List<String> allowedDistricts = user.getAllowedDistricts();
        
        Pageable pageable = PageRequest.of(page - 1, size);
        Page<Devotee> devotees = devoteeService.getFilteredDevotees(
            allowedDistricts, status, search, pageable);
        
        return ResponseEntity.ok(
            PagedResponse.of(devotees.map(devoteeMapper::toDto))
        );
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('OFFICE')")
    public ResponseEntity<DevoteeDto> createDevotee(
            @Valid @RequestBody CreateDevoteeDto dto) {
        
        Devotee devotee = devoteeService.createDevotee(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(devoteeMapper.toDto(devotee));
    }
}

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletResponse response) {
        
        LoginResponse loginResponse = authService.authenticate(request);
        
        // Set HTTP-only cookie
        Cookie cookie = new Cookie("auth_token", loginResponse.getToken());
        cookie.setHttpOnly(true);
        cookie.setSecure(true);
        cookie.setMaxAge(86400); // 24 hours
        response.addCookie(cookie);
        
        return ResponseEntity.ok(loginResponse);
    }
}
```

### Phase 6: Configuration & Properties (Day 7)

#### 6.1 Application Configuration
```yaml
# application.yml
spring:
  application:
    name: namhatta-management-system
  
  datasource:
    url: ${DATABASE_URL}
    driver-class-name: org.postgresql.Driver
    
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
        
  flyway:
    enabled: true
    locations: classpath:db/migration

jwt:
  secret: ${JWT_SECRET}
  expiration: 86400000 # 24 hours

session:
  secret: ${SESSION_SECRET}
  
server:
  port: ${PORT:5000}
  
logging:
  level:
    com.namhatta: DEBUG
    org.springframework.security: DEBUG
```

### Phase 7: Testing & Validation (Day 8-9)

#### 7.1 Unit Tests
```java
@SpringBootTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Testcontainers
class DevoteeServiceTest {
    
    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15")
            .withDatabaseName("namhatta_test")
            .withUsername("test")
            .withPassword("test");
    
    @Test
    void shouldCreateDevoteeWithAddress() {
        // Test devotee creation
    }
    
    @Test
    void shouldFilterDevoteesByDistrict() {
        // Test district-based filtering
    }
}
```

#### 7.2 Integration Tests
```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class AuthControllerIntegrationTest {
    
    @Test
    void shouldAuthenticateUserAndSetCookie() {
        // Test complete authentication flow
    }
}
```

### Phase 8: Deployment Configuration (Day 9-10)

#### 8.1 Docker Configuration
```dockerfile
FROM openjdk:17-jdk-slim

WORKDIR /app
COPY target/namhatta-management-system-1.0.jar app.jar

EXPOSE 5000
ENTRYPOINT ["java", "-jar", "app.jar"]
```

#### 8.2 Replit Configuration
```bash
# .replit
run = "mvn spring-boot:run"
entrypoint = "src/main/java/com/namhatta/NamhattaApplication.java"

[languages.java]
pattern = "**/*.java"

[nix]
channel = "stable-22_11"

[deployment]
run = ["mvn", "clean", "package", "-DskipTests", "&&", "java", "-jar", "target/namhatta-management-system-1.0.jar"]
```

## Migration Execution Plan

### Week 1: Core Migration
- **Day 1-2**: Project setup, dependencies, basic configuration
- **Day 3-4**: Entity mapping, repository layer
- **Day 5-6**: Security configuration, JWT implementation
- **Day 7**: Service layer for core entities (Devotee, Namhatta)

### Week 2: Feature Completion
- **Day 8-9**: Complete all service implementations
- **Day 10-11**: REST controller implementation
- **Day 12-13**: Authentication system, role-based access
- **Day 14**: Testing, validation, bug fixes

### Week 3: Advanced Features & Deployment
- **Day 15-16**: Geographic services, dashboard APIs
- **Day 17-18**: Complete testing suite
- **Day 19-20**: Performance optimization, caching
- **Day 21**: Production deployment configuration

## Key Migration Considerations

### 1. Database Compatibility
- Keep existing PostgreSQL schema unchanged
- Use Flyway for any necessary schema updates
- Maintain all foreign key relationships

### 2. API Compatibility
- Maintain exact same REST endpoints
- Keep identical request/response formats
- Preserve authentication flow with HTTP-only cookies

### 3. Authentication Migration
- Port JWT implementation exactly
- Maintain session-based single login enforcement
- Keep role-based access control logic

### 4. Data Access Patterns
- Implement same filtering logic for district supervisors
- Maintain pagination, sorting, search functionality
- Keep geographic data hierarchy intact

### 5. Performance Considerations
- Implement JPA query optimization
- Add appropriate database indexes
- Consider caching for geographic data

## Risk Mitigation

### 1. Parallel Development
- Keep Node.js version running during migration
- Use feature flags for gradual rollout
- Maintain database schema compatibility

### 2. Testing Strategy
- Comprehensive unit test coverage
- Integration tests for all endpoints
- Load testing with existing data volume

### 3. Rollback Plan
- Database backup before migration
- Keep Node.js deployment ready
- Environment-based routing for gradual migration

### 4. Data Validation
- Compare API responses between versions
- Validate authentication flows
- Test all role-based access scenarios

## Success Criteria

### Functional Requirements
- ✅ All 25+ API endpoints working identically
- ✅ Authentication system with HTTP-only cookies
- ✅ Role-based access control (ADMIN, OFFICE, DISTRICT_SUPERVISOR)
- ✅ District-based data filtering for supervisors
- ✅ Geographic data hierarchy intact
- ✅ Pagination, sorting, search functionality

### Performance Requirements
- Response times within 10% of current system
- Support for current user load (concurrent sessions)
- Database query optimization maintained

### Security Requirements
- JWT token validation identical
- Password hashing compatibility
- Session management with single login enforcement
- Token blacklisting for secure logout

## Tools & Libraries Required

### Core Dependencies
```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
    </dependency>
    <dependency>
        <groupId>org.postgresql</groupId>
        <artifactId>postgresql</artifactId>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-api</artifactId>
        <version>0.11.5</version>
    </dependency>
    <dependency>
        <groupId>org.flywaydb</groupId>
        <artifactId>flyway-core</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springdoc</groupId>
        <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
        <version>2.1.0</version>
    </dependency>
</dependencies>
```

This comprehensive plan provides a structured approach to migrating your Namhatta Management System to Spring Boot while maintaining all existing functionality and ensuring a smooth transition.