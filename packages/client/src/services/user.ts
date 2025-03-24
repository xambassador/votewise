import type { Client } from "../client";
import type { Client as ServerClient } from "../server";

type UserOptions = {
  client: Client | ServerClient;
};

export class User {
  private readonly client: Client | ServerClient;

  constructor(opts: UserOptions) {
    this.client = opts.client;
  }

  public async isUsernameAvailable(username: string) {
    const path = `/v1/users/${username}/exists`;
    const res = await this.client.get<{ is_available: boolean }>(path);
    return res;
  }
}
