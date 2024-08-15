import type { RedisOptions } from "ioredis";

import Redis from "ioredis";
import { defaults } from "lodash";

import { Milisecond } from "@votewise/lib/times";

/* ----------------------------------------------------------------------------------------------- */

type AdapterOptions = RedisOptions & {
  suffix?: string;
};

const DEFAULT_OPTIONS: RedisOptions = {
  maxRetriesPerRequest: 3,
  enableReadyCheck: true
};

export class RedisAdapter extends Redis {
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
      this.setMaxListeners(100);
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

    this.setMaxListeners(100);
  }

  public static get defaultClient() {
    if (this.client) return this.client;
    this.client = new this(process.env.REDIS_URL, {
      suffix: "votewise-client",
      connectTimeout: 5000,
      lazyConnect: true
    });
    return this.client;
  }

  public static get defaultSubscriber() {
    if (this.subscriber) return this.subscriber;
    this.subscriber = new this(process.env.REDIS_URL, {
      suffix: "votewise-subscriber",
      maxRetriesPerRequest: null,
      lazyConnect: true
    });
    return this.subscriber;
  }
}

export class Cache {
  private readonly client: RedisAdapter;
  private isConnected: boolean;

  constructor() {
    this.client = RedisAdapter.defaultClient;
    this.isConnected = false;
  }

  public async connect() {
    return new Promise((resolve, reject) => {
      this.client
        .connect()
        .then(() => {
          this.isConnected = true;
          resolve(true);
        })
        .catch((err) => reject(err));
    });
  }

  /**
   * Run a callback function when the client connects to the Redis server
   *
   * @param cb - Callback function to run when the client connects
   */
  public onConnect(cb: () => void) {
    this.isConnected = true;
    this.client.on("connect", cb);
  }

  /**
   * Run a callback function when the client encounters an error
   *
   * @param cb - Callback function to run when the client encounters an error
   */
  public onError(cb: (err: Error) => void) {
    this.client.on("error", cb);
  }

  public onEnd(cb: () => void) {
    this.client.on("end", () => {
      this.isConnected = false;
      cb();
    });
  }

  /**
   * Disconnect the client from the Redis server
   */
  public async disconnect() {
    if (!this.isConnected) {
      return void 0;
    }
    return this.client.disconnect();
  }

  /**
   * Set a value in the cache
   *
   * @param {string} key - Cache key
   * @returns {Promise<string | null>} Cached value or null
   */
  public async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  /**
   * Set a value in the cache with an expiry. Expiry is in seconds.
   *
   * @param {string} key - Cache key
   * @param {string | Buffer | number} value - Cache value
   * @param {number} expiry - Cache expiry in milliseconds
   * @returns {Promise<"Ok">} Redis response
   */
  public async setWithExpiry(key: string, value: string | Buffer | number, expiry: number) {
    const seconds = Math.floor(expiry / Milisecond);
    return this.client.set(key, value, "EX", seconds);
  }

  /**
   * Set a value in the cache.
   *
   * @param {string} key - Cache key
   * @param {string | Buffer | number} value - Cache value
   * @returns {Promise<"Ok">} Redis response
   */
  public async set(key: string, value: string | Buffer | number) {
    return this.client.set(key, value);
  }

  /**
   * Delete a key from the cache
   *
   * @param {string} key - Cache key
   * @returns {Promise<number>} Number of keys deleted
   */
  public async del(key: string) {
    return this.client.del(key);
  }
}
