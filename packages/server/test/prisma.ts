import prisma from "@votewise/prisma";

export default prisma;

jest.mock("../src/utils/logger", () => {
  return {
    logger: jest.fn(),
  };
});
