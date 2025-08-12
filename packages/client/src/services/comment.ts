import type {
  CreateCommentResponse,
  DeleteCommentResponse,
  GetCommentsResponse,
  GetRepliesResponse,
  UpdateCommentResponse
} from "@votewise/api";
import type { TCommentCreate, TCommentUpdate } from "@votewise/schemas/comment";
import type { TPagination } from "@votewise/schemas/pagination";
import type { Client } from "../client";
import type { Client as ServerClient } from "../server";

import { comments } from "@votewise/constant/routes";

import { qs } from "./qs";

type CommentOptions = { client: Client | ServerClient };

export class Comment {
  private readonly client: Client | ServerClient;

  constructor(opts: CommentOptions) {
    this.client = opts.client;
  }

  public async getComments(id: string, query?: TPagination) {
    const path = comments.runtime.getAll("", id);
    const res = await this.client.get<GetCommentsResponse>(qs(path, query));
    return res;
  }

  public async createComment(id: string, data: TCommentCreate) {
    const res = await this.client.post<CreateCommentResponse, TCommentCreate>(comments.runtime.create("", id), data);
    return res;
  }

  public async getReplies(feedId: string, parentId: string, query?: TPagination) {
    const path = comments.runtime.getReplies("", feedId, parentId);
    const res = await this.client.get<GetRepliesResponse>(qs(path, query));
    return res;
  }

  public async update(feedId: string, id: string, data: TCommentUpdate) {
    const res = await this.client.put<UpdateCommentResponse, TCommentUpdate>(
      comments.runtime.update("", feedId, id),
      data
    );
    return res;
  }

  public async delete(feedId: string, commentId: string) {
    const res = await this.client.delete<DeleteCommentResponse>(comments.runtime.delete("", feedId, commentId));
    return res;
  }
}

export type { GetCommentsResponse, CreateCommentResponse, GetRepliesResponse, UpdateCommentResponse };
