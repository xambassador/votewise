import type { AppContext } from "@/context";
import type { ExtractControllerResponse } from "@/types";
import type { Request, Response } from "express";

import { StatusCodes } from "http-status-codes";

import { ZPagination } from "@votewise/schemas";

import { PaginationBuilder } from "@/lib/pagination";
import { getAuthenticateLocals } from "@/utils/locals";

type ControllerOptions = {
  timelineRepository: AppContext["repositories"]["timeline"];
  assert: AppContext["assert"];
  bucketService: AppContext["bucketService"];
};

export class Controller {
  private readonly ctx: ControllerOptions;

  constructor(opts: ControllerOptions) {
    this.ctx = opts;
  }

  public async handle(req: Request, res: Response) {
    const locals = getAuthenticateLocals(res);
    const schema = ZPagination.safeParse(req.query);
    this.ctx.assert.unprocessableEntity(!schema.success, "Invalid query");
    const query = schema.data!;
    const total = await this.ctx.timelineRepository.countByUserId(locals.payload.sub);
    const { page, limit } = query;
    const timeline = await this.ctx.timelineRepository.findByUserId(locals.payload.sub, { page, limit });
    const bucketService = this.ctx.bucketService;
    const timelineFeedPromises = timeline.map((timeline) => {
      const item = {
        id: timeline.post.id,
        title: timeline.post.title,
        slug: timeline.post.slug,
        created_at: timeline.post.created_at,
        updated_at: timeline.post.updated_at,
        hash_tags: timeline.post.hashTags.map((tag) => ({
          name: tag.hash_tag.name
        })),
        author: {
          id: timeline.post.author.id,
          user_name: timeline.post.author.user_name,
          first_name: timeline.post.author.first_name,
          last_name: timeline.post.author.last_name,
          avatar_url: ""
        },
        votes: timeline.post._count.upvotes,
        voters: timeline.post.upvotes.map((vote) => ({
          id: vote.user.id,
          avatar_url: vote.user.avatar_url
        })),
        comments: timeline.post._count.comments
      };
      const authorAvatarPromise = new Promise<typeof item>((resolve) => {
        bucketService
          .getUrlForType(timeline.post.author.avatar_url ?? "", "avatar")
          .then((url) => {
            item.author.avatar_url = url;
            resolve(item);
          })
          .catch(() => {
            item.author.avatar_url = timeline.post.author.avatar_url ?? "";
            resolve(item);
          });
      });
      const votersAvatarPromises = item.voters.map(
        (vote) =>
          new Promise<typeof item>((resolve) => {
            bucketService
              .getUrlForType(vote.avatar_url ?? "", "avatar")
              .then((url) => {
                vote.avatar_url = url;
                resolve(item);
              })
              .catch(() => {
                vote.avatar_url = vote.avatar_url ?? "";
                resolve(item);
              });
          })
      );
      return new Promise<typeof item>((resolve) => {
        Promise.all([authorAvatarPromise, ...votersAvatarPromises]).then(() => {
          resolve(item);
        });
      });
    });
    const feeds = await Promise.all(timelineFeedPromises);
    const pagination = new PaginationBuilder({ total, page, limit }).build();
    const result = {
      feeds,
      ...pagination
    };
    return res.status(StatusCodes.OK).json(result) as Response<typeof result>;
  }
}

export type GetAllFeedsResponse = ExtractControllerResponse<Controller>;
