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
  malaSenapotis: Leader[];
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
  zipcode?: string;
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
  harinamInitiationGurudevId?: number;
  pancharatrikInitiationGurudevId?: number;
  harinamInitiationGurudev?: string;
  pancharatrikInitiationGurudev?: string;
  initiatedName?: string;
  harinamDate?: string;
  pancharatrikDate?: string;
  education?: string;
  occupation?: string;
  devotionalCourses?: DevotionalCourse[];
  additionalComments?: string;
  shraddhakutirId?: number;
  createdAt: Date;
}

export interface Namhatta {
  id: number;
  code: string;
  name: string;
  meetingDay?: string;
  meetingTime?: string;
  address?: Address;
  malaSenapoti?: string;
  mahaChakraSenapoti?: string;
  chakraSenapoti?: string;
  upaChakraSenapoti?: string;
  secretary?: string;
  status: 'PENDING_APPROVAL' | 'APPROVED';
  createdAt: Date;
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
