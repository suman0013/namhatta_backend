import { 
  Devotee, 
  InsertDevotee, 
  Namhatta, 
  InsertNamhatta, 
  DevotionalStatus, 
  InsertDevotionalStatus,
  Shraddhakutir,
  InsertShraddhakutir,
  NamhattaUpdate,
  InsertNamhattaUpdate,
  Leader,
  InsertLeader,
  StatusHistory
} from "@shared/schema";

export interface IStorage {
  // Devotees
  getDevotees(page?: number, size?: number): Promise<{ data: Devotee[], total: number }>;
  getDevotee(id: number): Promise<Devotee | undefined>;
  createDevotee(devotee: InsertDevotee): Promise<Devotee>;
  updateDevotee(id: number, devotee: Partial<InsertDevotee>): Promise<Devotee>;
  getDevoteesByNamhatta(namhattaId: number, page?: number, size?: number, statusId?: number): Promise<{ data: Devotee[], total: number }>;
  upgradeDevoteeStatus(id: number, newStatusId: number): Promise<void>;
  getDevoteeStatusHistory(id: number): Promise<StatusHistory[]>;

  // Namhattas
  getNamhattas(page?: number, size?: number, filters?: any): Promise<{ data: Namhatta[], total: number }>;
  getNamhatta(id: number): Promise<Namhatta | undefined>;
  createNamhatta(namhatta: InsertNamhatta): Promise<Namhatta>;
  updateNamhatta(id: number, namhatta: Partial<InsertNamhatta>): Promise<Namhatta>;
  approveNamhatta(id: number): Promise<void>;
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

  // Geography
  getCountries(): Promise<string[]>;
  getStates(country: string): Promise<string[]>;
  getDistricts(state: string): Promise<string[]>;
  getSubDistricts(district: string): Promise<string[]>;
  getVillages(subDistrict: string): Promise<string[]>;
}

export class MemStorage implements IStorage {
  private devotees: Map<number, Devotee>;
  private namhattas: Map<number, Namhatta>;
  private devotionalStatuses: Map<number, DevotionalStatus>;
  private shraddhakutirs: Map<number, Shraddhakutir>;
  private namhattaUpdates: Map<number, NamhattaUpdate>;
  private leaders: Map<number, Leader>;
  private statusHistory: Map<number, StatusHistory>;
  private currentId: number;

  constructor() {
    this.devotees = new Map();
    this.namhattas = new Map();
    this.devotionalStatuses = new Map();
    this.shraddhakutirs = new Map();
    this.namhattaUpdates = new Map();
    this.leaders = new Map();
    this.statusHistory = new Map();
    this.currentId = 1;

    this.initializeMockData();
  }

  private initializeMockData() {
    // Initialize devotional statuses
    const statuses = [
      { name: "Bhakta" },
      { name: "Bhaktin" },
      { name: "Initiated" },
      { name: "Brahmachari" },
      { name: "Sannyasi" }
    ];
    
    statuses.forEach(status => {
      const id = this.currentId++;
      this.devotionalStatuses.set(id, { ...status, id, createdAt: new Date() });
    });

    // Initialize leaders
    const leadersData = [
      { name: "His Divine Grace A.C. Bhaktivedanta Swami Prabhupada", role: "FOUNDER_ACHARYA", reportingTo: null, location: { country: "India" } },
      { name: "His Holiness Jayapataka Swami", role: "GBC", reportingTo: 1, location: { country: "India" } },
      { name: "Regional Director - East", role: "REGIONAL_DIRECTOR", reportingTo: 2, location: { country: "India", state: "West Bengal" } },
      { name: "Co-Regional Director - West Bengal", role: "CO_REGIONAL_DIRECTOR", reportingTo: 3, location: { country: "India", state: "West Bengal" } },
      { name: "District Supervisor - Nadia", role: "DISTRICT_SUPERVISOR", reportingTo: 4, location: { country: "India", state: "West Bengal", district: "Nadia" } },
      { name: "Mala Senapoti - Mayapur", role: "MALA_SENAPOTI", reportingTo: 5, location: { country: "India", state: "West Bengal", district: "Nadia" } }
    ];

    leadersData.forEach((leader, index) => {
      this.leaders.set(index + 1, { ...leader, id: index + 1, createdAt: new Date() });
    });

    // Initialize namhattas
    const namhattasData = [
      {
        name: "Mayapur Namhatta",
        address: { country: "India", state: "West Bengal", district: "Nadia", subDistrict: "Mayapur", village: "Mayapur" },
        status: "active",
        leaderRole: "MalaSenapoti"
      },
      {
        name: "Kolkata Namhatta",
        address: { country: "India", state: "West Bengal", district: "Kolkata", subDistrict: "Central", village: "Park Street" },
        status: "pending",
        leaderRole: "ChakraSenapoti"
      },
      {
        name: "Dhaka Namhatta",
        address: { country: "Bangladesh", state: "Dhaka", district: "Dhaka", subDistrict: "Dhanmondi", village: "Dhanmondi" },
        status: "active",
        leaderRole: "MahaChakraSenapoti"
      }
    ];

    namhattasData.forEach((namhatta, index) => {
      const id = this.currentId++;
      this.namhattas.set(id, { ...namhatta, id, createdAt: new Date() });
    });

    // Initialize devotees
    const devoteesData = [
      {
        name: "Ananda Das",
        presentAddress: { country: "India", state: "West Bengal", district: "Nadia", subDistrict: "Mayapur", village: "Mayapur" },
        permanentAddress: { country: "India", state: "West Bengal", district: "Nadia", subDistrict: "Mayapur", village: "Mayapur" },
        gurudev: "Jayapataka Swami",
        maritalStatus: "Single",
        statusId: 3,
        shraddhakutirId: 1,
        education: "Graduate",
        occupation: "Temple Service"
      },
      {
        name: "Bhakti Devi",
        presentAddress: { country: "India", state: "West Bengal", district: "Kolkata", subDistrict: "Central", village: "Park Street" },
        permanentAddress: { country: "India", state: "West Bengal", district: "Kolkata", subDistrict: "Central", village: "Park Street" },
        gurudev: "Jayapataka Swami",
        maritalStatus: "Married",
        statusId: 2,
        shraddhakutirId: 2,
        education: "Post Graduate",
        occupation: "Teacher"
      }
    ];

    devoteesData.forEach((devotee, index) => {
      const id = this.currentId++;
      this.devotees.set(id, { ...devotee, id, devotionalCourses: [], createdAt: new Date() });
    });

    // Initialize shraddhakutirs
    const shraddhakutirsData = [
      { name: "Mayapur Shraddhakutir", code: "SK-NAD-001", districtCode: "NAD" },
      { name: "Kolkata Shraddhakutir", code: "SK-KOL-001", districtCode: "KOL" }
    ];

    shraddhakutirsData.forEach((shraddhakutir, index) => {
      const id = this.currentId++;
      this.shraddhakutirs.set(id, { ...shraddhakutir, id, createdAt: new Date() });
    });

    // Initialize namhatta updates
    const updatesData = [
      {
        namhattaId: 1,
        programType: "Weekly Satsang Program",
        date: new Date("2024-12-28"),
        attendance: 45,
        hasKirtan: true,
        hasPrasadam: true,
        hasClass: true,
        imageUrls: [],
        specialAttraction: "Special Kirtan by visiting devotee"
      },
      {
        namhattaId: 2,
        programType: "Bhagavad Gita Study Circle",
        date: new Date("2024-12-27"),
        attendance: 28,
        hasKirtan: false,
        hasPrasadam: true,
        hasClass: true,
        imageUrls: [],
        specialAttraction: "Chapter 7 discussion"
      }
    ];

    updatesData.forEach((update, index) => {
      const id = this.currentId++;
      this.namhattaUpdates.set(id, { ...update, id, createdAt: new Date() });
    });
  }

  async getDevotees(page = 1, size = 10): Promise<{ data: Devotee[], total: number }> {
    const allDevotees = Array.from(this.devotees.values());
    const start = (page - 1) * size;
    const data = allDevotees.slice(start, start + size);
    return { data, total: allDevotees.length };
  }

  async getDevotee(id: number): Promise<Devotee | undefined> {
    return this.devotees.get(id);
  }

  async createDevotee(devotee: InsertDevotee): Promise<Devotee> {
    const id = this.currentId++;
    const newDevotee: Devotee = { ...devotee, id, createdAt: new Date() };
    this.devotees.set(id, newDevotee);
    return newDevotee;
  }

  async updateDevotee(id: number, devotee: Partial<InsertDevotee>): Promise<Devotee> {
    const existing = this.devotees.get(id);
    if (!existing) throw new Error("Devotee not found");
    const updated = { ...existing, ...devotee };
    this.devotees.set(id, updated);
    return updated;
  }

  async getDevoteesByNamhatta(namhattaId: number, page = 1, size = 10, statusId?: number): Promise<{ data: Devotee[], total: number }> {
    let allDevotees = Array.from(this.devotees.values());
    if (statusId) {
      allDevotees = allDevotees.filter(d => d.statusId === statusId);
    }
    const start = (page - 1) * size;
    const data = allDevotees.slice(start, start + size);
    return { data, total: allDevotees.length };
  }

  async upgradeDevoteeStatus(id: number, newStatusId: number): Promise<void> {
    const devotee = this.devotees.get(id);
    if (!devotee) throw new Error("Devotee not found");
    
    const historyId = this.currentId++;
    this.statusHistory.set(historyId, {
      id: historyId,
      devoteeId: id,
      fromStatusId: devotee.statusId || null,
      toStatusId: newStatusId,
      changeDate: new Date(),
      notes: "Status upgraded"
    });
    
    devotee.statusId = newStatusId;
    this.devotees.set(id, devotee);
  }

  async getDevoteeStatusHistory(id: number): Promise<StatusHistory[]> {
    return Array.from(this.statusHistory.values()).filter(h => h.devoteeId === id);
  }

  async getNamhattas(page = 1, size = 10, filters?: any): Promise<{ data: Namhatta[], total: number }> {
    const allNamhattas = Array.from(this.namhattas.values());
    const start = (page - 1) * size;
    const data = allNamhattas.slice(start, start + size);
    return { data, total: allNamhattas.length };
  }

  async getNamhatta(id: number): Promise<Namhatta | undefined> {
    return this.namhattas.get(id);
  }

  async createNamhatta(namhatta: InsertNamhatta): Promise<Namhatta> {
    const id = this.currentId++;
    const newNamhatta: Namhatta = { ...namhatta, id, createdAt: new Date() };
    this.namhattas.set(id, newNamhatta);
    return newNamhatta;
  }

  async updateNamhatta(id: number, namhatta: Partial<InsertNamhatta>): Promise<Namhatta> {
    const existing = this.namhattas.get(id);
    if (!existing) throw new Error("Namhatta not found");
    const updated = { ...existing, ...namhatta };
    this.namhattas.set(id, updated);
    return updated;
  }

  async approveNamhatta(id: number): Promise<void> {
    const namhatta = this.namhattas.get(id);
    if (!namhatta) throw new Error("Namhatta not found");
    namhatta.status = "active";
    this.namhattas.set(id, namhatta);
  }

  async getNamhattaUpdates(id: number): Promise<NamhattaUpdate[]> {
    return Array.from(this.namhattaUpdates.values()).filter(u => u.namhattaId === id);
  }

  async getNamhattaDevoteeStatusCount(id: number): Promise<Record<string, number>> {
    const devotees = Array.from(this.devotees.values());
    const counts: Record<string, number> = {};
    
    devotees.forEach(devotee => {
      const status = this.devotionalStatuses.get(devotee.statusId || 0);
      if (status) {
        counts[status.name] = (counts[status.name] || 0) + 1;
      }
    });
    
    return counts;
  }

  async getNamhattaStatusHistory(id: number, page = 1, size = 10): Promise<{ data: StatusHistory[], total: number }> {
    const allHistory = Array.from(this.statusHistory.values());
    const start = (page - 1) * size;
    const data = allHistory.slice(start, start + size);
    return { data, total: allHistory.length };
  }

  async getDevotionalStatuses(): Promise<DevotionalStatus[]> {
    return Array.from(this.devotionalStatuses.values());
  }

  async createDevotionalStatus(status: InsertDevotionalStatus): Promise<DevotionalStatus> {
    const id = this.currentId++;
    const newStatus: DevotionalStatus = { ...status, id, createdAt: new Date() };
    this.devotionalStatuses.set(id, newStatus);
    return newStatus;
  }

  async renameDevotionalStatus(id: number, newName: string): Promise<void> {
    const status = this.devotionalStatuses.get(id);
    if (!status) throw new Error("Status not found");
    status.name = newName;
    this.devotionalStatuses.set(id, status);
  }

  async getShraddhakutirs(): Promise<Shraddhakutir[]> {
    return Array.from(this.shraddhakutirs.values());
  }

  async createShraddhakutir(shraddhakutir: InsertShraddhakutir): Promise<Shraddhakutir> {
    const id = this.currentId++;
    const newShraddhakutir: Shraddhakutir = { ...shraddhakutir, id, createdAt: new Date() };
    this.shraddhakutirs.set(id, newShraddhakutir);
    return newShraddhakutir;
  }

  async createNamhattaUpdate(update: InsertNamhattaUpdate): Promise<NamhattaUpdate> {
    const id = this.currentId++;
    const newUpdate: NamhattaUpdate = { ...update, id, createdAt: new Date() };
    this.namhattaUpdates.set(id, newUpdate);
    return newUpdate;
  }

  async getTopLevelHierarchy(): Promise<{
    founder: Leader[];
    gbc: Leader[];
    regionalDirectors: Leader[];
    coRegionalDirectors: Leader[];
  }> {
    const allLeaders = Array.from(this.leaders.values());
    return {
      founder: allLeaders.filter(l => l.role === "FOUNDER_ACHARYA"),
      gbc: allLeaders.filter(l => l.role === "GBC"),
      regionalDirectors: allLeaders.filter(l => l.role === "REGIONAL_DIRECTOR"),
      coRegionalDirectors: allLeaders.filter(l => l.role === "CO_REGIONAL_DIRECTOR")
    };
  }

  async getLeadersByLevel(level: string): Promise<Leader[]> {
    return Array.from(this.leaders.values()).filter(l => l.role === level);
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
    const recentUpdates = Array.from(this.namhattaUpdates.values())
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 5)
      .map(update => {
        const namhatta = this.namhattas.get(update.namhattaId);
        return {
          namhattaId: update.namhattaId,
          namhattaName: namhatta?.name || "Unknown",
          programType: update.programType,
          date: update.date.toISOString().split('T')[0],
          attendance: update.attendance
        };
      });

    return {
      totalDevotees: this.devotees.size,
      totalNamhattas: this.namhattas.size,
      recentUpdates
    };
  }

  async getCountries(): Promise<string[]> {
    return ["India", "Bangladesh", "Sri Lanka", "Nepal"];
  }

  async getStates(country: string): Promise<string[]> {
    const statesByCountry: Record<string, string[]> = {
      "India": ["West Bengal", "Odisha", "Bihar", "Jharkhand", "Assam"],
      "Bangladesh": ["Dhaka", "Chittagong", "Sylhet", "Rajshahi", "Khulna"],
      "Sri Lanka": ["Western", "Central", "Southern", "Northern", "Eastern"],
      "Nepal": ["Province 1", "Madhesh", "Bagmati", "Gandaki", "Lumbini"]
    };
    return statesByCountry[country] || [];
  }

  async getDistricts(state: string): Promise<string[]> {
    const districtsByState: Record<string, string[]> = {
      "West Bengal": ["Kolkata", "Nadia", "North 24 Parganas", "South 24 Parganas", "Hooghly"],
      "Dhaka": ["Dhaka", "Gazipur", "Narayanganj", "Manikganj", "Munshiganj"],
      "Western": ["Colombo", "Gampaha", "Kalutara"],
    };
    return districtsByState[state] || [];
  }

  async getSubDistricts(district: string): Promise<string[]> {
    const subDistrictsByDistrict: Record<string, string[]> = {
      "Nadia": ["Mayapur", "Krishnanagar", "Ranaghat", "Kalyani"],
      "Kolkata": ["Central", "North", "South", "East", "West"],
      "Dhaka": ["Dhanmondi", "Gulshan", "Uttara", "Old Dhaka"],
    };
    return subDistrictsByDistrict[district] || [];
  }

  async getVillages(subDistrict: string): Promise<string[]> {
    const villagesBySubDistrict: Record<string, string[]> = {
      "Mayapur": ["Mayapur", "Antardwip", "Godrumadvip", "Madhyadvip"],
      "Central": ["Park Street", "Esplanade", "Bow Barracks", "BBD Bagh"],
      "Dhanmondi": ["Dhanmondi", "Lalmatia", "Mohammadpur"],
    };
    return villagesBySubDistrict[subDistrict] || [];
  }
}

export const storage = new MemStorage();
