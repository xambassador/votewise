import type { AppContext } from "@/context";
import type { ExtractControllerResponse } from "@/types";
import type { Request, Response } from "express";

import { StatusCodes } from "http-status-codes";
import { z } from "zod";

import { PAGINATION } from "@votewise/constant";
import { ZPagination } from "@votewise/schemas";

import { unpack } from "@/lib/cursor";
import { PaginationBuilder } from "@/lib/pagination";
import { getAuthenticateLocals } from "@/utils/locals";

const ZParams = z.object({ groupId: z.string() });

export class Controller {
  private readonly ctx: AppContext;

  constructor(opts: AppContext) {
    this.ctx = opts;
  }

  public async handle(req: Request, res: Response) {
    const locals = getAuthenticateLocals(res);
    const validate = ZParams.safeParse(req.params);
    this.ctx.assert.unprocessableEntity(!validate.success, "Invalid request");
    const schema = ZPagination.safeParse(req.query);
    this.ctx.assert.unprocessableEntity(!schema.success, "Invalid query");

    const query = schema.data!;
    const { groupId } = validate.data!;
    const cursor = unpack(query.cursor, () => this.ctx.assert.unprocessableEntity(true, "Invalid cursor"));
    const limit = query.limit < 1 ? PAGINATION.feeds.limit : query.limit;

    const _group = await this.ctx.repositories.group.findById(groupId);
    this.ctx.assert.resourceNotFound(!_group, `Group with id ${groupId} not found`);
    const group = _group!;

    const isPublic = group.type === "PUBLIC";

    if (isPublic) {
      const result = await this.getFeeds({ groupId, cursor, limit });
      return res.status(StatusCodes.OK).json(result) as Response<typeof result>;
    }

    const isMember = await this.ctx.repositories.group.groupMember.isMember(group.id, locals.payload.sub);
    this.ctx.assert.forbidden(!isMember, "You are not a member of this group");
    const result = await this.getFeeds({ groupId, cursor, limit });
    return res.status(StatusCodes.OK).json(result) as Response<typeof result>;
  }

  private async getFeeds(props: {
    groupId: string;
    cursor: { primary: string; secondary: string } | null;
    limit: number;
  }) {
    const { groupId, cursor, limit } = props;
    const feeds = await this.ctx.repositories.feed.findByGroupId(groupId, { cursor, limit });
    const nextCursor = feeds.length < limit ? undefined : feeds.at(-1);
    const pagination = new PaginationBuilder({
      total: 0,
      page: 1,
      limit,
      cursor: nextCursor ? { primary: nextCursor.created_at, secondary: nextCursor.post.id } : undefined
    }).build();
    return {
      feeds: feeds.map((feed) => ({
        id: feed.post.id,
        title: feed.post.title,
        slug: feed.post.slug,
        created_at: feed.post.created_at,
        updated_at: feed.post.updated_at,
        hash_tags: [],
        author: {
          id: feed.post.author.id,
          user_name: feed.post.author.user_name,
          first_name: feed.post.author.first_name,
          last_name: feed.post.author.last_name,
          avatar_url: feed.post.author.avatar_url
        },
        votes: feed.post.postAggregates?.votes ?? 0,
        voters: feed.post.upvotes.map((vote) => ({
          id: vote.user.id,
          avatar_url: vote.user.avatar_url
        })),
        comments: feed.post.postAggregates?.comments ?? 0
      })),
      ...pagination
    };
  }
}

export type GetGroupFeedsResponse = ExtractControllerResponse<Controller>;
