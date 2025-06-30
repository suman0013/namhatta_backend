import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Devotees table
export const devotees = pgTable("devotees", {
  id: serial("id").primaryKey(),
  legalName: text("legal_name").notNull(),
  name: text("name"), // Initiated/spiritual name
  dob: text("dob"), // Store as text to match OpenAPI format
  email: text("email"),
  phone: text("phone"),
  fatherName: text("father_name"),
  motherName: text("mother_name"),
  husbandName: text("husband_name"),
  gender: text("gender"), // MALE, FEMALE, OTHER
  bloodGroup: text("blood_group"),
  maritalStatus: text("marital_status"), // MARRIED, UNMARRIED, WIDOWED
  presentAddress: json("present_address").$type<{
    country?: string;
    state?: string;
    district?: string;
    subDistrict?: string;
    village?: string;
    postalCode?: string;
    landmark?: string;
  }>(),
  permanentAddress: json("permanent_address").$type<{
    country?: string;
    state?: string;
    district?: string;
    subDistrict?: string;
    village?: string;
    postalCode?: string;
    landmark?: string;
  }>(),
  devotionalStatusId: integer("devotional_status_id"),
  gurudevHarinam: integer("gurudev_harinam"), // Reference to leader ID
  gurudevPancharatrik: integer("gurudev_pancharatrik"), // Reference to leader ID
  harinamInitiationGurudev: text("harinam_initiation_gurudev"), // Spiritual name of harinam guru
  pancharatrikInitiationGurudev: text("pancharatrik_initiation_gurudev"), // Spiritual name of pancharatrik guru
  initiatedName: text("initiated_name"),
  harinamDate: text("harinam_date"), // Store as text to match OpenAPI format
  pancharatrikDate: text("pancharatrik_date"), // Store as text to match OpenAPI format
  education: text("education"),
  occupation: text("occupation"),
  devotionalCourses: json("devotional_courses").$type<Array<{
    name: string;
    date: string;
    institute: string;
  }>>(),
  additionalComments: text("additional_comments"),
  shraddhakutirId: integer("shraddhakutir_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Namhattas table
export const namhattas = pgTable("namhattas", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  meetingDay: text("meeting_day"),
  meetingTime: text("meeting_time"),
  address: json("address").$type<{
    country?: string;
    state?: string;
    district?: string;
    subDistrict?: string;
    village?: string;
    postalCode?: string;
    landmark?: string;
  }>(),
  malaSenapoti: text("mala_senapoti"),
  mahaChakraSenapoti: text("maha_chakra_senapoti"),
  chakraSenapoti: text("chakra_senapoti"),
  upaChakraSenapoti: text("upa_chakra_senapoti"),
  secretary: text("secretary"),
  status: text("status").notNull().default("PENDING_APPROVAL"), // PENDING_APPROVAL, APPROVED, REJECTED
  createdAt: timestamp("created_at").defaultNow(),
});

// Devotional Statuses table
export const devotionalStatuses = pgTable("devotional_statuses", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Shraddhakutirs table
export const shraddhakutirs = pgTable("shraddhakutirs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  districtCode: text("district_code").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Status History table
export const statusHistory = pgTable("status_history", {
  id: serial("id").primaryKey(),
  devoteeId: integer("devotee_id").notNull(),
  previousStatus: text("previous_status"),
  newStatus: text("new_status").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
  comment: text("comment"),
});

// Namhatta Updates table
export const namhattaUpdates = pgTable("namhatta_updates", {
  id: serial("id").primaryKey(),
  namhattaId: integer("namhatta_id").notNull(),
  programType: text("program_type").notNull(),
  date: timestamp("date").notNull(),
  attendance: integer("attendance").notNull(),
  prasadDistribution: integer("prasad_distribution"),
  nagarKirtan: boolean("nagar_kirtan").default(false),
  bookDistribution: boolean("book_distribution").default(false),
  chanting: boolean("chanting").default(false),
  arati: boolean("arati").default(false),
  bhagwatPath: boolean("bhagwat_path").default(false),
  imageUrls: json("image_urls").$type<string[]>(),
  facebookLink: text("facebook_link"),
  youtubeLink: text("youtube_link"),
  specialAttraction: text("special_attraction"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Leaders/Hierarchy table
export const leaders = pgTable("leaders", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull(), // GBC, REGIONAL_DIRECTOR, CO_REGIONAL_DIRECTOR, DISTRICT_SUPERVISOR, etc.
  reportingTo: integer("reporting_to"),
  location: json("location").$type<{
    country?: string;
    state?: string;
    district?: string;
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertDevoteeSchema = createInsertSchema(devotees).omit({
  id: true,
  createdAt: true,
});

export const insertNamhattaSchema = createInsertSchema(namhattas).omit({
  id: true,
  createdAt: true,
});

export const insertDevotionalStatusSchema = createInsertSchema(devotionalStatuses).omit({
  id: true,
  createdAt: true,
});

export const insertShraddhakutirSchema = createInsertSchema(shraddhakutirs).omit({
  id: true,
  createdAt: true,
});

export const insertNamhattaUpdateSchema = createInsertSchema(namhattaUpdates).omit({
  id: true,
  createdAt: true,
});

export const insertLeaderSchema = createInsertSchema(leaders).omit({
  id: true,
  createdAt: true,
});

// Types
export type Devotee = typeof devotees.$inferSelect;
export type InsertDevotee = z.infer<typeof insertDevoteeSchema>;

export type Namhatta = typeof namhattas.$inferSelect;
export type InsertNamhatta = z.infer<typeof insertNamhattaSchema>;

export type DevotionalStatus = typeof devotionalStatuses.$inferSelect;
export type InsertDevotionalStatus = z.infer<typeof insertDevotionalStatusSchema>;

export type Shraddhakutir = typeof shraddhakutirs.$inferSelect;
export type InsertShraddhakutir = z.infer<typeof insertShraddhakutirSchema>;

export type NamhattaUpdate = typeof namhattaUpdates.$inferSelect;
export type InsertNamhattaUpdate = z.infer<typeof insertNamhattaUpdateSchema>;

export type Leader = typeof leaders.$inferSelect;
export type InsertLeader = z.infer<typeof insertLeaderSchema>;

export type StatusHistory = typeof statusHistory.$inferSelect;
