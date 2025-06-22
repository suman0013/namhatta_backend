import { apiRequest } from "@/lib/queryClient";
import type { 
  DashboardSummary, 
  HierarchyResponse, 
  PaginatedResponse, 
  Devotee, 
  Namhatta, 
  DevotionalStatus,
  Shraddhakutir,
  Leader
} from "@/lib/types";

export const api = {
  // Dashboard
  getDashboard: async (): Promise<DashboardSummary> => {
    const res = await apiRequest("GET", "/api/dashboard");
    return res.json();
  },

  // Hierarchy
  getHierarchy: async (): Promise<HierarchyResponse> => {
    const res = await apiRequest("GET", "/api/hierarchy");
    return res.json();
  },

  getLeadersByLevel: async (level: string): Promise<Leader[]> => {
    const res = await apiRequest("GET", `/api/hierarchy/${level}`);
    return res.json();
  },

  // Geography
  getCountries: async (): Promise<string[]> => {
    const res = await apiRequest("GET", "/api/countries");
    return res.json();
  },

  getStates: async (country: string): Promise<string[]> => {
    const res = await apiRequest("GET", `/api/states?country=${encodeURIComponent(country)}`);
    return res.json();
  },

  getDistricts: async (state: string): Promise<string[]> => {
    const res = await apiRequest("GET", `/api/districts?state=${encodeURIComponent(state)}`);
    return res.json();
  },

  getSubDistricts: async (district: string): Promise<string[]> => {
    const res = await apiRequest("GET", `/api/sub-districts?district=${encodeURIComponent(district)}`);
    return res.json();
  },

  getVillages: async (district: string): Promise<string[]> => {
    const res = await apiRequest("GET", `/api/villages?district=${encodeURIComponent(district)}`);
    return res.json();
  },

  // Devotees
  getDevotees: async (page = 1, size = 10): Promise<PaginatedResponse<Devotee>> => {
    const res = await apiRequest("GET", `/api/devotees?page=${page}&size=${size}`);
    return res.json();
  },

  getDevotee: async (id: number): Promise<Devotee> => {
    const res = await apiRequest("GET", `/api/devotees/${id}`);
    return res.json();
  },

  createDevotee: async (devotee: Partial<Devotee>): Promise<Devotee> => {
    const res = await apiRequest("POST", "/api/devotees", devotee);
    return res.json();
  },

  updateDevotee: async (id: number, devotee: Partial<Devotee>): Promise<Devotee> => {
    const res = await apiRequest("PUT", `/api/devotees/${id}`, devotee);
    return res.json();
  },

  upgradeDevoteeStatus: async (id: number, newStatusId: number): Promise<void> => {
    await apiRequest("POST", `/api/devotees/${id}/upgrade-status`, { newStatusId });
  },

  getDevoteeStatusHistory: async (id: number) => {
    const res = await apiRequest("GET", `/api/devotees/${id}/status-history`);
    return res.json();
  },

  // Namhattas
  getNamhattas: async (page = 1, size = 10, filters?: any): Promise<PaginatedResponse<Namhatta>> => {
    const params = new URLSearchParams({ page: page.toString(), size: size.toString() });
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key]) params.append(key, filters[key]);
      });
    }
    const res = await apiRequest("GET", `/api/namhattas?${params}`);
    return res.json();
  },

  getNamhatta: async (id: number): Promise<Namhatta> => {
    const res = await apiRequest("GET", `/api/namhattas/${id}`);
    return res.json();
  },

  createNamhatta: async (namhatta: Partial<Namhatta>): Promise<Namhatta> => {
    const res = await apiRequest("POST", "/api/namhattas", namhatta);
    return res.json();
  },

  updateNamhatta: async (id: number, namhatta: Partial<Namhatta>): Promise<Namhatta> => {
    const res = await apiRequest("PUT", `/api/namhattas/${id}`, namhatta);
    return res.json();
  },

  approveNamhatta: async (id: number): Promise<void> => {
    await apiRequest("POST", `/api/namhattas/${id}/approve`);
  },

  getNamhattaUpdates: async (id: number) => {
    const res = await apiRequest("GET", `/api/namhattas/${id}/updates`);
    return res.json();
  },

  getNamhattaDevotees: async (id: number, page = 1, size = 10, statusId?: number) => {
    const params = new URLSearchParams({ page: page.toString(), size: size.toString() });
    if (statusId) params.append('statusId', statusId.toString());
    const res = await apiRequest("GET", `/api/namhattas/${id}/devotees?${params}`);
    return res.json();
  },

  getNamhattaDevoteeStatusCount: async (id: number) => {
    const res = await apiRequest("GET", `/api/namhattas/${id}/devotee-status-count`);
    return res.json();
  },

  // Statuses
  getStatuses: async (): Promise<DevotionalStatus[]> => {
    const res = await apiRequest("GET", "/api/statuses");
    return res.json();
  },

  createStatus: async (name: string): Promise<DevotionalStatus> => {
    const res = await apiRequest("POST", "/api/statuses", { name });
    return res.json();
  },

  renameStatus: async (id: number, newName: string): Promise<void> => {
    await apiRequest("POST", `/api/statuses/${id}/rename`, { newName });
  },

  // Shraddhakutirs
  getShraddhakutirs: async (): Promise<Shraddhakutir[]> => {
    const res = await apiRequest("GET", "/api/shraddhakutirs");
    return res.json();
  },

  createShraddhakutir: async (shraddhakutir: Partial<Shraddhakutir>): Promise<Shraddhakutir> => {
    const res = await apiRequest("POST", "/api/shraddhakutirs", shraddhakutir);
    return res.json();
  },

  // Health & About
  getHealth: async () => {
    const res = await apiRequest("GET", "/api/health");
    return res.json();
  },

  getAbout: async () => {
    const res = await apiRequest("GET", "/api/about");
    return res.json();
  }
};
