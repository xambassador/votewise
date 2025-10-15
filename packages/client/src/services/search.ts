import type { SearchResponse } from "@votewise/api";
import type { BaseOptions, TClient } from "../utils";

import { search } from "@votewise/constant/routes";

import { qs } from "./qs";

export class Search {
  private readonly client: TClient;

  constructor(opts: BaseOptions) {
    this.client = opts.client;
  }

  public async search(query: string) {
    const path = search.runtime.all("");
    const res = await this.client.get<SearchResponse>(qs(path, { q: query }));
    return res;
  }
}

export type { SearchResponse };
