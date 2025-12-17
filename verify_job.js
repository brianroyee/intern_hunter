import { createClient } from "@libsql/client";
import dotenv from "dotenv";

dotenv.config({ path: '.env.local' });

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function run() {
  try {
    const result = await db.execute("SELECT * FROM jobs WHERE title = 'Final Verification Job'");
    console.log("Found Jobs:", result.rows.length);
    if (result.rows.length > 0) {
        console.log("Job Status:", result.rows[0].status);
    }
  } catch (e) {
    console.error(e);
  }
}

run();
