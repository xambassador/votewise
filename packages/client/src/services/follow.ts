import type { FollowResponse, UnFollowResponse } from "@votewise/api";
import type { BaseOptions, TClient } from "../utils";

import { follow } from "@votewise/constant/routes";

export class Follow {
  private readonly client: TClient;

  constructor(opts: BaseOptions) {
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
