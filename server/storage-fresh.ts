import { Devotee, InsertDevotee, Namhatta, InsertNamhatta, DevotionalStatus, InsertDevotionalStatus, Shraddhakutir, InsertShraddhakutir, NamhattaUpdate, InsertNamhattaUpdate, Leader, InsertLeader, StatusHistory, Gurudev, InsertGurudev, User, InsertUser } from "../shared/schema";

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
  approveNamhatta(id: number, registrationNo: string, registrationDate: string): Promise<void>;
  rejectNamhatta(id: number, reason?: string): Promise<void>;
  checkRegistrationNoExists(registrationNo: string): Promise<boolean>;
  getNamhattaUpdates(id: number): Promise<NamhattaUpdate[]>;
  getNamhattaDevoteeStatusCount(id: number): Promise<Record<string, number>>;
  getNamhattaStatusHistory(id: number, page?: number, size?: number): Promise<{ data: StatusHistory[], total: number }>;

  // Statuses
  getDevotionalStatuses(): Promise<DevotionalStatus[]>;
  createDevotionalStatus(status: InsertDevotionalStatus): Promise<DevotionalStatus>;
  renameDevotionalStatus(id: number, newName: string): Promise<void>;

  // Shraddhakutirs
  getShraddhakutirs(district?: string): Promise<Shraddhakutir[]>;
  createShraddhakutir(shraddhakutir: InsertShraddhakutir): Promise<Shraddhakutir>;

  // Gurudevs
  getGurudevs(): Promise<Gurudev[]>;
  createGurudev(gurudev: InsertGurudev): Promise<Gurudev>;

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

  // Admin functions
  createDistrictSupervisor(data: {
    username: string;
    fullName: string;
    email: string;
    password: string;
    districts: string[];
  }): Promise<{
    user: any;
    districts: string[];
  }>;
  getAllUsers(): Promise<any[]>;
  getAvailableDistricts(): Promise<Array<{ code: string; name: string }>>;
  getAllDistrictSupervisors(): Promise<Array<{ id: number; username: string; fullName: string; email: string; districts: string[]; isDefault: boolean }>>;
  getDistrictSupervisors(district: string): Promise<Array<{ id: number; username: string; fullName: string; email: string; isDefault: boolean }>>;
  getUserAddressDefaults(userId: number): Promise<{ country?: string; state?: string; district?: string }>;
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

  // Devotee counts by geography
  getDevoteeCountsByState(country?: string): Promise<Array<{ state: string; country: string; count: number }>>;
  getDevoteeCountsByDistrict(state?: string): Promise<Array<{ district: string; state: string; country: string; count: number }>>;
  getDevoteeCountsBySubDistrict(district?: string): Promise<Array<{ subDistrict: string; district: string; state: string; country: string; count: number }>>;
  getDevoteeCountsByVillage(subDistrict?: string): Promise<Array<{ village: string; subDistrict: string; district: string; state: string; country: string; count: number }>>;

  // Hierarchical reports with role-based filtering
  getHierarchicalReports(filters?: { allowedDistricts?: string[] }): Promise<{
    states: Array<{
      name: string;
      country: string;
      namhattaCount: number;
      devoteeCount: number;
      districts: Array<{
        name: string;
        state: string;
        namhattaCount: number;
        devoteeCount: number;
        subDistricts: Array<{
          name: string;
          district: string;
          namhattaCount: number;
          devoteeCount: number;
          villages: Array<{
            name: string;
            subDistrict: string;
            namhattaCount: number;
            devoteeCount: number;
          }>;
        }>;
      }>;
    }>;
  }>;

  // Lazy loading methods for hierarchical reports (includes ALL locations, even with 0 counts)
  getAllStatesWithCounts(filters?: { allowedDistricts?: string[] }): Promise<Array<{
    name: string;
    country: string;
    namhattaCount: number;
    devoteeCount: number;
  }>>;
  getAllDistrictsWithCounts(state: string, filters?: { allowedDistricts?: string[] }): Promise<Array<{
    name: string;
    state: string;
    namhattaCount: number;
    devoteeCount: number;
  }>>;
  getAllSubDistrictsWithCounts(state: string, district: string, filters?: { allowedDistricts?: string[] }): Promise<Array<{
    name: string;
    district: string;
    namhattaCount: number;
    devoteeCount: number;
  }>>;
  getAllVillagesWithCounts(state: string, district: string, subDistrict: string, filters?: { allowedDistricts?: string[] }): Promise<Array<{
    name: string;
    subDistrict: string;
    namhattaCount: number;
    devoteeCount: number;
  }>>;

  // Leadership Management
  getDevoteeLeaders(page?: number, size?: number, filters?: any): Promise<{ data: Array<Devotee & { reportingToName?: string }>, total: number }>;
  getDevoteesByRole(role: string): Promise<Array<Devotee & { reportingToName?: string }>>;
  getSenapotisByTypeAndReporting(type: string, reportingId: number): Promise<Array<Devotee & { reportingToName?: string }>>;
  assignLeadershipRole(devoteeId: number, data: {
    leadershipRole: string;
    reportingToDevoteeId?: number;
    hasSystemAccess: boolean;
    appointedBy: number;
    appointedDate: string;
  }): Promise<Devotee>;
  removeLeadershipRole(devoteeId: number): Promise<Devotee>;
  getLeadershipHierarchy(): Promise<Array<{
    id: number;
    name: string;
    legalName: string;
    leadershipRole: string;
    reportingToDevoteeId?: number;
    children: Array<any>;
  }>>;
  getEligibleLeaders(): Promise<Devotee[]>;

  // User-Devotee Linking
  getDevoteeLinkedUser(devoteeId: number): Promise<User | null>;
  getUserLinkedDevotee(userId: number): Promise<Devotee | null>;
  linkUserToDevotee(userId: number, devoteeId: number, force?: boolean): Promise<void>;
  unlinkUserFromDevotee(userId: number): Promise<void>;
  createUserForDevotee(devoteeId: number, userData: {
    username: string;
    fullName?: string;
    email: string;
    password: string;
    role: string;
    force?: boolean;
    createdBy?: number;
  }): Promise<{ user: User; devotee: any }>;
}

// Import database storage implementation
import { DatabaseStorage } from './storage-db';

// Export the database storage instance
export const storage = new DatabaseStorage();