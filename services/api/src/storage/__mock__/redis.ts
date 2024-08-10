import type { Cache } from "../redis";

export const mockCache = {
  connect: jest.fn(),
  disconnect: jest.fn(),
  set: jest.fn(),
  get: jest.fn(),
  setWithExpiry: jest.fn(),
  del: jest.fn()
} as unknown as jest.Mock<Cache>;
