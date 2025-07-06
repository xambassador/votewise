import type { CreateCommentResponse, GetCommentsResponse, GetRepliesResponse } from "@votewise/api";
import type { TCommentCreate } from "@votewise/schemas/comment";
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

  public async createComment(id: string, data: TCommentCreate) {
    const res = await this.client.post<CreateCommentResponse, TCommentCreate>(comments.runtime.create("", id), data);
    return res;
  }

  public async getReplies(feedId: string, parentId: string) {
    const res = await this.client.get<GetRepliesResponse>(comments.runtime.getReplies("", feedId, parentId));
    return res;
  }
}

export type { GetCommentsResponse, CreateCommentResponse, GetRepliesResponse };
