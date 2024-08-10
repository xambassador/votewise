import Redis from "ioredis";

export class RedisMockAdapter extends Redis {
  public static get defaultClient(): RedisMockAdapter {
    return { set: jest.fn(), get: jest.fn() } as unknown as RedisMockAdapter;
  }

  public static get defaultSubscriber(): RedisMockAdapter {
    return { subscribe: jest.fn(), on: jest.fn() } as unknown as RedisMockAdapter;
  }
}
