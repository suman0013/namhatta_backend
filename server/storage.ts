import { 
  devotees, 
  namhattas, 
  addresses, 
  devotionalStatuses, 
  shraddhakutirs, 
  statusHistory, 
  namhattaUpdates, 
  leaders,
  type Devotee, 
  type InsertDevotee, 
  type Namhatta, 
  type InsertNamhatta,
  type Address,
  type InsertAddress,
  type DevotionalStatus,
  type InsertDevotionalStatus,
  type Shraddhakutir,
  type InsertShraddhakutir,
  type StatusHistory,
  type InsertStatusHistory,
  type NamhattaUpdate,
  type InsertNamhattaUpdate,
  type Leader,
  type InsertLeader
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

// Storage interface for the application
export interface IStorage {
  // Devotees
  getDevotees(): Promise<Devotee[]>;
  getDevotee(id: number): Promise<Devotee | undefined>;
  createDevotee(data: InsertDevotee): Promise<Devotee>;
  
  // Namhattas
  getNamhattas(): Promise<Namhatta[]>;
  getNamhatta(id: number): Promise<Namhatta | undefined>;
  createNamhatta(data: InsertNamhatta): Promise<Namhatta>;
  
  // Devotional Statuses
  getDevotionalStatuses(): Promise<DevotionalStatus[]>;
  
  // Shraddhakutirs
  getShraddhakutirs(): Promise<Shraddhakutir[]>;
  
  // Leaders
  getLeaders(): Promise<Leader[]>;
  
  // Addresses
  getAddresses(): Promise<Address[]>;
  
  // Status History
  getStatusHistory(devoteeId?: number): Promise<StatusHistory[]>;
  
  // Namhatta Updates
  getNamhattaUpdates(namhattaId?: number): Promise<NamhattaUpdate[]>;
  createNamhattaUpdate(data: InsertNamhattaUpdate): Promise<NamhattaUpdate>;
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  async getDevotees(): Promise<Devotee[]> {
    return await db.select().from(devotees);
  }

  async getDevotee(id: number): Promise<Devotee | undefined> {
    const [devotee] = await db.select().from(devotees).where(eq(devotees.id, id));
    return devotee || undefined;
  }

  async createDevotee(data: InsertDevotee): Promise<Devotee> {
    const [devotee] = await db.insert(devotees).values(data).returning();
    return devotee;
  }

  async getNamhattas(): Promise<Namhatta[]> {
    return await db.select().from(namhattas);
  }

  async getNamhatta(id: number): Promise<Namhatta | undefined> {
    const [namhatta] = await db.select().from(namhattas).where(eq(namhattas.id, id));
    return namhatta || undefined;
  }

  async createNamhatta(data: InsertNamhatta): Promise<Namhatta> {
    const [namhatta] = await db.insert(namhattas).values(data).returning();
    return namhatta;
  }

  async getDevotionalStatuses(): Promise<DevotionalStatus[]> {
    return await db.select().from(devotionalStatuses);
  }

  async getShraddhakutirs(): Promise<Shraddhakutir[]> {
    return await db.select().from(shraddhakutirs);
  }

  async getLeaders(): Promise<Leader[]> {
    return await db.select().from(leaders);
  }

  async getAddresses(): Promise<Address[]> {
    return await db.select().from(addresses);
  }

  async getStatusHistory(devoteeId?: number): Promise<StatusHistory[]> {
    if (devoteeId) {
      return await db.select().from(statusHistory).where(eq(statusHistory.devoteeId, devoteeId));
    }
    return await db.select().from(statusHistory);
  }

  async getNamhattaUpdates(namhattaId?: number): Promise<NamhattaUpdate[]> {
    if (namhattaId) {
      return await db.select().from(namhattaUpdates).where(eq(namhattaUpdates.namhattaId, namhattaId));
    }
    return await db.select().from(namhattaUpdates);
  }

  async createNamhattaUpdate(data: InsertNamhattaUpdate): Promise<NamhattaUpdate> {
    const [update] = await db.insert(namhattaUpdates).values(data).returning();
    return update;
  }
}

export const storage = new DatabaseStorage();