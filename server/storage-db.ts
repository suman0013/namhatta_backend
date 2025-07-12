import { db } from "./db";
import { sql, eq, desc, asc, and, or, like, count, inArray } from "drizzle-orm";
import { IStorage } from "./storage-fresh";
import { seedDatabase } from "./seed-data";

// Import schemas based on database type
const databaseUrl = process.env.DATABASE_URL;
const useMySQL = databaseUrl?.startsWith('mysql://') || databaseUrl?.startsWith('mysql2://');
const usePostgreSQL = databaseUrl?.startsWith('postgresql://') || databaseUrl?.startsWith('postgres://');

let devotees, namhattas, devotionalStatuses, shraddhakutirs, namhattaUpdates, leaders, statusHistory, addresses, devoteeAddresses, namhattaAddresses;
let Devotee, InsertDevotee, Namhatta, InsertNamhatta, DevotionalStatus, InsertDevotionalStatus, Shraddhakutir, InsertShraddhakutir, NamhattaUpdate, InsertNamhattaUpdate, Leader, InsertLeader, StatusHistory;

if (useMySQL) {
  const mysqlSchema = await import("@shared/schema-mysql");
  devotees = mysqlSchema.devotees;
  namhattas = mysqlSchema.namhattas;
  devotionalStatuses = mysqlSchema.devotionalStatuses;
  shraddhakutirs = mysqlSchema.shraddhakutirs;
  namhattaUpdates = mysqlSchema.namhattaUpdates;
  leaders = mysqlSchema.leaders;
  statusHistory = mysqlSchema.statusHistory;
  addresses = mysqlSchema.addresses;
  devoteeAddresses = mysqlSchema.devoteeAddresses;
  namhattaAddresses = mysqlSchema.namhattaAddresses;
  
  Devotee = mysqlSchema.Devotee;
  InsertDevotee = mysqlSchema.NewDevotee;
  Namhatta = mysqlSchema.Namhatta;
  InsertNamhatta = mysqlSchema.NewNamhatta;
  DevotionalStatus = mysqlSchema.DevotionalStatus;
  InsertDevotionalStatus = mysqlSchema.NewDevotionalStatus;
  Shraddhakutir = mysqlSchema.Shraddhakutir;
  InsertShraddhakutir = mysqlSchema.NewShraddhakutir;
  NamhattaUpdate = mysqlSchema.NamhattaUpdate;
  InsertNamhattaUpdate = mysqlSchema.NewNamhattaUpdate;
  Leader = mysqlSchema.Leader;
  InsertLeader = mysqlSchema.NewLeader;
  StatusHistory = mysqlSchema.StatusHistory;
} else if (usePostgreSQL) {
  const postgresSchema = await import("@shared/schema-postgres");
  devotees = postgresSchema.devotees;
  namhattas = postgresSchema.namhattas;
  devotionalStatuses = postgresSchema.devotionalStatuses;
  shraddhakutirs = postgresSchema.shraddhakutirs;
  namhattaUpdates = postgresSchema.namhattaUpdates;
  leaders = postgresSchema.leaders;
  statusHistory = postgresSchema.statusHistory;
  addresses = postgresSchema.addresses;
  devoteeAddresses = postgresSchema.devoteeAddresses;
  namhattaAddresses = postgresSchema.namhattaAddresses;
  
  Devotee = postgresSchema.Devotee;
  InsertDevotee = postgresSchema.NewDevotee;
  Namhatta = postgresSchema.Namhatta;
  InsertNamhatta = postgresSchema.NewNamhatta;
  DevotionalStatus = postgresSchema.DevotionalStatus;
  InsertDevotionalStatus = postgresSchema.NewDevotionalStatus;
  Shraddhakutir = postgresSchema.Shraddhakutir;
  InsertShraddhakutir = postgresSchema.NewShraddhakutir;
  NamhattaUpdate = postgresSchema.NamhattaUpdate;
  InsertNamhattaUpdate = postgresSchema.NewNamhattaUpdate;
  Leader = postgresSchema.Leader;
  InsertLeader = postgresSchema.NewLeader;
  StatusHistory = postgresSchema.StatusHistory;
} else {
  throw new Error("Unsupported database URL. Please use MySQL or PostgreSQL connection string.");
}

export class DatabaseStorage implements IStorage {
  constructor() {
    this.initializeDefaultData();
  }

  private async initializeDefaultData() {
    // Check if data already exists
    const existingStatuses = await db.select().from(devotionalStatuses).limit(1);
    
    if (existingStatuses.length === 0) {
      // Initialize devotional statuses
      const statusData = [
        { name: "Shraddhavan", level: 1 },
        { name: "Sadhusangi", level: 2 },
        { name: "Gour/Krishna Sevak", level: 3 },
        { name: "Gour/Krishna Sadhak", level: 4 },
        { name: "Sri Guru Charan Asraya", level: 5 },
        { name: "Harinam Diksha", level: 6 },
        { name: "Pancharatrik Diksha", level: 7 }
      ];

      for (const status of statusData) {
        await db.insert(devotionalStatuses).values(status);
      }

      // Initialize leaders
      const leadersData = [
        { name: "His Divine Grace A.C. Bhaktivedanta Swami Prabhupada", position: "Founder Acharya", level: "founder" },
        { name: "His Holiness Jayapataka Swami", position: "GBC", level: "acharya" },
        { name: "HH Gauranga Prem Swami", position: "Regional Director", level: "regional", region: "West Bengal" },
        { name: "HH Bhaktivilasa Gaurachandra Swami", position: "Co-Regional Director", level: "regional", region: "West Bengal" },
        { name: "HG Padmanetra Das", position: "Co-Regional Director", level: "regional", region: "West Bengal" },
        { name: "District Supervisor - Nadia", position: "District Supervisor", level: "district", region: "West Bengal", district: "Nadia" },
        { name: "Mala Senapoti - Mayapur", position: "Mala Senapoti", level: "mala", region: "West Bengal", district: "Nadia" }
      ];

      for (const leader of leadersData) {
        await db.insert(leaders).values(leader);
      }

      // Initialize shraddhakutirs
      const shraddhakutirData = [
        { name: "Mayapur Shraddhakutir", description: "Primary Shraddhakutir in West Bengal" },
        { name: "Kolkata Shraddhakutir", description: "Metropolitan Shraddhakutir in Kolkata" },
        { name: "Bhubaneswar Shraddhakutir", description: "Regional Shraddhakutir in Odisha" },
        { name: "Patna Shraddhakutir", description: "Regional Shraddhakutir in Bihar" },
        { name: "Ranchi Shraddhakutir", description: "Regional Shraddhakutir in Jharkhand" }
      ];

      for (const shraddhakutir of shraddhakutirData) {
        await db.insert(shraddhakutirs).values(shraddhakutir);
      }

      // Seed the database with sample data
      await seedDatabase();
    }
  }

  // Devotees
  async getDevotees(page = 1, size = 10, filters: any = {}): Promise<{ data: Devotee[], total: number }> {
    const offset = (page - 1) * size;
    
    let whereConditions = [];
    
    if (filters.search) {
      whereConditions.push(
        or(
          like(devotees.legalName, `%${filters.search}%`),
          like(devotees.initiatedName, `%${filters.search}%`),
          like(devotees.email, `%${filters.search}%`)
        )
      );
    }
    
    if (filters.statusId) {
      whereConditions.push(eq(devotees.devotionalStatusId, parseInt(filters.statusId)));
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;
    
    // Handle sorting
    let orderBy = asc(devotees.legalName);
    if (filters.sortBy === 'createdAt') {
      orderBy = filters.sortOrder === 'desc' ? desc(devotees.createdAt) : asc(devotees.createdAt);
    } else if (filters.sortBy === 'name') {
      orderBy = filters.sortOrder === 'desc' ? desc(devotees.legalName) : asc(devotees.legalName);
    }

    const [data, totalResult] = await Promise.all([
      db.select().from(devotees).where(whereClause).limit(size).offset(offset).orderBy(orderBy),
      db.select({ count: count() }).from(devotees).where(whereClause)
    ]);

    return {
      data,
      total: totalResult[0].count
    };
  }

  async getDevotee(id: number): Promise<Devotee | undefined> {
    const result = await db.select().from(devotees).where(eq(devotees.id, id)).limit(1);
    return result[0];
  }

  async createDevotee(devotee: InsertDevotee): Promise<Devotee> {
    const result = await db.insert(devotees).values(devotee).returning();
    return result[0];
  }

  async createDevoteeForNamhatta(devotee: InsertDevotee, namhattaId: number): Promise<Devotee> {
    const devoteeData = { ...devotee, namhattaId };
    const result = await db.insert(devotees).values(devoteeData).returning();
    return result[0];
  }

  async updateDevotee(id: number, devotee: Partial<InsertDevotee>): Promise<Devotee> {
    const result = await db.update(devotees).set(devotee).where(eq(devotees.id, id)).returning();
    return result[0];
  }

  async getDevoteesByNamhatta(namhattaId: number, page = 1, size = 10, statusId?: number): Promise<{ data: Devotee[], total: number }> {
    const offset = (page - 1) * size;
    
    let whereClause = eq(devotees.namhattaId, namhattaId);
    if (statusId) {
      whereClause = and(whereClause, eq(devotees.devotionalStatusId, statusId));
    }

    const [data, totalResult] = await Promise.all([
      db.select().from(devotees).where(whereClause).limit(size).offset(offset),
      db.select({ count: count() }).from(devotees).where(whereClause)
    ]);

    return {
      data,
      total: totalResult[0].count
    };
  }

  async upgradeDevoteeStatus(id: number, newStatusId: number, notes?: string): Promise<void> {
    try {
      // Get current devotee status
      const devotee = await db.select().from(devotees).where(eq(devotees.id, id)).limit(1);
      if (!devotee[0]) {
        throw new Error(`Devotee with ID ${id} not found`);
      }
      const currentStatus = devotee[0]?.devotionalStatusId;
      
      // Update devotee status
      await db.update(devotees).set({ devotionalStatusId: newStatusId }).where(eq(devotees.id, id));
      
      // Record status history - use actual timestamp
      await db.insert(statusHistory).values({
        devoteeId: id,
        previousStatus: currentStatus?.toString(),
        newStatus: newStatusId.toString(),
        comment: notes,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error in upgradeDevoteeStatus:", error);
      throw error;
    }
  }

  async getDevoteeStatusHistory(id: number): Promise<StatusHistory[]> {
    return await db.select().from(statusHistory).where(eq(statusHistory.devoteeId, id)).orderBy(desc(statusHistory.updatedAt));
  }

  // Namhattas
  async getNamhattas(page = 1, size = 10, filters: any = {}): Promise<{ data: Namhatta[], total: number }> {
    const offset = (page - 1) * size;
    
    let whereConditions = [];
    
    if (filters.search) {
      whereConditions.push(like(namhattas.name, `%${filters.search}%`));
    }
    
    // Note: Status filtering removed as not available in PostgreSQL schema

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;
    
    // Handle sorting - default to name ascending
    let orderBy = asc(namhattas.name);
    if (filters.sortBy === 'createdAt') {
      orderBy = filters.sortOrder === 'desc' ? desc(namhattas.createdAt) : asc(namhattas.createdAt);
    } else if (filters.sortBy === 'updatedAt') {
      orderBy = filters.sortOrder === 'desc' ? desc(namhattas.updatedAt) : asc(namhattas.updatedAt);
    } else if (filters.sortBy === 'name' || !filters.sortBy) {
      // Default to name sorting if no sortBy provided or explicitly name
      orderBy = filters.sortOrder === 'desc' ? desc(namhattas.name) : asc(namhattas.name);
    }

    const [data, totalResult] = await Promise.all([
      db.select({
        id: namhattas.id,
        name: namhattas.name,
        description: namhattas.description,
        establishedDate: namhattas.establishedDate,
        shraddhakutirId: namhattas.shraddhakutirId,
        malaSenapoti: namhattas.malaSenapoti,
        mahaChakraSenapoti: namhattas.mahaChakraSenapoti,
        chakraSenapoti: namhattas.chakraSenapoti,
        upaChakraSenapoti: namhattas.upaChakraSenapoti,
        secretary: namhattas.secretary,
        createdAt: namhattas.createdAt,
        updatedAt: namhattas.updatedAt,
        devoteeCount: count(devotees.id)
      }).from(namhattas)
        .leftJoin(devotees, eq(namhattas.id, devotees.namhattaId))
        .where(whereClause)
        .groupBy(namhattas.id)
        .limit(size)
        .offset(offset)
        .orderBy(orderBy),
      db.select({ count: count() }).from(namhattas).where(whereClause)
    ]);

    return {
      data,
      total: totalResult[0].count
    };
  }

  async getNamhatta(id: number): Promise<Namhatta | undefined> {
    const result = await db.select().from(namhattas).where(eq(namhattas.id, id)).limit(1);
    return result[0];
  }

  async createNamhatta(namhatta: InsertNamhatta): Promise<Namhatta> {
    const result = await db.insert(namhattas).values(namhatta).returning();
    return result[0];
  }

  async updateNamhatta(id: number, namhatta: Partial<InsertNamhatta>): Promise<Namhatta> {
    const result = await db.update(namhattas).set(namhatta).where(eq(namhattas.id, id)).returning();
    return result[0];
  }

  async approveNamhatta(id: number): Promise<void> {
    await db.update(namhattas).set({ status: "APPROVED" }).where(eq(namhattas.id, id));
  }

  async rejectNamhatta(id: number, reason?: string): Promise<void> {
    await db.update(namhattas).set({ status: "REJECTED" }).where(eq(namhattas.id, id));
  }

  async getNamhattaUpdates(id: number): Promise<NamhattaUpdate[]> {
    return await db.select().from(namhattaUpdates).where(eq(namhattaUpdates.namhattaId, id)).orderBy(desc(namhattaUpdates.eventDate));
  }

  async getNamhattaDevoteeStatusCount(id: number): Promise<Record<string, number>> {
    const devoteesByStatus = await db.select({
      statusId: devotees.devotionalStatusId,
      count: count()
    }).from(devotees).where(eq(devotees.namhattaId, id)).groupBy(devotees.devotionalStatusId);

    const statusCounts: Record<string, number> = {};
    for (const item of devoteesByStatus) {
      const status = await db.select().from(devotionalStatuses).where(eq(devotionalStatuses.id, item.statusId)).limit(1);
      if (status[0]) {
        statusCounts[status[0].name] = item.count;
      }
    }

    return statusCounts;
  }

  async getNamhattaStatusHistory(id: number, page = 1, size = 10): Promise<{ data: StatusHistory[], total: number }> {
    const offset = (page - 1) * size;
    
    // Get devotees for this namhatta first
    const namhattaDevotees = await db.select({ id: devotees.id }).from(devotees).where(eq(devotees.namhattaId, id));
    const devoteeIds = namhattaDevotees.map(d => d.id);
    
    if (devoteeIds.length === 0) {
      return { data: [], total: 0 };
    }

    const [data, totalResult] = await Promise.all([
      db.select().from(statusHistory).where(inArray(statusHistory.devoteeId, devoteeIds)).limit(size).offset(offset).orderBy(desc(statusHistory.updatedAt)),
      db.select({ count: count() }).from(statusHistory).where(inArray(statusHistory.devoteeId, devoteeIds))
    ]);

    return {
      data,
      total: totalResult[0].count
    };
  }

  // Statuses
  async getDevotionalStatuses(): Promise<DevotionalStatus[]> {
    return await db.select().from(devotionalStatuses);
  }

  async createDevotionalStatus(status: InsertDevotionalStatus): Promise<DevotionalStatus> {
    const result = await db.insert(devotionalStatuses).values(status).returning();
    return result[0];
  }

  async renameDevotionalStatus(id: number, newName: string): Promise<void> {
    await db.update(devotionalStatuses).set({ name: newName }).where(eq(devotionalStatuses.id, id));
  }

  // Shraddhakutirs
  async getShraddhakutirs(): Promise<Shraddhakutir[]> {
    return await db.select().from(shraddhakutirs);
  }

  async createShraddhakutir(shraddhakutir: InsertShraddhakutir): Promise<Shraddhakutir> {
    const result = await db.insert(shraddhakutirs).values(shraddhakutir).returning();
    return result[0];
  }

  // Updates
  async createNamhattaUpdate(update: InsertNamhattaUpdate): Promise<NamhattaUpdate> {
    const result = await db.insert(namhattaUpdates).values(update).returning();
    return result[0];
  }

  async getAllUpdates(): Promise<Array<NamhattaUpdate & { namhattaName: string }>> {
    const result = await db.select({
      id: namhattaUpdates.id,
      namhattaId: namhattaUpdates.namhattaId,
      title: namhattaUpdates.title,
      description: namhattaUpdates.description,
      eventDate: namhattaUpdates.eventDate,
      programType: namhattaUpdates.programType,
      specialAttraction: namhattaUpdates.specialAttraction,
      prasadamDetails: namhattaUpdates.prasadamDetails,
      kirtanDetails: namhattaUpdates.kirtanDetails,
      bookDistribution: namhattaUpdates.bookDistribution,
      chantingRounds: namhattaUpdates.chantingRounds,
      aratiPerformed: namhattaUpdates.aratiPerformed,
      bhagwatPathPerformed: namhattaUpdates.bhagwatPathPerformed,
      attendance: namhattaUpdates.attendance,
      imageUrl: namhattaUpdates.imageUrl,
      createdAt: namhattaUpdates.createdAt,
      namhattaName: namhattas.name
    }).from(namhattaUpdates)
      .innerJoin(namhattas, eq(namhattaUpdates.namhattaId, namhattas.id))
      .orderBy(desc(namhattaUpdates.eventDate));
    
    return result;
  }

  // Hierarchy
  async getTopLevelHierarchy(): Promise<{
    founder: Leader[];
    gbc: Leader[];
    regionalDirectors: Leader[];
    coRegionalDirectors: Leader[];
    districtSupervisors: Leader[];
    malaSenapotis: Leader[];
  }> {
    const [founder, gbc, regionalDirectors, coRegionalDirectors, districtSupervisors, malaSenapotis] = await Promise.all([
      db.select().from(leaders).where(eq(leaders.level, "founder")),
      db.select().from(leaders).where(eq(leaders.level, "gbc")),
      db.select().from(leaders).where(eq(leaders.level, "regional")),
      db.select().from(leaders).where(eq(leaders.level, "co-regional")),
      db.select().from(leaders).where(eq(leaders.level, "district")),
      db.select().from(leaders).where(eq(leaders.level, "mala"))
    ]);

    return { founder, gbc, regionalDirectors, coRegionalDirectors, districtSupervisors, malaSenapotis };
  }

  async getLeadersByLevel(level: string): Promise<Leader[]> {
    return await db.select().from(leaders).where(eq(leaders.level, level));
  }

  // Dashboard
  async getStatusDistribution(): Promise<Array<{
    statusName: string;
    count: number;
    percentage: number;
  }>> {
    const [statusCounts, totalDevotees] = await Promise.all([
      db.select({
        statusId: devotees.devotionalStatusId,
        count: count()
      }).from(devotees).groupBy(devotees.devotionalStatusId),
      db.select({ count: count() }).from(devotees)
    ]);

    const total = totalDevotees[0].count;
    const statuses = await db.select().from(devotionalStatuses);
    
    const distribution = statusCounts.map(item => {
      const status = statuses.find(s => s.id === item.statusId);
      return {
        statusName: status?.name || "Unknown",
        count: item.count,
        percentage: Math.round((item.count / total) * 100)
      };
    });

    return distribution.sort((a, b) => b.count - a.count);
  }

  async getDashboardSummary(): Promise<{
    totalDevotees: number;
    totalNamhattas: number;
    recentUpdates: Array<{
      namhattaId: number;
      namhattaName: string;
      programType: string;
      date: string;
      attendance: number;
    }>;
  }> {
    const [devoteeCount, namhattaCount, updates] = await Promise.all([
      db.select({ count: count() }).from(devotees),
      db.select({ count: count() }).from(namhattas),
      db.select().from(namhattaUpdates).orderBy(desc(namhattaUpdates.eventDate)).limit(5)
    ]);

    const recentUpdates = [];
    for (const update of updates) {
      const namhatta = await db.select().from(namhattas).where(eq(namhattas.id, update.namhattaId)).limit(1);
      recentUpdates.push({
        namhattaId: update.namhattaId,
        namhattaName: namhatta[0]?.name || "Unknown",
        programType: update.programType,
        date: typeof update.eventDate === 'string' ? update.eventDate : update.eventDate?.toISOString().split('T')[0] || '',
        attendance: update.attendance
      });
    }

    return {
      totalDevotees: devoteeCount[0].count,
      totalNamhattas: namhattaCount[0].count,
      recentUpdates
    };
  }

  // Geography - Database-based methods
  async getCountries(): Promise<string[]> {
    try {
      const results = await db
        .selectDistinct({ country: addresses.country })
        .from(addresses)
        .where(sql`${addresses.country} IS NOT NULL`);
      
      return results.map(row => row.country).filter(Boolean);
    } catch (error) {
      console.error('Error getting countries from database:', error);
      return ["India"]; // Fallback
    }
  }

  async getStates(country?: string): Promise<string[]> {
    try {
      let query = db
        .selectDistinct({ state: addresses.state })
        .from(addresses)
        .where(sql`${addresses.state} IS NOT NULL`);
      
      if (country) {
        query = query.where(eq(addresses.country, country));
      }
      
      const results = await query;
      return results.map(row => row.state).filter(Boolean);
    } catch (error) {
      console.error('Error getting states from database:', error);
      return [];
    }
  }

  async getDistricts(state?: string): Promise<string[]> {
    try {
      let query = db
        .selectDistinct({ district: addresses.district })
        .from(addresses)
        .where(sql`${addresses.district} IS NOT NULL`);
      
      if (state) {
        query = query.where(eq(addresses.state, state));
      }
      
      const results = await query;
      return results.map(row => row.district).filter(Boolean);
    } catch (error) {
      console.error('Error getting districts from database:', error);
      return [];
    }
  }

  async getSubDistricts(district?: string): Promise<string[]> {
    try {
      let query = db
        .selectDistinct({ subDistrict: addresses.subDistrict })
        .from(addresses)
        .where(sql`${addresses.subDistrict} IS NOT NULL`);
      
      if (district) {
        query = query.where(eq(addresses.district, district));
      }
      
      const results = await query;
      return results.map(row => row.subDistrict).filter(Boolean);
    } catch (error) {
      console.error('Error getting sub-districts from database:', error);
      return [];
    }
  }

  async getVillages(subDistrict?: string): Promise<string[]> {
    try {
      let query = db
        .selectDistinct({ village: addresses.village })
        .from(addresses)
        .where(sql`${addresses.village} IS NOT NULL`);
      
      if (subDistrict) {
        query = query.where(eq(addresses.subDistrict, subDistrict));
      }
      
      const results = await query;
      return results.map(row => row.village).filter(Boolean);
    } catch (error) {
      console.error('Error getting villages from database:', error);
      return [];
    }
  }

  async getPincodes(village?: string, district?: string, subDistrict?: string): Promise<string[]> {
    try {
      let query = db
        .selectDistinct({ postalCode: addresses.postalCode })
        .from(addresses)
        .where(sql`${addresses.postalCode} IS NOT NULL`);
      
      if (village) {
        query = query.where(eq(addresses.village, village));
      }
      if (district) {
        query = query.where(eq(addresses.district, district));
      }
      if (subDistrict) {
        query = query.where(eq(addresses.subDistrict, subDistrict));
      }
      
      const results = await query;
      return results.map(row => row.postalCode).filter(Boolean);
    } catch (error) {
      console.error('Error getting postal codes from database:', error);
      return [];
    }
  }

  // Map data methods
  async getNamhattaCountsByCountry(): Promise<Array<{ country: string; count: number }>> {
    // Since PostgreSQL schema doesn't have address field in namhattas table,
    // we'll use the junction table approach with addresses table
    const results = await db.select({
      country: addresses.country,
      count: count()
    }).from(namhattas)
      .leftJoin(namhattaAddresses, eq(namhattas.id, namhattaAddresses.namhattaId))
      .leftJoin(addresses, eq(namhattaAddresses.addressId, addresses.id))
      .groupBy(addresses.country);

    return results.map(result => ({
      country: result.country || 'Unknown',
      count: result.count
    }));
  }

  async getNamhattaCountsByState(country?: string): Promise<Array<{ state: string; country: string; count: number }>> {
    let query = db.select({
      state: addresses.state,
      country: addresses.country,
      count: count()
    }).from(namhattas)
      .leftJoin(namhattaAddresses, eq(namhattas.id, namhattaAddresses.namhattaId))
      .leftJoin(addresses, eq(namhattaAddresses.addressId, addresses.id))
      .groupBy(addresses.state, addresses.country);

    if (country) {
      query = query.where(eq(addresses.country, country));
    }

    const results = await query;
    return results.map(result => ({
      state: result.state || 'Unknown',
      country: result.country || 'Unknown',
      count: result.count
    }));
  }

  async getNamhattaCountsByDistrict(state?: string): Promise<Array<{ district: string; state: string; country: string; count: number }>> {
    let query = db.select({
      district: addresses.district,
      state: addresses.state,
      country: addresses.country,
      count: count()
    }).from(namhattas)
      .leftJoin(namhattaAddresses, eq(namhattas.id, namhattaAddresses.namhattaId))
      .leftJoin(addresses, eq(namhattaAddresses.addressId, addresses.id))
      .groupBy(addresses.district, addresses.state, addresses.country);

    if (state) {
      query = query.where(eq(addresses.state, state));
    }

    const results = await query;
    return results.map(result => ({
      district: result.district || 'Unknown',
      state: result.state || 'Unknown',
      country: result.country || 'Unknown',
      count: result.count
    }));
  }

  async getNamhattaCountsBySubDistrict(district?: string): Promise<Array<{ subDistrict: string; district: string; state: string; country: string; count: number }>> {
    let query = db.select({
      subDistrict: addresses.subDistrict,
      district: addresses.district,
      state: addresses.state,
      country: addresses.country,
      count: count()
    }).from(namhattas)
      .leftJoin(namhattaAddresses, eq(namhattas.id, namhattaAddresses.namhattaId))
      .leftJoin(addresses, eq(namhattaAddresses.addressId, addresses.id))
      .groupBy(addresses.subDistrict, addresses.district, addresses.state, addresses.country);

    if (district) {
      query = query.where(eq(addresses.district, district));
    }

    const results = await query;
    return results.map(result => ({
      subDistrict: result.subDistrict || 'Unknown',
      district: result.district || 'Unknown',
      state: result.state || 'Unknown',
      country: result.country || 'Unknown',
      count: result.count
    }));
  }

  async getNamhattaCountsByVillage(subDistrict?: string): Promise<Array<{ village: string; subDistrict: string; district: string; state: string; country: string; count: number }>> {
    let query = db.select({
      village: addresses.village,
      subDistrict: addresses.subDistrict,
      district: addresses.district,
      state: addresses.state,
      country: addresses.country,
      count: count()
    }).from(namhattas)
      .leftJoin(namhattaAddresses, eq(namhattas.id, namhattaAddresses.namhattaId))
      .leftJoin(addresses, eq(namhattaAddresses.addressId, addresses.id))
      .groupBy(addresses.village, addresses.subDistrict, addresses.district, addresses.state, addresses.country);

    if (subDistrict) {
      query = query.where(eq(addresses.subDistrict, subDistrict));
    }

    const results = await query;
    return results.map(result => ({
      village: result.village || 'Unknown',
      subDistrict: result.subDistrict || 'Unknown',
      district: result.district || 'Unknown',
      state: result.state || 'Unknown',
      country: result.country || 'Unknown',
      count: result.count
    }));
  }
}