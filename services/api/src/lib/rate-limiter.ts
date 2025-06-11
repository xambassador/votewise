import type { RateLimiterAbstract } from "rate-limiter-flexible";

import { Redis } from "ioredis";
import { RateLimiterMemory, RateLimiterRedis, RateLimiterRes } from "rate-limiter-flexible";

import { environment } from "@votewise/env";

export { RateLimiterRes };
export type IRateLimiterOptions = {
  keyPrefix: string;
  points: number;
  duration?: number;
  execEvenly?: boolean;
  execEvenlyMinDelayMs?: number;
  blockDuration?: number;
};

function createInMemoryLimiterFactory(opt: IRateLimiterOptions): RateLimiterAbstract {
  return new RateLimiterMemory(opt);
}

function createRedisLimiterFactory(storeClient: unknown, opt: IRateLimiterOptions): RateLimiterAbstract {
  return new RateLimiterRedis({
    storeClient,
    ...opt,
    insuranceLimiter: createInMemoryLimiterFactory(opt)
  });
}

export class RateLimiterManager {
  private static _instance: RateLimiterManager | null = null;
  private _redisClient: Redis | null = null;
  private readonly routeRateLimiters: Map<string, RateLimiterAbstract> = new Map();

  constructor() {
    if (RateLimiterManager._instance) {
      throw new Error("RateLimiterManager is a singleton class and cannot be instantiated multiple times.");
    }
  }

  static create() {
    if (!RateLimiterManager._instance) {
      RateLimiterManager._instance = new RateLimiterManager();
    }

    if (!RateLimiterManager._instance._redisClient) {
      RateLimiterManager._instance._redisClient = new Redis({
        host: environment.REDIS_HOST,
        port: environment.REDIS_PORT
      });
    }

    return RateLimiterManager._instance;
  }

  public register(route: string, opt: IRateLimiterOptions) {
    const instance = RateLimiterManager._instance;
    if (!instance) {
      throw new Error(`RateLimiterManager is not initialized. Call create() first.`);
    }
    const limiter = instance.routeRateLimiters.get(route);
    if (!limiter) {
      const limiter = createRedisLimiterFactory(instance._redisClient, opt);
      instance.routeRateLimiters.set(route, limiter);
      return limiter;
    }
    return limiter;
  }
}

export const rateLimitStrategies = {
  THREE_PER_MINUTE: {
    points: 3,
    duration: 60
  },
  FIVE_PER_HOUR: {
    points: 5,
    duration: 60 * 60
  },
  THREE_PER_HOUR: {
    points: 3,
    duration: 60 * 60
  },
  TEN_PER_MINUTE: {
    points: 10,
    duration: 60
  },
  FIFTEEN_PER_MINUTE: {
    points: 15,
    duration: 60
  }
};
