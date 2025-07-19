import { sqliteTable, text, integer, blob } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Devotees table
export const devotees = sqliteTable("devotees", {
  id: integer("id").primaryKey({ autoIncrement: true }),
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
  presentAddress: text("present_address", { mode: 'json' }).$type<{
    country?: string;
    state?: string;
    district?: string;
    subDistrict?: string;
    village?: string;
    postalCode?: string;
    landmark?: string;
  }>(),
  permanentAddress: text("permanent_address", { mode: 'json' }).$type<{
    country?: string;
    state?: string;
    district?: string;
    subDistrict?: string;
    village?: string;
    postalCode?: string;
    landmark?: string;
  }>(),
  devotionalStatusId: integer("devotional_status_id"),
  namhattaId: integer("namhatta_id"),
  gurudevHarinam: integer("gurudev_harinam"), // Reference to leader ID
  gurudevPancharatrik: integer("gurudev_pancharatrik"), // Reference to leader ID
  harinamInitiationGurudev: text("harinam_initiation_gurudev"), // Spiritual name of harinam guru
  pancharatrikInitiationGurudev: text("pancharatrik_initiation_gurudev"), // Spiritual name of pancharatrik guru
  initiatedName: text("initiated_name"),
  harinamDate: text("harinam_date"), // Store as text to match OpenAPI format
  pancharatrikDate: text("pancharatrik_date"), // Store as text to match OpenAPI format
  education: text("education"),
  occupation: text("occupation"),
  devotionalCourses: text("devotional_courses", { mode: 'json' }).$type<Array<{
    name: string;
    date: string;
    institute: string;
  }>>(),
  additionalComments: text("additional_comments"),
  shraddhakutirId: integer("shraddhakutir_id"),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
  updatedAt: text("updated_at").default("CURRENT_TIMESTAMP"),
});

// Namhattas table
export const namhattas = sqliteTable("namhattas", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  meetingDay: text("meeting_day"),
  meetingTime: text("meeting_time"),
  address: text("address", { mode: 'json' }).$type<{
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
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
  updatedAt: text("updated_at").default("CURRENT_TIMESTAMP"),
});

// Devotional Statuses table
export const devotionalStatuses = sqliteTable("devotional_statuses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});

// Shraddhakutirs table
export const shraddhakutirs = sqliteTable("shraddhakutirs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  districtCode: text("district_code").notNull(),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});

// Status History table
export const statusHistory = sqliteTable("status_history", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  devoteeId: integer("devotee_id").notNull(),
  previousStatus: text("previous_status"),
  newStatus: text("new_status").notNull(),
  updatedAt: text("updated_at").default("CURRENT_TIMESTAMP"),
  comment: text("comment"),
});

// Namhatta Updates table
export const namhattaUpdates = sqliteTable("namhatta_updates", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  namhattaId: integer("namhatta_id").notNull(),
  programType: text("program_type").notNull(),
  date: text("date").notNull(),
  attendance: integer("attendance").notNull(),
  prasadDistribution: integer("prasad_distribution"),
  nagarKirtan: integer("nagar_kirtan", { mode: 'boolean' }).default(false),
  bookDistribution: integer("book_distribution", { mode: 'boolean' }).default(false),
  chanting: integer("chanting", { mode: 'boolean' }).default(false),
  arati: integer("arati", { mode: 'boolean' }).default(false),
  bhagwatPath: integer("bhagwat_path", { mode: 'boolean' }).default(false),
  imageUrls: text("image_urls", { mode: 'json' }).$type<string[]>(),
  facebookLink: text("facebook_link"),
  youtubeLink: text("youtube_link"),
  specialAttraction: text("special_attraction"),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});

// Leaders/Hierarchy table
export const leaders = sqliteTable("leaders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  role: text("role").notNull(), // GBC, REGIONAL_DIRECTOR, CO_REGIONAL_DIRECTOR, DISTRICT_SUPERVISOR, etc.
  reportingTo: integer("reporting_to"),
  location: text("location", { mode: 'json' }).$type<{
    country?: string;
    state?: string;
    district?: string;
  }>(),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});

// Address table for normalized address storage
export const addresses = sqliteTable("addresses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  country: text("country"),
  state: text("state"),
  district: text("district"),
  subDistrict: text("sub_district"),
  village: text("village"),
  postalCode: text("postal_code"),
  landmark: text("landmark"),
  addressType: text("address_type"), // 'present', 'permanent', 'namhatta'
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});

// Junction table for devotee addresses
export const devoteeAddresses = sqliteTable("devotee_addresses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  devoteeId: integer("devotee_id").notNull(),
  addressId: integer("address_id").notNull(),
  addressType: text("address_type").notNull(), // 'present' or 'permanent'
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});

// Junction table for namhatta addresses
export const namhattaAddresses = sqliteTable("namhatta_addresses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  namhattaId: integer("namhatta_id").notNull(),
  addressId: integer("address_id").notNull(),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
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

export const insertAddressSchema = createInsertSchema(addresses).omit({
  id: true,
  createdAt: true,
});

export const insertDevoteeAddressSchema = createInsertSchema(devoteeAddresses).omit({
  id: true,
  createdAt: true,
});

export const insertNamhattaAddressSchema = createInsertSchema(namhattaAddresses).omit({
  id: true,
  createdAt: true,
});

// Types
export type Devotee = typeof devotees.$inferSelect;
export type InsertDevotee = z.infer<typeof insertDevoteeSchema>;

export type Namhatta = typeof namhattas.$inferSelect & {
  devoteeCount?: number;
};
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

export type Address = typeof addresses.$inferSelect;
export type InsertAddress = z.infer<typeof insertAddressSchema>;

export type DevoteeAddress = typeof devoteeAddresses.$inferSelect;
export type InsertDevoteeAddress = z.infer<typeof insertDevoteeAddressSchema>;

export type NamhattaAddress = typeof namhattaAddresses.$inferSelect;
export type InsertNamhattaAddress = z.infer<typeof insertNamhattaAddressSchema>;
