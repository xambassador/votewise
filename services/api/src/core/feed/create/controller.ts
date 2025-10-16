import type { AppContext } from "@/context";
import type { ExtractControllerResponse } from "@/types";
import type { Request, Response } from "express";

import { StatusCodes } from "http-status-codes";
import slugify from "slugify";

import { ZFeedCreate } from "@votewise/schemas";

import { getAuthenticateLocals } from "@/utils/locals";

export class Controller {
  private readonly ctx: AppContext;

  constructor(opts: AppContext) {
    this.ctx = opts;
  }

  public async handle(req: Request, res: Response) {
    const locals = getAuthenticateLocals(res);
    const { body } = this.ctx.plugins.requestParser.getParser(ZFeedCreate).parseRequest(req, res);

    const today = Date.now();
    const slug = slugify(body.title + " " + today);
    const validTopicsPromises = body.topics.map((topic) => this.ctx.repositories.topic.findById(topic));
    const validTopics = await Promise.all(validTopicsPromises);
    const invalidTopics = validTopics.filter((topic) => topic === null);
    const invalidMessage = body.topics.length > 1 ? "Invalid topics provided" : "Invalid topic provided";
    this.ctx.assert.unprocessableEntity(invalidTopics.length > 0, invalidMessage);

    const { feed } = await this.ctx.repositories.transactionManager.withDataLayerTransaction(async (tx) => {
      const feed = await this.ctx.repositories.feed.create(
        {
          authorId: locals.payload.sub,
          type: body.type!,
          content: body.content,
          title: body.title,
          slug,
          status: body.status!
        },
        tx
      );

      const topicsToCreate = body.topics.map((topic) => ({ postId: feed.id, topicId: topic }));
      const p: Promise<unknown>[] = [
        this.ctx.repositories.postTopic.createMany(topicsToCreate, tx),
        this.ctx.repositories.aggregator.postAggregator.aggregate(
          feed.id,
          (currentStats) => ({
            comments: currentStats?.comments ?? 0,
            shares: currentStats?.shares ?? 0,
            views: currentStats?.views ?? 0,
            votes: currentStats?.votes ?? 0
          }),
          tx
        ),
        this.ctx.repositories.aggregator.userAggregator.aggregate(
          locals.payload.sub,
          (currentStats) => ({
            total_comments: currentStats?.total_comments ?? 0,
            total_followers: currentStats?.total_followers ?? 0,
            total_following: currentStats?.total_following ?? 0,
            total_groups: currentStats?.total_groups ?? 0,
            total_posts: (currentStats?.total_posts ?? 0) + 1,
            total_votes: currentStats?.total_votes ?? 0
          }),
          tx
        )
      ];

      if (body.assets && body.assets.length > 0) {
        const assets = body.assets.map((asset) => ({
          post_id: feed.id,
          type: asset.type,
          url: asset.url
        }));
        p.push(this.ctx.repositories.feedAsset.createMany(assets, tx));
      }

      await Promise.all(p);
      return { feed };
    });

    const followers = await this.ctx.repositories.follow.findByFollowingId(locals.payload.sub);
    const timelines = followers.map((follower) => ({
      user_id: follower.follower_id,
      post_id: feed.id
    }));
    timelines.unshift({ user_id: locals.payload.sub, post_id: feed.id });
    await this.ctx.repositories.timeline.createMany(timelines);
    const result = { id: feed.id, slug };
    return res.status(StatusCodes.CREATED).json(result) as Response<typeof result>;
  }
}

export type CreateFeedResponse = ExtractControllerResponse<Controller>;
