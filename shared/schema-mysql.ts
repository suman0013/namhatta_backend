import { mysqlTable, text, int, json, timestamp, boolean, serial } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Devotees table for MySQL
export const devotees = mysqlTable("devotees", {
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
  devotionalStatusId: int("devotional_status_id"),
  namhattaId: int("namhatta_id"),
  gurudevHarinam: int("gurudev_harinam"), // Reference to leader ID
  gurudevPancharatrik: int("gurudev_pancharatrik"), // Reference to leader ID
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
  shraddhakutirId: int("shraddhakutir_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// Namhattas table for MySQL
export const namhattas = mysqlTable("namhattas", {
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
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// Devotional Statuses table for MySQL
export const devotionalStatuses = mysqlTable("devotional_statuses", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Shraddhakutirs table for MySQL
export const shraddhakutirs = mysqlTable("shraddhakutirs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  districtCode: text("district_code").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Status History table for MySQL
export const statusHistory = mysqlTable("status_history", {
  id: serial("id").primaryKey(),
  devoteeId: int("devotee_id").notNull(),
  previousStatus: text("previous_status"),
  newStatus: text("new_status").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
  comment: text("comment"),
});

// Namhatta Updates table for MySQL
export const namhattaUpdates = mysqlTable("namhatta_updates", {
  id: serial("id").primaryKey(),
  namhattaId: int("namhatta_id").notNull(),
  programType: text("program_type").notNull(),
  date: text("date").notNull(),
  attendance: int("attendance").notNull(),
  prasadDistribution: int("prasad_distribution"),
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
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// Leaders table for MySQL
export const leaders = mysqlTable("leaders", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  level: int("level").notNull(),
  parentId: int("parent_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Addresses table for MySQL
export const addresses = mysqlTable("addresses", {
  id: serial("id").primaryKey(),
  country: text("country").notNull(),
  state: text("state").notNull(),
  district: text("district").notNull(),
  subDistrict: text("sub_district"),
  village: text("village"),
  postalCode: text("postal_code"),
  landmark: text("landmark"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas for validation
export const insertDevoteeSchema = createInsertSchema(devotees).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNamhattaSchema = createInsertSchema(namhattas).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
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
  updatedAt: true,
});

// Types for TypeScript
export type InsertDevotee = z.infer<typeof insertDevoteeSchema>;
export type InsertNamhatta = z.infer<typeof insertNamhattaSchema>;
export type InsertDevotionalStatus = z.infer<typeof insertDevotionalStatusSchema>;
export type InsertShraddhakutir = z.infer<typeof insertShraddhakutirSchema>;
export type InsertNamhattaUpdate = z.infer<typeof insertNamhattaUpdateSchema>;

export type Devotee = typeof devotees.$inferSelect;
export type Namhatta = typeof namhattas.$inferSelect;
export type DevotionalStatus = typeof devotionalStatuses.$inferSelect;
export type Shraddhakutir = typeof shraddhakutirs.$inferSelect;
export type NamhattaUpdate = typeof namhattaUpdates.$inferSelect;
export type Leader = typeof leaders.$inferSelect;
export type Address = typeof addresses.$inferSelect;