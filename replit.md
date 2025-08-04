# Namhatta Management System

## Overview
This is a full-stack web application designed for managing Namhatta religious/spiritual organizations. Its primary purpose is to provide comprehensive functionality for the management of devotees, Namhattas (spiritual centers), hierarchical leadership structures, and devotional statuses. The system aims to streamline administrative tasks and enhance the organizational capabilities of Namhatta centers.

## User Preferences
Preferred communication style: Simple, everyday language.
Navigation layout: Horizontal top navigation bar instead of left sidebar for desktop interface.

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

## Recent Changes

### 2025-01-04: Gurudev Selection Fix & Project Cleanup
- **Fixed gurudev selection bug**: Updated form field names to match database schema (harinamInitiationGurudevId and pancharatrikInitiationGurudevId)
- **Enhanced backend**: Added gurudev name fetching in devotee queries with proper joins to gurudevs table
- **Updated types**: Fixed TypeScript interfaces to include gurudev display fields
- **Project cleanup**: Removed unnecessary files including:
  - 200+ attached assets (development images and text files)
  - Old documentation files (API_CONFIGURATION.md, AUTH_IMPLEMENTATION_PLAN.md, etc.)
  - Unused migration scripts and seed files
  - Configuration files no longer needed
- **Result**: Gurudev selections now save properly and display correctly in devotee views

## External Dependencies

- **React Ecosystem**: React 18, React Query, React Hook Form
- **Backend Framework**: Express.js
- **Runtime**: Node.js
- **Database**: PostgreSQL (Neon), Drizzle ORM
- **UI Libraries**: Radix UI, Tailwind CSS, shadcn/ui, Lucide Icons
- **Authentication**: bcryptjs, jsonwebtoken
- **Build Tools**: Vite, ESBuild
- **Other**: Wouter (router)

## Project Structure

```
/
├── client/                 # React frontend
├── server/                 # Express backend
├── shared/                 # Shared types and schemas
├── migrations/             # Database migrations
├── node_modules/           # Dependencies
├── package.json           # Project configuration
├── drizzle.config.ts      # Database configuration
├── vite.config.ts         # Build configuration
├── tailwind.config.ts     # Styling configuration
└── replit.md             # Project documentation
```