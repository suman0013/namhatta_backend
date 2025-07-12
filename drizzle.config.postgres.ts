import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required. Please set your PostgreSQL connection string.");
}

export default defineConfig({
  out: "./migrations/postgres",
  schema: "./shared/schema-postgres.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});