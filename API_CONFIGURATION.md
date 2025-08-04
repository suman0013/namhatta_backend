# API Configuration Guide

This guide explains how to configure the Namhatta Management System frontend to connect to different backend APIs.

## Overview

The frontend is designed to work with your existing Java Spring Boot backend. It uses environment variables to dynamically configure the API base URL, making it easy to switch between development and production environments.

## Environment Variables

### VITE_API_BASE_URL

This is the main configuration variable that determines which backend API the frontend will connect to.

**Default Value**: `http://localhost:5000` (Node.js backend for development)

**For Production**: Set this to your Java Spring Boot backend URL

## Configuration Files

### 1. `.env` file (Current environment)
```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:5000

# App Configuration
VITE_APP_NAME=Namhatta Management System
VITE_APP_VERSION=1.0.0
```

### 2. `.env.example` file (Template for new deployments)
```bash
# API Configuration
# For local development with Node.js backend
VITE_API_BASE_URL=http://localhost:5000

# For production with Java Spring Boot backend
# VITE_API_BASE_URL=https://your-spring-boot-api.com

# Other environment variables
VITE_APP_NAME=Namhatta Management System
VITE_APP_VERSION=1.0.0
```

## How to Switch to Java Spring Boot Backend

### For Development
1. Update the `.env` file:
```bash
VITE_API_BASE_URL=http://localhost:8080
```

### For Production Deployment
1. Set the environment variable in your deployment platform:
```bash
VITE_API_BASE_URL=https://your-spring-boot-api.com
```

2. Or create a production `.env.production` file:
```bash
VITE_API_BASE_URL=https://your-spring-boot-api.com
VITE_APP_NAME=Namhatta Management System
VITE_APP_VERSION=1.0.0
```

## API Endpoints Expected

Your Java Spring Boot backend should implement these endpoints:

### Authentication & Session
- `GET /api/dashboard` - Dashboard summary data
- `GET /api/hierarchy` - Leadership hierarchy

### Geography
- `GET /api/countries` - List of countries
- `GET /api/states?country={country}` - States by country
- `GET /api/districts?state={state}` - Districts by state
- `GET /api/sub-districts?district={district}` - Sub-districts by district
- `GET /api/villages?subDistrict={subDistrict}` - Villages by sub-district
- `GET /api/pincodes?village={village}` - Pincodes by village

### Devotees
- `GET /api/devotees` - List devotees (with pagination, filtering, sorting)
- `POST /api/devotees` - Create new devotee
- `GET /api/devotees/{id}` - Get devotee details
- `PUT /api/devotees/{id}` - Update devotee
- `DELETE /api/devotees/{id}` - Delete devotee
- `GET /api/devotees/{id}/status-history` - Get status change history
- `POST /api/devotees/{id}/status` - Update devotee status

### Namhattas
- `GET /api/namhattas` - List namhattas (with pagination, filtering, sorting)
- `POST /api/namhattas` - Create new namhatta
- `GET /api/namhattas/{id}` - Get namhatta details
- `PUT /api/namhattas/{id}` - Update namhatta
- `DELETE /api/namhattas/{id}` - Delete namhatta
- `GET /api/namhattas/{id}/updates` - Get namhatta updates
- `POST /api/namhattas/{id}/updates` - Create namhatta update

### Statuses
- `GET /api/statuses` - List devotional statuses
- `POST /api/statuses` - Create new status
- `PUT /api/statuses/{id}` - Update status
- `DELETE /api/statuses/{id}` - Delete status

### Updates
- `GET /api/updates` - List all updates (with filtering)
- `POST /api/updates` - Create new update
- `PUT /api/updates/{id}` - Update existing update
- `DELETE /api/updates/{id}` - Delete update

### Map Data
- `GET /api/map/countries` - Country boundaries for map
- `GET /api/map/states` - State boundaries for map
- `GET /api/map/districts` - District boundaries for map
- `GET /api/map/sub-districts` - Sub-district boundaries for map
- `GET /api/map/villages` - Village points for map

## Request/Response Format

All API endpoints should:
- Accept and return JSON data
- Use standard HTTP status codes
- Support CORS for cross-origin requests
- Handle authentication/authorization as needed

### Example Response Format
```json
{
  "success": true,
  "data": [...],
  "message": "Success",
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

## Testing the Configuration

1. Update your `.env` file with the Java backend URL
2. Restart the development server: `npm run dev`
3. Open browser console and check for API configuration logs
4. Test API calls in Network tab to verify correct URLs

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure your Java backend allows CORS from the frontend domain
2. **404 Not Found**: Check that all API endpoints are implemented in your Java backend
3. **Authentication Issues**: Verify session/token handling between frontend and backend
4. **Network Timeouts**: Increase timeout in `client/src/lib/api-config.ts` if needed

### Debug Mode

The frontend logs API configuration in development mode. Check browser console for:
```
🚀 API Configuration: {
  baseUrl: "http://localhost:8080",
  mode: "development",
  isDev: true
}
```

## Deployment Checklist

- [ ] Java Spring Boot backend is running and accessible
- [ ] All required API endpoints are implemented
- [ ] CORS is configured for your frontend domain
- [ ] Environment variable `VITE_API_BASE_URL` is set correctly
- [ ] Frontend can successfully connect to backend APIs
- [ ] Authentication/session management is working
- [ ] All features are tested with real Java backend data

## Support

If you encounter issues connecting to your Java backend, please check:
1. Backend server is running and accessible
2. API endpoints match the expected format
3. CORS headers are properly configured
4. Authentication mechanisms are compatible