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
  createDevoteeForNamhatta(devotee: InsertDevotee, namhattaId: number): Promise<Devotee>;
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

  // Geography
  getCountries(): Promise<string[]>;
  getStates(country: string): Promise<string[]>;
  getDistricts(state: string): Promise<string[]>;
  getSubDistricts(district: string): Promise<string[]>;
  getVillages(subDistrict: string): Promise<string[]>;

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
      { name: "Prabhu Radhanath Swami", role: "REGIONAL_DIRECTOR", reportingTo: 2, location: { country: "India", state: "West Bengal" } },
      { name: "Prabhu Bhakti Charu Swami", role: "REGIONAL_DIRECTOR", reportingTo: 2, location: { country: "India", state: "West Bengal" } },
      { name: "Prabhu Gopal Krishna Goswami", role: "CO_REGIONAL_DIRECTOR", reportingTo: 3, location: { country: "India", state: "West Bengal" } },
      { name: "Prabhu Bhanu Swami", role: "CO_REGIONAL_DIRECTOR", reportingTo: 3, location: { country: "India", state: "West Bengal" } },
      { name: "District Supervisor - Nadia", role: "DISTRICT_SUPERVISOR", reportingTo: 5, location: { country: "India", state: "West Bengal", district: "Nadia" } },
      { name: "Mala Senapoti - Mayapur", role: "MALA_SENAPOTI", reportingTo: 7, location: { country: "India", state: "West Bengal", district: "Nadia" } }
    ];

    leadersData.forEach((leader, index) => {
      this.leaders.set(index + 1, { ...leader, id: index + 1, createdAt: new Date() });
    });

    // Initialize namhattas
    const namhattasData = [
      {
        code: "NAM001",
        name: "Mayapur Namhatta",
        address: { country: "India", state: "West Bengal", district: "Nadia", subDistrict: "Mayapur", village: "Mayapur" },
        status: "APPROVED",
        malaSenapoti: "Prabhu Jaya Gopala Das",
        meetingDay: "Sunday",
        meetingTime: "16:00"
      },
      {
        code: "NAM002", 
        name: "Kolkata Central Namhatta",
        address: { country: "India", state: "West Bengal", district: "Kolkata", subDistrict: "Central", village: "Park Street" },
        status: "APPROVED",
        chakraSenapoti: "Prabhu Radha Kanta Das",
        meetingDay: "Saturday",
        meetingTime: "17:00"
      },
      {
        code: "NAM003",
        name: "Kolkata North Namhatta",
        address: { country: "India", state: "West Bengal", district: "Kolkata", subDistrict: "North", village: "Shyama Bazar" },
        status: "APPROVED", 
        chakraSenapoti: "Prabhu Krishna Chaitanya Das",
        meetingDay: "Friday",
        meetingTime: "18:00"
      },
      {
        code: "NAM004",
        name: "Dhaka Central Namhatta",
        address: { country: "Bangladesh", state: "Dhaka", district: "Dhaka", subDistrict: "Dhanmondi", village: "Dhanmondi" },
        status: "APPROVED",
        mahaChakraSenapoti: "Prabhu Nityananda Das",
        meetingDay: "Saturday",
        meetingTime: "16:30"
      },
      {
        code: "NAM005",
        name: "Chittagong Namhatta",
        address: { country: "Bangladesh", state: "Chittagong", district: "Chittagong", subDistrict: "Port Area", village: "Chittagong" },
        status: "APPROVED",
        chakraSenapoti: "Prabhu Gauranga Das",
        meetingDay: "Sunday",
        meetingTime: "15:00"
      },
      {
        code: "NAM006",
        name: "Nadia Krishnanagar Namhatta", 
        address: { country: "India", state: "West Bengal", district: "Nadia", subDistrict: "Krishnanagar", village: "Krishnanagar" },
        status: "PENDING_APPROVAL",
        upaChakraSenapoti: "Prabhu Harinama Das",
        meetingDay: "Sunday",
        meetingTime: "17:30"
      },
      {
        code: "NAM007",
        name: "Colombo Namhatta",
        address: { country: "Sri Lanka", state: "Western", district: "Colombo", subDistrict: "Colombo Central", village: "Colombo" },
        status: "APPROVED",
        chakraSenapoti: "Prabhu Vrindavan Das",
        meetingDay: "Saturday",
        meetingTime: "16:00"
      },
      {
        code: "NAM008",
        name: "Kathmandu Namhatta",
        address: { country: "Nepal", state: "Bagmati", district: "Kathmandu", subDistrict: "Central", village: "Kathmandu" },
        status: "APPROVED", 
        chakraSenapoti: "Prabhu Govinda Das",
        meetingDay: "Sunday",
        meetingTime: "15:30"
      }
    ];

    // Clear existing namhattas and add the comprehensive data
    this.namhattas.clear();
    
    // West Bengal Namhattas (15 total)
    const comprehensiveNamhattas = [
      { code: "NAM001", name: "Mayapur Namhatta", address: { country: "India", state: "West Bengal", district: "Nadia", subDistrict: "Mayapur", village: "Mayapur" }, status: "APPROVED", malaSenapoti: "Prabhu Jaya Gopala Das", meetingDay: "Sunday", meetingTime: "16:00" },
      { code: "NAM002", name: "Kolkata Central Namhatta", address: { country: "India", state: "West Bengal", district: "Kolkata", subDistrict: "Central", village: "Park Street" }, status: "APPROVED", chakraSenapoti: "Prabhu Radha Kanta Das", meetingDay: "Saturday", meetingTime: "17:00" },
      { code: "NAM003", name: "Kolkata North Namhatta", address: { country: "India", state: "West Bengal", district: "Kolkata", subDistrict: "North", village: "Shyama Bazar" }, status: "APPROVED", chakraSenapoti: "Prabhu Krishna Chaitanya Das", meetingDay: "Friday", meetingTime: "18:00" },
      { code: "NAM006", name: "Nadia Krishnanagar Namhatta", address: { country: "India", state: "West Bengal", district: "Nadia", subDistrict: "Krishnanagar", village: "Krishnanagar" }, status: "APPROVED", upaChakraSenapoti: "Prabhu Harinama Das", meetingDay: "Sunday", meetingTime: "17:30" },
      { code: "NAM009", name: "Howrah Namhatta", address: { country: "India", state: "West Bengal", district: "Howrah", subDistrict: "Howrah", village: "Howrah" }, status: "APPROVED", chakraSenapoti: "Prabhu Jagannath Das", meetingDay: "Sunday", meetingTime: "16:00" },
      { code: "NAM010", name: "Durgapur Namhatta", address: { country: "India", state: "West Bengal", district: "Paschim Bardhaman", subDistrict: "Durgapur", village: "Durgapur" }, status: "APPROVED", chakraSenapoti: "Prabhu Steel Das", meetingDay: "Saturday", meetingTime: "18:00" },
      { code: "NAM011", name: "Siliguri Namhatta", address: { country: "India", state: "West Bengal", district: "Darjeeling", subDistrict: "Siliguri", village: "Siliguri" }, status: "APPROVED", chakraSenapoti: "Prabhu Mountain Das", meetingDay: "Sunday", meetingTime: "17:00" },
      { code: "NAM012", name: "Malda Namhatta", address: { country: "India", state: "West Bengal", district: "Malda", subDistrict: "English Bazar", village: "Malda" }, status: "APPROVED", chakraSenapoti: "Prabhu Mango Das", meetingDay: "Friday", meetingTime: "18:00" },
      { code: "NAM013", name: "Asansol Namhatta", address: { country: "India", state: "West Bengal", district: "Paschim Bardhaman", subDistrict: "Asansol", village: "Asansol" }, status: "APPROVED", chakraSenapoti: "Prabhu Coal Das", meetingDay: "Sunday", meetingTime: "16:30" },
      { code: "NAM014", name: "Cooch Behar Namhatta", address: { country: "India", state: "West Bengal", district: "Cooch Behar", subDistrict: "Cooch Behar", village: "Cooch Behar" }, status: "APPROVED", chakraSenapoti: "Prabhu Royal Das", meetingDay: "Saturday", meetingTime: "17:30" },
      { code: "NAM015", name: "Jalpaiguri Namhatta", address: { country: "India", state: "West Bengal", district: "Jalpaiguri", subDistrict: "Jalpaiguri", village: "Jalpaiguri" }, status: "APPROVED", chakraSenapoti: "Prabhu Tea Das", meetingDay: "Sunday", meetingTime: "18:00" },
      { code: "NAM016", name: "Murshidabad Namhatta", address: { country: "India", state: "West Bengal", district: "Murshidabad", subDistrict: "Berhampore", village: "Berhampore" }, status: "APPROVED", chakraSenapoti: "Prabhu Nawab Das", meetingDay: "Thursday", meetingTime: "18:00" },
      { code: "NAM017", name: "Bankura Namhatta", address: { country: "India", state: "West Bengal", district: "Bankura", subDistrict: "Bankura", village: "Bankura" }, status: "APPROVED", chakraSenapoti: "Prabhu Bishnupur Das", meetingDay: "Sunday", meetingTime: "17:00" },
      { code: "NAM018", name: "Purulia Namhatta", address: { country: "India", state: "West Bengal", district: "Purulia", subDistrict: "Purulia", village: "Purulia" }, status: "APPROVED", chakraSenapoti: "Prabhu Tribal Das", meetingDay: "Saturday", meetingTime: "17:00" },
      { code: "NAM019", name: "Medinipur Namhatta", address: { country: "India", state: "West Bengal", district: "Paschim Medinipur", subDistrict: "Medinipur", village: "Medinipur" }, status: "APPROVED", chakraSenapoti: "Prabhu Coastal Das", meetingDay: "Sunday", meetingTime: "16:00" },

      // Odisha Namhattas (12 total)
      { code: "NAM020", name: "Bhubaneswar Namhatta", address: { country: "India", state: "Odisha", district: "Khordha", subDistrict: "Bhubaneswar", village: "Bhubaneswar" }, status: "APPROVED", malaSenapoti: "Prabhu Capital Das", meetingDay: "Sunday", meetingTime: "16:00" },
      { code: "NAM021", name: "Puri Namhatta", address: { country: "India", state: "Odisha", district: "Puri", subDistrict: "Puri", village: "Puri" }, status: "APPROVED", malaSenapoti: "Prabhu Jagannath Das", meetingDay: "Daily", meetingTime: "18:00" },
      { code: "NAM022", name: "Cuttack Namhatta", address: { country: "India", state: "Odisha", district: "Cuttack", subDistrict: "Cuttack", village: "Cuttack" }, status: "APPROVED", chakraSenapoti: "Prabhu Silver Das", meetingDay: "Saturday", meetingTime: "17:00" },
      { code: "NAM023", name: "Berhampur Namhatta", address: { country: "India", state: "Odisha", district: "Ganjam", subDistrict: "Berhampur", village: "Berhampur" }, status: "APPROVED", chakraSenapoti: "Prabhu Silk Das", meetingDay: "Sunday", meetingTime: "17:30" },
      { code: "NAM024", name: "Rourkela Namhatta", address: { country: "India", state: "Odisha", district: "Sundargarh", subDistrict: "Rourkela", village: "Rourkela" }, status: "APPROVED", chakraSenapoti: "Prabhu Steel Das", meetingDay: "Sunday", meetingTime: "16:30" },
      { code: "NAM025", name: "Sambalpur Namhatta", address: { country: "India", state: "Odisha", district: "Sambalpur", subDistrict: "Sambalpur", village: "Sambalpur" }, status: "APPROVED", chakraSenapoti: "Prabhu Mahanadi Das", meetingDay: "Saturday", meetingTime: "18:00" },
      { code: "NAM026", name: "Balasore Namhatta", address: { country: "India", state: "Odisha", district: "Balasore", subDistrict: "Balasore", village: "Balasore" }, status: "APPROVED", chakraSenapoti: "Prabhu Coastal Das", meetingDay: "Sunday", meetingTime: "17:00" },
      { code: "NAM027", name: "Baripada Namhatta", address: { country: "India", state: "Odisha", district: "Mayurbhanj", subDistrict: "Baripada", village: "Baripada" }, status: "APPROVED", chakraSenapoti: "Prabhu Tribal Das", meetingDay: "Friday", meetingTime: "18:00" },
      { code: "NAM028", name: "Jharsuguda Namhatta", address: { country: "India", state: "Odisha", district: "Jharsuguda", subDistrict: "Jharsuguda", village: "Jharsuguda" }, status: "APPROVED", chakraSenapoti: "Prabhu Coal Das", meetingDay: "Sunday", meetingTime: "16:00" },
      { code: "NAM029", name: "Angul Namhatta", address: { country: "India", state: "Odisha", district: "Angul", subDistrict: "Angul", village: "Angul" }, status: "APPROVED", chakraSenapoti: "Prabhu Power Das", meetingDay: "Saturday", meetingTime: "17:30" },
      { code: "NAM030", name: "Kendrapara Namhatta", address: { country: "India", state: "Odisha", district: "Kendrapara", subDistrict: "Kendrapara", village: "Kendrapara" }, status: "APPROVED", chakraSenapoti: "Prabhu River Das", meetingDay: "Sunday", meetingTime: "18:00" },
      { code: "NAM031", name: "Koraput Namhatta", address: { country: "India", state: "Odisha", district: "Koraput", subDistrict: "Koraput", village: "Koraput" }, status: "APPROVED", chakraSenapoti: "Prabhu Hills Das", meetingDay: "Sunday", meetingTime: "17:00" },

      // Bihar Namhattas (10 total)
      { code: "NAM032", name: "Patna Namhatta", address: { country: "India", state: "Bihar", district: "Patna", subDistrict: "Patna", village: "Patna" }, status: "APPROVED", malaSenapoti: "Prabhu Ganga Das", meetingDay: "Sunday", meetingTime: "16:00" },
      { code: "NAM033", name: "Gaya Namhatta", address: { country: "India", state: "Bihar", district: "Gaya", subDistrict: "Gaya", village: "Gaya" }, status: "APPROVED", malaSenapoti: "Prabhu Buddha Das", meetingDay: "Sunday", meetingTime: "17:00" },
      { code: "NAM034", name: "Muzaffarpur Namhatta", address: { country: "India", state: "Bihar", district: "Muzaffarpur", subDistrict: "Muzaffarpur", village: "Muzaffarpur" }, status: "APPROVED", chakraSenapoti: "Prabhu Litchi Das", meetingDay: "Saturday", meetingTime: "18:00" },
      { code: "NAM035", name: "Bhagalpur Namhatta", address: { country: "India", state: "Bihar", district: "Bhagalpur", subDistrict: "Bhagalpur", village: "Bhagalpur" }, status: "APPROVED", chakraSenapoti: "Prabhu Silk Das", meetingDay: "Sunday", meetingTime: "16:30" },
      { code: "NAM036", name: "Darbhanga Namhatta", address: { country: "India", state: "Bihar", district: "Darbhanga", subDistrict: "Darbhanga", village: "Darbhanga" }, status: "APPROVED", chakraSenapoti: "Prabhu Mithila Das", meetingDay: "Sunday", meetingTime: "17:30" },
      { code: "NAM037", name: "Purnia Namhatta", address: { country: "India", state: "Bihar", district: "Purnia", subDistrict: "Purnia", village: "Purnia" }, status: "APPROVED", chakraSenapoti: "Prabhu Border Das", meetingDay: "Friday", meetingTime: "18:00" },
      { code: "NAM038", name: "Arrah Namhatta", address: { country: "India", state: "Bihar", district: "Bhojpur", subDistrict: "Arrah", village: "Arrah" }, status: "APPROVED", chakraSenapoti: "Prabhu Sone Das", meetingDay: "Sunday", meetingTime: "16:00" },
      { code: "NAM039", name: "Begusarai Namhatta", address: { country: "India", state: "Bihar", district: "Begusarai", subDistrict: "Begusarai", village: "Begusarai" }, status: "APPROVED", chakraSenapoti: "Prabhu Industrial Das", meetingDay: "Saturday", meetingTime: "17:00" },
      { code: "NAM040", name: "Katihar Namhatta", address: { country: "India", state: "Bihar", district: "Katihar", subDistrict: "Katihar", village: "Katihar" }, status: "APPROVED", chakraSenapoti: "Prabhu Junction Das", meetingDay: "Sunday", meetingTime: "18:00" },
      { code: "NAM041", name: "Sasaram Namhatta", address: { country: "India", state: "Bihar", district: "Rohtas", subDistrict: "Sasaram", village: "Sasaram" }, status: "APPROVED", chakraSenapoti: "Prabhu Sher Das", meetingDay: "Sunday", meetingTime: "17:00" },

      // Jharkhand Namhattas (8 total)
      { code: "NAM042", name: "Ranchi Namhatta", address: { country: "India", state: "Jharkhand", district: "Ranchi", subDistrict: "Ranchi", village: "Ranchi" }, status: "APPROVED", malaSenapoti: "Prabhu Capital Das", meetingDay: "Sunday", meetingTime: "16:00" },
      { code: "NAM043", name: "Jamshedpur Namhatta", address: { country: "India", state: "Jharkhand", district: "East Singhbhum", subDistrict: "Jamshedpur", village: "Jamshedpur" }, status: "APPROVED", chakraSenapoti: "Prabhu Steel Das", meetingDay: "Sunday", meetingTime: "17:00" },
      { code: "NAM044", name: "Dhanbad Namhatta", address: { country: "India", state: "Jharkhand", district: "Dhanbad", subDistrict: "Dhanbad", village: "Dhanbad" }, status: "APPROVED", chakraSenapoti: "Prabhu Coal Das", meetingDay: "Saturday", meetingTime: "18:00" },
      { code: "NAM045", name: "Bokaro Namhatta", address: { country: "India", state: "Jharkhand", district: "Bokaro", subDistrict: "Bokaro", village: "Bokaro" }, status: "APPROVED", chakraSenapoti: "Prabhu Steel Das", meetingDay: "Sunday", meetingTime: "16:30" },
      { code: "NAM046", name: "Deoghar Namhatta", address: { country: "India", state: "Jharkhand", district: "Deoghar", subDistrict: "Deoghar", village: "Deoghar" }, status: "APPROVED", chakraSenapoti: "Prabhu Baba Das", meetingDay: "Sunday", meetingTime: "17:30" },
      { code: "NAM047", name: "Hazaribagh Namhatta", address: { country: "India", state: "Jharkhand", district: "Hazaribagh", subDistrict: "Hazaribagh", village: "Hazaribagh" }, status: "APPROVED", chakraSenapoti: "Prabhu Hills Das", meetingDay: "Sunday", meetingTime: "18:00" },
      { code: "NAM048", name: "Giridih Namhatta", address: { country: "India", state: "Jharkhand", district: "Giridih", subDistrict: "Giridih", village: "Giridih" }, status: "APPROVED", chakraSenapoti: "Prabhu Coal Das", meetingDay: "Saturday", meetingTime: "17:00" },
      { code: "NAM049", name: "Chaibasa Namhatta", address: { country: "India", state: "Jharkhand", district: "West Singhbhum", subDistrict: "Chaibasa", village: "Chaibasa" }, status: "APPROVED", chakraSenapoti: "Prabhu Tribal Das", meetingDay: "Sunday", meetingTime: "16:00" },

      // Assam Namhattas (8 total)
      { code: "NAM050", name: "Guwahati Namhatta", address: { country: "India", state: "Assam", district: "Kamrup Metropolitan", subDistrict: "Guwahati", village: "Guwahati" }, status: "APPROVED", malaSenapoti: "Prabhu Brahmaputra Das", meetingDay: "Sunday", meetingTime: "16:00" },
      { code: "NAM051", name: "Dibrugarh Namhatta", address: { country: "India", state: "Assam", district: "Dibrugarh", subDistrict: "Dibrugarh", village: "Dibrugarh" }, status: "APPROVED", chakraSenapoti: "Prabhu Tea Das", meetingDay: "Sunday", meetingTime: "17:00" },
      { code: "NAM052", name: "Silchar Namhatta", address: { country: "India", state: "Assam", district: "Cachar", subDistrict: "Silchar", village: "Silchar" }, status: "APPROVED", chakraSenapoti: "Prabhu Barak Das", meetingDay: "Saturday", meetingTime: "18:00" },
      { code: "NAM053", name: "Jorhat Namhatta", address: { country: "India", state: "Assam", district: "Jorhat", subDistrict: "Jorhat", village: "Jorhat" }, status: "APPROVED", chakraSenapoti: "Prabhu Tea Das", meetingDay: "Sunday", meetingTime: "16:30" },
      { code: "NAM054", name: "Tezpur Namhatta", address: { country: "India", state: "Assam", district: "Sonitpur", subDistrict: "Tezpur", village: "Tezpur" }, status: "APPROVED", chakraSenapoti: "Prabhu Cultural Das", meetingDay: "Sunday", meetingTime: "17:30" },
      { code: "NAM055", name: "Nagaon Namhatta", address: { country: "India", state: "Assam", district: "Nagaon", subDistrict: "Nagaon", village: "Nagaon" }, status: "APPROVED", chakraSenapoti: "Prabhu Central Das", meetingDay: "Friday", meetingTime: "18:00" },
      { code: "NAM056", name: "Tinsukia Namhatta", address: { country: "India", state: "Assam", district: "Tinsukia", subDistrict: "Tinsukia", village: "Tinsukia" }, status: "APPROVED", chakraSenapoti: "Prabhu Oil Das", meetingDay: "Sunday", meetingTime: "16:00" },
      { code: "NAM057", name: "Bongaigaon Namhatta", address: { country: "India", state: "Assam", district: "Bongaigaon", subDistrict: "Bongaigaon", village: "Bongaigaon" }, status: "APPROVED", chakraSenapoti: "Prabhu Refinery Das", meetingDay: "Saturday", meetingTime: "17:00" },

      // Bangladesh, Sri Lanka, Nepal
      { code: "NAM058", name: "Dhaka Central Namhatta", address: { country: "Bangladesh", state: "Dhaka", district: "Dhaka", subDistrict: "Dhanmondi", village: "Dhanmondi" }, status: "APPROVED", mahaChakraSenapoti: "Prabhu Nityananda Das", meetingDay: "Saturday", meetingTime: "16:30" },
      { code: "NAM059", name: "Chittagong Namhatta", address: { country: "Bangladesh", state: "Chittagong", district: "Chittagong", subDistrict: "Port Area", village: "Chittagong" }, status: "APPROVED", chakraSenapoti: "Prabhu Gauranga Das", meetingDay: "Sunday", meetingTime: "15:00" },
      { code: "NAM060", name: "Colombo Namhatta", address: { country: "Sri Lanka", state: "Western", district: "Colombo", subDistrict: "Colombo Central", village: "Colombo" }, status: "APPROVED", chakraSenapoti: "Prabhu Lanka Das", meetingDay: "Wednesday", meetingTime: "18:00" },
      { code: "NAM061", name: "Kathmandu Namhatta", address: { country: "Nepal", state: "Bagmati", district: "Kathmandu", subDistrict: "Kathmandu", village: "Kathmandu" }, status: "APPROVED", chakraSenapoti: "Prabhu Nepal Das", meetingDay: "Monday", meetingTime: "17:00" }
    ];

    comprehensiveNamhattas.forEach((namhatta, index) => {
      const id = this.currentId++;
      this.namhattas.set(id, { 
        ...namhatta, 
        id, 
        createdAt: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000) // Random date within last 6 months
      });
    });

    // Initialize devotees
    const devoteesData = [
      {
        legalName: "Ananda Kumar Das",
        name: "Ananda Das",
        dob: "1985-05-15",
        email: "ananda.das@iskcon.org",
        phone: "+91-9876543210",
        fatherName: "Raman Das",
        motherName: "Radha Devi",
        bloodGroup: "O+",
        maritalStatus: "UNMARRIED",
        presentAddress: { country: "India", state: "West Bengal", district: "Nadia", subDistrict: "Mayapur", village: "Mayapur", postalCode: "741313" },
        permanentAddress: { country: "India", state: "West Bengal", district: "Nadia", subDistrict: "Mayapur", village: "Mayapur", postalCode: "741313" },
        devotionalStatusId: 3,
        initiatedName: "Ananda Das",
        harinamDate: "2010-08-15",
        pancharatrikDate: "2015-03-20",
        shraddhakutirId: 1,
        education: "B.Tech Computer Science",
        occupation: "Temple Service - IT Department"
      },
      {
        legalName: "Bhakti Kumari Devi",
        name: "Bhakti Devi",
        dob: "1988-12-03",
        email: "bhakti.devi@iskcon.org",
        phone: "+91-9876543211",
        fatherName: "Krishna Das",
        motherName: "Ganga Devi",
        husbandName: "Govinda Das",
        bloodGroup: "A+",
        maritalStatus: "MARRIED",
        presentAddress: { country: "India", state: "West Bengal", district: "Kolkata", subDistrict: "Central", village: "Park Street", postalCode: "700016" },
        permanentAddress: { country: "India", state: "West Bengal", district: "Kolkata", subDistrict: "Central", village: "Park Street", postalCode: "700016" },
        devotionalStatusId: 2,
        initiatedName: "Bhakti Devi",
        harinamDate: "2012-06-10",
        shraddhakutirId: 2,
        education: "M.A. Sanskrit",
        occupation: "Teacher - Gurukula"
      },
      {
        legalName: "Govinda Kumar Singh",
        name: "Govinda Das",
        dob: "1982-03-22",
        email: "govinda.das@iskcon.org",
        phone: "+91-9876543212",
        fatherName: "Hari Singh",
        motherName: "Sita Devi",
        bloodGroup: "B+",
        maritalStatus: "MARRIED",
        presentAddress: { country: "India", state: "West Bengal", district: "Kolkata", subDistrict: "South", village: "Ballygunge", postalCode: "700019" },
        permanentAddress: { country: "India", state: "Bihar", district: "Patna", subDistrict: "Patna Sadar", village: "Boring Road", postalCode: "800001" },
        devotionalStatusId: 4,
        initiatedName: "Govinda Das",
        harinamDate: "2008-11-25",
        pancharatrikDate: "2018-09-15",
        shraddhakutirId: 2,
        education: "MBA Finance",
        occupation: "Temple Administration"
      },
      {
        legalName: "Radha Kumari Sharma",
        name: "Radha Devi",
        dob: "1990-07-18",
        email: "radha.devi@iskcon.org",
        phone: "+91-9876543213",
        fatherName: "Gopal Sharma",
        motherName: "Lakshmi Devi",
        bloodGroup: "AB+",
        maritalStatus: "UNMARRIED",
        presentAddress: { country: "India", state: "Maharashtra", district: "Mumbai", subDistrict: "Andheri", village: "Juhu", postalCode: "400049" },
        permanentAddress: { country: "India", state: "Rajasthan", district: "Jaipur", subDistrict: "Jaipur", village: "Pink City", postalCode: "302001" },
        devotionalStatusId: 2,
        initiatedName: "Radha Devi",
        harinamDate: "2015-04-12",
        shraddhakutirId: 1,
        education: "B.A. Arts",
        occupation: "Deity Service"
      },
      {
        legalName: "Krishna Kumar Patel",
        dob: "1975-09-08",
        email: "krishna.patel@iskcon.org",
        phone: "+91-9876543214",
        fatherName: "Mohan Patel",
        motherName: "Gita Devi",
        bloodGroup: "O-",
        maritalStatus: "MARRIED",
        presentAddress: { country: "India", state: "Gujarat", district: "Ahmedabad", subDistrict: "Satellite", village: "Prahlad Nagar", postalCode: "380015" },
        permanentAddress: { country: "India", state: "Gujarat", district: "Ahmedabad", subDistrict: "Satellite", village: "Prahlad Nagar", postalCode: "380015" },
        devotionalStatusId: 1,
        shraddhakutirId: 1,
        education: "B.Com",
        occupation: "Business - Grocery Store"
      },
      {
        legalName: "Ganga Kumari Roy",
        name: "Ganga Devi",
        dob: "1993-11-30",
        email: "ganga.devi@iskcon.org",
        phone: "+91-9876543215",
        fatherName: "Shyam Roy",
        motherName: "Tulsi Devi",
        bloodGroup: "A-",
        maritalStatus: "UNMARRIED",
        presentAddress: { country: "Bangladesh", state: "Dhaka", district: "Dhaka", subDistrict: "Dhanmondi", village: "Dhanmondi 15", postalCode: "1209" },
        permanentAddress: { country: "Bangladesh", state: "Dhaka", district: "Dhaka", subDistrict: "Dhanmondi", village: "Dhanmondi 15", postalCode: "1209" },
        devotionalStatusId: 2,
        initiatedName: "Ganga Devi",
        harinamDate: "2018-02-14",
        shraddhakutirId: 2,
        education: "B.Sc. Biology",
        occupation: "Research Assistant"
      },
      {
        legalName: "Hari Kumar Gupta",
        name: "Hari Das",
        dob: "1987-01-25",
        email: "hari.das@iskcon.org",
        phone: "+91-9876543216",
        fatherName: "Ram Gupta",
        motherName: "Sita Gupta",
        bloodGroup: "B-",
        maritalStatus: "MARRIED",
        presentAddress: { country: "India", state: "Uttar Pradesh", district: "Vrindavan", subDistrict: "Mathura", village: "Raman Reti", postalCode: "281121" },
        permanentAddress: { country: "India", state: "Uttar Pradesh", district: "Vrindavan", subDistrict: "Mathura", village: "Raman Reti", postalCode: "281121" },
        devotionalStatusId: 3,
        initiatedName: "Hari Das",
        harinamDate: "2013-12-08",
        pancharatrikDate: "2020-01-15",
        shraddhakutirId: 1,
        education: "M.Tech Mechanical",
        occupation: "Temple Maintenance"
      },
      {
        legalName: "Tulsi Kumari Joshi",
        name: "Tulsi Devi",
        dob: "1991-06-12",
        email: "tulsi.devi@iskcon.org",
        phone: "+91-9876543217",
        fatherName: "Narayan Joshi",
        motherName: "Kamala Devi",
        bloodGroup: "AB-",
        maritalStatus: "WIDOWED",
        presentAddress: { country: "Nepal", state: "Bagmati", district: "Kathmandu", subDistrict: "Kathmandu", village: "Thamel", postalCode: "44600" },
        permanentAddress: { country: "Nepal", state: "Bagmati", district: "Kathmandu", subDistrict: "Kathmandu", village: "Thamel", postalCode: "44600" },
        devotionalStatusId: 2,
        initiatedName: "Tulsi Devi",
        harinamDate: "2016-10-22",
        shraddhakutirId: 2,
        education: "M.A. Philosophy",
        occupation: "Book Distribution"
      },
      {
        legalName: "Shyam Kumar Mehta",
        dob: "1980-04-07",
        email: "shyam.mehta@iskcon.org",
        phone: "+91-9876543218",
        fatherName: "Gopal Mehta",
        motherName: "Rukmini Devi",
        bloodGroup: "O+",
        maritalStatus: "MARRIED",
        presentAddress: { country: "India", state: "Karnataka", district: "Bangalore", subDistrict: "Rajajinagar", village: "Rajajinagar", postalCode: "560010" },
        permanentAddress: { country: "India", state: "Karnataka", district: "Bangalore", subDistrict: "Rajajinagar", village: "Rajajinagar", postalCode: "560010" },
        devotionalStatusId: 1,
        shraddhakutirId: 1,
        education: "B.E. Electronics",
        occupation: "Software Engineer"
      },
      {
        legalName: "Rukmini Kumari Nair",
        name: "Rukmini Devi",
        dob: "1989-08-19",
        email: "rukmini.devi@iskcon.org",
        phone: "+91-9876543219",
        fatherName: "Vishnu Nair",
        motherName: "Saraswati Devi",
        bloodGroup: "A+",
        maritalStatus: "MARRIED",
        presentAddress: { country: "India", state: "Kerala", district: "Kochi", subDistrict: "Ernakulam", village: "Marine Drive", postalCode: "682031" },
        permanentAddress: { country: "India", state: "Kerala", district: "Kochi", subDistrict: "Ernakulam", village: "Marine Drive", postalCode: "682031" },
        devotionalStatusId: 3,
        initiatedName: "Rukmini Devi",
        harinamDate: "2014-07-05",
        pancharatrikDate: "2019-11-12",
        shraddhakutirId: 2,
        education: "B.Sc. Nursing",
        occupation: "Healthcare - Nurse"
      },
      {
        legalName: "Saraswati Kumari Iyer",
        name: "Saraswati Devi",
        dob: "1992-02-28",
        email: "saraswati.devi@iskcon.org",
        phone: "+91-9876543220",
        fatherName: "Lakshman Iyer",
        motherName: "Parvati Devi",
        bloodGroup: "B+",
        maritalStatus: "UNMARRIED",
        presentAddress: { country: "India", state: "Tamil Nadu", district: "Chennai", subDistrict: "T.Nagar", village: "T.Nagar", postalCode: "600017" },
        permanentAddress: { country: "India", state: "Tamil Nadu", district: "Chennai", subDistrict: "T.Nagar", village: "T.Nagar", postalCode: "600017" },
        devotionalStatusId: 2,
        initiatedName: "Saraswati Devi",
        harinamDate: "2017-09-03",
        shraddhakutirId: 1,
        education: "M.Sc. Mathematics",
        occupation: "Teacher - Mathematics"
      },
      {
        legalName: "Parvati Kumari Reddy",
        name: "Parvati Devi",
        dob: "1986-10-14",
        email: "parvati.devi@iskcon.org",
        phone: "+91-9876543221",
        fatherName: "Venkat Reddy",
        motherName: "Lakshmi Reddy",
        bloodGroup: "AB+",
        maritalStatus: "MARRIED",
        presentAddress: { country: "India", state: "Andhra Pradesh", district: "Hyderabad", subDistrict: "Banjara Hills", village: "Banjara Hills", postalCode: "500034" },
        permanentAddress: { country: "India", state: "Andhra Pradesh", district: "Hyderabad", subDistrict: "Banjara Hills", village: "Banjara Hills", postalCode: "500034" },
        devotionalStatusId: 4,
        initiatedName: "Parvati Devi",
        harinamDate: "2011-05-28",
        pancharatrikDate: "2017-12-10",
        shraddhakutirId: 2,
        education: "M.B.A. Marketing",
        occupation: "Temple Outreach Coordinator"
      }
    ];

    devoteesData.forEach((devotee, index) => {
      const id = this.currentId++;
      this.devotees.set(id, { 
        ...devotee, 
        id, 
        devotionalCourses: [], 
        createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000) // Random date within last year
      });
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

    // Initialize namhatta updates with comprehensive data
    const programTypes = [
      "Weekly Satsang Program", "Bhagavad Gita Study Circle", "Kirtan Evening", 
      "Festival Celebration", "Book Distribution Drive", "Youth Program",
      "Ladies Program", "Children's Program", "Prasadam Distribution",
      "Community Service", "Spiritual Workshop", "Deity Darshan Program"
    ];
    
    const specialAttractions = [
      "Special Kirtan by visiting devotee", "Guest speaker from temple",
      "Cultural performance by children", "Bhajan competition",
      "Spiritual question & answer session", "Community feast",
      "Book reading session", "Meditation workshop",
      "Festival decorations", "Special prasadam varieties",
      "Drama presentation", "Interactive spiritual games"
    ];

    const updatesData = [];
    
    // Generate updates for each namhatta
    for (let namhattaId = 1; namhattaId <= 12; namhattaId++) {
      // Generate 5-8 random updates per namhatta
      const updateCount = 5 + Math.floor(Math.random() * 4);
      
      for (let i = 0; i < updateCount; i++) {
        const daysAgo = Math.floor(Math.random() * 90); // Within last 3 months
        const date = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
        
        updatesData.push({
          namhattaId,
          programType: programTypes[Math.floor(Math.random() * programTypes.length)],
          date,
          attendance: 15 + Math.floor(Math.random() * 60), // 15-75 attendees
          prasadDistribution: 10 + Math.floor(Math.random() * 50),
          nagarKirtan: Math.random() > 0.7,
          bookDistribution: Math.random() > 0.6,
          chanting: Math.random() > 0.3,
          arati: Math.random() > 0.5,
          bhagwatPath: Math.random() > 0.4,
          specialAttraction: Math.random() > 0.5 ? specialAttractions[Math.floor(Math.random() * specialAttractions.length)] : undefined,
          facebookLink: Math.random() > 0.8 ? "https://facebook.com/iskcon" : undefined,
          youtubeLink: Math.random() > 0.9 ? "https://youtube.com/iskcon" : undefined,
          imageUrls: []
        });
      }
    }

    updatesData.forEach((update, index) => {
      const id = this.currentId++;
      this.namhattaUpdates.set(id, { 
        ...update, 
        id, 
        createdAt: update.date
      });
    });
  }

  async getDevotees(page = 1, size = 10, filters?: any): Promise<{ data: Devotee[], total: number }> {
    let allDevotees = Array.from(this.devotees.values());
    
    // Apply search filter
    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase();
      allDevotees = allDevotees.filter(devotee => 
        devotee.legalName?.toLowerCase().includes(searchTerm) ||
        devotee.name?.toLowerCase().includes(searchTerm) ||
        devotee.email?.toLowerCase().includes(searchTerm) ||
        devotee.phone?.toLowerCase().includes(searchTerm) ||
        devotee.education?.toLowerCase().includes(searchTerm) ||
        devotee.occupation?.toLowerCase().includes(searchTerm) ||
        devotee.presentAddress?.country?.toLowerCase().includes(searchTerm) ||
        devotee.presentAddress?.state?.toLowerCase().includes(searchTerm) ||
        devotee.presentAddress?.district?.toLowerCase().includes(searchTerm) ||
        devotee.presentAddress?.village?.toLowerCase().includes(searchTerm)
      );
    }
    
    // Apply country filter
    if (filters?.country) {
      allDevotees = allDevotees.filter(devotee => 
        devotee.presentAddress?.country === filters.country
      );
    }
    
    // Apply state filter
    if (filters?.state) {
      allDevotees = allDevotees.filter(devotee => 
        devotee.presentAddress?.state === filters.state
      );
    }
    
    // Apply district filter
    if (filters?.district) {
      allDevotees = allDevotees.filter(devotee => 
        devotee.presentAddress?.district === filters.district
      );
    }
    
    // Apply status filter
    if (filters?.statusId) {
      allDevotees = allDevotees.filter(devotee => 
        devotee.devotionalStatusId === parseInt(filters.statusId)
      );
    }
    
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

  async createDevoteeForNamhatta(devotee: InsertDevotee, namhattaId: number): Promise<Devotee> {
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
    
    const currentStatus = devotee.devotionalStatusId ? this.devotionalStatuses.get(devotee.devotionalStatusId)?.name : null;
    const newStatus = this.devotionalStatuses.get(newStatusId)?.name || "Unknown";
    
    const historyId = this.currentId++;
    this.statusHistory.set(historyId, {
      id: historyId,
      devoteeId: id,
      previousStatus: currentStatus,
      newStatus: newStatus,
      updatedAt: new Date(),
      comment: "Status upgraded"
    });
    
    devotee.devotionalStatusId = newStatusId;
    this.devotees.set(id, devotee);
  }

  async getDevoteeStatusHistory(id: number): Promise<StatusHistory[]> {
    return Array.from(this.statusHistory.values()).filter(h => h.devoteeId === id);
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
    
    // Apply status filter
    if (filters?.status) {
      allNamhattas = allNamhattas.filter(namhatta => 
        namhatta.status === filters.status
      );
    }
    
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

  async getNamhattaCountsByCountry(): Promise<Array<{ country: string; count: number }>> {
    const countryCounts = new Map<string, number>();
    
    for (const namhatta of this.namhattas.values()) {
      const country = namhatta.address?.country;
      if (country) {
        countryCounts.set(country, (countryCounts.get(country) || 0) + 1);
      }
    }
    
    return Array.from(countryCounts.entries()).map(([country, count]) => ({ country, count }));
  }

  async getNamhattaCountsByState(country?: string): Promise<Array<{ state: string; country: string; count: number }>> {
    const stateCounts = new Map<string, { country: string; count: number }>();
    
    for (const namhatta of this.namhattas.values()) {
      const namhattaCountry = namhatta.address?.country;
      const state = namhatta.address?.state;
      if (state && namhattaCountry && (!country || namhattaCountry === country)) {
        const key = `${namhattaCountry}-${state}`;
        const existing = stateCounts.get(key);
        stateCounts.set(key, {
          country: namhattaCountry,
          count: (existing?.count || 0) + 1
        });
      }
    }
    
    return Array.from(stateCounts.entries()).map(([key, data]) => ({
      state: key.split('-')[1],
      country: data.country,
      count: data.count
    }));
  }

  async getNamhattaCountsByDistrict(state?: string): Promise<Array<{ district: string; state: string; country: string; count: number }>> {
    const districtCounts = new Map<string, { state: string; country: string; count: number }>();
    
    for (const namhatta of this.namhattas.values()) {
      const namhattaState = namhatta.address?.state;
      const district = namhatta.address?.district;
      const country = namhatta.address?.country;
      if (district && namhattaState && country && (!state || namhattaState === state)) {
        const key = `${country}-${namhattaState}-${district}`;
        const existing = districtCounts.get(key);
        districtCounts.set(key, {
          state: namhattaState,
          country,
          count: (existing?.count || 0) + 1
        });
      }
    }
    
    return Array.from(districtCounts.entries()).map(([key, data]) => {
      const parts = key.split('-');
      return {
        district: parts[2],
        state: data.state,
        country: data.country,
        count: data.count
      };
    });
  }

  async getNamhattaCountsBySubDistrict(district?: string): Promise<Array<{ subDistrict: string; district: string; state: string; country: string; count: number }>> {
    const subDistrictCounts = new Map<string, { district: string; state: string; country: string; count: number }>();
    
    for (const namhatta of this.namhattas.values()) {
      const namhattaDistrict = namhatta.address?.district;
      const subDistrict = namhatta.address?.subDistrict;
      const state = namhatta.address?.state;
      const country = namhatta.address?.country;
      if (subDistrict && namhattaDistrict && state && country && (!district || namhattaDistrict === district)) {
        const key = `${country}-${state}-${namhattaDistrict}-${subDistrict}`;
        const existing = subDistrictCounts.get(key);
        subDistrictCounts.set(key, {
          district: namhattaDistrict,
          state,
          country,
          count: (existing?.count || 0) + 1
        });
      }
    }
    
    return Array.from(subDistrictCounts.entries()).map(([key, data]) => {
      const parts = key.split('-');
      return {
        subDistrict: parts[3],
        district: data.district,
        state: data.state,
        country: data.country,
        count: data.count
      };
    });
  }

  async getNamhattaCountsByVillage(subDistrict?: string): Promise<Array<{ village: string; subDistrict: string; district: string; state: string; country: string; count: number }>> {
    const villageCounts = new Map<string, { subDistrict: string; district: string; state: string; country: string; count: number }>();
    
    for (const namhatta of this.namhattas.values()) {
      const village = namhatta.address?.village;
      const namhattaSubDistrict = namhatta.address?.subDistrict;
      const district = namhatta.address?.district;
      const state = namhatta.address?.state;
      const country = namhatta.address?.country;
      if (village && namhattaSubDistrict && district && state && country && (!subDistrict || namhattaSubDistrict === subDistrict)) {
        const key = `${country}-${state}-${district}-${namhattaSubDistrict}-${village}`;
        const existing = villageCounts.get(key);
        villageCounts.set(key, {
          subDistrict: namhattaSubDistrict,
          district,
          state,
          country,
          count: (existing?.count || 0) + 1
        });
      }
    }
    
    return Array.from(villageCounts.entries()).map(([key, data]) => {
      const parts = key.split('-');
      return {
        village: parts[4],
        subDistrict: data.subDistrict,
        district: data.district,
        state: data.state,
        country: data.country,
        count: data.count
      };
    });
  }
}

export const storage = new MemStorage();
