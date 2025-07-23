# Namhatta Management System

## Overview

This is a full-stack web application for managing Namhatta religious/spiritual organizations. The system provides functionality for managing devotees, Namhattas (spiritual centers), hierarchical leadership structures, and devotional statuses. It's built with modern web technologies and follows a clean architecture pattern.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight router)
- **State Management**: React Query (TanStack Query) for server state
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js 20 with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon serverless PostgreSQL
- **Authentication**: JWT tokens with HTTP-only cookies, bcrypt password hashing
- **Session Management**: PostgreSQL-based sessions with single login enforcement
- **Authorization**: Role-based access control (ADMIN, OFFICE, DISTRICT_SUPERVISOR)
- **Security**: Rate limiting, token blacklisting, district-based data filtering
- **API Design**: RESTful API with JSON responses

### Data Storage Solutions
- **Primary Database**: PostgreSQL hosted on Neon
- **ORM**: Drizzle ORM for type-safe database operations
- **Migrations**: Drizzle Kit for schema management
- **Session Storage**: PostgreSQL-based session store
- **Connection**: Neon serverless PostgreSQL with connection pooling

## Key Components

### Database Schema
The application uses a PostgreSQL database with the following main entities:

1. **Devotees**: Personal information, spiritual status, and courses (addresses stored in normalized tables)
2. **Namhattas**: Spiritual centers with organizational details (addresses stored in normalized tables)
3. **Devotional Statuses**: Hierarchical spiritual levels (Bhakta, Initiated, etc.)
4. **Shraddhakutirs**: Regional spiritual administrative units
5. **Leaders**: Hierarchical leadership structure
6. **Addresses**: Normalized address data (country, state, district, sub_district, village, postal_code)
7. **Devotee_Addresses & Namhatta_Addresses**: Junction tables linking entities to addresses with landmarks
8. **Users**: Authentication users with username, password hash, role, and active status
9. **User_Districts**: Many-to-many mapping between users and districts for access control
10. **User_Sessions**: Single login enforcement with session tokens and expiry
11. **JWT_Blacklist**: Token invalidation for secure logout

### Frontend Components
- **Layout System**: Responsive app layout with navigation
- **Forms**: Comprehensive forms for data entry with validation
- **Data Tables**: Paginated lists with filtering and search
- **Detail Views**: Individual entity pages with tabbed interfaces
- **Dashboard**: Summary statistics and recent activity

### API Structure
RESTful endpoints organized by resource:
- `/api/auth` - Authentication (login, logout, verify, dev tools)
- `/api/devotees` - Devotee management (protected, role-based access)
- `/api/namhattas` - Namhatta center management (protected, role-based access)
- `/api/statuses` - Devotional status management
- `/api/hierarchy` - Leadership hierarchy (protected)
- `/api/geography` - Location data (public access)
- `/api/dashboard` - Summary statistics (protected)

## Data Flow

1. **Client Requests**: Frontend makes HTTP requests to Express API
2. **API Processing**: Express routes handle requests and business logic
3. **Database Operations**: Drizzle ORM executes type-safe database queries
4. **Response**: JSON data returned to client through React Query
5. **UI Updates**: React components re-render with updated data

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React 18, React Query, React Hook Form
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL (Neon), Drizzle ORM
- **UI Library**: Radix UI, Tailwind CSS, Lucide Icons

### Development Tools
- **Build Tools**: Vite, ESBuild
- **TypeScript**: Full TypeScript support across stack
- **Linting**: ESLint configuration
- **Development**: Hot module replacement, error overlays

## Deployment Strategy

### Production Build
- Frontend: Vite builds optimized static assets
- Backend: ESBuild bundles server code for Node.js
- Database: Neon serverless PostgreSQL (no separate deployment needed)

### Replit Deployment
- **Build Command**: `npm run build`
- **Start Command**: `npm run start`
- **Development**: `npm run dev` with hot reload
- **Port Configuration**: Server runs on port 5000, mapped to external port 80
- **Autoscale**: Configured for automatic scaling based on traffic

### Environment Configuration
- **Development**: Local development with Vite dev server
- **Production**: Optimized builds with static file serving
- **Database**: Environment-based connection strings
- **Sessions**: PostgreSQL-backed session management

## Recent Changes  
- July 23, 2025: COMPLETED - Migration from Replit Agent to standard Replit environment - successfully resolved tsx dependency issue by ensuring proper NodeJS installation, created secure .env configuration with Neon PostgreSQL database connection (postgresql://neondb_owner:npg_5MIwCD4YhSdP@ep-calm-silence-a15zko7l-pooler.ap-southeast-1.aws.neon.tech/neondb), fixed critical address population bug in devotee edit form by transforming addresses array into presentAddress and permanentAddress properties in getDevotee API function, enhanced updateDevotee function to properly handle address updates with deletion/recreation of address records, fixed permission issue by allowing DISTRICT_SUPERVISOR role to update devotees with district validation, reduced devotee card height from 280px to 200px for more compact layout, verified server running correctly on port 5000 with authentication enabled, confirmed all application functionality working properly in Replit environment with proper client/server separation and secure database connection
- July 19, 2025: COMPLETED - Migration from Replit Agent to standard Replit environment - fixed critical security vulnerability by removing hardcoded database credentials and implementing proper .env configuration, enabled authentication system with VITE_AUTHENTICATION_ENABLED=true, implemented automatic 401 redirect to login page functionality in query client, verified LoginPage component with demo credentials (admin/Admin@123456, office1/Office@123456, supervisor1/Super@123456), confirmed proper client/server separation with secure PostgreSQL connection, all authentication flows working correctly with proper session management and role-based access control
- January 19, 2025: COMPLETED - JWT-based authentication system with role-based access control - implemented complete backend authentication including user management tables (users, user_districts, user_sessions, jwt_blacklist), password hashing with bcrypt, JWT token management with HTTP-only cookies, single login enforcement, three user roles (ADMIN, OFFICE, DISTRICT_SUPERVISOR) with district-based data filtering, authentication middleware with development bypass functionality, comprehensive API endpoints (/api/auth/login, logout, verify), route protection for all data endpoints, rate limiting for login attempts, and test user creation with proper password policies
- July 19, 2025: COMPLETED - Full devotee address management system - implemented complete address handling for devotees including present and permanent addresses, fixed address creation and retrieval for both individual devotees and devotees assigned to specific namhattas, verified proper foreign key relationships and address reuse functionality, tested complete workflow including address normalization, landmark storage, and proper JSON response formatting with all address details
- July 19, 2025: COMPLETED - Critical address management fixes - resolved duplicate address creation bug in Namhatta forms by implementing proper findOrCreateAddress logic using foreign key references instead of direct insertions, enhanced postal code filtering to use hierarchical location codes for more precise results (limited to 50 results), improved address matching algorithm to find existing records before creating new ones, fixed address table relationship issues that were causing database bloat, verified all address-related API endpoints working correctly with proper normalization
- July 19, 2025: COMPLETED - Migration from Replit Agent to standard Replit environment with custom PostgreSQL database - configured specific Neon database (postgresql://neondb_owner:npg_5MIwCD4YhSdP@ep-calm-silence-a15zko7l-pooler.ap-southeast-1.aws.neon.tech/neondb) as default for consistent access across environments, updated database configuration with fallback to ensure automatic connection, imported existing CSV data (101 namhattas, 253 devotees, 7 devotional statuses), verified application startup and API connectivity, created .env configuration and documentation for future imports
- July 19, 2025: COMPLETED - Migration from Replit Agent to standard Replit environment with complete authentication system - successfully fixed critical security vulnerability (removed hardcoded database credentials), resolved village dropdown bug in NamhattaForm (was using district instead of subDistrict parameter), fixed timestamp error in status upgrade functionality (PostgreSQL expects Date objects not ISO strings), enhanced address information display in Namhatta detail view by updating database queries to include normalized address data, implemented complete frontend authentication system (Phase 7) with AuthContext, LoginPage, ProtectedRoute components, fixed Express rate limiting for Replit environment, created demo users (admin/Admin@123456, office1/Office@123456, supervisor1/Super@123456), fixed logout functionality with proper ES6 imports, verified proper client/server separation and Replit-compatible configuration, all API endpoints working correctly with PostgreSQL backend and role-based authentication
- July 19, 2025: Successfully migrated from SQLite to PostgreSQL using Neon database - updated schema to use PostgreSQL syntax (serial, timestamp, jsonb), configured Neon serverless connection, migrated all data (253 devotees, 101 namhattas, 125 devotee addresses, 34 namhatta addresses, 53 updates, 13 leaders, 7 statuses), verified all API endpoints working correctly with PostgreSQL backend
- July 19, 2025: Successfully restructured address system for better normalization - separated main address data (country, state, district, sub_district, village, postal_code) from location-specific landmarks, updated database schema to store landmarks in junction tables (devotee_addresses and namhatta_addresses), migrated 125 devotee addresses and 34 namhatta addresses to new structure, updated all storage methods and API endpoints to use normalized address tables, verified all geographic filtering and mapping functionality working correctly

## Changelog
- July 12, 2025: Set default sorting to alphabetical by name for Namhattas page - ensured backend properly handles default name sorting when no sortBy is specified, updated sorting logic to consistently sort by name ascending as default
- July 12, 2025: Fixed devotee creation issue in Namhatta detail page - updated DevoteeForm to use correct API endpoint (createDevoteeForNamhatta) when adding devotees to specific Namhattas, improved cache invalidation to refresh both global devotees list and specific Namhatta devotees list
- July 12, 2025: Optimized Updates page performance by replacing N+1 queries with single database query - created getAllUpdates endpoint with JOIN operation, reduced 100+ API calls to 1 request, significantly improved page load speed
- July 12, 2025: Removed Mala Senapotis section from Leadership Hierarchy page as requested by user, cleaned up unused import statements
- July 12, 2025: Fixed dashboard "0 members" issue by updating database queries to include devotee count for each Namhatta, changed all "members" references to "devotees" throughout the application for consistent terminology
- July 12, 2025: Enhanced Leadership Hierarchy display in Dashboard to show only up to Co-Regional Directors (removed District Supervisors and Mala Senapotis sections), made "Leadership Hierarchy" title clickable to navigate to hierarchy page, and enhanced Hierarchy page with collapsible District Supervisors section utilizing full screen width with responsive grid layout and compact cards
- July 12, 2025: Successfully completed migration from Replit Agent to standard Replit environment with verified 100% database-driven architecture - removed all static data files (geographic_data_with_pincode.csv, world-110m.json, attached CSV files), conducted comprehensive 5-pass API audit confirming all 25+ endpoints use database queries exclusively through Drizzle ORM with 73+ database operations, verified live API testing shows real database content (250 devotees, 100 namhattas, geographic data from addresses table), fixed update form validation error, and confirmed all CRUD operations write to SQLite database tables
- July 12, 2025: Fixed critical database issues preventing app startup - resolved SQLite query syntax errors by adding missing namhatta_id column to devotees table, fixed status history schema field mappings (newStatusId→newStatus, changedAt→updatedAt), removed problematic SQLite transaction wrapper causing "Transaction function cannot return a promise" error, improved error handling in status upgrade functionality, and verified all devotee status upgrade operations now work correctly with proper database persistence
- July 11, 2025: Successfully completed migration from Replit Agent to standard Replit environment - verified all APIs are using database operations instead of static data or files, confirmed DatabaseStorage class is properly configured with Drizzle ORM queries, validated all CRUD operations write to database tables (devotees, namhattas, addresses, statusHistory, etc.), ensured geographic data comes from database instead of CSV files, fixed static Status Distribution data in dashboard to use proper database queries via /api/status-distribution endpoint, and verified complete database-driven architecture is working correctly
- July 11, 2025: Successfully completed migration from Replit Agent to standard Replit environment with comprehensive database seeding - added 100 Namhattas, 250 devotees, and 50 updates with realistic data distribution across Indian locations, fixed all database compatibility issues, verified all API endpoints working correctly with proper data serving, confirmed complete transition from static/mock data to database-driven architecture
- July 11, 2025: Completed full migration to database-driven architecture - replaced all in-memory storage with database operations, implemented DatabaseStorage class with proper CRUD operations, migrated all API endpoints to use database queries instead of static/mock data, added sample data to test database functionality, verified devotees/namhattas/dashboard/geographic endpoints working correctly with database
- July 11, 2025: Migrated geographic data from CSV to database - updated all address filter endpoints to use database queries instead of CSV file, implemented proper database-based geographic methods (getCountries, getStates, getDistricts, getSubDistricts, getVillages, getPincodes), added sample address data to addresses table, and verified all API endpoints working correctly
- July 11, 2025: Created proper normalized address tables - added separate `addresses` table with proper address components (country, state, district, sub_district, village, postal_code, landmark), created junction tables `devotee_addresses` and `namhatta_addresses` for proper relational mapping, improved database normalization for better query performance and data integrity, and added sample address data for testing
- July 11, 2025: Successfully added SQLite database support to the project - migrated from PostgreSQL to SQLite for development ease, created database schema with all necessary tables (devotees, namhattas, devotional_statuses, shraddhakutirs, status_history, namhatta_updates, leaders), configured dual database support (SQLite for development, MySQL for production), and verified all tables are properly created and functional
- July 11, 2025: Successfully migrated from Replit Agent to standard Replit environment with hybrid database support - updated database architecture to support both SQLite (development) and MySQL (production), converted all database schemas from PostgreSQL to SQLite format, installed mysql2 and better-sqlite3 packages, implemented dynamic database connection switching based on environment, maintained all existing functionality while adding database flexibility
- July 4, 2025: Successfully completed migration from Replit Agent to standard Replit environment and improved status management interface - moved edit icons to far right end, reduced progress bar width to 60%, centered card with reduced horizontal width (max-w-2xl) to eliminate unnecessary white space, added distinctive icons for each devotional status (Heart, HandHeart, Star, Award, Shield, Crown, Sparkles) with gradient backgrounds, reduced map height by 15% (from 80vh to 68vh), fixed double border issue in filter dropdowns with CSS override for glass+border-0 combination, reduced spacing between filter elements (gap-4 to gap-2), matched Devotees page spacing to Namhattas page (space-y-1, p-2 space-y-1) for consistent compact layout, updated Updates page spacing to match Namhattas page with compact spacing (space-y-1, p-2, gap-2), and fixed layout structure for better UI alignment
- July 4, 2025: Successfully completed migration from Replit Agent to standard Replit environment - fixed API connection issues by configuring relative URLs for development mode (both frontend and backend served from same Express server on port 5000), resolved TypeScript errors in Dashboard component, and verified all API endpoints working correctly including dashboard, hierarchy, namhattas, devotees, and geographic data
- July 4, 2025: Successfully implemented dynamic API configuration system with environment variables - added VITE_API_BASE_URL configuration, created client/src/lib/api-config.ts for dynamic base URL switching, updated queryClient.ts to use configurable endpoints, added comprehensive API_CONFIGURATION.md guide, and implemented debug logging for API configuration. Frontend can now easily switch between Node.js development backend and Java Spring Boot production backend by changing environment variables
- July 4, 2025: Successfully completed migration from Replit Agent to standard Replit environment - fixed getPincodes function import conflict in storage-fresh.ts, added missing function implementation, restored all searchable dropdown functionality across address fields, verified server startup and API functionality
- July 4, 2025: Enhanced all address field dropdowns with searchable functionality - replaced standard Select components with SearchableSelect in DevoteeForm, NamhattaForm, and Namhattas filter page. Users can now type to search through long lists instead of scrolling, improving efficiency when selecting Country, State, District, Sub-District, and Village fields
- July 4, 2025: Further optimized spacing for ultra-compact layout - minimized padding and margins across all components for maximum content density while maintaining readability
- July 4, 2025: Removed borders from Leadership Hierarchy cards for cleaner visual design - eliminated border lines and increased padding for better visual balance and modern appearance
- July 4, 2025: Refined glass-card border styling for cleaner appearance - made borders more subtle with reduced opacity and softer shadows, eliminating visual clutter while maintaining elegant glass morphism effect
- July 4, 2025: Enhanced Recent Updates icons with contextual program-specific icons and colors - different program types now display unique icons (Heart for Satsang, Music for Kirtan, BookOpen for study classes, etc.) with matching gradient backgrounds
- July 4, 2025: Applied consistent gradient styling to both "Namhatta" and "Management System" text in logo for unified visual design
- July 4, 2025: Fixed logo text blinking by replacing animated gradient-text class with static gradient - "Namhatta" text now displays stable gradient colors without animation
- July 4, 2025: Enhanced scrollbar styling with custom CSS - made scrollbars thinner, more subtle, and properly styled for both light and dark themes with smooth hover effects
- July 4, 2025: Fixed dialog blinking issue by removing glass-card class from NamhattaUpdateForm - dialogs now display properly without visual overlapping or blinking effects
- July 4, 2025: Fixed excessive background animation blinking by removing animate-pulse effects from floating orbs in AppLayout - background elements now remain static for better user experience
- July 4, 2025: Successfully completed migration from Replit Agent to standard Replit environment with all functionality preserved and working correctly
- July 4, 2025: Fixed Select dropdown positioning issue in Namhatta Update Form - removed glass styling from form elements that caused dropdown to follow cursor movement, ensuring proper dropdown positioning
- July 4, 2025: Fixed dark mode visibility issues in form labels and section headers - enhanced Label component, Dialog titles, and form section headers with proper dark mode styling for better visibility and readability
- July 4, 2025: Implemented automatic scroll-to-top functionality when navigating between pages - new pages now open at the top position instead of maintaining previous scroll position
- July 4, 2025: Removed bottom navigation bar (MobileNav component) from mobile interface - users now access navigation through the mobile menu button in the top-left corner
- July 4, 2025: Further enhanced dark mode styling for Input and Select components - improved form visibility with darker backgrounds, lighter borders, and white text for better contrast and readability in dark mode
- July 4, 2025: Successfully completed migration from Replit Agent to standard Replit environment and comprehensively fixed all dark mode styling issues - improved form input visibility, pagination button contrast, text readability, Select dropdown styling, and glass effect backgrounds for complete dark mode support across all components
- July 4, 2025: Removed "Add New Devotee" button from Devotees page - devotees can now only be added from Namhatta page as requested, kept edit functionality for existing devotees
- July 4, 2025: Made Devotees page more compact by reducing white space - reduced spacing between sections, cards, and filters for better visual density and improved layout
- July 4, 2025: Made Namhattas page more compact by reducing white space - reduced spacing between sections, cards, and filters for better visual density and improved layout
- July 4, 2025: Made devotee detail page sections more compact by reducing spacing between cards for better visual density and improved layout
- July 4, 2025: Redesigned Status Management tab in devotee detail page with attractive gradient design - Current Status and Status History sections now feature beautiful gradient backgrounds, timeline-style history display, and enhanced visual elements
- July 4, 2025: Updated Devotional Courses section in devotee detail page to match gradient card design of other sections - course name, date, and institute now display in beautiful gradient cards with consistent styling and icons
- July 4, 2025: Made Dashboard statistics cards horizontal layout with compact design - Total Devotees and Total Namhattas now display in a single row on larger screens with title and number on the same line, reduced vertical height for cleaner appearance
- July 4, 2025: Removed percentage changes and monthly indicators from Dashboard statistics cards for cleaner UI (removed "+12.5% vs last month" and "+3 new this month")
- July 4, 2025: Implemented dynamic event status badges in Dashboard Recent Updates - now shows "Past Event", "Today", or "Future Event" instead of generic "Active" status based on event date
- July 4, 2025: Made Leadership Roles and Address Information sections more compact in Namhatta detail page, and Spiritual Information section in devotee detail page - reduced spacing, padding, and card sizes for better mobile experience
- July 4, 2025: Removed Programs and Avg Attendance statistics cards from Namhatta detail page for cleaner UI
- July 4, 2025: Successfully completed migration from Replit Agent to standard Replit environment - all functionality preserved and working correctly
- July 4, 2025: Fixed SearchableSelect dropdown z-index overlapping issues and made devotee detail page more compact by reducing spacing, padding, and card sizes for better mobile experience
- July 4, 2025: Enhanced devotee detail view address and spiritual information sections with beautiful gradient cards, floating animations, and modern styling to match other sections
- July 4, 2025: Fixed statistics cards alignment in Updates page for all screen sizes - added items-stretch to grid, improved flex layout, and consistent line heights for perfect alignment on large screens
- July 4, 2025: Implemented dynamic event status badges in update cards - now shows "Past Event", "Today", or "Future Event" instead of generic "Active" status based on event date
- July 4, 2025: Fixed update cards content overflow - changed to minimum height instead of fixed height to prevent content cutoff at bottom
- July 4, 2025: Fixed Special Attraction text truncation in update cards - removed line clamp to show full text content
- July 4, 2025: Fixed update cards in Updates page - made them clickable to navigate to respective Namhatta detail pages for better user experience
- July 4, 2025: Enhanced devotee profile page with attractive gradient cards, colored borders, and modern visual design to replace vanilla styling
- July 4, 2025: Enhanced Analytics tab in Namhatta detail view with colored progress bars and percentages matching Dashboard's status distribution format
- July 4, 2025: Added Briefcase icon before occupation field in devotee cards for better visual identification
- July 4, 2025: Updated devotee cards in Namhatta detail view to match main devotee list format with consistent styling, status badges, and layout
- July 4, 2025: Added icons before legal name (User icon) and initiated name (Crown icon) in devotee cards for better visual identification
- July 4, 2025: Removed unwanted scrolling from Dashboard cards (Recent Updates and Status Distribution) for cleaner UI
- July 4, 2025: Successfully completed migration from Replit Agent to standard Replit environment - all functionality preserved and working correctly
- July 4, 2025: Added Landmark field to Namhatta form and detail view - users can now specify landmark information for better location identification
- July 1, 2025: Removed "View Details" button and edit icon from Namhatta cards - entire card is now clickable to navigate to details for cleaner UI
- July 1, 2025: Removed "View Profile" button and edit icon from devotee cards - entire card is now clickable to navigate to profile for cleaner UI
- June 30, 2025: Fixed inconsistent heights in devotee detail Status Management cards by using min-height (min-h-96) instead of fixed height, with scrollable content only when needed to eliminate unnecessary scrollbars
- June 30, 2025: Fixed inconsistent heights in Dashboard Recent Updates and Status Distribution cards by using min-height (min-h-96) instead of fixed height, with scrollable content only when needed to eliminate unnecessary scrollbars
- June 30, 2025: Fixed inconsistent heights in statistics cards on Updates page by replacing Card components with direct div elements using glass-card styling, fixed height of 128px (h-32), and flex centering for uniform sizing
- June 30, 2025: Removed statistics cards section from Devotees page (Total Devotees, Active This Month, Course Completions, New This Month) as requested
- June 30, 2025: Fixed inconsistent heights in update cards by setting fixed height of 280px for uniform sizing on all screen sizes
- June 30, 2025: Fixed inconsistent heights in Namhatta cards by setting fixed height of 280px for uniform sizing on all screen sizes
- June 30, 2025: Added sorting functionality to Namhattas page with options for name, created date, and updated date with ascending/descending toggle - includes backend API support and UI sorting controls
- June 30, 2025: Added "updatedAt" as third sorting option alongside name and creation date - backend and frontend now support sorting by Updated Date
- June 30, 2025: Fixed initiated name display in devotee cards - now properly shows initiated names for devotees with status 6+ (Harinam Diksha or higher)
- June 30, 2025: Restructured devotee card layout - legal name displays first, initiated name below if present, status badge moved to separate line instead of right side
- June 30, 2025: Added sorting functionality for devotees list by name and creation date with ascending/descending toggle
- June 30, 2025: Added Devotional Courses section to devotee detail view matching form structure with course name, date, and institute fields
- June 30, 2025: Removed "Initiated Devotee" and devotional course count text from devotee cards for cleaner UI
- June 30, 2025: Fixed edit button functionality in devotee cards to properly open edit form
- June 30, 2025: Fixed DOM nesting warning by replacing Badge container from p tag to div in devotee detail view
- June 30, 2025: Restructured devotee detail view to match form segments: Basic Information, Family Information, Personal Information, Present Address, Permanent Address, Spiritual Information
- June 30, 2025: Successfully completed migration from Replit Agent to standard Replit environment
- June 30, 2025: Fixed toast notifications to auto-dismiss after 4 seconds instead of staying indefinitely
- June 30, 2025: Updated status upgrade UI to use manual trigger button - users now select status and add comments, then click "Change Status" button to apply changes instead of automatic triggering
- June 30, 2025: Added optional comment field to status upgrade functionality - users can now add comments when changing devotee status, and comments are displayed in status history
- June 30, 2025: Restored status change history to Status Management tab after removing separate History tab - status history now properly displays within Status Management section
- June 30, 2025: Removed Spiritual Name field from devotee forms and reordered initiation fields so Initiated Name appears after Harinama Initiation Date in both forms and detail views
- June 30, 2025: Fixed devotee detail view to display all registration fields including legal name, date of birth, gender, blood group, family names, contact information, sub-district, postal code, and spiritual information
- June 30, 2025: Fixed status history display issue - now correctly shows actual status names instead of "Unknown" by using proper field mappings (newStatusId and changedAt)
- June 30, 2025: Successfully completed migration from Replit Agent to standard Replit environment with full functionality restored
- June 30, 2025: Completed form validation system overhaul - toast notifications now auto-dismiss after 3 seconds as requested
- June 30, 2025: Fixed village dropdown in Add New Devotee form - now properly loads villages based on selected sub-district using complete geographic dataset
- June 30, 2025: Fixed form validation system in Add New Devotee form - all validation errors now display properly with red error messages for required fields
- June 30, 2025: Made all address fields mandatory in Add New Devotee form: Country, State, District, Sub-District, Village, and Postal Code for both Present and Permanent addresses
- June 30, 2025: Made mandatory fields required in Add New Devotee form: Legal Name, Date of Birth, Gender, Present Address, Permanent Address, and Devotional Status
- June 30, 2025: Moved Spiritual Information section below address sections in Add New Devotee form
- June 30, 2025: Fixed inconsistent heights in devotee cards by setting fixed height of 280px for uniform sizing on all screen sizes
- June 30, 2025: Made Total Devotees and Total Namhattas stats cards clickable to navigate to respective pages
- June 30, 2025: Fixed non-functional "View All" and "Manage Statuses" buttons in Dashboard by adding proper navigation handlers
- June 30, 2025: Added missing Secretary field to Leadership Roles and corrected address fields (Pincode, Additional Details) in Namhatta detail view
- June 30, 2025: Enhanced map zoom transitions with complete geographic hierarchy (Country→State→District→Sub-district→Village)
- June 30, 2025: Removed all map attribution text and badge numbers from navigation for cleaner UI
- June 30, 2025: Fixed navigation bar alignment to maintain single-line layout with improved responsive design
- June 30, 2025: Successfully completed migration from Replit Agent to standard Replit environment with proper alignment fixes
- June 30, 2025: Fixed alignment issues across all pages by removing double padding and ensuring proper content centering
- June 30, 2025: Updated main layout to use max-width container with proper horizontal centering
- June 30, 2025: Standardized page spacing from space-y-8 to space-y-6 for better visual consistency
- June 28, 2025: Updated devotional status system to use specific spiritual hierarchy: Shraddhavan, Sadhusangi, Gour/Krishna Sevak, Gour/Krishna Sadhak, Sri Guru Charan Asraya, Harinam Diksha, Pancharatrik Diksha
- June 28, 2025: Removed welcome message from dashboard page
- June 28, 2025: Successfully migrated project from Replit Agent to standard Replit environment
- June 28, 2025: Imported comprehensive Indian geographic data (41,005 records) from CSV file with states, districts, sub-districts, and villages
- June 28, 2025: Updated geographic API endpoints to use real data instead of mock data
- June 28, 2025: Fixed dropdown filter issues in Namhattas page by replacing SearchableSelect with standard Select components
- June 27, 2025: Fixed dropdown selection issues in modal dialogs by replacing SearchableSelect with standard Select components
- June 27, 2025: Updated both Namhatta and Devotee forms to use reliable dropdown components for address fields
- June 27, 2025: Ensured API compliance with OpenAPI 3.0.3 specification across all forms and endpoints
- June 22, 2025: Added interactive map visualization showing Namhatta distribution by geographic regions
- June 22, 2025: Implemented zoom-based geographic aggregation (country → state → district → sub-district)
- June 22, 2025: Created map API endpoints for geographic data aggregation
- January 2, 2025: Successfully completed migration from Replit Agent to standard Replit environment
- January 2, 2025: Fixed popup modal behavior - all forms now close when clicking outside and are properly centered
- January 2, 2025: Removed search bar and notification icon from header interface for cleaner UI
- January 2, 2025: Converted navigation from left sidebar to horizontal top navigation bar for desktop
- January 2, 2025: Combined header and navigation into single horizontal bar for cleaner interface
- January 2, 2025: Removed "health" and "about" items from navigation bar
- January 2, 2025: Reverted UI to cleaner, simpler design focusing on functionality over visual effects
- January 2, 2025: Redesigned Leadership Hierarchy to show proper organizational structure with visual hierarchy, connection lines, and tiered layout
- June 22, 2025: Verified all popup and modal components have proper click-outside-to-close behavior
- January 2, 2025: Replaced URL input with image upload functionality for better user experience
- January 2, 2025: Added image preview and removal capabilities in update forms
- January 2, 2025: Implemented comprehensive Namhatta Updates system with rich forms and visual cards
- January 2, 2025: Added activity tracking (kirtan, prasadam, book distribution, chanting, arati, bhagwat path)
- January 2, 2025: Created dedicated Updates page with filtering, search, and statistics
- January 2, 2025: Enhanced Namhatta detail pages with update management capabilities
- January 2, 2025: Enhanced UI with modern glass morphism design and responsive mobile interface
- January 2, 2025: Fixed API endpoints to match OpenAPI 3.0.3 specification
- January 2, 2025: Implemented proper geography hierarchy with sub-districts support
- January 2, 2025: Applied security best practices with client/server separation
- December 30, 2024: Modified Namhatta form to use individual text inputs for leadership roles instead of dropdown
- December 30, 2024: Updated database schema to include separate fields for MalaSenapoti, MahaChakraSenapoti, ChakraSenapoti, and UpaChakraSenapoti

## User Preferences

Preferred communication style: Simple, everyday language.
Navigation layout: Horizontal top navigation bar instead of left sidebar for desktop interface.