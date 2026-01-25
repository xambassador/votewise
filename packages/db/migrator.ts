/* eslint-disable no-console */

import type { DB as Database } from "./db/schema";

import { promises as fs } from "fs";
import * as path from "path";
import { FileMigrationProvider, Kysely, Migrator, PostgresDialect } from "kysely";
import { Pool } from "pg";

async function migrateToLatest(dbUrl: string) {
  const pool = new Pool({ connectionString: dbUrl });
  const dialect = new PostgresDialect({ pool });
  const migrationFolder = path.join(__dirname, "db", "migrations");
  const db = new Kysely<Database>({ dialect });
  const provider = new FileMigrationProvider({
    fs,
    path,
    migrationFolder
  });
  const migrator = new Migrator({ db, provider });
  const { error, results } = await migrator.migrateToLatest();
  await db.destroy();
  return { error, results };
}

export { migrateToLatest };
