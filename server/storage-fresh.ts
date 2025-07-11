import { db } from "./db";
import { addresses } from "@shared/schema";
import { sql } from "drizzle-orm";
import { Devotee, InsertDevotee, Namhatta, InsertNamhatta, DevotionalStatus, InsertDevotionalStatus, Shraddhakutir, InsertShraddhakutir, NamhattaUpdate, InsertNamhattaUpdate, Leader, InsertLeader, StatusHistory } from "../shared/schema";

export interface IStorage {
  // Devotees
  getDevotees(page?: number, size?: number): Promise<{ data: Devotee[], total: number }>;
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

  // Geography - Database-based methods
  getCountries(): Promise<string[]>;
  getStates(country?: string): Promise<string[]>;
  getDistricts(state?: string): Promise<string[]>;
  getSubDistricts(district?: string): Promise<string[]>;
  getVillages(subDistrict?: string): Promise<string[]>;
  getPincodes(village?: string, district?: string, subDistrict?: string): Promise<string[]>;

  // Map data
  getNamhattaCountsByCountry(): Promise<Array<{ country: string; count: number }>>;
  getNamhattaCountsByState(country?: string): Promise<Array<{ state: string; country: string; count: number }>>;
  getNamhattaCountsByDistrict(state?: string): Promise<Array<{ district: string; state: string; country: string; count: number }>>;
  getNamhattaCountsBySubDistrict(district?: string): Promise<Array<{ subDistrict: string; district: string; state: string; country: string; count: number }>>;
  getNamhattaCountsByVillage(subDistrict?: string): Promise<Array<{ village: string; subDistrict: string; district: string; state: string; country: string; count: number }>>;
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
    
    // Initialize with fresh comprehensive data
    this.initializeGeographicData();
    this.initializeFreshData();
  }

  private async initializeGeographicData() {
    // Geographic data is now stored in the database
    // This method is kept for compatibility but doesn't need to load CSV data
  }

  private initializeFreshData() {
    // Clear all existing data first
    this.devotees.clear();
    this.namhattas.clear();
    this.devotionalStatuses.clear();
    this.namhattaUpdates.clear();
    this.statusHistory.clear();
    this.shraddhakutirs.clear();
    this.leaders.clear();
    this.currentId = 1;

    // Initialize devotional statuses
    const statuses = [
      { name: "Shraddhavan" },
      { name: "Sadhusangi" },
      { name: "Gour/Krishna Sevak" },
      { name: "Gour/Krishna Sadhak" },
      { name: "Sri Guru Charan Asraya" },
      { name: "Harinam Diksha" },
      { name: "Pancharatrik Diksha" }
    ];

    statuses.forEach(status => {
      const id = this.currentId++;
      this.devotionalStatuses.set(id, { ...status, id, createdAt: new Date() });
    });

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

    leadersData.forEach((leader, index) => {
      this.leaders.set(index + 1, { ...leader, id: index + 1, createdAt: new Date() });
    });

    // Initialize 50 comprehensive Namhattas
    const namhattaData = this.generate50Namhattas();
    namhattaData.forEach(namhatta => {
      const id = this.currentId++;
      this.namhattas.set(id, { ...namhatta, id, createdAt: new Date() });
    });

    // Initialize 200 comprehensive devotees (4 per namhatta)
    const devoteeData = this.generate200Devotees(namhattaData);
    devoteeData.devotees.forEach(devotee => {
      const id = this.currentId++;
      this.devotees.set(id, { ...devotee, id, createdAt: new Date() });
    });

    // Initialize status history for devotees
    devoteeData.statusHistory.forEach(history => {
      const id = this.currentId++;
      this.statusHistory.set(id, { ...history, id, createdAt: new Date() });
    });

    // Initialize namhatta updates
    const updateData = this.generateNamhattaUpdates(Array.from(this.namhattas.values()));
    updateData.forEach(update => {
      const id = this.currentId++;
      this.namhattaUpdates.set(id, { ...update, id, createdAt: new Date() });
    });

    // Initialize shraddhakutirs
    const shraddhakutirData = [
      { name: "Mayapur Shraddhakutir", region: "West Bengal", address: { country: "India", state: "West Bengal", district: "Nadia" } },
      { name: "Kolkata Shraddhakutir", region: "West Bengal", address: { country: "India", state: "West Bengal", district: "Kolkata" } },
      { name: "Bhubaneswar Shraddhakutir", region: "Odisha", address: { country: "India", state: "Odisha", district: "Khordha" } },
      { name: "Patna Shraddhakutir", region: "Bihar", address: { country: "India", state: "Bihar", district: "Patna" } },
      { name: "Ranchi Shraddhakutir", region: "Jharkhand", address: { country: "India", state: "Jharkhand", district: "Ranchi" } }
    ];

    shraddhakutirData.forEach(shraddhakutir => {
      const id = this.currentId++;
      this.shraddhakutirs.set(id, { ...shraddhakutir, id, createdAt: new Date() });
    });
  }

  private generate50Namhattas() {
    return [
      // West Bengal (15)
      { code: "NAM001", name: "Mayapur Sri Chaitanya Namhatta", address: { country: "India", state: "West Bengal", district: "Nadia", subDistrict: "Mayapur", village: "Mayapur", postalCode: "741313", landmark: "Near ISKCON Temple" }, status: "APPROVED", malaSenapoti: "Prabhu Jaya Gopala Das", chakraSenapoti: "Prabhu Nitai Chandra Das", upaChakraSenapoti: "Prabhu Vrindavan Das", mahaChakraSenapoti: "Prabhu Gauranga Das", secretary: "Mataji Radha Priya Devi", meetingDay: "Sunday", meetingTime: "16:00", description: "Main Namhatta at Sri Mayapur Dham" },
      { code: "NAM002", name: "Kolkata Radha Govinda Namhatta", address: { country: "India", state: "West Bengal", district: "Kolkata", subDistrict: "Central", village: "Park Street", postalCode: "700016", landmark: "Near Park Street Metro" }, status: "APPROVED", malaSenapoti: "Prabhu Radha Kanta Das", chakraSenapoti: "Prabhu Krishna Chaitanya Das", upaChakraSenapoti: "Prabhu Gopal Das", secretary: "Mataji Sita Devi", meetingDay: "Saturday", meetingTime: "17:00", description: "Central Kolkata spiritual community" },
      { code: "NAM003", name: "Howrah Jagannath Namhatta", address: { country: "India", state: "West Bengal", district: "Howrah", subDistrict: "Howrah", village: "Howrah", postalCode: "711101", landmark: "Howrah Railway Station" }, status: "APPROVED", chakraSenapoti: "Prabhu Jagannath Das", upaChakraSenapoti: "Prabhu Balarama Das", secretary: "Mataji Yamuna Devi", meetingDay: "Sunday", meetingTime: "16:00", description: "Howrah district spiritual center" },
      { code: "NAM004", name: "Durgapur Krishna Balaram Namhatta", address: { country: "India", state: "West Bengal", district: "Paschim Bardhaman", subDistrict: "Durgapur", village: "Durgapur", postalCode: "713201", landmark: "Steel City Mall" }, status: "APPROVED", chakraSenapoti: "Prabhu Steel Das", upaChakraSenapoti: "Prabhu Madhava Das", secretary: "Mataji Tulsi Devi", meetingDay: "Saturday", meetingTime: "18:00", description: "Industrial city devotee group" },
      { code: "NAM005", name: "Siliguri Radha Madhav Namhatta", address: { country: "India", state: "West Bengal", district: "Darjeeling", subDistrict: "Siliguri", village: "Siliguri", postalCode: "734001", landmark: "Mahabirsthan More" }, status: "APPROVED", chakraSenapoti: "Prabhu Mountain Das", upaChakraSenapoti: "Prabhu Keshava Das", secretary: "Mataji Ganga Devi", meetingDay: "Sunday", meetingTime: "17:00", description: "North Bengal spiritual hub" },
      { code: "NAM006", name: "Malda Nitai Gaura Namhatta", address: { country: "India", state: "West Bengal", district: "Malda", subDistrict: "English Bazar", village: "Malda", postalCode: "732101", landmark: "Malda Medical College" }, status: "APPROVED", chakraSenapoti: "Prabhu Mango Das", upaChakraSenapoti: "Prabhu Nitai Das", secretary: "Mataji Radha Devi", meetingDay: "Friday", meetingTime: "18:00", description: "Malda district community center" },
      { code: "NAM007", name: "Asansol Govinda Namhatta", address: { country: "India", state: "West Bengal", district: "Paschim Bardhaman", subDistrict: "Asansol", village: "Asansol", postalCode: "713301", landmark: "Asansol Railway Station" }, status: "APPROVED", chakraSenapoti: "Prabhu Coal Das", upaChakraSenapoti: "Prabhu Govinda Das", secretary: "Mataji Saraswati Devi", meetingDay: "Sunday", meetingTime: "16:30", description: "Coal belt spiritual community" },
      { code: "NAM008", name: "Cooch Behar Vrindavan Namhatta", address: { country: "India", state: "West Bengal", district: "Cooch Behar", subDistrict: "Cooch Behar", village: "Cooch Behar", postalCode: "736101", landmark: "Cooch Behar Palace" }, status: "APPROVED", chakraSenapoti: "Prabhu Royal Das", upaChakraSenapoti: "Prabhu Vrindavan Das", secretary: "Mataji Radharani Devi", meetingDay: "Saturday", meetingTime: "17:30", description: "Royal city devotee assembly" },
      { code: "NAM009", name: "Jalpaiguri Hare Krishna Namhatta", address: { country: "India", state: "West Bengal", district: "Jalpaiguri", subDistrict: "Jalpaiguri", village: "Jalpaiguri", postalCode: "735101", landmark: "Jalpaiguri Court" }, status: "APPROVED", chakraSenapoti: "Prabhu Tea Das", upaChakraSenapoti: "Prabhu Haribol Das", secretary: "Mataji Ganga Devi", meetingDay: "Sunday", meetingTime: "18:00", description: "Tea garden region community" },
      { code: "NAM010", name: "Murshidabad Ganga Namhatta", address: { country: "India", state: "West Bengal", district: "Murshidabad", subDistrict: "Berhampore", village: "Berhampore", postalCode: "742101", landmark: "Hazarduari Palace" }, status: "APPROVED", chakraSenapoti: "Prabhu Nawab Das", upaChakraSenapoti: "Prabhu Ganga Das", secretary: "Mataji Ganga Devi", meetingDay: "Thursday", meetingTime: "18:00", description: "Historic Murshidabad spiritual center" },
      { code: "NAM011", name: "Bankura Bishnupur Namhatta", address: { country: "India", state: "West Bengal", district: "Bankura", subDistrict: "Bankura", village: "Bankura", postalCode: "722101", landmark: "Bankura University" }, status: "APPROVED", chakraSenapoti: "Prabhu Bishnupur Das", upaChakraSenapoti: "Prabhu Bankura Das", secretary: "Mataji Saraswati Devi", meetingDay: "Sunday", meetingTime: "17:00", description: "Bankura district devotee center" },
      { code: "NAM012", name: "Purulia Jagannath Namhatta", address: { country: "India", state: "West Bengal", district: "Purulia", subDistrict: "Purulia", village: "Purulia", postalCode: "723101", landmark: "Purulia Bus Stand" }, status: "APPROVED", chakraSenapoti: "Prabhu Tribal Das", upaChakraSenapoti: "Prabhu Jagannath Das", secretary: "Mataji Durga Devi", meetingDay: "Saturday", meetingTime: "17:00", description: "Tribal region spiritual community" },
      { code: "NAM013", name: "Medinipur Radha Krishna Namhatta", address: { country: "India", state: "West Bengal", district: "Paschim Medinipur", subDistrict: "Medinipur", village: "Medinipur", postalCode: "721101", landmark: "Medinipur Medical College" }, status: "APPROVED", chakraSenapoti: "Prabhu Coastal Das", upaChakraSenapoti: "Prabhu Krishna Das", secretary: "Mataji Radha Devi", meetingDay: "Sunday", meetingTime: "16:00", description: "Coastal region devotee group" },
      { code: "NAM014", name: "Bardhaman Kirtan Namhatta", address: { country: "India", state: "West Bengal", district: "Purba Bardhaman", subDistrict: "Bardhaman", village: "Bardhaman", postalCode: "713101", landmark: "Bardhaman University" }, status: "APPROVED", chakraSenapoti: "Prabhu Kirtan Das", upaChakraSenapoti: "Prabhu Madhava Das", secretary: "Mataji Ganga Devi", meetingDay: "Friday", meetingTime: "18:00", description: "University town spiritual center" },
      { code: "NAM015", name: "Krishnanagar Nitai Chaitanya Namhatta", address: { country: "India", state: "West Bengal", district: "Nadia", subDistrict: "Krishnanagar", village: "Krishnanagar", postalCode: "741101", landmark: "Krishnanagar Railway Station" }, status: "APPROVED", chakraSenapoti: "Prabhu Nitai Das", upaChakraSenapoti: "Prabhu Chaitanya Das", secretary: "Mataji Nitai Devi", meetingDay: "Sunday", meetingTime: "17:30", description: "Historic Krishnanagar community" },

      // Odisha (8)
      { code: "NAM016", name: "Bhubaneswar Capital Namhatta", address: { country: "India", state: "Odisha", district: "Khordha", subDistrict: "Bhubaneswar", village: "Bhubaneswar", postalCode: "751001", landmark: "Lingaraj Temple" }, status: "APPROVED", malaSenapoti: "Prabhu Capital Das", chakraSenapoti: "Prabhu Jagannath Das", secretary: "Mataji Subhadra Devi", meetingDay: "Sunday", meetingTime: "16:00", description: "State capital spiritual hub" },
      { code: "NAM017", name: "Puri Jagannath Dham Namhatta", address: { country: "India", state: "Odisha", district: "Puri", subDistrict: "Puri", village: "Puri", postalCode: "752001", landmark: "Jagannath Temple" }, status: "APPROVED", malaSenapoti: "Prabhu Jagannath Das", chakraSenapoti: "Prabhu Balabhadra Das", secretary: "Mataji Subhadra Devi", meetingDay: "Daily", meetingTime: "18:00", description: "Holy Dham spiritual center" },
      { code: "NAM018", name: "Cuttack Silver City Namhatta", address: { country: "India", state: "Odisha", district: "Cuttack", subDistrict: "Cuttack", village: "Cuttack", postalCode: "753001", landmark: "Barabati Stadium" }, status: "APPROVED", chakraSenapoti: "Prabhu Silver Das", upaChakraSenapoti: "Prabhu Cuttack Das", secretary: "Mataji Ganga Devi", meetingDay: "Saturday", meetingTime: "17:00", description: "Commercial city devotee center" },
      { code: "NAM019", name: "Berhampur Silk City Namhatta", address: { country: "India", state: "Odisha", district: "Ganjam", subDistrict: "Berhampur", village: "Berhampur", postalCode: "760001", landmark: "Berhampur University" }, status: "APPROVED", chakraSenapoti: "Prabhu Silk Das", upaChakraSenapoti: "Prabhu Ganjam Das", secretary: "Mataji Lakshmi Devi", meetingDay: "Sunday", meetingTime: "17:30", description: "Silk city spiritual community" },
      { code: "NAM020", name: "Rourkela Steel Namhatta", address: { country: "India", state: "Odisha", district: "Sundargarh", subDistrict: "Rourkela", village: "Rourkela", postalCode: "769001", landmark: "Steel Plant" }, status: "APPROVED", chakraSenapoti: "Prabhu Steel Das", upaChakraSenapoti: "Prabhu Industrial Das", secretary: "Mataji Durga Devi", meetingDay: "Sunday", meetingTime: "16:30", description: "Steel city devotee assembly" },
      { code: "NAM021", name: "Sambalpur Mahanadi Namhatta", address: { country: "India", state: "Odisha", district: "Sambalpur", subDistrict: "Sambalpur", village: "Sambalpur", postalCode: "768001", landmark: "Samaleswari Temple" }, status: "APPROVED", chakraSenapoti: "Prabhu Mahanadi Das", upaChakraSenapoti: "Prabhu River Das", secretary: "Mataji Mahanadi Devi", meetingDay: "Saturday", meetingTime: "18:00", description: "River city spiritual center" },
      { code: "NAM022", name: "Balasore Coastal Namhatta", address: { country: "India", state: "Odisha", district: "Balasore", subDistrict: "Balasore", village: "Balasore", postalCode: "756001", landmark: "Chandipur Beach" }, status: "APPROVED", chakraSenapoti: "Prabhu Coastal Das", upaChakraSenapoti: "Prabhu Ocean Das", secretary: "Mataji Ganga Devi", meetingDay: "Sunday", meetingTime: "17:00", description: "Coastal region devotee group" },
      { code: "NAM023", name: "Angul Coal Belt Namhatta", address: { country: "India", state: "Odisha", district: "Angul", subDistrict: "Angul", village: "Angul", postalCode: "759122", landmark: "NALCO Plant" }, status: "APPROVED", chakraSenapoti: "Prabhu Coal Das", upaChakraSenapoti: "Prabhu Mining Das", secretary: "Mataji Saraswati Devi", meetingDay: "Friday", meetingTime: "18:00", description: "Mining belt spiritual community" },

      // Bihar (6)
      { code: "NAM024", name: "Patna Ganga Namhatta", address: { country: "India", state: "Bihar", district: "Patna", subDistrict: "Patna", village: "Patna", postalCode: "800001", landmark: "Gandhi Maidan" }, status: "APPROVED", malaSenapoti: "Prabhu Ganga Das", chakraSenapoti: "Prabhu Bihar Das", secretary: "Mataji Ganga Devi", meetingDay: "Sunday", meetingTime: "16:00", description: "State capital spiritual center" },
      { code: "NAM025", name: "Gaya Bodh Namhatta", address: { country: "India", state: "Bihar", district: "Gaya", subDistrict: "Gaya", village: "Gaya", postalCode: "823001", landmark: "Mahabodhi Temple" }, status: "APPROVED", chakraSenapoti: "Prabhu Bodh Das", upaChakraSenapoti: "Prabhu Enlighten Das", secretary: "Mataji Buddha Devi", meetingDay: "Saturday", meetingTime: "17:00", description: "Sacred Bodh Gaya community" },
      { code: "NAM026", name: "Muzaffarpur Litchi Namhatta", address: { country: "India", state: "Bihar", district: "Muzaffarpur", subDistrict: "Muzaffarpur", village: "Muzaffarpur", postalCode: "842001", landmark: "Sitamarhi Road" }, status: "APPROVED", chakraSenapoti: "Prabhu Litchi Das", upaChakraSenapoti: "Prabhu Sweet Das", secretary: "Mataji Sita Devi", meetingDay: "Sunday", meetingTime: "17:30", description: "Litchi land devotee group" },
      { code: "NAM027", name: "Darbhanga Cultural Namhatta", address: { country: "India", state: "Bihar", district: "Darbhanga", subDistrict: "Darbhanga", village: "Darbhanga", postalCode: "846004", landmark: "Lalit Narayan Mithila University" }, status: "APPROVED", chakraSenapoti: "Prabhu Culture Das", upaChakraSenapoti: "Prabhu Mithila Das", secretary: "Mataji Vidya Devi", meetingDay: "Friday", meetingTime: "18:00", description: "Cultural capital spiritual hub" },
      { code: "NAM028", name: "Bhagalpur Silk Namhatta", address: { country: "India", state: "Bihar", district: "Bhagalpur", subDistrict: "Bhagalpur", village: "Bhagalpur", postalCode: "812001", landmark: "Tilka Manjhi University" }, status: "APPROVED", chakraSenapoti: "Prabhu Silk Das", upaChakraSenapoti: "Prabhu Ganga Das", secretary: "Mataji Tilka Devi", meetingDay: "Sunday", meetingTime: "16:30", description: "Silk city devotee center" },
      { code: "NAM029", name: "Purnia Mango Namhatta", address: { country: "India", state: "Bihar", district: "Purnia", subDistrict: "Purnia", village: "Purnia", postalCode: "854301", landmark: "Purnia University" }, status: "APPROVED", chakraSenapoti: "Prabhu Mango Das", upaChakraSenapoti: "Prabhu North Das", secretary: "Mataji Purnima Devi", meetingDay: "Saturday", meetingTime: "17:00", description: "North Bihar spiritual community" },

      // Jharkhand (4)
      { code: "NAM030", name: "Ranchi Tribal Namhatta", address: { country: "India", state: "Jharkhand", district: "Ranchi", subDistrict: "Ranchi", village: "Ranchi", postalCode: "834001", landmark: "Ranchi University" }, status: "APPROVED", malaSenapoti: "Prabhu Tribal Das", chakraSenapoti: "Prabhu Forest Das", secretary: "Mataji Tribal Devi", meetingDay: "Sunday", meetingTime: "16:00", description: "State capital tribal community" },
      { code: "NAM031", name: "Jamshedpur Steel Namhatta", address: { country: "India", state: "Jharkhand", district: "East Singhbhum", subDistrict: "Jamshedpur", village: "Jamshedpur", postalCode: "831001", landmark: "Tata Steel Plant" }, status: "APPROVED", chakraSenapoti: "Prabhu Steel Das", upaChakraSenapoti: "Prabhu Tata Das", secretary: "Mataji Industry Devi", meetingDay: "Saturday", meetingTime: "18:00", description: "Steel city devotee assembly" },
      { code: "NAM032", name: "Dhanbad Coal Namhatta", address: { country: "India", state: "Jharkhand", district: "Dhanbad", subDistrict: "Dhanbad", village: "Dhanbad", postalCode: "826001", landmark: "IIT Dhanbad" }, status: "APPROVED", chakraSenapoti: "Prabhu Coal Das", upaChakraSenapoti: "Prabhu Mining Das", secretary: "Mataji Shakti Devi", meetingDay: "Sunday", meetingTime: "17:00", description: "Coal capital spiritual center" },
      { code: "NAM033", name: "Bokaro Steel Namhatta", address: { country: "India", state: "Jharkhand", district: "Bokaro", subDistrict: "Bokaro", village: "Bokaro", postalCode: "827001", landmark: "Bokaro Steel Plant" }, status: "APPROVED", chakraSenapoti: "Prabhu Bokaro Das", upaChakraSenapoti: "Prabhu Steel Das", secretary: "Mataji Steel Devi", meetingDay: "Friday", meetingTime: "18:00", description: "Steel city devotee group" },

      // Assam (4)
      { code: "NAM034", name: "Guwahati Gateway Namhatta", address: { country: "India", state: "Assam", district: "Kamrup Metropolitan", subDistrict: "Guwahati", village: "Guwahati", postalCode: "781001", landmark: "Kamakhya Temple" }, status: "APPROVED", malaSenapoti: "Prabhu Gateway Das", chakraSenapoti: "Prabhu Brahmaputra Das", secretary: "Mataji Kamakhya Devi", meetingDay: "Sunday", meetingTime: "16:00", description: "Northeast gateway spiritual hub" },
      { code: "NAM035", name: "Dibrugarh Tea Namhatta", address: { country: "India", state: "Assam", district: "Dibrugarh", subDistrict: "Dibrugarh", village: "Dibrugarh", postalCode: "786001", landmark: "Dibrugarh University" }, status: "APPROVED", chakraSenapoti: "Prabhu Tea Das", upaChakraSenapoti: "Prabhu Garden Das", secretary: "Mataji Tea Devi", meetingDay: "Saturday", meetingTime: "17:00", description: "Tea capital devotee center" },
      { code: "NAM036", name: "Silchar Barak Namhatta", address: { country: "India", state: "Assam", district: "Cachar", subDistrict: "Silchar", village: "Silchar", postalCode: "788001", landmark: "Assam University" }, status: "APPROVED", chakraSenapoti: "Prabhu Barak Das", upaChakraSenapoti: "Prabhu Valley Das", secretary: "Mataji Barak Devi", meetingDay: "Sunday", meetingTime: "17:30", description: "Barak Valley spiritual community" },
      { code: "NAM037", name: "Jorhat Cultural Namhatta", address: { country: "India", state: "Assam", district: "Jorhat", subDistrict: "Jorhat", village: "Jorhat", postalCode: "785001", landmark: "Tocklai Tea Research" }, status: "APPROVED", chakraSenapoti: "Prabhu Culture Das", upaChakraSenapoti: "Prabhu Research Das", secretary: "Mataji Culture Devi", meetingDay: "Friday", meetingTime: "18:00", description: "Cultural hub devotee group" },

      // Northeast States (13)
      { code: "NAM038", name: "Agartala Royal Namhatta", address: { country: "India", state: "Tripura", district: "West Tripura", subDistrict: "Agartala", village: "Agartala", postalCode: "799001", landmark: "Ujjayanta Palace" }, status: "APPROVED", malaSenapoti: "Prabhu Royal Das", chakraSenapoti: "Prabhu Palace Das", secretary: "Mataji Royal Devi", meetingDay: "Sunday", meetingTime: "16:00", description: "State capital royal community" },
      { code: "NAM039", name: "Udaipur Lake Namhatta", address: { country: "India", state: "Tripura", district: "Gomati", subDistrict: "Udaipur", village: "Udaipur", postalCode: "799120", landmark: "Tripura Sundari Temple" }, status: "APPROVED", chakraSenapoti: "Prabhu Lake Das", upaChakraSenapoti: "Prabhu Sundari Das", secretary: "Mataji Lake Devi", meetingDay: "Saturday", meetingTime: "17:00", description: "Lake city spiritual center" },
      { code: "NAM040", name: "Aizawl Hill Namhatta", address: { country: "India", state: "Mizoram", district: "Aizawl", subDistrict: "Aizawl", village: "Aizawl", postalCode: "796001", landmark: "Mizoram University" }, status: "APPROVED", malaSenapoti: "Prabhu Hill Das", chakraSenapoti: "Prabhu Mizo Das", secretary: "Mataji Hill Devi", meetingDay: "Sunday", meetingTime: "16:00", description: "Hill state capital community" },
      { code: "NAM041", name: "Lunglei Valley Namhatta", address: { country: "India", state: "Mizoram", district: "Lunglei", subDistrict: "Lunglei", village: "Lunglei", postalCode: "796701", landmark: "Lunglei College" }, status: "APPROVED", chakraSenapoti: "Prabhu Valley Das", upaChakraSenapoti: "Prabhu South Das", secretary: "Mataji Valley Devi", meetingDay: "Saturday", meetingTime: "17:00", description: "Southern valley devotee center" },
      { code: "NAM042", name: "Imphal Jewel Namhatta", address: { country: "India", state: "Manipur", district: "Imphal West", subDistrict: "Imphal", village: "Imphal", postalCode: "795001", landmark: "Kangla Fort" }, status: "APPROVED", malaSenapoti: "Prabhu Jewel Das", chakraSenapoti: "Prabhu Manipur Das", secretary: "Mataji Jewel Devi", meetingDay: "Sunday", meetingTime: "16:00", description: "Jewel state capital community" },
      { code: "NAM043", name: "Thoubal Lake Namhatta", address: { country: "India", state: "Manipur", district: "Thoubal", subDistrict: "Thoubal", village: "Thoubal", postalCode: "795138", landmark: "Loktak Lake" }, status: "APPROVED", chakraSenapoti: "Prabhu Lake Das", upaChakraSenapoti: "Prabhu Loktak Das", secretary: "Mataji Loktak Devi", meetingDay: "Saturday", meetingTime: "17:00", description: "Lake district spiritual center" },
      { code: "NAM044", name: "Shillong Scotland Namhatta", address: { country: "India", state: "Meghalaya", district: "East Khasi Hills", subDistrict: "Shillong", village: "Shillong", postalCode: "793001", landmark: "Ward's Lake" }, status: "APPROVED", malaSenapoti: "Prabhu Scotland Das", chakraSenapoti: "Prabhu Hill Das", secretary: "Mataji Scotland Devi", meetingDay: "Sunday", meetingTime: "16:00", description: "Scotland of East spiritual hub" },
      { code: "NAM045", name: "Tura Garo Namhatta", address: { country: "India", state: "Meghalaya", district: "West Garo Hills", subDistrict: "Tura", village: "Tura", postalCode: "794001", landmark: "Tura Peak" }, status: "APPROVED", chakraSenapoti: "Prabhu Garo Das", upaChakraSenapoti: "Prabhu Peak Das", secretary: "Mataji Garo Devi", meetingDay: "Saturday", meetingTime: "17:00", description: "Garo Hills devotee community" },
      { code: "NAM046", name: "Kohima Warrior Namhatta", address: { country: "India", state: "Nagaland", district: "Kohima", subDistrict: "Kohima", village: "Kohima", postalCode: "797001", landmark: "War Cemetery" }, status: "APPROVED", malaSenapoti: "Prabhu Warrior Das", chakraSenapoti: "Prabhu Naga Das", secretary: "Mataji Warrior Devi", meetingDay: "Sunday", meetingTime: "16:00", description: "Warrior state capital community" },
      { code: "NAM047", name: "Dimapur Gateway Namhatta", address: { country: "India", state: "Nagaland", district: "Dimapur", subDistrict: "Dimapur", village: "Dimapur", postalCode: "797112", landmark: "Dimapur Railway Station" }, status: "APPROVED", chakraSenapoti: "Prabhu Gateway Das", upaChakraSenapoti: "Prabhu Commerce Das", secretary: "Mataji Gateway Devi", meetingDay: "Saturday", meetingTime: "17:00", description: "Commercial capital devotee center" },
      { code: "NAM048", name: "Itanagar Capital Namhatta", address: { country: "India", state: "Arunachal Pradesh", district: "Papum Pare", subDistrict: "Itanagar", village: "Itanagar", postalCode: "791111", landmark: "Raj Bhawan" }, status: "APPROVED", malaSenapoti: "Prabhu Capital Das", chakraSenapoti: "Prabhu Rising Das", secretary: "Mataji Capital Devi", meetingDay: "Sunday", meetingTime: "16:00", description: "Rising state capital community" },
      { code: "NAM049", name: "Pasighat Gateway Namhatta", address: { country: "India", state: "Arunachal Pradesh", district: "East Siang", subDistrict: "Pasighat", village: "Pasighat", postalCode: "791102", landmark: "Siang River" }, status: "APPROVED", chakraSenapoti: "Prabhu Gateway Das", upaChakraSenapoti: "Prabhu Siang Das", secretary: "Mataji Siang Devi", meetingDay: "Saturday", meetingTime: "17:00", description: "Oldest town devotee group" },
      { code: "NAM050", name: "Gangtok Mountain Namhatta", address: { country: "India", state: "Sikkim", district: "East Sikkim", subDistrict: "Gangtok", village: "Gangtok", postalCode: "737101", landmark: "Rumtek Monastery" }, status: "APPROVED", malaSenapoti: "Prabhu Mountain Das", chakraSenapoti: "Prabhu Himalaya Das", secretary: "Mataji Mountain Devi", meetingDay: "Sunday", meetingTime: "16:00", description: "Himalayan state capital community" }
    ];
  }

  private generate200Devotees(namhattas: any[]) {
    const maleNames = ["Rama", "Krishna", "Govinda", "Madhava", "Vishnu", "Gopal", "Hari", "Narayan", "Damodara", "Keshava", "Janardana", "Achyuta", "Upendra", "Yadava", "Trivikrama", "Vamana", "Sridhara", "Hrishikesha", "Padmanabha", "Mukunda", "Narasimha", "Jagannath", "Balarama", "Nityananda", "Chaitanya", "Gauranga", "Advaita", "Srivasa", "Gadadhara", "Vrindavan", "Raghunath", "Rupa", "Sanatana", "Jiva", "Raghava", "Pradyumna", "Aniruddha", "Vasudeva", "Devaki", "Rohini"];
    const femaleNames = ["Radha", "Rukmini", "Satyabhama", "Jambavati", "Kalindi", "Mitravinda", "Nagnajiti", "Bhadra", "Lakshana", "Sita", "Ganga", "Yamuna", "Tulsi", "Vrinda", "Lalita", "Vishakha", "Chitra", "Campakalata", "Tungavidya", "Indulekha", "Rangadevi", "Sudevi", "Kundalata", "Mandali", "Shaibya", "Syama", "Manjari", "Kasturi", "Mukta", "Subhadra"];

    const devotees: any[] = [];
    const statusHistory: any[] = [];
    let devoteeId = 1;
    let historyId = 1;

    namhattas.forEach((namhatta, namhattaIndex) => {
      // Generate 4 devotees per namhatta
      for (let i = 0; i < 4; i++) {
        const isMataji = Math.random() > 0.6; // 40% matajis, 60% prabhus
        const firstName = isMataji ? femaleNames[Math.floor(Math.random() * femaleNames.length)] : maleNames[Math.floor(Math.random() * maleNames.length)];
        const surname = isMataji ? "Devi" : "Das";
        const statusId = Math.floor(Math.random() * 7) + 1; // Random status 1-7
        
        const createdDate = new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
        const updatedDate = new Date(createdDate.getTime() + Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000)); // Random date after creation
        
        const devotee = {
          legalName: `${firstName} ${surname}`,
          name: isMataji ? `Mataji ${firstName} ${surname}` : `Prabhu ${firstName} ${surname}`,
          initiatedName: statusId >= 6 ? `${firstName} ${surname}` : null, // Only initiated devotees have spiritual names
          dob: `${1950 + Math.floor(Math.random() * 50)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
          email: `${firstName.toLowerCase()}.${surname.toLowerCase()}@iskcon.org`,
          phone: `+91-${Math.floor(Math.random() * 9000000000) + 1000000000}`,
          fatherName: `${maleNames[Math.floor(Math.random() * maleNames.length)]} Das`,
          motherName: `${femaleNames[Math.floor(Math.random() * femaleNames.length)]} Devi`,
          husbandName: isMataji ? `${maleNames[Math.floor(Math.random() * maleNames.length)]} Das` : null,
          bloodGroup: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"][Math.floor(Math.random() * 8)],
          maritalStatus: isMataji ? "MARRIED" : (Math.random() > 0.4 ? "MARRIED" : "SINGLE"),
          presentAddress: {
            ...namhatta.address,
            landmark: `${namhatta.address.landmark} - Near ${firstName} Residence`
          },
          permanentAddress: {
            ...namhatta.address,
            landmark: `${namhatta.address.landmark} - Near ${firstName} Residence`
          },
          devotionalStatusId: statusId,
          namhattaId: (namhattaIndex + 1),
          gender: isMataji ? "FEMALE" : "MALE",
          gurudevHarinam: statusId >= 6 ? `HH ${maleNames[Math.floor(Math.random() * 10)]} Swami` : null,
          gurudevPancharatrik: statusId >= 7 ? `HH ${maleNames[Math.floor(Math.random() * 10)]} Swami` : null,
          harinamInitiationGurudev: statusId >= 6 ? `HH ${maleNames[Math.floor(Math.random() * 10)]} Swami` : null,
          pancharatrikInitiationGurudev: statusId >= 7 ? `HH ${maleNames[Math.floor(Math.random() * 10)]} Swami` : null,
          additionalComments: `Active devotee from ${namhatta.name}`,
          devotionalCourses: [],
          shraddhakutirId: null,
          education: ["B.A.", "M.A.", "B.Sc.", "M.Sc.", "B.Tech", "MBA", "Ph.D", "Diploma"][Math.floor(Math.random() * 8)],
          occupation: ["Teacher", "Engineer", "Doctor", "Business", "Service", "Farmer", "Retired", "Student"][Math.floor(Math.random() * 8)],
          id: devoteeId++,
          createdAt: createdDate,
          updatedAt: updatedDate
        };
        
        devotees.push(devotee);

        // Generate 1-5 status history entries per devotee
        const historyCount = Math.floor(Math.random() * 5) + 1;
        for (let h = 0; h < historyCount; h++) {
          const historyDate = new Date(2020 + Math.floor(Math.random() * 5), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
          const historyStatusId = Math.min(statusId, h + 1); // Progressive status upgrades
          
          statusHistory.push({
            devoteeId: devoteeId,
            previousStatusId: h === 0 ? 1 : historyStatusId - 1,
            newStatusId: historyStatusId,
            changedAt: historyDate,
            changedBy: `Prabhu ${maleNames[Math.floor(Math.random() * 10)]} Das`,
            reason: `Spiritual progress assessment - ${new Date().getFullYear() - historyDate.getFullYear()} years of dedicated service`,
            createdAt: new Date()
          });
          historyId++;
        }
        devoteeId++;
      }
    });

    return { devotees, statusHistory };
  }

  private generateNamhattaUpdates(namhattas: any[]) {
    const updates: any[] = [];
    const programTypes = ["Weekly Satsang", "Rath Yatra", "Janmashtami", "Gaura Purnima", "Ekadashi", "Book Distribution", "Prasadam Distribution", "Kirtan Program"];

    namhattas.forEach(namhatta => {
      const updateCount = Math.floor(Math.random() * 5) + 1; // 1-5 updates per namhatta
      for (let u = 0; u < updateCount; u++) {
        const updateDate = new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
        
        updates.push({
          namhattaId: namhatta.id,
          programType: programTypes[Math.floor(Math.random() * programTypes.length)],
          date: updateDate,
          attendance: Math.floor(Math.random() * 200) + 20,
          prasadDistribution: Math.floor(Math.random() * 300) + 50,
          nagarKirtan: Math.random() > 0.7,
          bookDistribution: Math.random() > 0.6,
          chanting: Math.random() > 0.3,
          arati: Math.random() > 0.4,
          bhagwatPath: Math.random() > 0.5,
          specialAttraction: Math.random() > 0.6 ? `Special ${programTypes[Math.floor(Math.random() * programTypes.length)]}` : null,
          facebookLink: Math.random() > 0.7 ? `https://facebook.com/${namhatta.code.toLowerCase()}` : null,
          youtubeLink: Math.random() > 0.8 ? `https://youtube.com/${namhatta.code.toLowerCase()}` : null,
          imageUrls: [],
          createdAt: new Date()
        });
      }
    });

    return updates;
  }

  // Rest of the IStorage implementation methods
  async getDevotees(page = 1, size = 10, filters?: any): Promise<{ data: Devotee[], total: number }> {
    let allDevotees = Array.from(this.devotees.values());
    
    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase();
      allDevotees = allDevotees.filter(devotee => 
        devotee.legalName?.toLowerCase().includes(searchTerm) ||
        devotee.name?.toLowerCase().includes(searchTerm) ||
        devotee.email?.toLowerCase().includes(searchTerm)
      );
    }

    // Apply filters
    if (filters?.country) {
      allDevotees = allDevotees.filter(devotee => 
        devotee.presentAddress?.country === filters.country ||
        devotee.permanentAddress?.country === filters.country
      );
    }
    
    if (filters?.state) {
      allDevotees = allDevotees.filter(devotee => 
        devotee.presentAddress?.state === filters.state ||
        devotee.permanentAddress?.state === filters.state
      );
    }
    
    if (filters?.district) {
      allDevotees = allDevotees.filter(devotee => 
        devotee.presentAddress?.district === filters.district ||
        devotee.permanentAddress?.district === filters.district
      );
    }
    
    if (filters?.statusId) {
      allDevotees = allDevotees.filter(devotee => 
        devotee.devotionalStatusId?.toString() === filters.statusId
      );
    }

    // Apply sorting
    if (filters?.sortBy) {
      allDevotees.sort((a, b) => {
        let aValue: any;
        let bValue: any;
        
        switch (filters.sortBy) {
          case "name":
            aValue = (a.name || a.legalName || "").toLowerCase();
            bValue = (b.name || b.legalName || "").toLowerCase();
            break;
          case "createdAt":
            aValue = a.createdAt?.getTime() || 0;
            bValue = b.createdAt?.getTime() || 0;
            break;
          case "updatedAt":
            aValue = a.updatedAt?.getTime() || a.createdAt?.getTime() || 0;
            bValue = b.updatedAt?.getTime() || b.createdAt?.getTime() || 0;
            break;
          default:
            aValue = (a.name || a.legalName || "").toLowerCase();
            bValue = (b.name || b.legalName || "").toLowerCase();
        }
        
        if (filters.sortOrder === "desc") {
          return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
        } else {
          return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
        }
      });
    }

    const total = allDevotees.length;
    const startIndex = (page - 1) * size;
    const data = allDevotees.slice(startIndex, startIndex + size);
    
    return { data, total };
  }

  async getDevotee(id: number): Promise<Devotee | undefined> {
    return this.devotees.get(id);
  }

  async createDevotee(devotee: InsertDevotee): Promise<Devotee> {
    const id = this.currentId++;
    const now = new Date();
    const newDevotee: Devotee = { ...devotee, id, createdAt: now, updatedAt: now };
    this.devotees.set(id, newDevotee);
    return newDevotee;
  }

  async createDevoteeForNamhatta(devotee: InsertDevotee, namhattaId: number): Promise<Devotee> {
    const id = this.currentId++;
    const newDevotee: Devotee = { ...devotee, id, namhattaId, createdAt: new Date() };
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
    let allDevotees = Array.from(this.devotees.values()).filter(d => d.namhattaId === namhattaId);
    
    if (statusId) {
      allDevotees = allDevotees.filter(d => d.devotionalStatusId === statusId);
    }

    const total = allDevotees.length;
    const startIndex = (page - 1) * size;
    const data = allDevotees.slice(startIndex, startIndex + size);
    
    return { data, total };
  }

  async upgradeDevoteeStatus(id: number, newStatusId: number, notes?: string): Promise<void> {
    const devotee = this.devotees.get(id);
    if (!devotee) throw new Error("Devotee not found");

    const historyId = this.currentId++;
    const history: StatusHistory = {
      id: historyId,
      devoteeId: id,
      previousStatusId: devotee.devotionalStatusId,
      newStatusId,
      changedAt: new Date(),
      changedBy: "System Admin",
      reason: notes || "Status upgrade",
      createdAt: new Date()
    };
    
    this.statusHistory.set(historyId, history);
    devotee.devotionalStatusId = newStatusId;
    this.devotees.set(id, devotee);
  }

  async getDevoteeStatusHistory(id: number): Promise<StatusHistory[]> {
    return Array.from(this.statusHistory.values())
      .filter(h => h.devoteeId === id)
      .sort((a, b) => b.changedAt.getTime() - a.changedAt.getTime());
  }

  async getNamhattas(page = 1, size = 10, filters?: any): Promise<{ data: Namhatta[], total: number }> {
    let allNamhattas = Array.from(this.namhattas.values());
    
    // Apply search filter
    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase();
      allNamhattas = allNamhattas.filter(namhatta => 
        namhatta.name?.toLowerCase().includes(searchTerm) ||
        namhatta.code?.toLowerCase().includes(searchTerm) ||
        namhatta.malaSenapoti?.toLowerCase().includes(searchTerm) ||
        namhatta.mahaChakraSenapoti?.toLowerCase().includes(searchTerm) ||
        namhatta.chakraSenapoti?.toLowerCase().includes(searchTerm) ||
        namhatta.upaChakraSenapoti?.toLowerCase().includes(searchTerm) ||
        namhatta.secretary?.toLowerCase().includes(searchTerm) ||
        namhatta.address?.country?.toLowerCase().includes(searchTerm) ||
        namhatta.address?.state?.toLowerCase().includes(searchTerm) ||
        namhatta.address?.district?.toLowerCase().includes(searchTerm) ||
        namhatta.address?.village?.toLowerCase().includes(searchTerm)
      );
    }
    
    // Apply country filter
    if (filters?.country) {
      allNamhattas = allNamhattas.filter(namhatta => 
        namhatta.address?.country === filters.country
      );
    }
    
    // Apply state filter
    if (filters?.state) {
      allNamhattas = allNamhattas.filter(namhatta => 
        namhatta.address?.state === filters.state
      );
    }
    
    // Apply district filter
    if (filters?.district) {
      allNamhattas = allNamhattas.filter(namhatta => 
        namhatta.address?.district === filters.district
      );
    }
    
    // Apply sub-district filter
    if (filters?.subDistrict) {
      allNamhattas = allNamhattas.filter(namhatta => 
        namhatta.address?.subDistrict === filters.subDistrict
      );
    }
    
    // Apply village filter
    if (filters?.village) {
      allNamhattas = allNamhattas.filter(namhatta => 
        namhatta.address?.village === filters.village
      );
    }
    
    // Apply status filter
    if (filters?.status) {
      allNamhattas = allNamhattas.filter(namhatta => 
        namhatta.status === filters.status
      );
    }
    
    // Apply sorting
    const sortBy = filters?.sortBy || 'name';
    const sortOrder = filters?.sortOrder || 'asc';
    
    allNamhattas.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name?.toLowerCase() || '';
          bValue = b.name?.toLowerCase() || '';
          break;
        case 'createdAt':
          aValue = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          bValue = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          break;
        case 'updatedAt':
          aValue = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
          bValue = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
          break;
        default:
          aValue = a.name?.toLowerCase() || '';
          bValue = b.name?.toLowerCase() || '';
      }
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    const total = allNamhattas.length;
    const startIndex = (page - 1) * size;
    const paginatedNamhattas = allNamhattas.slice(startIndex, startIndex + size);
    
    // Add devotee count to each Namhatta
    const data = paginatedNamhattas.map(namhatta => {
      const devoteeCount = Array.from(this.devotees.values()).filter(devotee => 
        devotee.namhattaId === namhatta.id
      ).length;
      
      return {
        ...namhatta,
        devoteeCount
      };
    });
    
    return { data, total };
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
    
    namhatta.status = "APPROVED";
    this.namhattas.set(id, namhatta);
  }

  async rejectNamhatta(id: number, reason?: string): Promise<void> {
    const namhatta = this.namhattas.get(id);
    if (!namhatta) throw new Error("Namhatta not found");
    
    namhatta.status = "REJECTED";
    this.namhattas.set(id, namhatta);
  }

  async getNamhattaUpdates(id: number): Promise<NamhattaUpdate[]> {
    return Array.from(this.namhattaUpdates.values())
      .filter(u => u.namhattaId === id)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  async getNamhattaDevoteeStatusCount(id: number): Promise<Record<string, number>> {
    const devotees = Array.from(this.devotees.values()).filter(d => d.namhattaId === id);
    const statusCounts: Record<string, number> = {};

    for (const devotee of devotees) {
      const status = this.devotionalStatuses.get(devotee.devotionalStatusId);
      if (status) {
        statusCounts[status.name] = (statusCounts[status.name] || 0) + 1;
      }
    }

    return statusCounts;
  }

  async getNamhattaStatusHistory(id: number, page = 1, size = 10): Promise<{ data: StatusHistory[], total: number }> {
    const devotees = Array.from(this.devotees.values()).filter(d => d.namhattaId === id);
    const devoteeIds = new Set(devotees.map(d => d.id));
    
    const allHistory = Array.from(this.statusHistory.values())
      .filter(h => devoteeIds.has(h.devoteeId))
      .sort((a, b) => b.changedAt.getTime() - a.changedAt.getTime());

    const total = allHistory.length;
    const startIndex = (page - 1) * size;
    const data = allHistory.slice(startIndex, startIndex + size);
    
    return { data, total };
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
    const newUpdate: NamhattaUpdate = { 
      ...update, 
      id, 
      createdAt: new Date() 
    };
    this.namhattaUpdates.set(id, newUpdate);
    return newUpdate;
  }

  async getTopLevelHierarchy(): Promise<{
    founder: Leader[];
    gbc: Leader[];
    regionalDirectors: Leader[];
    coRegionalDirectors: Leader[];
  }> {
    const leaders = Array.from(this.leaders.values());
    
    return {
      founder: leaders.filter(l => l.role === "FOUNDER_ACHARYA"),
      gbc: leaders.filter(l => l.role === "GBC"),
      regionalDirectors: leaders.filter(l => l.role === "REGIONAL_DIRECTOR"),
      coRegionalDirectors: leaders.filter(l => l.role === "CO_REGIONAL_DIRECTOR")
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
    const totalDevotees = this.devotees.size;
    const totalNamhattas = this.namhattas.size;
    
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
      totalDevotees,
      totalNamhattas,
      recentUpdates
    };
  }

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
        query = query.where(sql`${addresses.country} = ${country}`);
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
        query = query.where(sql`${addresses.state} = ${state}`);
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
        query = query.where(sql`${addresses.district} = ${district}`);
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
        query = query.where(sql`${addresses.subDistrict} = ${subDistrict}`);
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
        query = query.where(sql`${addresses.village} = ${village}`);
      }
      if (district) {
        query = query.where(sql`${addresses.district} = ${district}`);
      }
      if (subDistrict) {
        query = query.where(sql`${addresses.subDistrict} = ${subDistrict}`);
      }
      
      const results = await query;
      return results.map(row => row.postalCode).filter(Boolean);
    } catch (error) {
      console.error('Error getting postal codes from database:', error);
      return [];
    }
  }

  async getNamhattaCountsByCountry(): Promise<Array<{ country: string; count: number }>> {
    const countryCounts: Record<string, number> = {};
    
    for (const namhatta of this.namhattas.values()) {
      const country = namhatta.address?.country;
      if (country) {
        countryCounts[country] = (countryCounts[country] || 0) + 1;
      }
    }
    
    return Object.entries(countryCounts).map(([country, count]) => ({ country, count }));
  }

  async getNamhattaCountsByState(country?: string): Promise<Array<{ state: string; country: string; count: number }>> {
    const stateCounts: Record<string, { country: string; count: number }> = {};
    
    for (const namhatta of this.namhattas.values()) {
      const namhattaCountry = namhatta.address?.country;
      const state = namhatta.address?.state;
      
      if (state && namhattaCountry && (!country || namhattaCountry === country)) {
        const key = `${state}-${namhattaCountry}`;
        if (!stateCounts[key]) {
          stateCounts[key] = { country: namhattaCountry, count: 0 };
        }
        stateCounts[key].count++;
      }
    }
    
    return Object.entries(stateCounts).map(([key, data]) => ({
      state: key.split('-')[0],
      country: data.country,
      count: data.count
    }));
  }

  async getNamhattaCountsByDistrict(state?: string): Promise<Array<{ district: string; state: string; country: string; count: number }>> {
    const districtCounts: Record<string, { state: string; country: string; count: number }> = {};
    
    for (const namhatta of this.namhattas.values()) {
      const namhattaState = namhatta.address?.state;
      const district = namhatta.address?.district;
      const country = namhatta.address?.country;
      
      if (district && namhattaState && country && (!state || namhattaState === state)) {
        const key = `${district}-${namhattaState}-${country}`;
        if (!districtCounts[key]) {
          districtCounts[key] = { state: namhattaState, country, count: 0 };
        }
        districtCounts[key].count++;
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
    const subDistrictCounts: Record<string, { district: string; state: string; country: string; count: number }> = {};
    
    for (const namhatta of this.namhattas.values()) {
      const namhattaDistrict = namhatta.address?.district;
      const subDistrict = namhatta.address?.subDistrict;
      const state = namhatta.address?.state;
      const country = namhatta.address?.country;
      
      if (subDistrict && namhattaDistrict && state && country && (!district || namhattaDistrict === district)) {
        const key = `${subDistrict}-${namhattaDistrict}-${state}-${country}`;
        if (!subDistrictCounts[key]) {
          subDistrictCounts[key] = { district: namhattaDistrict, state, country, count: 0 };
        }
        subDistrictCounts[key].count++;
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
    const villageCounts: Record<string, { subDistrict: string; district: string; state: string; country: string; count: number }> = {};
    
    for (const namhatta of this.namhattas.values()) {
      const namhattaSubDistrict = namhatta.address?.subDistrict;
      const village = namhatta.address?.village;
      const district = namhatta.address?.district;
      const state = namhatta.address?.state;
      const country = namhatta.address?.country;
      
      if (village && namhattaSubDistrict && district && state && country && (!subDistrict || namhattaSubDistrict === subDistrict)) {
        const key = `${village}-${namhattaSubDistrict}-${district}-${state}-${country}`;
        if (!villageCounts[key]) {
          villageCounts[key] = { subDistrict: namhattaSubDistrict, district, state, country, count: 0 };
        }
        villageCounts[key].count++;
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

export const storage = new MemStorage();