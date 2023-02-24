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

export const prisma = global.prisma || new PrismaClient(prismaOptions);

export const customPrisma = (options: Prisma.PrismaClientOptions) =>
  new PrismaClient({
    ...prismaOptions,
    ...options,
  });

if (process.env.NODE_ENV === "development") {
  globalThis.prisma = prisma;
}

export default prisma;
