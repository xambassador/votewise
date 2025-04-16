import type { RateLimiterAbstract } from "rate-limiter-flexible";

import { Redis } from "ioredis";
import { RateLimiterMemory, RateLimiterRedis, RateLimiterRes } from "rate-limiter-flexible";

import { environment } from "@votewise/env";

export type IRateLimiterOptions = {
  keyPrefix: string;
  points: number;
  duration?: number;
  execEvenly?: boolean;
  execEvenlyMinDelayMs?: number;
  blockDuration?: number;
};

export { RateLimiterRes };

export class RateLimiter {
  constructor() {
    throw new Error("RateLimiter is a static class and cannot be instantiated.");
  }

  static createInMemory(opt: IRateLimiterOptions): RateLimiterAbstract {
    return new RateLimiterMemory(opt);
  }

  static createRedisLimiter(storeClient: unknown, opt: IRateLimiterOptions): RateLimiterAbstract {
    return new RateLimiterRedis({
      storeClient,
      ...opt,
      insuranceLimiter: this.createInMemory(opt)
    });
  }
}

export class RateLimiterManager {
  private static _instance: RateLimiterManager;
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
    const instance = RateLimiterManager.create();
    const limiter = instance.routeRateLimiters.get(route);
    if (!limiter) {
      const limiter = RateLimiter.createRedisLimiter(instance._redisClient, opt);
      instance.routeRateLimiters.set(route, limiter);
      return limiter;
    }
    return limiter;
  }
}
