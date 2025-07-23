import type { Express } from "express";
import { createServer, type Server } from "http";
import cookieParser from "cookie-parser";
import { storage } from "./storage-fresh";
import { insertDevoteeSchema, insertNamhattaSchema, insertDevotionalStatusSchema, insertShraddhakutirSchema, insertNamhattaUpdateSchema } from "@shared/schema";
import { authRoutes } from "./auth/routes";
import { authenticateJWT, authorize, validateDistrictAccess } from "./auth/middleware";

export async function registerRoutes(app: Express): Promise<Server> {
  // Add cookie parser middleware
  app.use(cookieParser());

  // Authentication routes (no auth required)
  app.use("/api/auth", authRoutes);

  // Health check (no auth required)
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

  // Get user districts (authenticated endpoint)
  app.get("/api/auth/user-districts", authenticateJWT, async (req, res) => {
    try {
      const { getUserDistricts } = await import('./storage-auth');
      const districts = await getUserDistricts(req.user.id);
      res.json({ 
        districts: districts.map(d => ({
          code: d.districtCode,
          name: d.districtNameEnglish
        }))
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Dev endpoint to check users (development only)
  app.get("/api/dev/users", async (req, res) => {
    if (process.env.NODE_ENV !== 'development') {
      return res.status(404).json({ message: "Not found" });
    }
    try {
      const { getUserByUsername } = await import('./storage-auth');
      const admin = await getUserByUsername('admin');
      const office1 = await getUserByUsername('office1');
      const supervisor1 = await getUserByUsername('supervisor1');
      
      res.json({
        admin: admin ? { id: admin.id, username: admin.username, role: admin.role, isActive: admin.isActive, passwordHashLength: admin.passwordHash.length } : null,
        office1: office1 ? { id: office1.id, username: office1.username, role: office1.role, isActive: office1.isActive, passwordHashLength: office1.passwordHash.length } : null,
        supervisor1: supervisor1 ? { id: supervisor1.id, username: supervisor1.username, role: supervisor1.role, isActive: supervisor1.isActive, passwordHashLength: supervisor1.passwordHash.length } : null,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Geography endpoints
  app.get("/api/countries", async (req, res) => {
    const countries = await storage.getCountries();
    res.json(countries);
  });

  app.get("/api/states", async (req, res) => {
    const { country } = req.query;
    const states = await storage.getStates(country as string);
    res.json(states);
  });

  app.get("/api/districts", async (req, res) => {
    const { state } = req.query;
    const districts = await storage.getDistricts(state as string);
    res.json(districts);
  });

  app.get("/api/sub-districts", async (req, res) => {
    const { district } = req.query;
    const subDistricts = await storage.getSubDistricts(district as string);
    res.json(subDistricts);
  });

  app.get("/api/villages", async (req, res) => {
    const { subDistrict } = req.query;
    const villages = await storage.getVillages(subDistrict as string);
    res.json(villages);
  });

  app.get("/api/pincodes", async (req, res) => {
    const { village, district, subDistrict } = req.query;
    const pincodes = await storage.getPincodes(village as string, district as string, subDistrict as string);
    res.json(pincodes);
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

  // Dashboard (requires authentication)
  app.get("/api/dashboard", authenticateJWT, async (req, res) => {
    const summary = await storage.getDashboardSummary();
    res.json(summary);
  });

  app.get("/api/status-distribution", authenticateJWT, async (req, res) => {
    const distribution = await storage.getStatusDistribution();
    res.json(distribution);
  });

  // Hierarchy (requires authentication)
  app.get("/api/hierarchy", authenticateJWT, async (req, res) => {
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

  // Devotees (requires authentication, district filtering for supervisors)
  app.get("/api/devotees", authenticateJWT, validateDistrictAccess, async (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const size = parseInt(req.query.size as string) || 10;
    const sortBy = (req.query.sortBy as string) || "name";
    const sortOrder = (req.query.sortOrder as string) || "asc";
    const filters = {
      search: req.query.search as string,
      country: req.query.country as string,
      state: req.query.state as string,
      district: req.query.district as string,
      statusId: req.query.statusId as string,
      sortBy,
      sortOrder,
    };
    const result = await storage.getDevotees(page, size, filters);
    res.json(result);
  });

  app.get("/api/devotees/:id", authenticateJWT, async (req, res) => {
    const id = parseInt(req.params.id);
    const devotee = await storage.getDevotee(id);
    if (!devotee) {
      return res.status(404).json({ message: "Devotee not found" });
    }
    res.json(devotee);
  });

  app.post("/api/devotees", authenticateJWT, authorize(['ADMIN', 'OFFICE']), async (req, res) => {
    try {
      // Extract address and other fields separately (similar to namhatta creation)
      const { presentAddress, permanentAddress, ...devoteeFields } = req.body;
      
      // Validate only the devotee fields against schema
      const validatedDevoteeData = insertDevoteeSchema.parse(devoteeFields);
      
      // Add addresses back to the data
      const devoteeDataWithAddresses = {
        ...validatedDevoteeData,
        presentAddress: presentAddress,
        permanentAddress: permanentAddress
      };
      
      const devotee = await storage.createDevotee(devoteeDataWithAddresses);
      res.status(201).json(devotee);
    } catch (error) {
      res.status(400).json({ message: "Invalid devotee data", error: error.message });
    }
  });

  // Add devotee to specific Namhatta
  app.post("/api/devotees/:namhattaId", authenticateJWT, authorize(['ADMIN', 'OFFICE']), async (req, res) => {
    const namhattaId = parseInt(req.params.namhattaId);
    try {
      // Extract address and other fields separately
      const { presentAddress, permanentAddress, ...devoteeFields } = req.body;
      
      // Validate only the devotee fields against schema
      const validatedDevoteeData = insertDevoteeSchema.parse(devoteeFields);
      
      // Add addresses back to the data
      const devoteeDataWithAddresses = {
        ...validatedDevoteeData,
        presentAddress: presentAddress,
        permanentAddress: permanentAddress
      };
      
      const devotee = await storage.createDevoteeForNamhatta(devoteeDataWithAddresses, namhattaId);
      res.status(201).json(devotee);
    } catch (error) {
      res.status(400).json({ message: "Invalid devotee data", error: error.message });
    }
  });

  app.put("/api/devotees/:id", authenticateJWT, authorize(['ADMIN', 'OFFICE', 'DISTRICT_SUPERVISOR']), validateDistrictAccess, async (req, res) => {
    const id = parseInt(req.params.id);
    try {
      // Extract address and other fields separately (similar to create operations)
      const { presentAddress, permanentAddress, allowedDistricts, devotionalCourses, ...devoteeFields } = req.body;
      
      // For DISTRICT_SUPERVISOR, check if they have access to this devotee
      if (req.user?.role === 'DISTRICT_SUPERVISOR') {
        console.log(`District access check for user ${req.user.username} (districts: ${req.user.districts.join(', ')}) trying to update devotee ${id}`);
        const hasAccess = await storage.checkDevoteeDistrictAccess(id, allowedDistricts || []);
        console.log(`Access result: ${hasAccess}`);
        if (!hasAccess) {
          return res.status(403).json({ error: "Access denied: Devotee not in your assigned districts" });
        }
      }
      
      // Validate only the devotee fields against schema
      const validatedDevoteeData = insertDevoteeSchema.partial().parse(devoteeFields);
      
      // Add addresses and other non-schema fields back to the data
      const devoteeDataWithAddresses = {
        ...validatedDevoteeData,
        presentAddress: presentAddress,
        permanentAddress: permanentAddress,
        devotionalCourses: devotionalCourses
      };
      
      const devotee = await storage.updateDevotee(id, devoteeDataWithAddresses);
      res.json(devotee);
    } catch (error) {
      res.status(400).json({ message: "Invalid devotee data", error: error.message });
    }
  });

  app.post("/api/devotees/:id/upgrade-status", authenticateJWT, authorize(['ADMIN', 'OFFICE', 'DISTRICT_SUPERVISOR']), validateDistrictAccess, async (req, res) => {
    const id = parseInt(req.params.id);
    const { newStatusId, notes, allowedDistricts } = req.body;
    
    // For DISTRICT_SUPERVISOR, check if they have access to this devotee
    if (req.user?.role === 'DISTRICT_SUPERVISOR') {
      const hasAccess = await storage.checkDevoteeDistrictAccess(id, allowedDistricts || []);
      if (!hasAccess) {
        return res.status(403).json({ error: "Access denied: Devotee not in your assigned districts" });
      }
    }
    
    if (!newStatusId) {
      return res.status(400).json({ message: "newStatusId is required" });
    }
    
    try {
      // Check if devotee exists first
      const devotee = await storage.getDevotee(id);
      if (!devotee) {
        return res.status(404).json({ message: "Devotee not found" });
      }
      
      await storage.upgradeDevoteeStatus(id, newStatusId, notes);
      res.json({ message: "Status updated successfully" });
    } catch (error) {
      console.error("Error upgrading devotee status:", error);
      res.status(500).json({ message: "Failed to upgrade status", error: error.message });
    }
  });

  app.get("/api/devotees/:id/status-history", authenticateJWT, async (req, res) => {
    const id = parseInt(req.params.id);
    const history = await storage.getDevoteeStatusHistory(id);
    res.json(history);
  });

  // Get devotee addresses
  app.get("/api/devotees/:id/addresses", authenticateJWT, async (req, res) => {
    const id = parseInt(req.params.id);
    const addresses = await storage.getDevoteeAddresses(id);
    res.json(addresses);
  });

  // Namhattas (requires authentication, district filtering for supervisors)
  app.get("/api/namhattas", authenticateJWT, validateDistrictAccess, async (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const size = parseInt(req.query.size as string) || 10;
    const sortBy = req.query.sortBy as string;
    const sortOrder = req.query.sortOrder as string;
    
    const filters = {
      search: req.query.search as string,
      country: req.query.country as string,
      state: req.query.state as string,
      district: req.query.district as string,
      subDistrict: req.query.subDistrict as string,
      village: req.query.village as string,
      status: req.query.status as string,
      sortBy,
      sortOrder,
    };
    const result = await storage.getNamhattas(page, size, filters);
    res.json(result);
  });

  app.get("/api/namhattas/pending", authenticateJWT, authorize(['ADMIN', 'OFFICE']), async (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const size = parseInt(req.query.size as string) || 10;
    const result = await storage.getNamhattas(page, size, { status: "PENDING_APPROVAL" });
    res.json(result.data);
  });

  app.get("/api/namhattas/:id", authenticateJWT, async (req, res) => {
    const id = parseInt(req.params.id);
    const namhatta = await storage.getNamhatta(id);
    if (!namhatta) {
      return res.status(404).json({ message: "Namhatta not found" });
    }
    res.json(namhatta);
  });

  app.post("/api/namhattas", authenticateJWT, authorize(['ADMIN', 'OFFICE']), async (req, res) => {
    try {
      // Extract address and other fields separately
      const { address, ...namhattaFields } = req.body;
      
      // Validate only the namhatta fields against schema
      const validatedNamhattaData = insertNamhattaSchema.parse(namhattaFields);
      
      // Add address back to the data
      const namhattaDataWithAddress = {
        ...validatedNamhattaData,
        address: address
      };
      
      const namhatta = await storage.createNamhatta(namhattaDataWithAddress);
      res.status(201).json(namhatta);
    } catch (error) {
      res.status(400).json({ message: "Invalid namhatta data", error: error.message });
    }
  });

  app.put("/api/namhattas/:id", authenticateJWT, authorize(['ADMIN', 'OFFICE']), async (req, res) => {
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

  // Namhatta approval endpoints - only ADMIN and OFFICE users can approve/reject
  app.post("/api/namhattas/:id/approve", authenticateJWT, authorize(['ADMIN', 'OFFICE']), async (req, res) => {
    const id = parseInt(req.params.id);
    try {
      await storage.approveNamhatta(id);
      res.json({ message: "Namhatta approved successfully" });
    } catch (error) {
      res.status(404).json({ message: "Namhatta not found" });
    }
  });

  app.post("/api/namhattas/:id/reject", authenticateJWT, authorize(['ADMIN', 'OFFICE']), async (req, res) => {
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

  // Get all updates from all namhattas (optimized endpoint)
  app.get("/api/updates/all", async (req, res) => {
    const updates = await storage.getAllUpdates();
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
      console.log("Received update data:", JSON.stringify(req.body, null, 2));
      console.log("Date field type:", typeof req.body.date, "Value:", req.body.date);
      const updateData = insertNamhattaUpdateSchema.parse(req.body);
      const update = await storage.createNamhattaUpdate(updateData);
      res.status(201).json(update);
    } catch (error) {
      console.error("Validation error:", error);
      res.status(400).json({ message: "Invalid update data", error });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
