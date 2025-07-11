import { db } from "./db";
import { devotees, namhattas, devotionalStatuses, shraddhakutirs, namhattaUpdates, leaders, statusHistory, addresses, devoteeAddresses, namhattaAddresses } from "@shared/schema";
import { Devotee, InsertDevotee, Namhatta, InsertNamhatta, DevotionalStatus, InsertDevotionalStatus, Shraddhakutir, InsertShraddhakutir, NamhattaUpdate, InsertNamhattaUpdate, Leader, InsertLeader, StatusHistory } from "@shared/schema";
import { sql, eq, desc, asc, and, or, like, count } from "drizzle-orm";
import { IStorage } from "./storage-fresh";
import { seedDatabase } from "./seed-data";

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
        { name: "Shraddhavan" },
        { name: "Sadhusangi" },
        { name: "Gour/Krishna Sevak" },
        { name: "Gour/Krishna Sadhak" },
        { name: "Sri Guru Charan Asraya" },
        { name: "Harinam Diksha" },
        { name: "Pancharatrik Diksha" }
      ];

      for (const status of statusData) {
        await db.insert(devotionalStatuses).values(status);
      }

      // Initialize leaders
      const leadersData = [
        { name: "His Divine Grace A.C. Bhaktivedanta Swami Prabhupada", role: "FOUNDER_ACHARYA", reportingTo: null, location: { country: "India" } },
        { name: "His Holiness Jayapataka Swami", role: "GBC", reportingTo: 1, location: { country: "India" } },
        { name: "HH Gauranga Prem Swami", role: "REGIONAL_DIRECTOR", reportingTo: 2, location: { country: "India", state: "West Bengal" } },
        { name: "HH Bhaktivilasa Gaurachandra Swami", role: "CO_REGIONAL_DIRECTOR", reportingTo: 3, location: { country: "India", state: "West Bengal" } },
        { name: "HG Padmanetra Das", role: "CO_REGIONAL_DIRECTOR", reportingTo: 3, location: { country: "India", state: "West Bengal" } },
        { name: "District Supervisor - Nadia", role: "DISTRICT_SUPERVISOR", reportingTo: 4, location: { country: "India", state: "West Bengal", district: "Nadia" } },
        { name: "Mala Senapoti - Mayapur", role: "MALA_SENAPOTI", reportingTo: 6, location: { country: "India", state: "West Bengal", district: "Nadia" } }
      ];

      for (const leader of leadersData) {
        await db.insert(leaders).values(leader);
      }

      // Initialize shraddhakutirs
      const shraddhakutirData = [
        { name: "Mayapur Shraddhakutir", region: "West Bengal", address: { country: "India", state: "West Bengal", district: "Nadia" } },
        { name: "Kolkata Shraddhakutir", region: "West Bengal", address: { country: "India", state: "West Bengal", district: "Kolkata" } },
        { name: "Bhubaneswar Shraddhakutir", region: "Odisha", address: { country: "India", state: "Odisha", district: "Khordha" } },
        { name: "Patna Shraddhakutir", region: "Bihar", address: { country: "India", state: "Bihar", district: "Patna" } },
        { name: "Ranchi Shraddhakutir", region: "Jharkhand", address: { country: "India", state: "Jharkhand", district: "Ranchi" } }
      ];

      for (const shraddhakutir of shraddhakutirData) {
        await db.insert(shraddhakutirs).values(shraddhakutir);
      }

      // Seed the database with sample data
      await seedDatabase();
    }
  }

  // Devotees
  async getDevotees(page = 1, size = 10): Promise<{ data: Devotee[], total: number }> {
    const offset = (page - 1) * size;
    
    const [data, totalResult] = await Promise.all([
      db.select().from(devotees).limit(size).offset(offset),
      db.select({ count: count() }).from(devotees)
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
    await db.transaction(async (tx) => {
      // Update devotee status
      await tx.update(devotees).set({ devotionalStatusId: newStatusId }).where(eq(devotees.id, id));
      
      // Record status history
      await tx.insert(statusHistory).values({
        devoteeId: id,
        newStatusId,
        notes,
        changedAt: new Date()
      });
    });
  }

  async getDevoteeStatusHistory(id: number): Promise<StatusHistory[]> {
    return await db.select().from(statusHistory).where(eq(statusHistory.devoteeId, id)).orderBy(desc(statusHistory.changedAt));
  }

  // Namhattas
  async getNamhattas(page = 1, size = 10, filters: any = {}): Promise<{ data: Namhatta[], total: number }> {
    const offset = (page - 1) * size;
    
    let whereConditions = [];
    
    if (filters.search) {
      whereConditions.push(like(namhattas.name, `%${filters.search}%`));
    }
    
    if (filters.status) {
      whereConditions.push(eq(namhattas.status, filters.status));
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;
    
    // Handle sorting
    let orderBy = asc(namhattas.name);
    if (filters.sortBy === 'createdAt') {
      orderBy = filters.sortOrder === 'desc' ? desc(namhattas.createdAt) : asc(namhattas.createdAt);
    } else if (filters.sortBy === 'name') {
      orderBy = filters.sortOrder === 'desc' ? desc(namhattas.name) : asc(namhattas.name);
    }

    const [data, totalResult] = await Promise.all([
      db.select().from(namhattas).where(whereClause).limit(size).offset(offset).orderBy(orderBy),
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
    return await db.select().from(namhattaUpdates).where(eq(namhattaUpdates.namhattaId, id)).orderBy(desc(namhattaUpdates.date));
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
      db.select().from(statusHistory).where(sql`${statusHistory.devoteeId} IN (${devoteeIds.join(',')})`).limit(size).offset(offset).orderBy(desc(statusHistory.changedAt)),
      db.select({ count: count() }).from(statusHistory).where(sql`${statusHistory.devoteeId} IN (${devoteeIds.join(',')})`)
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

  // Hierarchy
  async getTopLevelHierarchy(): Promise<{
    founder: Leader[];
    gbc: Leader[];
    regionalDirectors: Leader[];
    coRegionalDirectors: Leader[];
  }> {
    const [founder, gbc, regionalDirectors, coRegionalDirectors] = await Promise.all([
      db.select().from(leaders).where(eq(leaders.role, "FOUNDER_ACHARYA")),
      db.select().from(leaders).where(eq(leaders.role, "GBC")),
      db.select().from(leaders).where(eq(leaders.role, "REGIONAL_DIRECTOR")),
      db.select().from(leaders).where(eq(leaders.role, "CO_REGIONAL_DIRECTOR"))
    ]);

    return { founder, gbc, regionalDirectors, coRegionalDirectors };
  }

  async getLeadersByLevel(level: string): Promise<Leader[]> {
    return await db.select().from(leaders).where(eq(leaders.role, level));
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
      db.select().from(namhattaUpdates).orderBy(desc(namhattaUpdates.date)).limit(5)
    ]);

    const recentUpdates = [];
    for (const update of updates) {
      const namhatta = await db.select().from(namhattas).where(eq(namhattas.id, update.namhattaId)).limit(1);
      recentUpdates.push({
        namhattaId: update.namhattaId,
        namhattaName: namhatta[0]?.name || "Unknown",
        programType: update.programType,
        date: typeof update.date === 'string' ? update.date : update.date.toISOString().split('T')[0],
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
    const results = await db.select({
      country: namhattas.address,
      count: count()
    }).from(namhattas).groupBy(namhattas.address);

    // Parse JSON address and group by country
    const countryCounts: Record<string, number> = {};
    for (const result of results) {
      try {
        const address = typeof result.country === 'string' ? JSON.parse(result.country) : result.country;
        if (address?.country) {
          countryCounts[address.country] = (countryCounts[address.country] || 0) + result.count;
        }
      } catch (e) {
        // Skip invalid JSON
      }
    }

    return Object.entries(countryCounts).map(([country, count]) => ({ country, count }));
  }

  async getNamhattaCountsByState(country?: string): Promise<Array<{ state: string; country: string; count: number }>> {
    const results = await db.select({
      address: namhattas.address,
      count: count()
    }).from(namhattas).groupBy(namhattas.address);

    const stateCounts: Record<string, { country: string; count: number }> = {};
    for (const result of results) {
      try {
        const address = typeof result.address === 'string' ? JSON.parse(result.address) : result.address;
        if (address?.state && address?.country && (!country || address.country === country)) {
          const key = `${address.state}-${address.country}`;
          if (!stateCounts[key]) {
            stateCounts[key] = { country: address.country, count: 0 };
          }
          stateCounts[key].count += result.count;
        }
      } catch (e) {
        // Skip invalid JSON
      }
    }

    return Object.entries(stateCounts).map(([key, data]) => ({
      state: key.split('-')[0],
      country: data.country,
      count: data.count
    }));
  }

  async getNamhattaCountsByDistrict(state?: string): Promise<Array<{ district: string; state: string; country: string; count: number }>> {
    const results = await db.select({
      address: namhattas.address,
      count: count()
    }).from(namhattas).groupBy(namhattas.address);

    const districtCounts: Record<string, { state: string; country: string; count: number }> = {};
    for (const result of results) {
      try {
        const address = typeof result.address === 'string' ? JSON.parse(result.address) : result.address;
        if (address?.district && address?.state && address?.country && (!state || address.state === state)) {
          const key = `${address.district}-${address.state}-${address.country}`;
          if (!districtCounts[key]) {
            districtCounts[key] = { state: address.state, country: address.country, count: 0 };
          }
          districtCounts[key].count += result.count;
        }
      } catch (e) {
        // Skip invalid JSON
      }
    }

    return Object.entries(districtCounts).map(([key, data]) => ({
      district: key.split('-')[0],
      state: data.state,
      country: data.country,
      count: data.count
    }));
  }

  async getNamhattaCountsBySubDistrict(district?: string): Promise<Array<{ subDistrict: string; district: string; state: string; country: string; count: number }>> {
    const results = await db.select({
      address: namhattas.address,
      count: count()
    }).from(namhattas).groupBy(namhattas.address);

    const subDistrictCounts: Record<string, { district: string; state: string; country: string; count: number }> = {};
    for (const result of results) {
      try {
        const address = typeof result.address === 'string' ? JSON.parse(result.address) : result.address;
        if (address?.subDistrict && address?.district && address?.state && address?.country && (!district || address.district === district)) {
          const key = `${address.subDistrict}-${address.district}-${address.state}-${address.country}`;
          if (!subDistrictCounts[key]) {
            subDistrictCounts[key] = { district: address.district, state: address.state, country: address.country, count: 0 };
          }
          subDistrictCounts[key].count += result.count;
        }
      } catch (e) {
        // Skip invalid JSON
      }
    }

    return Object.entries(subDistrictCounts).map(([key, data]) => ({
      subDistrict: key.split('-')[0],
      district: data.district,
      state: data.state,
      country: data.country,
      count: data.count
    }));
  }

  async getNamhattaCountsByVillage(subDistrict?: string): Promise<Array<{ village: string; subDistrict: string; district: string; state: string; country: string; count: number }>> {
    const results = await db.select({
      address: namhattas.address,
      count: count()
    }).from(namhattas).groupBy(namhattas.address);

    const villageCounts: Record<string, { subDistrict: string; district: string; state: string; country: string; count: number }> = {};
    for (const result of results) {
      try {
        const address = typeof result.address === 'string' ? JSON.parse(result.address) : result.address;
        if (address?.village && address?.subDistrict && address?.district && address?.state && address?.country && (!subDistrict || address.subDistrict === subDistrict)) {
          const key = `${address.village}-${address.subDistrict}-${address.district}-${address.state}-${address.country}`;
          if (!villageCounts[key]) {
            villageCounts[key] = { subDistrict: address.subDistrict, district: address.district, state: address.state, country: address.country, count: 0 };
          }
          villageCounts[key].count += result.count;
        }
      } catch (e) {
        // Skip invalid JSON
      }
    }

    return Object.entries(villageCounts).map(([key, data]) => ({
      village: key.split('-')[0],
      subDistrict: data.subDistrict,
      district: data.district,
      state: data.state,
      country: data.country,
      count: data.count
    }));
  }
}