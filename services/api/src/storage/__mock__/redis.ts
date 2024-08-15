import type { Cache } from "../redis";

export const mockCache = {
  connect: jest.fn(),
  disconnect: jest.fn(),
  set: jest.fn().mockName("set"),
  get: jest.fn().mockName("get"),
  setWithExpiry: jest.fn().mockName("setWithExpiry"),
  del: jest.fn().mockName("del")
} as unknown as jest.Mocked<Cache>;
