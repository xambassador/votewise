import prisma from "@votewise/prisma";

export default prisma;

jest.mock("@votewise/lib/logger", () => {
  return {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    errorInfo: jest.fn(),
  };
});
