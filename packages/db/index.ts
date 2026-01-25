import type { DB as VotewiseSchema } from "./db/schema";

import { createId } from "@paralleldrive/cuid2";
import dotenv from "dotenv";
import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";

dotenv.config();

const dialect = new PostgresDialect({
  pool: new Pool({ connectionString: process.env.DATABASE_URL })
});

export const dataLayer = new Kysely<VotewiseSchema>({ dialect }) as Kysely<VotewiseSchema> & {
  createId: typeof createId;
};

dataLayer.createId = createId;

export type DataLayer = typeof dataLayer & { createId: typeof createId };

export * from "kysely";
