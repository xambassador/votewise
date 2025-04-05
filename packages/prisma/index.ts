import { Prisma, PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var, vars-on-top
  var prisma: PrismaClient | undefined;
}

const prismaOptions: Prisma.PrismaClientOptions = {};

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
