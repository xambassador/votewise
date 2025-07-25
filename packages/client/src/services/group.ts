import type { GetAllGroupsResponse, GetMyGroupsResponse } from "@votewise/api";
import type { TPagination } from "@votewise/schemas/pagination";
import type { Client } from "../client";
import type { Client as ServerClient } from "../server";

import { groups } from "@votewise/constant/routes";

import { qs } from "./qs";

type GroupOptions = {
  client: Client | ServerClient;
};

export class Group {
  private readonly client: Client | ServerClient;

  constructor(opts: GroupOptions) {
    this.client = opts.client;
  }

  public async getAll(query?: TPagination) {
    const path = groups.runtime.all("");
    const response = await this.client.get<GetAllGroupsResponse>(qs(path, query));
    return response;
  }

  public async getMyGroups(query?: TPagination) {
    const path = groups.runtime.myGroups("");
    const response = await this.client.get<GetMyGroupsResponse>(qs(path, query));
    return response;
  }
}

export type { GetAllGroupsResponse, GetMyGroupsResponse };
