import type { CreateFeedResponse, GetAllFeedsResponse, GetFeedResponse, VoteResponse } from "@votewise/api";
import type { TFeedCreate } from "@votewise/schemas/feed";
import type { TPagination } from "@votewise/schemas/pagination";
import type { BaseOptions, TClient } from "../utils";

import { feeds } from "@votewise/constant/routes";

import { qs } from "./qs";

export class Feed {
  private readonly client: TClient;

  constructor(opts: BaseOptions) {
    this.client = opts.client;
  }

  public async getAll(query?: TPagination) {
    const res = await this.client.get<GetAllFeedsResponse>(qs(feeds.runtime.all(""), query));
    return res;
  }

  public async create(data: TFeedCreate) {
    const res = await this.client.post<CreateFeedResponse, TFeedCreate>(feeds.runtime.create(""), data);
    return res;
  }

  public async get(id: string) {
    const res = await this.client.get<GetFeedResponse>(feeds.runtime.get("", id));
    return res;
  }

  public async vote(id: string) {
    const res = await this.client.post<VoteResponse, object>(feeds.runtime.vote("", id), {});
    return res;
  }
}

export type { GetAllFeedsResponse, CreateFeedResponse, GetFeedResponse };
