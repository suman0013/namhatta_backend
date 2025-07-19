# Namhatta Management System

## Overview
A comprehensive Namhatta Management System built with React, Express, and PostgreSQL. This system manages devotees, namhattas (spiritual communities), devotional statuses, and organizational hierarchy for spiritual organizations.

## Recent Changes
- **2025-01-19**: Successfully migrated from Replit Agent to Replit environment
- **2025-01-19**: Configured PostgreSQL database with Neon
- **2025-01-19**: Created complete Drizzle schema with all required tables
- **2025-01-19**: Set up proper TypeScript configuration for ES2022 modules
- **2025-01-19**: Application now running successfully on port 5000

## Project Architecture

### Backend
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL (Neon)
- **ORM**: Drizzle ORM with relations
- **Schema**: Located in `shared/schema.ts`
- **Storage**: DatabaseStorage class implementing IStorage interface
- **Routes**: RESTful API endpoints in `server/routes.ts`

### Frontend
- **Framework**: React with TypeScript
- **Routing**: Wouter for client-side routing
- **UI**: Shadcn/ui components with Tailwind CSS
- **State**: TanStack Query for server state management
- **Forms**: React Hook Form with Zod validation

### Database Schema
- **devotees**: Core devotee information with spiritual progress tracking
- **namhattas**: Spiritual community centers with leadership hierarchy
- **devotional_statuses**: 7-level devotional progression system
- **addresses**: Geographic location data
- **shraddhakutirs**: Regional spiritual centers
- **status_history**: Devotee advancement tracking
- **namhatta_updates**: Community activity reports
- **leaders**: Organizational hierarchy management

### Key Features
- Devotee registration and management
- Spiritual progression tracking (7 levels)
- Namhatta community management
- Geographic organization (country/state/district)
- Leadership hierarchy management
- Activity and update reporting
- Mobile-responsive design

## Development Guidelines

### Database Operations
- Use `npm run db:push` to sync schema changes
- All database operations through Drizzle ORM
- Relations properly defined for efficient queries
- TypeScript types auto-generated from schema

### Code Organization
- Shared types and schemas in `shared/`
- Backend API in `server/`
- Frontend components in `client/src/`
- Strict TypeScript with ES2022 target

### Environment Setup
- PostgreSQL database via Neon (configured)
- All required packages installed
- Development server runs on port 5000
- Hot reloading enabled for development

## User Preferences
- Focus on robust database design and relationships
- Secure data handling practices
- Clear separation between client and server
- Mobile-responsive UI requirements
- Multi-level organizational hierarchy support

## Current Status
✅ Migration from Replit Agent completed successfully
✅ Database schema deployed and functional
✅ Application running and accessible
✅ All dependencies properly configured

Ready for feature development and customization!