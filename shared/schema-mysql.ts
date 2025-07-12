import { mysqlTable, text, int, json, timestamp, boolean, serial, varchar } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Devotees table for MySQL
export const devotees = mysqlTable("devotees", {
  id: serial("id").primaryKey(),
  legalName: varchar("legal_name", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }), // Initiated/spiritual name
  dob: varchar("dob", { length: 10 }), // Store as text to match OpenAPI format
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  fatherName: varchar("father_name", { length: 255 }),
  motherName: varchar("mother_name", { length: 255 }),
  husbandName: varchar("husband_name", { length: 255 }),
  gender: varchar("gender", { length: 10 }), // MALE, FEMALE, OTHER
  bloodGroup: varchar("blood_group", { length: 10 }),
  maritalStatus: varchar("marital_status", { length: 20 }), // MARRIED, UNMARRIED, WIDOWED
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
  harinamInitiationGurudev: varchar("harinam_initiation_gurudev", { length: 255 }), // Spiritual name of harinam guru
  pancharatrikInitiationGurudev: varchar("pancharatrik_initiation_gurudev", { length: 255 }), // Spiritual name of pancharatrik guru
  initiatedName: varchar("initiated_name", { length: 255 }),
  harinamDate: varchar("harinam_date", { length: 10 }), // Store as text to match OpenAPI format
  pancharatrikDate: varchar("pancharatrik_date", { length: 10 }), // Store as text to match OpenAPI format
  education: varchar("education", { length: 255 }),
  occupation: varchar("occupation", { length: 255 }),
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
  code: varchar("code", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  meetingDay: varchar("meeting_day", { length: 20 }),
  meetingTime: varchar("meeting_time", { length: 20 }),
  address: json("address").$type<{
    country?: string;
    state?: string;
    district?: string;
    subDistrict?: string;
    village?: string;
    postalCode?: string;
    landmark?: string;
  }>(),
  malaSenapoti: varchar("mala_senapoti", { length: 255 }),
  mahaChakraSenapoti: varchar("maha_chakra_senapoti", { length: 255 }),
  chakraSenapoti: varchar("chakra_senapoti", { length: 255 }),
  upaChakraSenapoti: varchar("upa_chakra_senapoti", { length: 255 }),
  secretary: varchar("secretary", { length: 255 }),
  status: varchar("status", { length: 50 }).notNull().default("PENDING_APPROVAL"), // PENDING_APPROVAL, APPROVED, REJECTED
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// Devotional Statuses table for MySQL
export const devotionalStatuses = mysqlTable("devotional_statuses", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Shraddhakutirs table for MySQL
export const shraddhakutirs = mysqlTable("shraddhakutirs", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  districtCode: varchar("district_code", { length: 20 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Status History table for MySQL
export const statusHistory = mysqlTable("status_history", {
  id: serial("id").primaryKey(),
  devoteeId: int("devotee_id").notNull(),
  previousStatus: varchar("previous_status", { length: 100 }),
  newStatus: varchar("new_status", { length: 100 }).notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
  comment: text("comment"),
});

// Namhatta Updates table for MySQL
export const namhattaUpdates = mysqlTable("namhatta_updates", {
  id: serial("id").primaryKey(),
  namhattaId: int("namhatta_id").notNull(),
  programType: varchar("program_type", { length: 100 }).notNull(),
  date: varchar("date", { length: 10 }).notNull(),
  attendance: int("attendance").notNull(),
  prasadDistribution: int("prasad_distribution"),
  nagarKirtan: boolean("nagar_kirtan").default(false),
  bookDistribution: boolean("book_distribution").default(false),
  chanting: boolean("chanting").default(false),
  arati: boolean("arati").default(false),
  bhagwatPath: boolean("bhagwat_path").default(false),
  imageUrls: json("image_urls").$type<string[]>(),
  facebookLink: varchar("facebook_link", { length: 500 }),
  youtubeLink: varchar("youtube_link", { length: 500 }),
  specialAttraction: text("special_attraction"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// Leaders table for MySQL
export const leaders = mysqlTable("leaders", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  role: varchar("role", { length: 100 }).notNull(),
  level: int("level").notNull(),
  parentId: int("parent_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Addresses table for MySQL
export const addresses = mysqlTable("addresses", {
  id: serial("id").primaryKey(),
  country: varchar("country", { length: 100 }).notNull(),
  state: varchar("state", { length: 100 }).notNull(),
  district: varchar("district", { length: 100 }).notNull(),
  subDistrict: varchar("sub_district", { length: 100 }),
  village: varchar("village", { length: 100 }),
  postalCode: varchar("postal_code", { length: 20 }),
  landmark: varchar("landmark", { length: 255 }),
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

// Devotee Addresses Junction Table
export const devoteeAddresses = mysqlTable("devotee_addresses", {
  id: serial("id").primaryKey(),
  devoteeId: int("devotee_id"),
  addressId: int("address_id"),
  type: varchar("type", { length: 50 }).notNull(), // 'present' or 'permanent'
  createdAt: timestamp("created_at").defaultNow()
});

// Namhatta Addresses Junction Table
export const namhattaAddresses = mysqlTable("namhatta_addresses", {
  id: serial("id").primaryKey(),
  namhattaId: int("namhatta_id"),
  addressId: int("address_id"),
  type: varchar("type", { length: 50 }).notNull(), // 'primary'
  createdAt: timestamp("created_at").defaultNow()
});

// Status History Table
export const statusHistory = mysqlTable("status_history", {
  id: serial("id").primaryKey(),
  devoteeId: int("devotee_id"),
  oldStatus: int("old_status"),
  newStatus: int("new_status"),
  comment: text("comment"),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Additional type exports
export type NewDevotee = typeof devotees.$inferInsert;
export type NewNamhatta = typeof namhattas.$inferInsert;
export type NewDevotionalStatus = typeof devotionalStatuses.$inferInsert;
export type NewShraddhakutir = typeof shraddhakutirs.$inferInsert;
export type NewNamhattaUpdate = typeof namhattaUpdates.$inferInsert;
export type NewAddress = typeof addresses.$inferInsert;
export type NewLeader = typeof leaders.$inferInsert;
export type DevoteeAddress = typeof devoteeAddresses.$inferSelect;
export type NewDevoteeAddress = typeof devoteeAddresses.$inferInsert;
export type NamhattaAddress = typeof namhattaAddresses.$inferSelect;
export type NewNamhattaAddress = typeof namhattaAddresses.$inferInsert;
export type StatusHistory = typeof statusHistory.$inferSelect;
export type NewStatusHistory = typeof statusHistory.$inferInsert;