import { createClient } from "@libsql/client";
import dotenv from "dotenv";

dotenv.config({ path: '.env.local' });

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function run() {
  try {
    console.log("Connecting to:", process.env.TURSO_DATABASE_URL ? "URL Defined" : "URL MISSING");
    
    // logic from server.js
    await db.execute(`
      CREATE TABLE IF NOT EXISTS jobs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        company TEXT NOT NULL,
        company_url TEXT,
        location TEXT NOT NULL,
        salary_min INTEGER,
        salary_max INTEGER,
        equity TEXT,
        tags TEXT, -- JSON array
        description TEXT NOT NULL,
        apply_url TEXT,
        status TEXT DEFAULT 'pending', -- pending, active, rejected
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("Table 'jobs' ensured.");

    try {
        await db.execute("ALTER TABLE jobs ADD COLUMN status TEXT DEFAULT 'pending'");
        console.log("Column 'status' added via ALTER.");
    } catch (e) {
        console.log("ALTER failed (likely column exists):", e.message);
    }

    const result = await db.execute("PRAGMA table_info(jobs)");
    console.log("Final Schema:");
    console.log(JSON.stringify(result.rows, null, 2));

  } catch (e) {
    console.error("Script error:", e);
  }
}

run();
