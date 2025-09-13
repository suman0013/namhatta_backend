import { pgTable, text, integer, serial, timestamp, jsonb, boolean, unique } from "drizzle-orm/pg-core";
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
  // Remove inline address JSON fields - use normalized address tables instead
  devotionalStatusId: integer("devotional_status_id"),
  namhattaId: integer("namhatta_id"),
  harinamInitiationGurudevId: integer("harinam_initiation_gurudev_id"), // Reference to gurudevs table
  pancharatrikInitiationGurudevId: integer("pancharatrik_initiation_gurudev_id"), // Reference to gurudevs table
  initiatedName: text("initiated_name"),
  harinamDate: text("harinam_date"), // Store as text to match OpenAPI format
  pancharatrikDate: text("pancharatrik_date"), // Store as text to match OpenAPI format
  education: text("education"),
  occupation: text("occupation"),
  devotionalCourses: jsonb("devotional_courses").$type<Array<{
    name: string;
    date: string;
    institute: string;
  }>>(),
  additionalComments: text("additional_comments"),
  shraddhakutirId: integer("shraddhakutir_id"),
  // Leadership role fields
  leadershipRole: text("leadership_role"), // MALA_SENAPOTI, MAHA_CHAKRA_SENAPOTI, CHAKRA_SENAPOTI, UPA_CHAKRA_SENAPOTI, NULL
  reportingToDevoteeId: integer("reporting_to_devotee_id"), // References devotees.id for hierarchy
  hasSystemAccess: boolean("has_system_access").default(false), // Determines if devotee gets login
  appointedDate: text("appointed_date"), // When appointed to leadership role
  appointedBy: integer("appointed_by"), // References users.id - who appointed them
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
  // Remove inline address JSON field - use normalized address tables instead
  // Leadership positions as foreign keys to devotees table
  malaSenapotiId: integer("mala_senapoti_id").references(() => devotees.id),
  mahaChakraSenapotiId: integer("maha_chakra_senapoti_id").references(() => devotees.id),
  chakraSenapotiId: integer("chakra_senapoti_id").references(() => devotees.id),
  upaChakraSenapotiId: integer("upa_chakra_senapoti_id").references(() => devotees.id),
  secretaryId: integer("secretary_id").references(() => devotees.id),
  presidentId: integer("president_id").references(() => devotees.id),
  accountantId: integer("accountant_id").references(() => devotees.id),
  districtSupervisorId: integer("district_supervisor_id").notNull(),
  status: text("status").notNull().default("PENDING_APPROVAL"), // PENDING_APPROVAL, APPROVED, REJECTED
  registrationNo: text("registration_no").unique(),
  registrationDate: text("registration_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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
  date: text("date").notNull(),
  attendance: integer("attendance").notNull(),
  prasadDistribution: integer("prasad_distribution"),
  nagarKirtan: integer("nagar_kirtan").default(0),
  bookDistribution: integer("book_distribution").default(0),
  chanting: integer("chanting").default(0),
  arati: integer("arati").default(0),
  bhagwatPath: integer("bhagwat_path").default(0),
  imageUrls: jsonb("image_urls").$type<string[]>(),
  facebookLink: text("facebook_link"),
  youtubeLink: text("youtube_link"),
  specialAttraction: text("special_attraction"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Gurudevs table
export const gurudevs = pgTable("gurudevs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  title: text("title"), // HH, HG, etc.
  createdAt: timestamp("created_at").defaultNow(),
});

// Leaders/Hierarchy table
export const leaders = pgTable("leaders", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull(), // GBC, REGIONAL_DIRECTOR, CO_REGIONAL_DIRECTOR, DISTRICT_SUPERVISOR, etc.
  reportingTo: integer("reporting_to"),
  location: jsonb("location").$type<{
    country?: string;
    state?: string;
    district?: string;
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Main Address table - matches CSV structure with all columns
export const addresses = pgTable("addresses", {
  id: serial("id").primaryKey(),
  country: text("country").notNull().default("India"), // Added country column with India default
  stateCode: text("state_code"),
  stateNameEnglish: text("state_name_english"),
  districtCode: text("district_code"),
  districtNameEnglish: text("district_name_english"),
  subdistrictCode: text("subdistrict_code"),
  subdistrictNameEnglish: text("subdistrict_name_english"),
  villageCode: text("village_code"),
  villageNameEnglish: text("village_name_english"),
  pincode: text("pincode"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Junction table for devotee addresses with landmark
export const devoteeAddresses = pgTable("devotee_addresses", {
  id: serial("id").primaryKey(),
  devoteeId: integer("devotee_id").notNull(),
  addressId: integer("address_id").notNull(),
  addressType: text("address_type").notNull(), // 'present' or 'permanent'
  landmark: text("landmark"), // Specific landmark for this devotee at this address
  createdAt: timestamp("created_at").defaultNow(),
});

// Junction table for namhatta addresses with landmark
export const namhattaAddresses = pgTable("namhatta_addresses", {
  id: serial("id").primaryKey(),
  namhattaId: integer("namhatta_id").notNull(),
  addressId: integer("address_id").notNull(),
  landmark: text("landmark"), // Specific landmark for this namhatta at this address
  createdAt: timestamp("created_at").defaultNow(),
});

// Authentication Tables

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull(), // 'ADMIN', 'OFFICE', 'DISTRICT_SUPERVISOR'
  devoteeId: integer("devotee_id"), // References devotees.id - links user account to devotee
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  isActive: boolean("is_active").default(true),
});

// User-District mapping (many-to-many)
export const userDistricts = pgTable("user_districts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  districtCode: text("district_code").notNull(), // References district from addresses table
  districtNameEnglish: text("district_name_english").notNull(), // Store district name for easy display
  isDefaultDistrictSupervisor: boolean("is_default_district_supervisor").default(false), // One default DS per district
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  uniqueUserDistrict: unique().on(table.userId, table.districtCode),
}));

// Active sessions (single login enforcement)
export const userSessions = pgTable("user_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(), // Only one active session per user
  sessionToken: text("session_token").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// JWT blacklist (for logout)
export const jwtBlacklist = pgTable("jwt_blacklist", {
  id: serial("id").primaryKey(),
  tokenHash: text("token_hash").notNull(),
  expiredAt: timestamp("expired_at").notNull(),
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

export const insertGurudevSchema = createInsertSchema(gurudevs).omit({
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

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserDistrictSchema = createInsertSchema(userDistricts).omit({
  id: true,
  createdAt: true,
});

export const insertUserSessionSchema = createInsertSchema(userSessions).omit({
  id: true,
  createdAt: true,
});

export const insertJwtBlacklistSchema = createInsertSchema(jwtBlacklist).omit({
  id: true,
  createdAt: true,
});

// Types
export type Devotee = typeof devotees.$inferSelect & {
  devotionalStatusName?: string;
  harinamInitiationGurudev?: string;
  pancharatrikInitiationGurudev?: string;
  presentAddress?: {
    country?: string;
    state?: string;
    district?: string;
    subDistrict?: string;
    village?: string;
    postalCode?: string;
    landmark?: string;
  };
  permanentAddress?: {
    country?: string;
    state?: string;
    district?: string;
    subDistrict?: string;
    village?: string;
    postalCode?: string;
    landmark?: string;
  };
};
export type InsertDevotee = z.infer<typeof insertDevoteeSchema>;

export type Namhatta = typeof namhattas.$inferSelect & {
  devoteeCount?: number;
  districtSupervisorName?: string;
  districtSupervisorId: number;
  registrationNo?: string;
  registrationDate?: string;
};
export type InsertNamhatta = z.infer<typeof insertNamhattaSchema>;

export type DevotionalStatus = typeof devotionalStatuses.$inferSelect;
export type InsertDevotionalStatus = z.infer<typeof insertDevotionalStatusSchema>;

export type Shraddhakutir = typeof shraddhakutirs.$inferSelect;
export type InsertShraddhakutir = z.infer<typeof insertShraddhakutirSchema>;

export type NamhattaUpdate = typeof namhattaUpdates.$inferSelect;
export type InsertNamhattaUpdate = z.infer<typeof insertNamhattaUpdateSchema>;

export type Gurudev = typeof gurudevs.$inferSelect;
export type InsertGurudev = z.infer<typeof insertGurudevSchema>;

export type Leader = typeof leaders.$inferSelect;
export type InsertLeader = z.infer<typeof insertLeaderSchema>;

export type StatusHistory = typeof statusHistory.$inferSelect;

export type Address = typeof addresses.$inferSelect;
export type InsertAddress = z.infer<typeof insertAddressSchema>;

export type DevoteeAddress = typeof devoteeAddresses.$inferSelect;
export type InsertDevoteeAddress = z.infer<typeof insertDevoteeAddressSchema>;

export type NamhattaAddress = typeof namhattaAddresses.$inferSelect;
export type InsertNamhattaAddress = z.infer<typeof insertNamhattaAddressSchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type UserDistrict = typeof userDistricts.$inferSelect;
export type InsertUserDistrict = z.infer<typeof insertUserDistrictSchema>;

export type UserSession = typeof userSessions.$inferSelect;
export type InsertUserSession = z.infer<typeof insertUserSessionSchema>;

export type JwtBlacklist = typeof jwtBlacklist.$inferSelect;
export type InsertJwtBlacklist = z.infer<typeof insertJwtBlacklistSchema>;
