import dotenv from "dotenv";
import express, { type Request, Response, NextFunction } from "express";
import helmet from "helmet";
import cors from "cors";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

// Load environment variables from .env file
dotenv.config({ path: ['.env.local', '.env'] });

const app = express();

// Trust proxy for Replit environment to fix rate limiting
app.set('trust proxy', true);

// CORS configuration - restrict cross-origin requests
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? (origin, callback) => {
        // In production, be strict about origins
        const allowedOrigins = [
          process.env.REPLIT_DOMAINS || 'https://*.replit.app',
          process.env.ALLOWED_ORIGINS || ''
        ].filter(Boolean);
        
        if (!origin) return callback(null, true); // Allow requests with no origin
        
        const isAllowed = allowedOrigins.some(allowed => 
          allowed.includes('*') ? 
            origin.match(allowed.replace('*', '.*')) : 
            origin === allowed
        );
        
        if (isAllowed) {
          return callback(null, true);
        }
        
        return callback(new Error('Not allowed by CORS'), false);
      }
    : true, // In development, allow all origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  maxAge: 86400 // Cache preflight response for 24 hours
}));

// Security headers - protect against common vulnerabilities
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Needed for React dev
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.replit.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null
    }
  } : false,
  crossOriginEmbedderPolicy: process.env.NODE_ENV === 'production',
  hsts: process.env.NODE_ENV === 'production' ? {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  } : false
}));

// Request size limits to prevent DoS attacks
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    
    // Log detailed error for debugging (server-side only)
    console.error('Server error:', {
      error: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method,
      ip: req.ip,
      timestamp: new Date().toISOString()
    });
    
    // Return sanitized error message to client
    let message = "Internal Server Error";
    if (status < 500) {
      // Client errors (4xx) can show more specific messages
      message = err.message || "Bad Request";
    } else {
      // Server errors (5xx) should not expose internal details
      message = "Internal Server Error";
    }

    res.status(status).json({ error: message });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  
  // Use 0.0.0.0 for Replit environment to allow external access
  const host = '0.0.0.0';
  
  server.listen({
    port,
    host,
    reusePort: process.env.NODE_ENV !== 'development', // Disable reusePort for local dev
  }, () => {
    log(`serving on port ${port}`);
  });
})();
