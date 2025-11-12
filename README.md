# Namhatta Management System

A comprehensive web application for managing Namhatta religious/spiritual organizations, built with React and Express.js.

## Quick Start

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd namhatta-management-system
   npm install
   ```

2. **Database Setup**
   The project is pre-configured with a specific Neon PostgreSQL database. The `.env` file contains the database URL:
   ```
   DATABASE_URL=postgresql://neondb_owner:npg_5MIwCD4YhSdP@ep-calm-silence-a15zko7l-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
   ```

3. **Initialize Database Schema**
   ```bash
   npm run db:push
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```
   Application will be available at `http://localhost:5000`

## Database Configuration

The application uses a specific Neon PostgreSQL database by default. This configuration ensures:
- Consistent database access across different environments
- No need for users to set up their own database
- Automatic connection when importing the project

If you need to use a different database, update the `DATABASE_URL` in the `.env` file.

## Architecture

- **Frontend**: React 18 + TypeScript + Tailwind CSS (`frontend/` directory)
- **Backend (Node.js)**: Express.js + TypeScript (`backend-node/` directory)
- **Backend (Spring Boot)**: Java + Spring Boot (`backend-spring/` directory)
- **Database**: PostgreSQL with Drizzle ORM
- **Build Tool**: Vite for frontend, ESBuild for backend
- **Documentation**: All documentation files in `docs/` directory

## Key Features

- Devotee management with comprehensive profiles
- Namhatta (spiritual center) administration
- Leadership hierarchy tracking
- Geographic organization by regions
- Real-time updates and notifications
- Responsive mobile-friendly interface

## Project Structure

```
├── frontend/              # React frontend application
├── backend-node/          # Node.js/Express backend (default)
├── backend-spring/        # Spring Boot backend (alternative)
├── docs/                  # All documentation files
├── attached_assets/       # Images and data files used in the app
├── shared/                # Shared TypeScript schemas
└── migrations/            # Database migration files
```

For detailed documentation, see `replit.md` and files in the `docs/` directory.