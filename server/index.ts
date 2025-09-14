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
        if (!origin) {
          // Allow requests with no origin (mobile apps, Postman, etc.)
          return callback(null, true);
        }
        
        // Allow same-origin requests
        if (origin === `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`) {
          return callback(null, true);
        }
        
        // Allow explicitly configured additional origins
        const additionalOrigins = process.env.ALLOWED_ORIGINS ? 
          process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()) : [];
        
        if (additionalOrigins.includes(origin)) {
          return callback(null, true);
        }
        
        // Secure pattern matching for *.replit.app domains only
        const replitAppPattern = /^https:\/\/[a-zA-Z0-9\-]+\.replit\.app$/;
        if (replitAppPattern.test(origin)) {
          return callback(null, true);
        }
        
        console.warn(`CORS blocked origin: ${origin}`);
        return callback(new Error('Not allowed by CORS'), false);
      }
    : true, // In development, allow all origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Cache-Control'],
  maxAge: 86400 // Cache preflight response for 24 hours
}));

// Security headers - protect against common vulnerabilities
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"], // Remove unsafe-inline and unsafe-eval in production
      styleSrc: ["'self'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.replit.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
      upgradeInsecureRequests: [],
      baseUri: ["'self'"],
      formAction: ["'self'"]
    }
  } : {
    // Development CSP - more relaxed for Vite HMR and debugging
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Allow for Vite HMR
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws:", "wss:", "https://api.replit.com"], // Allow WebSocket for HMR
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"]
    }
  },
  crossOriginEmbedderPolicy: process.env.NODE_ENV === 'production',
  hsts: process.env.NODE_ENV === 'production' ? {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  } : false,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" }
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
