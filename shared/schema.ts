import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Devotees table
export const devotees = pgTable("devotees", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  presentAddress: json("present_address").$type<{
    country?: string;
    state?: string;
    district?: string;
    subDistrict?: string;
    village?: string;
    zipcode?: string;
    details?: string;
  }>(),
  permanentAddress: json("permanent_address").$type<{
    country?: string;
    state?: string;
    district?: string;
    subDistrict?: string;
    village?: string;
    zipcode?: string;
    details?: string;
  }>(),
  gurudev: text("gurudev"),
  maritalStatus: text("marital_status"),
  statusId: integer("status_id"),
  shraddhakutirId: integer("shraddhakutir_id"),
  education: text("education"),
  occupation: text("occupation"),
  devotionalCourses: json("devotional_courses").$type<Array<{
    name: string;
    date: string;
    institute: string;
  }>>(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Namhattas table
export const namhattas = pgTable("namhattas", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull(),
  address: json("address").$type<{
    country?: string;
    state?: string;
    district?: string;
    subDistrict?: string;
    village?: string;
    zipcode?: string;
    details?: string;
  }>(),
  status: text("status").notNull().default("pending"), // pending, active, inactive
  weeklyMeetingDay: text("weekly_meeting_day"),
  weeklyMeetingTime: text("weekly_meeting_time"),
  malaSenapoti: text("mala_senapoti"),
  mahaChakraSenapoti: text("maha_chakra_senapoti"),
  chakraSenapoti: text("chakra_senapoti"),
  upaChakraSenapoti: text("upa_chakra_senapoti"),
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
  code: text("code").notNull().unique(),
  districtCode: text("district_code").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Status History table
export const statusHistory = pgTable("status_history", {
  id: serial("id").primaryKey(),
  devoteeId: integer("devotee_id").notNull(),
  fromStatusId: integer("from_status_id"),
  toStatusId: integer("to_status_id").notNull(),
  changeDate: timestamp("change_date").defaultNow(),
  notes: text("notes"),
});

// Namhatta Updates table
export const namhattaUpdates = pgTable("namhatta_updates", {
  id: serial("id").primaryKey(),
  namhattaId: integer("namhatta_id").notNull(),
  programType: text("program_type").notNull(),
  date: timestamp("date").notNull(),
  attendance: integer("attendance").notNull(),
  hasKirtan: boolean("has_kirtan").default(false),
  hasPrasadam: boolean("has_prasadam").default(false),
  hasClass: boolean("has_class").default(false),
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
