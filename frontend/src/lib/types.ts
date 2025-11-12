export interface DashboardSummary {
  totalDevotees: number;
  totalNamhattas: number;
  recentUpdates: NamhattaUpdateCard[];
}

export interface NamhattaUpdateCard {
  namhattaId: number;
  namhattaName: string;
  programType: string;
  date: string;
  attendance: number;
}

export interface HierarchyResponse {
  founder: Leader[];
  gbc: Leader[];
  regionalDirectors: Leader[];
  coRegionalDirectors: Leader[];
  districtSupervisors: Leader[];
  malaSenapotis: DevoteeLeader[];
  mahaChakraSenapotis: DevoteeLeader[];
  chakraSenapotis: DevoteeLeader[];
  upaChakraSenapotis: DevoteeLeader[];
}

export interface Leader {
  id: number;
  name: string;
  role: string;
  reportingTo?: number;
  location?: {
    country?: string;
    state?: string;
    district?: string;
  };
}

export interface DevoteeLeader {
  id: number;
  devoteeId: number;
  name: string; // devotee's name (legal or initiated)
  legalName: string;
  leadershipRole: 'MALA_SENAPOTI' | 'MAHA_CHAKRA_SENAPOTI' | 'CHAKRA_SENAPOTI' | 'UPA_CHAKRA_SENAPOTI';
  reportingToDevoteeId?: number;
  reportingToDevoteeName?: string;
  appointedDate?: string;
  appointedBy?: number;
  namhattaId?: number;
  namhattaName?: string;
  hasSystemAccess?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
}

export interface Address {
  country?: string;
  state?: string;
  district?: string;
  subDistrict?: string;
  village?: string;
  postalCode?: string;
  landmark?: string;
}

export interface DevotionalCourse {
  name: string;
  date: string;
  institute: string;
}

export interface Devotee {
  id: number;
  legalName: string;
  name?: string; // Initiated/spiritual name
  dob?: string;
  email?: string;
  phone?: string;
  fatherName?: string;
  motherName?: string;
  husbandName?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  bloodGroup?: string;
  maritalStatus?: 'MARRIED' | 'UNMARRIED' | 'WIDOWED';
  presentAddress?: Address;
  permanentAddress?: Address;
  devotionalStatusId?: number;
  namhattaId?: number;
  harinamInitiationGurudevId?: number;
  pancharatrikInitiationGurudevId?: number;
  harinamInitiationGurudev?: string;
  pancharatrikInitiationGurudev?: string;
  devotionalStatusName?: string;
  initiatedName?: string;
  harinamDate?: string;
  pancharatrikDate?: string;
  education?: string;
  occupation?: string;
  devotionalCourses?: DevotionalCourse[];
  additionalComments?: string;
  shraddhakutirId?: number;
  // Leadership fields
  leadershipRole?: 'MALA_SENAPOTI' | 'MAHA_CHAKRA_SENAPOTI' | 'CHAKRA_SENAPOTI' | 'UPA_CHAKRA_SENAPOTI' | null;
  reportingToDevoteeId?: number;
  hasSystemAccess?: boolean;
  appointedDate?: string;
  appointedBy?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Namhatta {
  id: number;
  code: string;
  name: string;
  meetingDay?: string;
  meetingTime?: string;
  address?: Address;
  // Leadership positions - stored as devotee names (matches database schema)
  malaSenapoti?: string;
  mahaChakraSenapoti?: string;
  chakraSenapoti?: string;
  upaChakraSenapoti?: string;
  secretary?: string;
  president?: string;
  accountant?: string;
  // For form handling - temporary fields to store devotee IDs during creation/editing
  malaSenapotiId?: number;
  mahaChakraSenapotiId?: number;
  chakraSenapotiId?: number;
  upaChakraSenapotiId?: number;
  secretaryId?: number;
  presidentId?: number;
  accountantId?: number;
  districtSupervisorId: number;
  districtSupervisorName?: string;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
  registrationNo?: string;
  registrationDate?: string;
  createdAt: Date;
  updatedAt: Date;
  devoteeCount?: number;
}

export interface DevotionalStatus {
  id: number;
  name: string;
  createdAt: Date;
}

export interface Gurudev {
  id: number;
  name: string;
  title?: string;
  createdAt: Date;
}

export interface Shraddhakutir {
  id: number;
  name: string;
  code: string;
  districtCode: string;
  createdAt: Date;
}
