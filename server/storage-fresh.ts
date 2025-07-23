import { DatabaseStorage } from "./storage-db";
import { Devotee, InsertDevotee, Namhatta, InsertNamhatta, DevotionalStatus, InsertDevotionalStatus, Shraddhakutir, InsertShraddhakutir, NamhattaUpdate, InsertNamhattaUpdate, Leader, InsertLeader, StatusHistory } from "../shared/schema";

export interface IStorage {
  // Devotees
  getDevotees(page?: number, size?: number, filters?: any): Promise<{ data: Devotee[], total: number }>;
  getDevotee(id: number): Promise<Devotee | undefined>;
  createDevotee(devotee: InsertDevotee): Promise<Devotee>;
  createDevoteeForNamhatta(devotee: InsertDevotee, namhattaId: number): Promise<Devotee>;
  updateDevotee(id: number, devotee: Partial<InsertDevotee>): Promise<Devotee>;
  getDevoteesByNamhatta(namhattaId: number, page?: number, size?: number, statusId?: number): Promise<{ data: Devotee[], total: number }>;
  upgradeDevoteeStatus(id: number, newStatusId: number, notes?: string): Promise<void>;
  getDevoteeStatusHistory(id: number): Promise<StatusHistory[]>;

  // Namhattas
  getNamhattas(page?: number, size?: number, filters?: any): Promise<{ data: Namhatta[], total: number }>;
  getNamhatta(id: number): Promise<Namhatta | undefined>;
  createNamhatta(namhatta: InsertNamhatta): Promise<Namhatta>;
  updateNamhatta(id: number, namhatta: Partial<InsertNamhatta>): Promise<Namhatta>;
  approveNamhatta(id: number): Promise<void>;
  rejectNamhatta(id: number, reason?: string): Promise<void>;
  getNamhattaUpdates(id: number): Promise<NamhattaUpdate[]>;
  getNamhattaDevoteeStatusCount(id: number): Promise<Record<string, number>>;
  getNamhattaStatusHistory(id: number, page?: number, size?: number): Promise<{ data: StatusHistory[], total: number }>;

  // Statuses
  getDevotionalStatuses(): Promise<DevotionalStatus[]>;
  createDevotionalStatus(status: InsertDevotionalStatus): Promise<DevotionalStatus>;
  renameDevotionalStatus(id: number, newName: string): Promise<void>;

  // Shraddhakutirs
  getShraddhakutirs(): Promise<Shraddhakutir[]>;
  createShraddhakutir(shraddhakutir: InsertShraddhakutir): Promise<Shraddhakutir>;

  // Updates
  createNamhattaUpdate(update: InsertNamhattaUpdate): Promise<NamhattaUpdate>;
  getAllUpdates(): Promise<Array<NamhattaUpdate & { namhattaName: string }>>;

  // Hierarchy
  getTopLevelHierarchy(): Promise<{
    founder: Leader[];
    gbc: Leader[];
    regionalDirectors: Leader[];
    coRegionalDirectors: Leader[];
  }>;
  getLeadersByLevel(level: string): Promise<Leader[]>;

  // Dashboard
  getDashboardSummary(): Promise<{
    totalDevotees: number;
    totalNamhattas: number;
    recentUpdates: Array<{
      namhattaId: number;
      namhattaName: string;
      programType: string;
      date: string;
      attendance: number;
    }>;
  }>;
  getStatusDistribution(): Promise<Array<{
    statusName: string;
    count: number;
    percentage: number;
  }>>;

  // Geography - Database-based methods
  getCountries(): Promise<string[]>;
  getStates(country?: string): Promise<string[]>;
  getDistricts(state?: string): Promise<string[]>;
  getSubDistricts(district?: string, pincode?: string): Promise<string[]>;
  getVillages(subDistrict?: string, pincode?: string): Promise<string[]>;
  getPincodes(village?: string, district?: string, subDistrict?: string): Promise<string[]>;
  searchPincodes(country: string, searchTerm: string, page: number, limit: number): Promise<{
    pincodes: string[];
    total: number;
    hasMore: boolean;
  }>;
  getAddressByPincode(pincode: string): Promise<{
    country: string;
    state: string;
    district: string;
    subDistricts: string[];
    villages: string[];
  } | null>;

  // Map data
  getNamhattaCountsByCountry(): Promise<Array<{ country: string; count: number }>>;
  getNamhattaCountsByState(country?: string): Promise<Array<{ state: string; country: string; count: number }>>;
  getNamhattaCountsByDistrict(state?: string): Promise<Array<{ district: string; state: string; country: string; count: number }>>;
  getNamhattaCountsBySubDistrict(district?: string): Promise<Array<{ subDistrict: string; district: string; state: string; country: string; count: number }>>;
  getNamhattaCountsByVillage(subDistrict?: string): Promise<Array<{ village: string; subDistrict: string; district: string; state: string; country: string; count: number }>>;
}

// Simple storage implementation for migration without database dependency
class MemStorage implements IStorage {
  // Basic implementations to make the server start
  async getDevotees() { return { data: [], total: 0 }; }
  async getDevotee() { return undefined; }
  async createDevotee(devotee: any) { return { id: 1, ...devotee, createdAt: new Date(), updatedAt: new Date() }; }
  async createDevoteeForNamhatta(devotee: any) { return this.createDevotee(devotee); }
  async updateDevotee() { return { id: 1, legalName: 'Test' } as any; }
  async getDevoteesByNamhatta() { return { data: [], total: 0 }; }
  async upgradeDevoteeStatus() { return; }
  async getDevoteeStatusHistory() { return []; }
  
  async getNamhattas() { return { data: [], total: 0 }; }
  async getNamhatta() { return undefined; }
  async createNamhatta(namhatta: any) { return { id: 1, ...namhatta, createdAt: new Date(), updatedAt: new Date() }; }
  async updateNamhatta() { return { id: 1, name: 'Test', code: 'TEST' } as any; }
  async approveNamhatta() { return; }
  async rejectNamhatta() { return; }
  async getNamhattaUpdates() { return []; }
  async getNamhattaDevoteeStatusCount() { return {}; }
  async getNamhattaStatusHistory() { return { data: [], total: 0 }; }
  
  async getDevotionalStatuses() { return [{ id: 1, name: 'Shraddhavan', createdAt: new Date() }]; }
  async createDevotionalStatus() { return { id: 1, name: 'Test', createdAt: new Date() }; }
  async renameDevotionalStatus() { return; }
  
  async getShraddhakutirs() { return []; }
  async createShraddhakutir() { return { id: 1, name: 'Test', districtCode: 'TEST', createdAt: new Date() }; }
  
  async createNamhattaUpdate() { return { id: 1, namhattaId: 1, programType: 'Test', date: '2025-01-01', attendance: 0, createdAt: new Date() } as any; }
  async getAllUpdates() { return []; }
  
  async getTopLevelHierarchy() { return { founder: [], gbc: [], regionalDirectors: [], coRegionalDirectors: [] }; }
  async getLeadersByLevel() { return []; }
  
  async getDashboardSummary() { return { totalDevotees: 0, totalNamhattas: 0, recentUpdates: [] }; }
  async getStatusDistribution() { return []; }
  
  async getCountries() { return ['India']; }
  async getStates() { return ['West Bengal']; }
  async getDistricts() { return ['Nadia']; }
  async getSubDistricts() { return []; }
  async getVillages() { return []; }
  async getPincodes() { return []; }
  async searchPincodes() { return { pincodes: [], total: 0, hasMore: false }; }
  async getAddressByPincode() { return null; }
  
  async getNamhattaCountsByCountry() { return []; }
  async getNamhattaCountsByState() { return []; }
  async getNamhattaCountsByDistrict() { return []; }
  async getNamhattaCountsBySubDistrict() { return []; }
  async getNamhattaCountsByVillage() { return []; }
}

export const storage = new MemStorage();