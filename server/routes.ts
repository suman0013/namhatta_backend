import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage-fresh";
import { insertDevoteeSchema, insertNamhattaSchema, insertDevotionalStatusSchema, insertShraddhakutirSchema, insertNamhattaUpdateSchema } from "@shared/schema";

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

  // Geography endpoints
  app.get("/api/countries", async (req, res) => {
    const countries = await storage.getCountries();
    res.json(countries);
  });

  app.get("/api/states", async (req, res) => {
    const { country } = req.query;
    if (!country) {
      return res.status(400).json({ message: "Country parameter is required" });
    }
    const states = await storage.getStates(country as string);
    res.json(states);
  });

  app.get("/api/districts", async (req, res) => {
    const { state } = req.query;
    if (!state) {
      return res.status(400).json({ message: "State parameter is required" });
    }
    const districts = await storage.getDistricts(state as string);
    res.json(districts);
  });

  app.get("/api/sub-districts", async (req, res) => {
    const { district } = req.query;
    if (!district) {
      return res.status(400).json({ message: "District parameter is required" });
    }
    const subDistricts = await storage.getSubDistricts(district as string);
    res.json(subDistricts);
  });

  app.get("/api/villages", async (req, res) => {
    const { subDistrict } = req.query;
    if (!subDistrict) {
      return res.status(400).json({ message: "Sub-district parameter is required" });
    }
    const villages = await storage.getVillages(subDistrict as string);
    res.json(villages);
  });

  // Map data endpoints
  app.get("/api/map/countries", async (req, res) => {
    const data = await storage.getNamhattaCountsByCountry();
    res.json(data);
  });

  app.get("/api/map/states", async (req, res) => {
    const data = await storage.getNamhattaCountsByState(); // Get all states
    res.json(data);
  });

  app.get("/api/map/districts", async (req, res) => {
    const data = await storage.getNamhattaCountsByDistrict(); // Get all districts
    res.json(data);
  });

  app.get("/api/map/sub-districts", async (req, res) => {
    const data = await storage.getNamhattaCountsBySubDistrict(); // Get all sub-districts
    res.json(data);
  });

  app.get("/api/map/villages", async (req, res) => {
    const data = await storage.getNamhattaCountsByVillage(); // Get all villages
    res.json(data);
  });

  // Dashboard
  app.get("/api/dashboard", async (req, res) => {
    const summary = await storage.getDashboardSummary();
    res.json(summary);
  });

  // Hierarchy
  app.get("/api/hierarchy", async (req, res) => {
    const hierarchy = await storage.getTopLevelHierarchy();
    res.json(hierarchy);
  });

  app.get("/api/hierarchy/:level", async (req, res) => {
    const { level } = req.params;
    const validLevels = ["DISTRICT_SUPERVISOR", "MALA_SENAPOTI", "MAHA_CHAKRA_SENAPOTI", "CHAKRA_SENAPOTI", "UPA_CHAKRA_SENAPOTI"];
    
    if (!validLevels.includes(level)) {
      return res.status(400).json({ message: "Invalid hierarchy level" });
    }
    
    const leaders = await storage.getLeadersByLevel(level);
    res.json(leaders);
  });

  // Devotees
  app.get("/api/devotees", async (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const size = parseInt(req.query.size as string) || 10;
    const filters = {
      search: req.query.search as string,
      country: req.query.country as string,
      state: req.query.state as string,
      district: req.query.district as string,
      statusId: req.query.statusId as string,
    };
    const result = await storage.getDevotees(page, size, filters);
    res.json(result);
  });

  app.get("/api/devotees/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const devotee = await storage.getDevotee(id);
    if (!devotee) {
      return res.status(404).json({ message: "Devotee not found" });
    }
    res.json(devotee);
  });

  app.post("/api/devotees", async (req, res) => {
    try {
      const devoteeData = insertDevoteeSchema.parse(req.body);
      const devotee = await storage.createDevotee(devoteeData);
      res.status(201).json(devotee);
    } catch (error) {
      res.status(400).json({ message: "Invalid devotee data", error });
    }
  });

  // Add devotee to specific Namhatta
  app.post("/api/devotees/:namhattaId", async (req, res) => {
    const namhattaId = parseInt(req.params.namhattaId);
    try {
      const devoteeData = insertDevoteeSchema.parse(req.body);
      const devotee = await storage.createDevoteeForNamhatta(devoteeData, namhattaId);
      res.status(201).json(devotee);
    } catch (error) {
      res.status(400).json({ message: "Invalid devotee data", error });
    }
  });

  app.put("/api/devotees/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    try {
      const devoteeData = insertDevoteeSchema.partial().parse(req.body);
      const devotee = await storage.updateDevotee(id, devoteeData);
      res.json(devotee);
    } catch (error) {
      res.status(400).json({ message: "Invalid devotee data", error });
    }
  });

  app.post("/api/devotees/:id/upgrade-status", async (req, res) => {
    const id = parseInt(req.params.id);
    const { newStatusId, notes } = req.body;
    
    if (!newStatusId) {
      return res.status(400).json({ message: "newStatusId is required" });
    }
    
    try {
      await storage.upgradeDevoteeStatus(id, newStatusId, notes);
      res.json({ message: "Status updated successfully" });
    } catch (error) {
      res.status(404).json({ message: "Devotee not found" });
    }
  });

  app.get("/api/devotees/:id/status-history", async (req, res) => {
    const id = parseInt(req.params.id);
    const history = await storage.getDevoteeStatusHistory(id);
    res.json(history);
  });

  // Namhattas
  app.get("/api/namhattas", async (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const size = parseInt(req.query.size as string) || 10;
    const result = await storage.getNamhattas(page, size, req.query);
    res.json(result);
  });

  app.get("/api/namhattas/pending", async (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const size = parseInt(req.query.size as string) || 10;
    const result = await storage.getNamhattas(page, size, { status: "PENDING_APPROVAL" });
    res.json(result.data);
  });

  app.get("/api/namhattas/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const namhatta = await storage.getNamhatta(id);
    if (!namhatta) {
      return res.status(404).json({ message: "Namhatta not found" });
    }
    res.json(namhatta);
  });

  app.post("/api/namhattas", async (req, res) => {
    try {
      const namhattaData = insertNamhattaSchema.parse(req.body);
      const namhatta = await storage.createNamhatta(namhattaData);
      res.status(201).json(namhatta);
    } catch (error) {
      res.status(400).json({ message: "Invalid namhatta data", error });
    }
  });

  app.put("/api/namhattas/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    try {
      const namhattaData = insertNamhattaSchema.partial().parse(req.body);
      const namhatta = await storage.updateNamhatta(id, namhattaData);
      res.json(namhatta);
    } catch (error) {
      res.status(400).json({ message: "Invalid namhatta data", error });
    }
  });

  app.get("/api/namhattas/:id/devotees", async (req, res) => {
    const id = parseInt(req.params.id);
    const page = parseInt(req.query.page as string) || 1;
    const size = parseInt(req.query.size as string) || 10;
    const statusId = req.query.statusId ? parseInt(req.query.statusId as string) : undefined;
    
    const result = await storage.getDevoteesByNamhatta(id, page, size, statusId);
    res.json(result);
  });

  app.post("/api/namhattas/:id/approve", async (req, res) => {
    const id = parseInt(req.params.id);
    try {
      await storage.approveNamhatta(id);
      res.json({ message: "Namhatta approved successfully" });
    } catch (error) {
      res.status(404).json({ message: "Namhatta not found" });
    }
  });

  app.post("/api/namhattas/:id/reject", async (req, res) => {
    const id = parseInt(req.params.id);
    const { reason } = req.body;
    try {
      await storage.rejectNamhatta(id, reason);
      res.json({ message: "Namhatta rejected successfully" });
    } catch (error) {
      res.status(404).json({ message: "Namhatta not found" });
    }
  });

  app.get("/api/namhattas/:id/updates", async (req, res) => {
    const id = parseInt(req.params.id);
    const updates = await storage.getNamhattaUpdates(id);
    res.json(updates);
  });

  app.get("/api/namhattas/:id/devotee-status-count", async (req, res) => {
    const id = parseInt(req.params.id);
    const counts = await storage.getNamhattaDevoteeStatusCount(id);
    res.json(counts);
  });

  app.get("/api/namhattas/:id/status-history", async (req, res) => {
    const id = parseInt(req.params.id);
    const page = parseInt(req.query.page as string) || 1;
    const size = parseInt(req.query.size as string) || 10;
    const result = await storage.getNamhattaStatusHistory(id, page, size);
    res.json(result);
  });

  // Statuses
  app.get("/api/statuses", async (req, res) => {
    const statuses = await storage.getDevotionalStatuses();
    res.json(statuses);
  });

  app.post("/api/statuses", async (req, res) => {
    try {
      const statusData = insertDevotionalStatusSchema.parse(req.body);
      const status = await storage.createDevotionalStatus(statusData);
      res.status(201).json(status);
    } catch (error) {
      res.status(400).json({ message: "Invalid status data", error });
    }
  });

  app.post("/api/statuses/:id/rename", async (req, res) => {
    const id = parseInt(req.params.id);
    const { newName } = req.body;
    
    if (!newName) {
      return res.status(400).json({ message: "newName is required" });
    }
    
    try {
      await storage.renameDevotionalStatus(id, newName);
      res.json({ message: "Status renamed successfully" });
    } catch (error) {
      res.status(404).json({ message: "Status not found" });
    }
  });

  // Shraddhakutirs
  app.get("/api/shraddhakutirs", async (req, res) => {
    const shraddhakutirs = await storage.getShraddhakutirs();
    res.json(shraddhakutirs);
  });

  app.post("/api/shraddhakutirs", async (req, res) => {
    try {
      const shraddhakutirData = insertShraddhakutirSchema.parse(req.body);
      const shraddhakutir = await storage.createShraddhakutir(shraddhakutirData);
      res.status(201).json(shraddhakutir);
    } catch (error) {
      res.status(400).json({ message: "Invalid shraddhakutir data", error });
    }
  });

  // Updates
  app.post("/api/updates", async (req, res) => {
    try {
      // Convert date string to Date object for validation
      const requestData = {
        ...req.body,
        date: new Date(req.body.date)
      };
      const updateData = insertNamhattaUpdateSchema.parse(requestData);
      const update = await storage.createNamhattaUpdate(updateData);
      res.status(201).json(update);
    } catch (error) {
      res.status(400).json({ message: "Invalid update data", error });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
