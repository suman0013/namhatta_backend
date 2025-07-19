import { db } from "./db";
import { 
  devotees, 
  namhattas, 
  devotionalStatuses, 
  shraddhakutirs, 
  namhattaUpdates, 
  addresses, 
  devoteeAddresses, 
  namhattaAddresses,
  leaders,
  statusHistory
} from "@shared/schema";
import { eq, sql, desc, asc, like, and, or, inArray } from "drizzle-orm";

export const storage = {
  // Geography methods
  async getCountries() {
    const result = await db.selectDistinct({ country: addresses.country }).from(addresses);
    return result.map(r => r.country).filter(Boolean);
  },

  async getStates(country?: string) {
    let query = db.selectDistinct({ state: addresses.state }).from(addresses);
    if (country) {
      query = query.where(eq(addresses.country, country));
    }
    const result = await query;
    return result.map(r => r.state).filter(Boolean);
  },

  async getDistricts(state?: string) {
    let query = db.selectDistinct({ district: addresses.district }).from(addresses);
    if (state) {
      query = query.where(eq(addresses.state, state));
    }
    const result = await query;
    return result.map(r => r.district).filter(Boolean);
  },

  async getSubDistricts(district?: string) {
    let query = db.selectDistinct({ subDistrict: addresses.subDistrict }).from(addresses);
    if (district) {
      query = query.where(eq(addresses.district, district));
    }
    const result = await query;
    return result.map(r => r.subDistrict).filter(Boolean);
  },

  async getVillages(subDistrict?: string) {
    let query = db.selectDistinct({ village: addresses.village }).from(addresses);
    if (subDistrict) {
      query = query.where(eq(addresses.subDistrict, subDistrict));
    }
    const result = await query;
    return result.map(r => r.village).filter(Boolean);
  },

  async getPincodes(village?: string, district?: string, subDistrict?: string) {
    let query = db.selectDistinct({ postalCode: addresses.postalCode }).from(addresses);
    const conditions = [];
    
    if (village) {
      conditions.push(eq(addresses.village, village));
    }
    if (district) {
      conditions.push(eq(addresses.district, district));
    }
    if (subDistrict) {
      conditions.push(eq(addresses.subDistrict, subDistrict));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    const result = await query;
    return result.map(r => r.postalCode).filter(Boolean);
  },

  // Devotees
  async getDevotees(filters: any = {}) {
    let query = db.select().from(devotees);
    const conditions = [];

    if (filters.search) {
      conditions.push(
        or(
          like(devotees.legalName, `%${filters.search}%`),
          like(devotees.name, `%${filters.search}%`)
        )
      );
    }

    if (filters.namhattaId) {
      conditions.push(eq(devotees.namhattaId, parseInt(filters.namhattaId)));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const sortBy = filters.sortBy || 'legalName';
    const sortOrder = filters.sortOrder || 'asc';
    
    if (sortOrder === 'desc') {
      query = query.orderBy(desc(devotees[sortBy as keyof typeof devotees]));
    } else {
      query = query.orderBy(asc(devotees[sortBy as keyof typeof devotees]));
    }

    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 50;
    const offset = (page - 1) * limit;

    const data = await query.limit(limit).offset(offset);
    const total = await db.select({ count: sql`count(*)` }).from(devotees);

    return {
      data,
      total: Number(total[0].count),
      page,
      limit
    };
  },

  async getDevoteeById(id: number) {
    const result = await db.select().from(devotees).where(eq(devotees.id, id));
    return result[0];
  },

  async createDevotee(data: any) {
    const result = await db.insert(devotees).values(data).returning();
    return result[0];
  },

  async updateDevotee(id: number, data: any) {
    const result = await db.update(devotees).set(data).where(eq(devotees.id, id)).returning();
    return result[0];
  },

  async deleteDevotee(id: number) {
    await db.delete(devotees).where(eq(devotees.id, id));
    return true;
  },

  // Namhattas
  async getNamhattas(filters: any = {}) {
    let query = db.select().from(namhattas);
    const conditions = [];

    if (filters.search) {
      conditions.push(
        or(
          like(namhattas.name, `%${filters.search}%`),
          like(namhattas.code, `%${filters.search}%`)
        )
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const sortBy = filters.sortBy || 'name';
    const sortOrder = filters.sortOrder || 'asc';
    
    if (sortOrder === 'desc') {
      query = query.orderBy(desc(namhattas[sortBy as keyof typeof namhattas]));
    } else {
      query = query.orderBy(asc(namhattas[sortBy as keyof typeof namhattas]));
    }

    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 50;
    const offset = (page - 1) * limit;

    const data = await query.limit(limit).offset(offset);
    const total = await db.select({ count: sql`count(*)` }).from(namhattas);

    return {
      data,
      total: Number(total[0].count),
      page,
      limit
    };
  },

  async getNamhattaById(id: number) {
    const result = await db.select().from(namhattas).where(eq(namhattas.id, id));
    return result[0];
  },

  async createNamhatta(data: any) {
    const result = await db.insert(namhattas).values(data).returning();
    return result[0];
  },

  async updateNamhatta(id: number, data: any) {
    const result = await db.update(namhattas).set(data).where(eq(namhattas.id, id)).returning();
    return result[0];
  },

  async deleteNamhatta(id: number) {
    await db.delete(namhattas).where(eq(namhattas.id, id));
    return true;
  },

  // Dashboard
  async getDashboardStats() {
    const devoteeCount = await db.select({ count: sql`count(*)` }).from(devotees);
    const namhattaCount = await db.select({ count: sql`count(*)` }).from(namhattas);
    const recentUpdates = await db.select().from(namhattaUpdates).orderBy(desc(namhattaUpdates.createdAt)).limit(5);

    return {
      totalDevotees: Number(devoteeCount[0].count),
      totalNamhattas: Number(namhattaCount[0].count),
      recentUpdates
    };
  },

  async getDashboardSummary() {
    return this.getDashboardStats();
  },

  async getStatusDistribution() {
    const result = await db
      .select({
        statusName: devotionalStatuses.name,
        count: sql`count(*)`,
      })
      .from(devotees)
      .leftJoin(devotionalStatuses, eq(devotees.devotionalStatusId, devotionalStatuses.id))
      .groupBy(devotionalStatuses.name);

    return result;
  },

  // Leaders and Hierarchy
  async getLeadershipHierarchy() {
    const allLeaders = await db.select().from(leaders);
    
    const hierarchy = {
      founder: allLeaders.filter(l => l.role === 'FOUNDER'),
      acharya: allLeaders.filter(l => l.role === 'ACHARYA'),
      regionalDirectors: allLeaders.filter(l => l.role === 'REGIONAL_DIRECTOR'),
      coRegionalDirectors: allLeaders.filter(l => l.role === 'CO_REGIONAL_DIRECTOR'),
      districtSupervisors: allLeaders.filter(l => l.role === 'DISTRICT_SUPERVISOR'),
    };

    return hierarchy;
  },

  // Devotional Statuses
  async getDevotionalStatuses() {
    return await db.select().from(devotionalStatuses);
  },

  async createDevotionalStatus(data: any) {
    const result = await db.insert(devotionalStatuses).values(data).returning();
    return result[0];
  },

  async renameDevotionalStatus(id: number, newName: string) {
    const result = await db.update(devotionalStatuses)
      .set({ name: newName })
      .where(eq(devotionalStatuses.id, id))
      .returning();
    if (result.length === 0) {
      throw new Error('Status not found');
    }
    return result[0];
  },

  // Shraddhakutirs
  async getShraddhakutirs() {
    return await db.select().from(shraddhakutirs).orderBy(asc(shraddhakutirs.name));
  },

  async createShraddhakutir(data: any) {
    const result = await db.insert(shraddhakutirs).values(data).returning();
    return result[0];
  },

  // Updates
  async getAllUpdates() {
    const result = await db
      .select({
        id: namhattaUpdates.id,
        namhattaId: namhattaUpdates.namhattaId,
        namhattaName: namhattas.name,
        programType: namhattaUpdates.programType,
        date: namhattaUpdates.date,
        attendance: namhattaUpdates.attendance,
        specialAttraction: namhattaUpdates.specialAttraction,
        prasadDistribution: namhattaUpdates.prasadDistribution,
        bookDistribution: namhattaUpdates.bookDistribution,
        nagarKirtan: namhattaUpdates.nagarKirtan,
        chanting: namhattaUpdates.chanting,
        arati: namhattaUpdates.arati,
        bhagwatPath: namhattaUpdates.bhagwatPath,
        createdAt: namhattaUpdates.createdAt
      })
      .from(namhattaUpdates)
      .leftJoin(namhattas, eq(namhattaUpdates.namhattaId, namhattas.id))
      .orderBy(desc(namhattaUpdates.createdAt));

    return result;
  },

  async createUpdate(data: any) {
    const result = await db.insert(namhattaUpdates).values(data).returning();
    return result[0];
  },

  async createNamhattaUpdate(data: any) {
    const result = await db.insert(namhattaUpdates).values(data).returning();
    return result[0];
  },

  // Map data methods
  async getNamhattaCountsByCountry() {
    return [];
  },

  async getNamhattaCountsByState() {
    return [];
  },

  async getNamhattaCountsByDistrict() {
    return [];
  },

  async getNamhattaCountsBySubDistrict() {
    return [];
  },

  async getNamhattaCountsByVillage() {
    return [];
  },

  // Additional hierarchy methods
  async getTopLevelHierarchy() {
    return this.getLeadershipHierarchy();
  },

  async getLeadersByLevel(level: string) {
    return await db.select().from(leaders).where(eq(leaders.role, level));
  },

  // Namhatta specific methods
  async rejectNamhatta(id: number, reason: string) {
    const result = await db.update(namhattas)
      .set({ status: 'REJECTED' })
      .where(eq(namhattas.id, id))
      .returning();
    if (result.length === 0) {
      throw new Error('Namhatta not found');
    }
    return result[0];
  },

  async getNamhattaUpdates(namhattaId: number) {
    return await db.select()
      .from(namhattaUpdates)
      .where(eq(namhattaUpdates.namhattaId, namhattaId))
      .orderBy(desc(namhattaUpdates.createdAt));
  },

  async getNamhattaDevoteeStatusCount(namhattaId: number) {
    const result = await db
      .select({
        statusName: devotionalStatuses.name,
        count: sql`count(*)`,
      })
      .from(devotees)
      .leftJoin(devotionalStatuses, eq(devotees.devotionalStatusId, devotionalStatuses.id))
      .where(eq(devotees.namhattaId, namhattaId))
      .groupBy(devotionalStatuses.name);

    return result;
  },

  async getNamhattaStatusHistory(namhattaId: number, page: number = 1, size: number = 10) {
    const offset = (page - 1) * size;
    
    const data = await db.select()
      .from(statusHistory)
      .leftJoin(devotees, eq(statusHistory.devoteeId, devotees.id))
      .where(eq(devotees.namhattaId, namhattaId))
      .orderBy(desc(statusHistory.updatedAt))
      .limit(size)
      .offset(offset);

    const total = await db.select({ count: sql`count(*)` })
      .from(statusHistory)
      .leftJoin(devotees, eq(statusHistory.devoteeId, devotees.id))
      .where(eq(devotees.namhattaId, namhattaId));

    return {
      data,
      total: Number(total[0].count),
      page,
      size
    };
  }
};