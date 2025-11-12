import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import validator from 'validator';
import { verifyToken, isTokenBlacklisted } from './jwt';
import { validateSession } from './session';
import { getUserWithDistricts } from '../storage-auth';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        username: string;
        role: 'ADMIN' | 'OFFICE' | 'DISTRICT_SUPERVISOR';
        districts: string[];
      };
    }
  }
}

// Rate limiting for login attempts  
export const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: { error: 'Too many login attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
  validate: {
    trustProxy: false, // Disable proxy validation for Replit
    xForwardedForHeader: false, // Disable X-Forwarded-For header validation
  },
});

// Authentication middleware with production-safe development bypass
export const authenticateJWT = async (req: Request, res: Response, next: NextFunction) => {
  // Development bypass - ONLY allowed in development environment
  if (process.env.AUTHENTICATION_ENABLED === 'false' && process.env.NODE_ENV === 'development') {
    console.warn('⚠️ WARNING: Authentication bypass is active in development mode');
    req.user = {
      id: 1,
      username: 'dev-user',
      role: 'ADMIN',
      districts: [] // Full access in dev mode
    };
    return next();
  }
  
  // Fail-safe: Ensure authentication bypass is never active in production
  if (process.env.AUTHENTICATION_ENABLED === 'false' && process.env.NODE_ENV === 'production') {
    console.error('🚨 SECURITY ERROR: Authentication bypass attempted in production!');
    return res.status(500).json({ error: 'Security configuration error' });
  }

  try {
    // Extract token from cookies
    const token = req.cookies?.auth_token;
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Check if token is blacklisted
    if (await isTokenBlacklisted(token)) {
      return res.status(401).json({ error: 'Token invalidated' });
    }

    // Verify JWT token
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Validate session (single login enforcement)
    const sessionValid = await validateSession(decoded.userId, decoded.sessionToken);
    if (!sessionValid) {
      return res.status(401).json({ error: 'Session expired or invalid' });
    }

    // Get user with current districts
    const user = await getUserWithDistricts(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }

    // Attach user to request
    req.user = {
      id: user.id,
      username: user.username,
      role: user.role as 'ADMIN' | 'OFFICE' | 'DISTRICT_SUPERVISOR',
      districts: user.districts
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ error: 'Authentication failed' });
  }
};

// Authorization middleware - check roles
export const authorize = (allowedRoles: Array<'ADMIN' | 'OFFICE' | 'DISTRICT_SUPERVISOR'>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Skip authorization in development bypass mode - ONLY in development
    if (process.env.AUTHENTICATION_ENABLED === 'false' && process.env.NODE_ENV === 'development') {
      return next();
    }
    
    // Fail-safe: Block authorization bypass in production
    if (process.env.AUTHENTICATION_ENABLED === 'false' && process.env.NODE_ENV === 'production') {
      console.error('🚨 SECURITY ERROR: Authorization bypass attempted in production!');
      return res.status(500).json({ error: 'Security configuration error' });
    }

    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

// District access validation middleware
export const validateDistrictAccess = (req: Request, res: Response, next: NextFunction) => {
  // Skip district validation in development bypass mode - ONLY in development
  if (process.env.AUTHENTICATION_ENABLED === 'false' && process.env.NODE_ENV === 'development') {
    return next();
  }
  
  // Fail-safe: Block district validation bypass in production
  if (process.env.AUTHENTICATION_ENABLED === 'false' && process.env.NODE_ENV === 'production') {
    console.error('🚨 SECURITY ERROR: District validation bypass attempted in production!');
    return res.status(500).json({ error: 'Security configuration error' });
  }

  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // ADMIN and OFFICE have access to all districts
  if (req.user.role === 'ADMIN' || req.user.role === 'OFFICE') {
    return next();
  }

  // DISTRICT_SUPERVISOR: Add district filtering to request
  if (req.user.role === 'DISTRICT_SUPERVISOR') {
    // Add districts filter to request for use in queries
    req.body.allowedDistricts = req.user.districts;
    req.query.allowedDistricts = req.user.districts.join(',');
  }

  next();
};

// Input sanitization middleware
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  const sanitizeValue = (value: any): any => {
    if (typeof value === 'string') {
      // Trim whitespace and escape HTML entities
      return validator.escape(value.trim());
    }
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // Recursively sanitize object properties
      const sanitized: any = {};
      Object.keys(value).forEach(key => {
        sanitized[key] = sanitizeValue(value[key]);
      });
      return sanitized;
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    return value;
  };

  // Only sanitize for POST, PUT, PATCH requests
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    req.body = sanitizeValue(req.body);
  }

  next();
};