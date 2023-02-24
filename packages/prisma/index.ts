import type { Prisma } from "@prisma/client";
import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var, vars-on-top
  var prisma: PrismaClient | undefined;
}

const prismaOptions: Prisma.PrismaClientOptions = {};

if (process.env.NODE_ENV === "production") {
  prismaOptions.log = ["error"];
}

if (process.env.NODE_ENV === "development" && process.env.DEBUG) {
  prismaOptions.log = ["query", "error", "info", "warn"];
}

// https://www.prisma.io/docs/concepts/components/prisma-client/working-with-prismaclient/instantiate-prisma-client#the-number-of-prismaclient-instances-matters
export const prisma = global.prisma || new PrismaClient(prismaOptions);

export const customPrisma = (options: Prisma.PrismaClientOptions) =>
  new PrismaClient({
    ...prismaOptions,
    ...options,
  });

//   https://www.prisma.io/docs/guides/performance-and-optimization/connection-management#prismaclient-in-long-running-applications
if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}

export default prisma;
