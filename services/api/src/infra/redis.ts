import type { RedisOptions } from "ioredis";

import Redis from "ioredis";
import { defaults } from "lodash";

import Logger from "@votewise/lib/logger";

import { APP_SETTINGS } from "@/configs/index";

/* ----------------------------------------------------------------------------------------------- */

type AdapterOptions = RedisOptions & {
  suffix?: string;
};

const DEFAULT_OPTIONS: RedisOptions = {
  maxRetriesPerRequest: APP_SETTINGS.REDIS.MAX_RETRIES_PER_REQUEST,
  enableReadyCheck: true,
  retryStrategy: (times) => {
    Logger.warn("DATABASE", { message: `Retrying Redis connection ${times} times` });
    return Math.min(times * 50, 2000); // Retry after 50ms, 100ms, 150ms, 200ms, 2000ms
  },
};

export default class RedisAdapter extends Redis {
  private static client: RedisAdapter;

  private static subscriber: RedisAdapter;

  constructor(url: string | undefined, options: AdapterOptions = {}) {
    const { suffix } = options;
    const connectionName = suffix ? `Redis (${suffix})` : "Redis";
    const redisUrl = process.env.REDIS_URL;

    if (!url || !url.startsWith("ioredis://")) {
      if (!redisUrl) {
        throw new Error("Missing REDIS_URL environment variable");
      }

      super(redisUrl, defaults(options, { connectionName }, DEFAULT_OPTIONS));
      this.setMaxListeners(APP_SETTINGS.REDIS.MAX_LISTENERS);
      return;
    }

    let customOptions = {};
    try {
      const decodedString = Buffer.from(url.slice(10), "base64").toString();
      customOptions = JSON.parse(decodedString);
    } catch (error) {
      throw new Error(`Failed to decode redis adapter options: ${error}`);
    }

    try {
      super(defaults(options, { connectionName }, customOptions, DEFAULT_OPTIONS));
    } catch (error) {
      throw new Error(`Failed to initialize redis client: ${error}`);
    }

    this.setMaxListeners(APP_SETTINGS.REDIS.MAX_LISTENERS);
  }

  public static get defaultClient(): RedisAdapter {
    if (this.client) return this.client;
    this.client = new this(process.env.REDIS_URL, { suffix: APP_SETTINGS.REDIS.CLIENT_SUFFIX });
    return this.client;
  }

  public static get defaultSubscriber(): RedisAdapter {
    if (this.subscriber) return this.subscriber;
    this.subscriber = new this(process.env.REDIS_URL, {
      suffix: APP_SETTINGS.REDIS.SUBSCRIBER_SUFFIX,
      maxRetriesPerRequest: null,
    });
    return this.subscriber;
  }
}
