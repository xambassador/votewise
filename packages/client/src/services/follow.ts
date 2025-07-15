import type { FollowResponse, UnFollowResponse } from "@votewise/api";
import type { Client } from "../client";
import type { Client as ServerClient } from "../server";

import { follow } from "@votewise/constant/routes";

type FollowOptions = {
  client: Client | ServerClient;
};

export class Follow {
  private readonly client: Client | ServerClient;

  constructor(opts: FollowOptions) {
    this.client = opts.client;
  }

  public async follow(username: string) {
    const path = follow.runtime.followUser("", username);
    const res = await this.client.post<FollowResponse, object>(path, {});
    return res;
  }

  public async unfollow(username: string) {
    const path = follow.runtime.unfollowUser("", username);
    const res = await this.client.delete<UnFollowResponse>(path);
    return res;
  }
}

export type { FollowResponse, UnFollowResponse };
