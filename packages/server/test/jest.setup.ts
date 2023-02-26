import dotenv from "dotenv";

dotenv.config({ path: "../../../.env.test" });

// eslint-disable-next-line import/first
import prisma from "@votewise/prisma/prisma-test";

beforeAll(async () => {
    await prisma.$connect();
});

afterAll(async () => {
    await prisma.$disconnect();
});

// eslint-disable-next-line
console.log("test ====> jest.setup.ts");
