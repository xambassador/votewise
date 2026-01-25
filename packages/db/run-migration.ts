/* eslint-disable no-console */

import dotenv from "dotenv";
import { Client } from "pg";

import { migrateToLatest } from "./migrator";

dotenv.config();

function parseDatabaseUrl(url: string) {
  const parsed = new URL(url);
  return {
    user: parsed.username,
    password: parsed.password,
    host: parsed.hostname,
    port: parseInt(parsed.port || "5432", 10),
    database: parsed.pathname.slice(1), // Remove leading '/'
    ssl: parsed.searchParams.get("sslmode") === "require" ? { rejectUnauthorized: false } : undefined
  };
}

async function ensureDatabaseExists(databaseUrl: string): Promise<void> {
  const config = parseDatabaseUrl(databaseUrl);
  const targetDatabase = config.database;

  const client = new Client({
    user: config.user,
    password: config.password,
    host: config.host,
    port: config.port,
    database: "postgres",
    ssl: config.ssl
  });

  try {
    await client.connect();

    const result = await client.query("SELECT 1 FROM pg_database WHERE datname = $1", [targetDatabase]);

    if (result.rowCount === 0) {
      await client.query(`CREATE DATABASE "${targetDatabase}"`);
    }
  } finally {
    await client.end();
  }
}

async function runMigration() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error("DATABASE_URL environment variable is not set.");
    process.exit(1);
  }

  await ensureDatabaseExists(databaseUrl);

  const { error, results } = await migrateToLatest(databaseUrl);

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
