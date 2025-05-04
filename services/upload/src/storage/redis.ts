import type { RedisOptions } from "ioredis";

import { Redis } from "ioredis";

type Options = RedisOptions & {
  environment: Environment;
};

export class RedisAdapter {
  private static client: Redis;
  private static options: RedisOptions;
  private static redisUrl: string;
  private static isConnected: boolean;

  constructor(opts: Options) {
    if (RedisAdapter.client) return;
    const { environment, ...redisOpts } = opts;
    const connectionName = "Redis (Upload service)";
    const redisUrl = environment.REDIS_URL;
    RedisAdapter.redisUrl = redisUrl;
    RedisAdapter.options = {
      ...redisOpts,
      connectionName
    };
    RedisAdapter.isConnected = false;
  }

  public static get defaultClient() {
    if (this.client) return this.client;
    this.client = new Redis(this.redisUrl, this.options);
    return this.client;
  }

  public init() {
    if (RedisAdapter.client) return RedisAdapter.client;
    RedisAdapter.client = new Redis(RedisAdapter.redisUrl, RedisAdapter.options);
    return RedisAdapter.client;
  }

  public async connect() {
    return new Promise((resolve, reject) => {
      RedisAdapter.client
        .connect()
        .then(() => {
          RedisAdapter.isConnected = true;
          resolve(true);
        })
        .catch((err) => reject(err));
    });
  }

  public onConnect(cb: () => void) {
    RedisAdapter.isConnected = true;
    RedisAdapter.client.on("connect", cb);
  }

  public onError(cb: (err: Error) => void) {
    RedisAdapter.client.on("error", cb);
  }

  public onEnd(cb: () => void) {
    RedisAdapter.client.on("end", () => {
      RedisAdapter.isConnected = false;
      cb();
    });
  }

  public async disconnect() {
    if (!RedisAdapter.isConnected) {
      return void 0;
    }
    return RedisAdapter.client.disconnect();
  }
}

export type { Redis };
