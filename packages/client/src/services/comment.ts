import type { GetCommentsResponse } from "@votewise/api";
import type { Client } from "../client";
import type { Client as ServerClient } from "../server";

import { comments } from "@votewise/constant/routes";

type CommentOptions = { client: Client | ServerClient };

export class Comment {
  private readonly client: Client | ServerClient;

  constructor(opts: CommentOptions) {
    this.client = opts.client;
  }

  public async getComments(id: string) {
    const res = await this.client.get<GetCommentsResponse>(comments.runtime.getAll("", id));
    return res;
  }
}

export type { GetCommentsResponse };
