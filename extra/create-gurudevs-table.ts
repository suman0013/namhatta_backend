import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { gurudevs } from "./shared/schema";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ['.env.local', '.env'] });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function createGurudevsTable() {
  try {
    console.log("Creating gurudevs table...");
    
    // Create the table using raw SQL since it's a new table
    await sql`
      CREATE TABLE IF NOT EXISTS gurudevs (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        title TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;
    
    console.log("Gurudevs table created successfully.");
    
    // Insert the sample gurudevs
    console.log("Adding sample gurudevs...");
    
    const sampleGurudevs = [
      { name: "Jaypataka Swami", title: "HH" },
      { name: "Bhakti Charu Swami", title: "HH" },
      { name: "Gouranga Prem Swami", title: "HH" },
      { name: "Gopal Krishna Goswami", title: "HH" },
      { name: "Radhanath Swami", title: "HH" }
    ];
    
    for (const gurudev of sampleGurudevs) {
      await db.insert(gurudevs).values(gurudev).onConflictDoNothing();
      console.log(`Added: ${gurudev.title} ${gurudev.name}`);
    }
    
    console.log("All gurudevs added successfully!");
    
    // Add the new columns to devotees table
    console.log("Adding new columns to devotees table...");
    
    await sql`
      ALTER TABLE devotees 
      ADD COLUMN IF NOT EXISTS harinam_initiation_gurudev_id INTEGER,
      ADD COLUMN IF NOT EXISTS pancharatrik_initiation_gurudev_id INTEGER;
    `;
    
    console.log("New columns added to devotees table successfully!");
    
  } catch (error) {
    console.error("Error:", error);
  }
}

createGurudevsTable();