import { pgTable, text, serial, timestamp, integer, varchar, boolean, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

// Devotional Status enum
export const devotionalStatusEnum = pgEnum('devotional_status', [
  'Shraddhavan',
  'Sadhusangi', 
  'Gour/Krishna Sevak',
  'Gour/Krishna Sadhak',
  'Sri Guru Charan Asraya',
  'Harinam Diksha',
  'Pancharatrik Diksha'
]);

// Devotional Statuses Table
export const devotionalStatuses = pgTable('devotional_statuses', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  level: integer('level').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Addresses Table
export const addresses = pgTable('addresses', {
  id: serial('id').primaryKey(),
  country: varchar('country', { length: 100 }).notNull(),
  state: varchar('state', { length: 100 }).notNull(),
  district: varchar('district', { length: 100 }).notNull(),
  subDistrict: varchar('sub_district', { length: 100 }),
  village: varchar('village', { length: 100 }),
  postalCode: varchar('postal_code', { length: 20 }),
  landmark: varchar('landmark', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Shraddhakutirs Table
export const shraddhakutirs = pgTable('shraddhakutirs', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 200 }).notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Namhattas Table
export const namhattas = pgTable('namhattas', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 200 }).notNull(),
  description: text('description'),
  establishedDate: timestamp('established_date'),
  shraddhakutirId: integer('shraddhakutir_id').references(() => shraddhakutirs.id),
  malaSenapoti: varchar('mala_senapoti', { length: 100 }),
  mahaChakraSenapoti: varchar('maha_chakra_senapoti', { length: 100 }),
  chakraSenapoti: varchar('chakra_senapoti', { length: 100 }),
  upaChakraSenapoti: varchar('upa_chakra_senapoti', { length: 100 }),
  secretary: varchar('secretary', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Devotees Table
export const devotees = pgTable('devotees', {
  id: serial('id').primaryKey(),
  legalName: varchar('legal_name', { length: 200 }).notNull(),
  initiatedName: varchar('initiated_name', { length: 200 }),
  dateOfBirth: timestamp('date_of_birth'),
  gender: varchar('gender', { length: 10 }),
  bloodGroup: varchar('blood_group', { length: 5 }),
  occupation: varchar('occupation', { length: 100 }),
  phoneNumber: varchar('phone_number', { length: 20 }),
  email: varchar('email', { length: 255 }),
  fatherName: varchar('father_name', { length: 200 }),
  motherName: varchar('mother_name', { length: 200 }),
  spouseName: varchar('spouse_name', { length: 200 }),
  emergencyContact: varchar('emergency_contact', { length: 200 }),
  emergencyPhone: varchar('emergency_phone', { length: 20 }),
  harinamInitiationDate: timestamp('harinam_initiation_date'),
  pancharatrikInitiationDate: timestamp('pancharatrik_initiation_date'),
  spiritualMaster: varchar('spiritual_master', { length: 200 }),
  courses: jsonb('courses'),
  namhattaId: integer('namhatta_id').references(() => namhattas.id),
  devotionalStatusId: integer('devotional_status_id').references(() => devotionalStatuses.id),
  addressId: integer('address_id').references(() => addresses.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Status History Table
export const statusHistory = pgTable('status_history', {
  id: serial('id').primaryKey(),
  devoteeId: integer('devotee_id').references(() => devotees.id),
  oldStatus: integer('old_status').references(() => devotionalStatuses.id),
  newStatus: integer('new_status').references(() => devotionalStatuses.id),
  comment: text('comment'),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Namhatta Updates Table
export const namhattaUpdates = pgTable('namhatta_updates', {
  id: serial('id').primaryKey(),
  namhattaId: integer('namhatta_id').references(() => namhattas.id),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description'),
  eventDate: timestamp('event_date'),
  programType: varchar('program_type', { length: 100 }),
  specialAttraction: text('special_attraction'),
  prasadamDetails: text('prasadam_details'),
  kirtanDetails: text('kirtan_details'),
  bookDistribution: integer('book_distribution'),
  chantingRounds: integer('chanting_rounds'),
  aratiPerformed: boolean('arati_performed'),
  bhagwatPathPerformed: boolean('bhagwat_path_performed'),
  attendance: integer('attendance'),
  imageUrl: varchar('image_url', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Leaders Table
export const leaders = pgTable('leaders', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 200 }).notNull(),
  position: varchar('position', { length: 100 }).notNull(),
  level: varchar('level', { length: 50 }).notNull(),
  region: varchar('region', { length: 100 }),
  district: varchar('district', { length: 100 }),
  description: text('description'),
  imageUrl: varchar('image_url', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Relations
export const devotionalStatusesRelations = relations(devotionalStatuses, ({ many }) => ({
  devotees: many(devotees),
  statusHistory: many(statusHistory),
}));

export const namhattasRelations = relations(namhattas, ({ one, many }) => ({
  shraddhakutir: one(shraddhakutirs, {
    fields: [namhattas.shraddhakutirId],
    references: [shraddhakutirs.id],
  }),
  devotees: many(devotees),
  updates: many(namhattaUpdates),
}));

export const devoteesRelations = relations(devotees, ({ one, many }) => ({
  namhatta: one(namhattas, {
    fields: [devotees.namhattaId],
    references: [namhattas.id],
  }),
  devotionalStatus: one(devotionalStatuses, {
    fields: [devotees.devotionalStatusId],
    references: [devotionalStatuses.id],
  }),
  address: one(addresses, {
    fields: [devotees.addressId],
    references: [addresses.id],
  }),
  statusHistory: many(statusHistory),
}));

export const shraddhakutirsRelations = relations(shraddhakutirs, ({ many }) => ({
  namhattas: many(namhattas),
}));

export const addressesRelations = relations(addresses, ({ many }) => ({
  devotees: many(devotees),
}));

export const statusHistoryRelations = relations(statusHistory, ({ one }) => ({
  devotee: one(devotees, {
    fields: [statusHistory.devoteeId],
    references: [devotees.id],
  }),
  oldStatusRef: one(devotionalStatuses, {
    fields: [statusHistory.oldStatus],
    references: [devotionalStatuses.id],
  }),
  newStatusRef: one(devotionalStatuses, {
    fields: [statusHistory.newStatus],
    references: [devotionalStatuses.id],
  }),
}));

export const namhattaUpdatesRelations = relations(namhattaUpdates, ({ one }) => ({
  namhatta: one(namhattas, {
    fields: [namhattaUpdates.namhattaId],
    references: [namhattas.id],
  }),
}));

// Type exports
export type Devotee = typeof devotees.$inferSelect;
export type InsertDevotee = typeof devotees.$inferInsert;
export type Namhatta = typeof namhattas.$inferSelect;
export type InsertNamhatta = typeof namhattas.$inferInsert;
export type Address = typeof addresses.$inferSelect;
export type InsertAddress = typeof addresses.$inferInsert;
export type DevotionalStatus = typeof devotionalStatuses.$inferSelect;
export type InsertDevotionalStatus = typeof devotionalStatuses.$inferInsert;
export type Shraddhakutir = typeof shraddhakutirs.$inferSelect;
export type InsertShraddhakutir = typeof shraddhakutirs.$inferInsert;
export type StatusHistory = typeof statusHistory.$inferSelect;
export type InsertStatusHistory = typeof statusHistory.$inferInsert;
export type NamhattaUpdate = typeof namhattaUpdates.$inferSelect;
export type InsertNamhattaUpdate = typeof namhattaUpdates.$inferInsert;
export type Leader = typeof leaders.$inferSelect;
export type InsertLeader = typeof leaders.$inferInsert;

// Zod schemas for validation
export const insertDevoteeSchema = createInsertSchema(devotees);
export const insertNamhattaSchema = createInsertSchema(namhattas);
export const insertAddressSchema = createInsertSchema(addresses);
export const insertDevotionalStatusSchema = createInsertSchema(devotionalStatuses);
export const insertShraddhakutirSchema = createInsertSchema(shraddhakutirs);
export const insertStatusHistorySchema = createInsertSchema(statusHistory);
export const insertNamhattaUpdateSchema = createInsertSchema(namhattaUpdates);
export const insertLeaderSchema = createInsertSchema(leaders);