import type { CreateFeedResponse, GetAllFeedsResponse } from "@votewise/api";
import type { TFeedCreate } from "@votewise/schemas/feed";
import type { Client } from "../client";
import type { Client as ServerClient } from "../server";

import { feeds } from "@votewise/constant/routes";

type FeedOptions = { client: Client | ServerClient };

export class Feed {
  private readonly client: Client | ServerClient;

  constructor(opts: FeedOptions) {
    this.client = opts.client;
  }

  public async get() {
    const res = await this.client.get<GetAllFeedsResponse>(feeds.runtime.all(""));
    return res;
  }

  public async create(data: TFeedCreate) {
    const res = await this.client.post<CreateFeedResponse, TFeedCreate>(feeds.runtime.create(""), data);
    return res;
  }
}

export type { GetAllFeedsResponse, CreateFeedResponse };
