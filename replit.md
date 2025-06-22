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
- **Session Management**: PostgreSQL-based sessions with connect-pg-simple
- **API Design**: RESTful API with JSON responses

### Data Storage Solutions
- **Primary Database**: PostgreSQL hosted on Neon
- **ORM**: Drizzle ORM for type-safe database operations
- **Migrations**: Drizzle Kit for schema management
- **Session Storage**: PostgreSQL-based session store

## Key Components

### Database Schema
The application uses a PostgreSQL database with the following main entities:

1. **Devotees**: Personal information, addresses, spiritual status, and courses
2. **Namhattas**: Spiritual centers with location and organizational details
3. **Devotional Statuses**: Hierarchical spiritual levels (Bhakta, Initiated, etc.)
4. **Shraddhakutirs**: Regional spiritual administrative units
5. **Leaders**: Hierarchical leadership structure
6. **Geography**: Country, state, district, and village data

### Frontend Components
- **Layout System**: Responsive app layout with navigation
- **Forms**: Comprehensive forms for data entry with validation
- **Data Tables**: Paginated lists with filtering and search
- **Detail Views**: Individual entity pages with tabbed interfaces
- **Dashboard**: Summary statistics and recent activity

### API Structure
RESTful endpoints organized by resource:
- `/api/devotees` - Devotee management
- `/api/namhattas` - Namhatta center management
- `/api/statuses` - Devotional status management
- `/api/hierarchy` - Leadership hierarchy
- `/api/geography` - Location data (countries, states, districts)

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

## Changelog
- January 2, 2025: Successfully migrated from Replit Agent to standard Replit environment
- January 2, 2025: Enhanced UI with modern glass morphism design and responsive mobile interface
- January 2, 2025: Fixed API endpoints to match OpenAPI 3.0.3 specification
- January 2, 2025: Implemented proper geography hierarchy with sub-districts support
- January 2, 2025: Applied security best practices with client/server separation
- December 30, 2024: Modified Namhatta form to use individual text inputs for leadership roles instead of dropdown
- December 30, 2024: Updated database schema to include separate fields for MalaSenapoti, MahaChakraSenapoti, ChakraSenapoti, and UpaChakraSenapoti
- June 22, 2025: Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.