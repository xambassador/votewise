import type {
  GetGroupRecommendationsResponse,
  GetMeResponse,
  GetUserProfileResponse,
  GetUserRecommendationsResponse,
  UsernameExistsResponse
} from "@votewise/api";
import type { TRecommendUserQuery } from "@votewise/schemas/user";
import type { BaseOptions, TClient } from "../utils";

import { user } from "@votewise/constant/routes";

import { qs } from "./qs";

export class User {
  private readonly client: TClient;

  constructor(opts: BaseOptions) {
    this.client = opts.client;
  }

  public async isUsernameAvailable(username: string) {
    const path = user.runtime.usernameExists("", username);
    const res = await this.client.get<UsernameExistsResponse>(path);
    return res;
  }

  public async getMe() {
    const path = user.runtime.me.get("");
    const res = await this.client.get<GetMeResponse>(path);
    return res;
  }

  public async getRecommendateUsers(query?: TRecommendUserQuery) {
    const path = user.runtime.recommendations.get("");
    const res = await this.client.get<GetUserRecommendationsResponse>(qs(path, query));
    return res;
  }

  public async getRecommendateGroups() {
    const path = user.runtime.recommendations.getGroupRecommendations("");
    const res = await this.client.get<GetGroupRecommendationsResponse>(path);
    return res;
  }

  public async getUser(userName: string) {
    const path = user.runtime.profile.getByUsername("", userName);
    const res = await this.client.get<GetUserProfileResponse>(path);
    return res;
  }
}

export type {
  UsernameExistsResponse,
  GetMeResponse,
  GetUserRecommendationsResponse,
  GetGroupRecommendationsResponse,
  GetUserProfileResponse
};
