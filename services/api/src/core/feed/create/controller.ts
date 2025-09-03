import type { AppContext } from "@/context";
import type { ExtractControllerResponse } from "@/types";
import type { Request, Response } from "express";

import { StatusCodes } from "http-status-codes";
import slugify from "slugify";

import { ZFeedCreate } from "@votewise/schemas";

import { getAuthenticateLocals } from "@/utils/locals";

type ControllerOptions = {
  requestParser: AppContext["plugins"]["requestParser"];
  feedRepository: AppContext["repositories"]["feed"];
  followRepository: AppContext["repositories"]["follow"];
  timelineRepository: AppContext["repositories"]["timeline"];
  feedAsset: AppContext["repositories"]["feedAsset"];
  postTopicRepository: AppContext["repositories"]["postTopic"];
  topicRepository: AppContext["repositories"]["topic"];
  assert: AppContext["assert"];
  transaction: AppContext["repositories"]["transactionManager"];
  aggregator: AppContext["repositories"]["aggregator"];
};

export class Controller {
  private readonly ctx: ControllerOptions;

  constructor(opts: ControllerOptions) {
    this.ctx = opts;
  }

  public async handle(req: Request, res: Response) {
    const locals = getAuthenticateLocals(res);
    const { body } = this.ctx.requestParser.getParser(ZFeedCreate).parseRequest(req, res);

    const today = Date.now();
    const slug = slugify(body.title + " " + today);
    const validTopicsPromises = body.topics.map((topic) => this.ctx.topicRepository.findById(topic));
    const validTopics = await Promise.all(validTopicsPromises);
    const invalidTopics = validTopics.filter((topic) => topic === null);
    const invalidMessage = body.topics.length > 1 ? "Invalid topics provided" : "Invalid topic provided";
    this.ctx.assert.unprocessableEntity(invalidTopics.length > 0, invalidMessage);

    const { feed } = await this.ctx.transaction.withTransaction(async (tx) => {
      const feed = await this.ctx.feedRepository.create(
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
      await this.ctx.postTopicRepository.createMany(topicsToCreate, tx);

      if (body.assets && body.assets.length > 0) {
        const assets = body.assets.map((asset) => ({
          post_id: feed.id,
          type: asset.type,
          url: asset.url
        }));
        await this.ctx.feedAsset.createMany(assets, tx);
      }

      await this.ctx.aggregator.postAggregator.aggregate(
        feed.id,
        (currentStats) => ({
          comments: currentStats?.comments ?? 0,
          shares: currentStats?.shares ?? 0,
          views: currentStats?.views ?? 0,
          votes: currentStats?.votes ?? 0
        }),
        tx
      );
      await this.ctx.aggregator.userAggregator.aggregate(
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
      );

      return { feed };
    });

    const followers = await this.ctx.followRepository.findByFollowingId(locals.payload.sub);
    const timelines = followers.map((follower) => ({
      user_id: follower.follower_id,
      post_id: feed.id
    }));
    timelines.unshift({ user_id: locals.payload.sub, post_id: feed.id });
    await this.ctx.timelineRepository.createMany(timelines);
    const result = { id: feed.id, slug };
    return res.status(StatusCodes.CREATED).json(result) as Response<typeof result>;
  }
}

export type CreateFeedResponse = ExtractControllerResponse<Controller>;
