import type { DB as VotewiseSchema } from "./db/schema";

import { createId } from "@paralleldrive/cuid2";
import { Prisma, PrismaClient } from "@prisma/client";
import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";

declare global {
  // eslint-disable-next-line no-var, vars-on-top
  var prisma: PrismaClient | undefined;
}

const prismaOptions: Prisma.PrismaClientOptions = {};

const dialect = new PostgresDialect({
  pool: new Pool({ connectionString: process.env.DATABASE_URL })
});

export const dataLayer = new Kysely<VotewiseSchema>({
  dialect,
  log: (e) => {
    if (process.env.DEBUG !== "true") return;
    // eslint-disable-next-line no-console
    console.log(e.query.sql, " ", e.query.parameters);
  }
}) as Kysely<VotewiseSchema> & { createId: typeof createId };

dataLayer.createId = createId;

export type DataLayer = typeof dataLayer & { createId: typeof createId };

if (process.env.NODE_ENV === "production") {
  prismaOptions.log = ["error"];
}

if (process.env.NODE_ENV === "development" && process.env.DEBUG) {
  prismaOptions.log = ["error"];
}

// https://www.prisma.io/docs/concepts/components/prisma-client/working-with-prismaclient/instantiate-prisma-client#the-number-of-prismaclient-instances-matters
const prisma = global.prisma || new PrismaClient(prismaOptions);

// https://www.prisma.io/docs/guides/performance-and-optimization/connection-management#prismaclient-in-long-running-applications
if (process.env.NODE_ENV !== "production") {
  // eslint-disable-next-line no-undef
  globalThis.prisma = prisma;
}

export default prisma;
export { PrismaClient, prisma };
export { Prisma };
export * from "kysely";
