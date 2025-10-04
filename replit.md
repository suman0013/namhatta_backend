# Namhatta Management System

## Overview
This is a full-stack web application designed for managing Namhatta religious/spiritual organizations. Its primary purpose is to provide comprehensive functionality for the management of devotees, Namhattas (spiritual centers), hierarchical leadership structures, and devotional statuses. The system aims to streamline administrative tasks and enhance the organizational capabilities of Namhatta centers.

## User Preferences
Preferred communication style: Simple, everyday language.
Navigation layout: Horizontal top navigation bar instead of left sidebar for desktop interface.

## Recent Changes

### October 2025 - Replit Environment Setup ✅
- **Environment Configuration**: Successfully imported and configured project for Replit environment
- **Workflow Setup**: Configured development workflow to run on port 5000 with webview output
- **CSP Configuration**: Updated Content Security Policy to allow Leaflet CSS and Replit development banner
- **Database**: Verified PostgreSQL database connection and schema is up to date
- **Deployment**: Configured autoscale deployment with proper build and start commands
- **Status**: Project is fully operational in Replit environment

### January 2025 - District Supervisor Assignment Implementation COMPLETED ✅
- **Database Schema**: Added mandatory `districtSupervisorId` field to namhattas table with NOT NULL constraint
- **Backend APIs**: Implemented district supervisor lookup (`/api/district-supervisors`) and user address defaults (`/api/user/address-defaults`) endpoints
- **Frontend Integration**: Enhanced NamhattaForm with complete role-based district supervisor selection and validation
- **Role-based Features**: 
  - District Supervisors: Auto-assignment + address pre-filling (country/state/district locked)
  - Admin/Office Users: Manual supervisor selection with district-based filtering
- **Data Migration**: Created migration script (`migrate-district-supervisors.sql`) for existing namhattas
- **Testing & Validation**: Comprehensive frontend testing completed with 12/12 tests passing, covering all business logic, form validation, error handling, and user workflows
- **Production Ready**: Feature fully implemented and tested, ready for deployment

### October 2025 - Spring Boot Migration Phase 5 COMPLETED ✅
- **Migration Strategy**: Parallel implementation of Spring Boot 3 + Java 17 backend while maintaining existing Node.js frontend
- **Database Preservation**: Using existing Neon PostgreSQL database with NO schema changes - strict API compatibility maintained
- **Phase 5 Deliverables**: 
  - **AddressService**: Geographic data management with pincode search, hierarchical location queries (country/state/district/subdistrict/village), address creation and linking for devotees and namhattas
  - **DevoteeService**: Comprehensive devotee management including CRUD operations, pagination with district-based filtering, status upgrades with history tracking, leadership role assignment, and role-based access control
  - **NamhattaService**: Namhatta management with CRUD operations, approval workflow (pending/approved/rejected), registration number validation, devotee listings by namhatta, and status reporting
- **Implementation Details**: 
  - Created comprehensive DTOs (DevoteeDTO, NamhattaDTO, AddressData, PincodeSearchResult)
  - Fixed repository queries to match actual entity field names (name vs spiritualName, devotionalStatusId vs statusId)
  - Implemented transaction management with @Transactional
  - Added validation and error handling throughout all services
- **Status**: Phase 5 completed - all three core services implemented and ready for Phase 6 (Role Management Services)

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter
- **State Management**: React Query (TanStack Query) for server state
- **Styling**: Tailwind CSS with custom design system, glass morphism design
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Build Tool**: Vite
- **UI/UX Decisions**: Responsive app layout, consistent gradient styling, custom scrollbars, minimal and compact layouts for data-heavy pages, modern visual design for cards and sections (e.g., gradient backgrounds, floating animations), automatic scroll-to-top on navigation, dark mode support.

### Backend Architecture
- **Runtime**: Node.js 20 with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT tokens with HTTP-only cookies, bcrypt password hashing, PostgreSQL-based sessions with single login enforcement
- **Authorization**: Role-based access control (ADMIN, OFFICE, DISTRICT_SUPERVISOR) with district-based data filtering
- **Security**: Rate limiting, token blacklisting
- **API Design**: RESTful API with JSON responses, compliance with OpenAPI 3.0.3 specification

### Data Storage Solutions
- **Primary Database**: PostgreSQL hosted on Neon (serverless)
- **ORM**: Drizzle ORM for type-safe database operations and migrations (Drizzle Kit)
- **Session Storage**: PostgreSQL-based session store
- **Connection**: Neon serverless PostgreSQL with connection pooling

### Key System Features
- **Database Schema**: Manages Devotees, Namhattas, Devotional Statuses, Shraddhakutirs, Leaders, normalized Addresses, Users (with roles and sessions), User_Districts, and JWT_Blacklist.
- **Data Entry Forms**: Comprehensive forms with validation for devotees, namhattas, and updates, including streamlined pincode-based address entry.
- **Data Display**: Paginated lists with filtering and search, detailed views with tabbed interfaces, dynamic event status badges.
- **Dashboard**: Summary statistics, recent activity, status distribution.
- **Leadership Hierarchy**: Visual representation of the organizational structure with proper roles.
- **Geographic Information System (GIS)**: Interactive map visualization of Namhatta distribution with zoom-based geographic aggregation (country → state → district → sub-district → village).
- **Updates System**: Comprehensive Namhatta Updates system with rich forms, activity tracking (kirtan, prasadam, book distribution, chanting, arati, bhagwat path), image upload, and dedicated Updates page with filtering and search.
- **Address Management**: Normalized address handling, present and permanent addresses for devotees, and proper address linking for Namhattas.

## External Dependencies

- **React Ecosystem**: React 18, React Query, React Hook Form
- **Backend Framework**: Express.js
- **Runtime**: Node.js
- **Database**: PostgreSQL (Neon), Drizzle ORM
- **UI Libraries**: Radix UI, Tailwind CSS, shadcn/ui, Lucide Icons
- **Authentication**: bcryptjs, jsonwebtoken
- **Build Tools**: Vite, ESBuild
- **Other**: Wouter (router)