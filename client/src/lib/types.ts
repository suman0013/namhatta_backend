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
  details?: string;
}

export interface Devotee {
  id: number;
  name: string;
  presentAddress?: Address;
  permanentAddress?: Address;
  gurudev?: string;
  maritalStatus?: string;
  statusId?: number;
  shraddhakutirId?: number;
  education?: string;
  occupation?: string;
  devotionalCourses?: Array<{
    name: string;
    date: string;
    institute: string;
  }>;
  createdAt: Date;
}

export interface Namhatta {
  id: number;
  name: string;
  code: string;
  address?: Address;
  status: string;
  weeklyMeetingDay?: string;
  weeklyMeetingTime?: string;
  malaSenapoti?: string;
  mahaChakraSenapoti?: string;
  chakraSenapoti?: string;
  upaChakraSenapoti?: string;
  createdAt: Date;
}

export interface DevotionalStatus {
  id: number;
  name: string;
  createdAt: Date;
}

export interface Shraddhakutir {
  id: number;
  name: string;
  code: string;
  districtCode: string;
  createdAt: Date;
}
