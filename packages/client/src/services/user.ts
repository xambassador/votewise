import type { UsernameIsAvailableResponse } from "@votewise/types";
import type { Client } from "../client";
import type { Client as ServerClient } from "../server";

import { user } from "@votewise/constant/routes";

type UserOptions = {
  client: Client | ServerClient;
};

export class User {
  private readonly client: Client | ServerClient;

  constructor(opts: UserOptions) {
    this.client = opts.client;
  }

  public async isUsernameAvailable(username: string) {
    const path = user.runtime.usernameExists("", username);
    const res = await this.client.get<UsernameIsAvailableResponse>(path);
    return res;
  }
}
