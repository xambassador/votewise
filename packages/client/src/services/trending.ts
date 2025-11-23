import type { GetHotFeedsResponse, GetHotUsersResponse } from "@votewise/api";
import type { TPagination } from "@votewise/schemas/pagination";
import type { BaseOptions, TClient } from "../utils";

import { trending } from "@votewise/constant/routes";

import { qs } from "./qs";

export class Trending {
  private readonly client: TClient;

  constructor(opts: BaseOptions) {
    this.client = opts.client;
  }

  public async getFeeds(query?: TPagination) {
    const path = trending.runtime.feeds("");
    const response = await this.client.get<GetHotFeedsResponse>(qs(path, query));
    return response;
  }

  public async getUsers(query?: TPagination) {
    const path = trending.runtime.users("");
    const response = await this.client.get<GetHotUsersResponse>(qs(path, query));
    return response;
  }
}

export type { GetHotFeedsResponse, GetHotUsersResponse };
