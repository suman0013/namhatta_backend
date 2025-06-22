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
  address?: Address;
  status: string;
  leaderRole?: string;
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
