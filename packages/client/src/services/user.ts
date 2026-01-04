import type {
  GetGroupRecommendationsResponse,
  GetMeResponse,
  GetMyAccountResponse,
  GetUserCommentsResponse,
  GetUserFollowersResponse,
  GetUserFollowingsResponse,
  GetUserGroupsResponse,
  GetUserPostsResponse,
  GetUserProfileResponse,
  GetUserRecommendationsResponse,
  UpdateAccountResponse,
  UpdateUserProfileResponse,
  UsernameExistsResponse
} from "@votewise/api";
import type { TPagination } from "@votewise/schemas/pagination";
import type { TRecommendUserQuery, TUpdateAccount, TUpdateProfile } from "@votewise/schemas/user";
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

  public async update(data: TUpdateProfile) {
    const path = user.runtime.me.update("");
    const res = await this.client.put<UpdateUserProfileResponse, TUpdateProfile>(path, data);
    return res;
  }

  public async getMyAccount() {
    const path = user.runtime.me.getAccount("");
    const res = await this.client.get<GetMyAccountResponse>(path);
    return res;
  }

  public async updateAccount(data: TUpdateAccount) {
    const path = user.runtime.me.updateAccount("");
    const res = await this.client.put<UpdateAccountResponse, TUpdateAccount>(path, data);
    return res;
  }

  public async getUserComments(username: string, query?: TPagination) {
    const path = user.runtime.profile.getComments("", username);
    const res = await this.client.get<GetUserCommentsResponse>(qs(path, query));
    return res;
  }

  public async getUserPosts(username: string, query?: TPagination & { type?: "posts" | "voted" }) {
    const path = user.runtime.profile.getPosts("", username);
    const res = await this.client.get<GetUserPostsResponse>(qs(path, query));
    return res;
  }

  public async getUserFollowers(username: string, query?: TPagination) {
    const path = user.runtime.profile.getFollowers("", username);
    const res = await this.client.get<GetUserFollowersResponse>(qs(path, query));
    return res;
  }

  public async getUserFollowings(username: string, query?: TPagination) {
    const path = user.runtime.profile.getFollowings("", username);
    const res = await this.client.get<GetUserFollowingsResponse>(qs(path, query));
    return res;
  }

  public async getUserGroups(username: string, query?: TPagination) {
    const path = user.runtime.profile.getGroups("", username);
    const res = await this.client.get<GetUserGroupsResponse>(qs(path, query));
    return res;
  }
}

export type {
  UsernameExistsResponse,
  GetMeResponse,
  GetUserRecommendationsResponse,
  GetGroupRecommendationsResponse,
  GetUserProfileResponse,
  UpdateUserProfileResponse,
  GetMyAccountResponse,
  UpdateAccountResponse,
  GetUserCommentsResponse,
  GetUserFollowersResponse,
  GetUserFollowingsResponse,
  GetUserGroupsResponse,
  GetUserPostsResponse
};
