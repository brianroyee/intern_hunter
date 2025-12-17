import { createClient } from "@libsql/client";
import dotenv from "dotenv";

dotenv.config({ path: '.env.local' });

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function check() {
  try {
    const result = await db.execute("PRAGMA table_info(jobs)");
    console.log("Columns in jobs table:");
    console.table(result.rows);
  } catch (e) {
    console.error(e);
  }
}

check();
