# Namhatta Management System

A comprehensive full-stack web application for managing Namhatta religious/spiritual organizations. Built with React, TypeScript, Express.js, and SQLite/MySQL.

## Features

- **Devotee Management**: Track personal information, spiritual status, and devotional progress
- **Namhatta Centers**: Manage spiritual centers with location and organizational details
- **Leadership Hierarchy**: Hierarchical leadership structure management
- **Updates System**: Track activities like kirtan, prasadam, book distribution
- **Geographic Data**: Comprehensive Indian location database
- **Dashboard**: Statistics and recent activity overview
- **Responsive Design**: Mobile-compatible interface with dark/light themes

## Tech Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS + shadcn/ui components
- Wouter for routing
- TanStack Query for state management
- Vite for build tooling

### Backend
- Node.js 20 with Express.js
- TypeScript with ES modules
- SQLite (development) / MySQL (production)
- Drizzle ORM for database operations

## Prerequisites

Before running the application locally, ensure you have the following installed:

- **Node.js 20+** - [Download here](https://nodejs.org/)
- **npm** or **yarn** - Package manager (comes with Node.js)
- **Git** - Version control system

## Local Development Setup

### Step 1: Clone the Repository

```bash
git clone <your-repository-url>
cd namhatta-management-system
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Frontend dependencies (React, Tailwind, etc.)
- Backend dependencies (Express, Drizzle ORM, etc.)
- Development tools (TypeScript, Vite, etc.)

### Step 3: Environment Configuration

Create a `.env` file in the root directory:

#### For SQLite (Default)
```env
# Database Configuration
NODE_ENV=development
DATABASE_URL=./namhatta.db

# API Configuration (optional)
VITE_API_BASE_URL=http://localhost:5000
```

#### For MySQL (Local Database)
```env
# MySQL Database Configuration
DATABASE_URL=mysql://username:password@localhost:3306/namhatta_management

# API Configuration (optional)
VITE_API_BASE_URL=http://localhost:5000
```

**Note**: 
- The application uses SQLite by default for development
- To use MySQL, see the detailed [MySQL Setup Guide](MYSQL_SETUP.md)
- Replace `username`, `password`, and database name with your actual MySQL credentials

### Step 4: Database Setup

The application comes with a pre-populated SQLite database (`namhatta.db`) containing sample data:
- 252 devotees
- 26 namhattas
- Geographic data for Indian locations
- Sample leadership hierarchy

If you need to reset the database or create a fresh one:

**For SQLite:**
```bash
# Push database schema (creates tables)
npm run db:push

# Optional: Run custom seed script if available
node seed-script.ts
```

**For MySQL:**
```bash
# Push database schema to MySQL (creates tables)
npx drizzle-kit push --config=drizzle.config.mysql.ts

# Optional: Run custom seed script if available
node seed-script.ts
```

### Step 5: Start the Development Server

```bash
npm run dev
```

This command:
- Starts the Express.js backend server on port 5000
- Launches the Vite development server for the frontend
- Enables hot module replacement for fast development
- Serves both frontend and backend on the same port

### Step 6: Access the Application

Open your browser and navigate to:
```
http://localhost:5000
```

The application will be available with:
- Frontend: React application with all pages
- Backend API: Available at `http://localhost:5000/api/*`
- Database: SQLite file in the root directory

## Available Scripts

### Development
```bash
npm run dev          # Start development server
npm run check        # Run TypeScript type checking
```

### Production
```bash
npm run build        # Build for production
npm run start        # Start production server
```

### Database
```bash
npm run db:push      # Push database schema changes (SQLite)
npx drizzle-kit push --config=drizzle.config.mysql.ts    # Push schema to MySQL
```

## Project Structure

```
namhatta-management-system/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Application pages
│   │   ├── lib/           # Utilities and configurations
│   │   └── hooks/         # Custom React hooks
│   └── index.html
├── server/                 # Backend Express application
│   ├── index.ts           # Main server file
│   ├── routes.ts          # API routes
│   ├── db.ts              # Database configuration
│   └── storage-fresh.ts   # Database operations
├── shared/                 # Shared TypeScript schemas
│   └── schema.ts          # Database schema definitions
├── namhatta.db            # SQLite database file
└── package.json
```

## API Endpoints

The application provides comprehensive REST API endpoints:

### Core Endpoints
- `GET /api/health` - Health check
- `GET /api/about` - Application information
- `GET /api/dashboard` - Dashboard statistics

### Devotee Management
- `GET /api/devotees` - List all devotees
- `POST /api/devotees` - Create new devotee
- `GET /api/devotees/:id` - Get devotee details
- `PUT /api/devotees/:id` - Update devotee
- `DELETE /api/devotees/:id` - Delete devotee

### Namhatta Management
- `GET /api/namhattas` - List all namhattas
- `POST /api/namhattas` - Create new namhatta
- `GET /api/namhattas/:id` - Get namhatta details
- `PUT /api/namhattas/:id` - Update namhatta

### Geographic Data
- `GET /api/countries` - List countries
- `GET /api/states` - List states
- `GET /api/districts` - List districts
- `GET /api/sub-districts` - List sub-districts
- `GET /api/villages` - List villages

## Database Schema

The application uses the following main entities:

### Devotees
- Personal information (name, DOB, contact details)
- Address information (present/permanent)
- Spiritual status and initiation details
- Devotional courses and progress

### Namhattas
- Center information (name, code, meeting schedule)
- Location details
- Leadership roles
- Activity tracking

### Supporting Tables
- `devotional_statuses` - Spiritual hierarchy levels
- `status_history` - Devotee status change tracking
- `namhatta_updates` - Activity and event updates
- `shraddhakutirs` - Regional administrative units

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Kill process using port 5000
   lsof -ti:5000 | xargs kill -9
   ```

2. **Database Connection Issues**
   - Ensure `namhatta.db` file exists in root directory
   - Check file permissions
   - Run `npm run db:push` to recreate tables

3. **Module Not Found Errors**
   ```bash
   # Clear node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **TypeScript Errors**
   ```bash
   # Run type checking
   npm run check
   ```

### Development Tips

- Use browser developer tools to inspect API calls
- Check console logs for debugging information
- Database changes require server restart
- Frontend changes auto-reload with Vite

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the API documentation
3. Create an issue in the repository
4. Contact the development team

---

**Note**: This application is designed for managing Namhatta spiritual organizations and includes specific workflows for devotee management, spiritual status tracking, and organizational hierarchy management.