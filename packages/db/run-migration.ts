/* eslint-disable no-console */

import dotenv from "dotenv";

import { migrateToLatest } from "./migrator";

dotenv.config();

async function runMigration() {
  const { error, results } = await migrateToLatest(process.env.DATABASE_URL!);

  results?.forEach((result) => {
    if (result.status === "Success") {
      console.log(`Migration ${result.migrationName} applied successfully.`);
    }

    if (result.status === "Error") {
      console.error(`Migration ${result.migrationName} failed:`);
    }
  });

  if (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

runMigration().catch((err) => {
  console.error("Unexpected error during migration:", err);
});
