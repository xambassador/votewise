import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config({ path: "../../.env.test" });

const VOTEWISE_TEST_DB_URL = process.env.VOTEWISE_TEST_DATABASE_URL;

if (!VOTEWISE_TEST_DB_URL) {
  throw new Error("VOTEWISE_TEST_DATABASE_URL is not set in .env.test");
}

export const prismaTest = new PrismaClient({
  datasources: {
    db: {
      url: VOTEWISE_TEST_DB_URL
    }
  }
});

if (process.env.NODE_ENV !== "production") {
  // eslint-disable-next-line no-undef
  globalThis.prisma = prismaTest;
}

export default prismaTest;
