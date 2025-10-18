import type { Cache } from "@/storage/redis";

export const mockCache = {
  connect: jest.fn(),
  disconnect: jest.fn(),
  set: jest.fn().mockName("set"),
  get: jest.fn().mockName("get"),
  setWithExpiry: jest.fn().mockName("setWithExpiry"),
  del: jest.fn().mockName("del"),
  hset: jest.fn().mockName("hset"),
  expire: jest.fn().mockName("expire"),
  keys: jest.fn().mockName("keys"),
  hget: jest.fn().mockName("hget"),
  hgetall: jest.fn().mockName("hgetall")
} as unknown as jest.Mocked<Cache>;
