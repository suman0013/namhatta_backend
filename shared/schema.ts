// Unified schema types for cross-database compatibility
import { z } from 'zod';

// Common type definitions that work across MySQL and PostgreSQL
export type Devotee = {
  id: number;
  legalName: string;
  initiatedName?: string | null;
  dateOfBirth?: Date | null;
  gender?: string | null;
  bloodGroup?: string | null;
  occupation?: string | null;
  phoneNumber?: string | null;
  email?: string | null;
  fatherName?: string | null;
  motherName?: string | null;
  spouseName?: string | null;
  emergencyContact?: string | null;
  emergencyPhone?: string | null;
  harinamInitiationDate?: Date | null;
  pancharatrikInitiationDate?: Date | null;
  spiritualMaster?: string | null;
  courses?: any;
  namhattaId?: number | null;
  devotionalStatusId?: number | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
};

export type InsertDevotee = Omit<Devotee, 'id' | 'createdAt' | 'updatedAt'>;

export type Namhatta = {
  id: number;
  name: string;
  description?: string | null;
  establishedDate?: Date | null;
  shraddhakutirId?: number | null;
  malaSenapoti?: string | null;
  mahaChakraSenapoti?: string | null;
  chakraSenapoti?: string | null;
  upaChakraSenapoti?: string | null;
  secretary?: string | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
};

export type InsertNamhatta = Omit<Namhatta, 'id' | 'createdAt' | 'updatedAt'>;

export type DevotionalStatus = {
  id: number;
  name: string;
  description?: string | null;
  level: number;
  createdAt?: Date | null;
  updatedAt?: Date | null;
};

export type InsertDevotionalStatus = Omit<DevotionalStatus, 'id' | 'createdAt' | 'updatedAt'>;

export type Shraddhakutir = {
  id: number;
  name: string;
  description?: string | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
};

export type InsertShraddhakutir = Omit<Shraddhakutir, 'id' | 'createdAt' | 'updatedAt'>;

export type NamhattaUpdate = {
  id: number;
  namhattaId: number;
  title: string;
  description?: string | null;
  eventDate?: Date | null;
  programType?: string | null;
  specialAttraction?: string | null;
  prasadamDetails?: string | null;
  kirtanDetails?: string | null;
  bookDistribution?: number | null;
  chantingRounds?: number | null;
  aratiPerformed?: boolean | null;
  bhagwatPathPerformed?: boolean | null;
  attendance?: number | null;
  imageUrl?: string | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
};

export type InsertNamhattaUpdate = Omit<NamhattaUpdate, 'id' | 'createdAt' | 'updatedAt'>;

export type Leader = {
  id: number;
  name: string;
  position: string;
  level: string;
  region?: string | null;
  district?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
};

export type InsertLeader = Omit<Leader, 'id' | 'createdAt' | 'updatedAt'>;

export type StatusHistory = {
  id: number;
  devoteeId: number;
  oldStatus?: number | null;
  newStatus: number;
  comment?: string | null;
  updatedAt?: Date | null;
};

export type InsertStatusHistory = Omit<StatusHistory, 'id' | 'updatedAt'>;

export type Address = {
  id: number;
  country: string;
  state: string;
  district: string;
  subDistrict?: string | null;
  village?: string | null;
  postalCode?: string | null;
  landmark?: string | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
};

export type InsertAddress = Omit<Address, 'id' | 'createdAt' | 'updatedAt'>;

// Zod schemas for validation (database-agnostic)
export const insertDevoteeSchema = z.object({
  legalName: z.string().min(1, "Legal name is required"),
  initiatedName: z.string().optional(),
  dateOfBirth: z.date().optional(),
  gender: z.string().optional(),
  bloodGroup: z.string().optional(),
  occupation: z.string().optional(),
  phoneNumber: z.string().optional(),
  email: z.string().email().optional(),
  fatherName: z.string().optional(),
  motherName: z.string().optional(),
  spouseName: z.string().optional(),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
  harinamInitiationDate: z.date().optional(),
  pancharatrikInitiationDate: z.date().optional(),
  spiritualMaster: z.string().optional(),
  courses: z.any().optional(),
  namhattaId: z.number().optional(),
  devotionalStatusId: z.number().optional(),
});

export const insertNamhattaSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  establishedDate: z.date().optional(),
  shraddhakutirId: z.number().optional(),
  malaSenapoti: z.string().optional(),
  mahaChakraSenapoti: z.string().optional(),
  chakraSenapoti: z.string().optional(),
  upaChakraSenapoti: z.string().optional(),
  secretary: z.string().optional(),
});

export const insertDevotionalStatusSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  level: z.number().min(1, "Level must be at least 1"),
});

export const insertShraddhakutirSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

export const insertNamhattaUpdateSchema = z.object({
  namhattaId: z.number().min(1, "Namhatta ID is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  eventDate: z.date().optional(),
  programType: z.string().optional(),
  specialAttraction: z.string().optional(),
  prasadamDetails: z.string().optional(),
  kirtanDetails: z.string().optional(),
  bookDistribution: z.number().optional(),
  chantingRounds: z.number().optional(),
  aratiPerformed: z.boolean().optional(),
  bhagwatPathPerformed: z.boolean().optional(),
  attendance: z.number().optional(),
  imageUrl: z.string().optional(),
});

export const insertLeaderSchema = z.object({
  name: z.string().min(1, "Name is required"),
  position: z.string().min(1, "Position is required"),
  level: z.string().min(1, "Level is required"),
  region: z.string().optional(),
  district: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
});