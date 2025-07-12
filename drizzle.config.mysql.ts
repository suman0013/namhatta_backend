import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required. Please set your MySQL connection string.");
}

export default defineConfig({
  out: "./migrations/mysql",
  schema: "./shared/schema-mysql.ts",
  dialect: "mysql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});