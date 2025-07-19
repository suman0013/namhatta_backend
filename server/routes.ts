import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertDevoteeSchema, 
  insertNamhattaSchema, 
  insertDevotionalStatusSchema, 
  insertShraddhakutirSchema, 
  insertNamhattaUpdateSchema,
  insertLeaderSchema,
  insertAddressSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check
  app.get("/api/health", async (req, res) => {
    res.json({ status: "OK" });
  });

  // About
  app.get("/api/about", async (req, res) => {
    res.json({
      name: "Namhatta Management System",
      version: "1.0.0",
      description: "OpenAPI spec for Namhatta web and mobile-compatible system"
    });
  });

  // Devotees
  app.get("/api/devotees", async (req, res) => {
    try {
      const devotees = await storage.getDevotees();
      res.json(devotees);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch devotees" });
    }
  });

  app.get("/api/devotees/:id", async (req, res) => {
    try {
      const devotee = await storage.getDevotee(parseInt(req.params.id));
      if (!devotee) {
        return res.status(404).json({ error: "Devotee not found" });
      }
      res.json(devotee);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch devotee" });
    }
  });

  app.post("/api/devotees", async (req, res) => {
    try {
      const result = insertDevoteeSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.errors });
      }
      const devotee = await storage.createDevotee(result.data);
      res.status(201).json(devotee);
    } catch (error) {
      res.status(500).json({ error: "Failed to create devotee" });
    }
  });

  // Namhattas
  app.get("/api/namhattas", async (req, res) => {
    try {
      const namhattas = await storage.getNamhattas();
      res.json(namhattas);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch namhattas" });
    }
  });

  app.get("/api/namhattas/:id", async (req, res) => {
    try {
      const namhatta = await storage.getNamhatta(parseInt(req.params.id));
      if (!namhatta) {
        return res.status(404).json({ error: "Namhatta not found" });
      }
      res.json(namhatta);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch namhatta" });
    }
  });

  app.post("/api/namhattas", async (req, res) => {
    try {
      const result = insertNamhattaSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.errors });
      }
      const namhatta = await storage.createNamhatta(result.data);
      res.status(201).json(namhatta);
    } catch (error) {
      res.status(500).json({ error: "Failed to create namhatta" });
    }
  });

  // Devotional Statuses
  app.get("/api/devotional-statuses", async (req, res) => {
    try {
      const statuses = await storage.getDevotionalStatuses();
      res.json(statuses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch devotional statuses" });
    }
  });

  // Shraddhakutirs
  app.get("/api/shraddhakutirs", async (req, res) => {
    try {
      const shraddhakutirs = await storage.getShraddhakutirs();
      res.json(shraddhakutirs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch shraddhakutirs" });
    }
  });

  // Leaders
  app.get("/api/leaders", async (req, res) => {
    try {
      const leaders = await storage.getLeaders();
      res.json(leaders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch leaders" });
    }
  });

  // Addresses
  app.get("/api/addresses", async (req, res) => {
    try {
      const addresses = await storage.getAddresses();
      res.json(addresses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch addresses" });
    }
  });

  // Status History
  app.get("/api/status-history", async (req, res) => {
    try {
      const devoteeId = req.query.devoteeId ? parseInt(req.query.devoteeId as string) : undefined;
      const history = await storage.getStatusHistory(devoteeId);
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch status history" });
    }
  });

  // Namhatta Updates
  app.get("/api/namhatta-updates", async (req, res) => {
    try {
      const namhattaId = req.query.namhattaId ? parseInt(req.query.namhattaId as string) : undefined;
      const updates = await storage.getNamhattaUpdates(namhattaId);
      res.json(updates);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch namhatta updates" });
    }
  });

  app.post("/api/namhatta-updates", async (req, res) => {
    try {
      const result = insertNamhattaUpdateSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.errors });
      }
      const update = await storage.createNamhattaUpdate(result.data);
      res.status(201).json(update);
    } catch (error) {
      res.status(500).json({ error: "Failed to create namhatta update" });
    }
  });

  const server = createServer(app);
  return server;
}