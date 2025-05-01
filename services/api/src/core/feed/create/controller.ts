import type { AppContext } from "@/context";
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
    const feed = await this.ctx.feedRepository.create({
      authorId: locals.payload.sub,
      type: body.type!,
      content: body.content,
      title: body.title,
      slug,
      status: body.status!
    });

    const validTopicsPromises = body.topics.map((topic) => this.ctx.topicRepository.findById(topic));
    const validTopics = await Promise.all(validTopicsPromises);
    const invalidTopics = validTopics.filter((topic) => topic === null);
    const invalidMessage = body.topics.length > 1 ? "Invalid topics provided" : "Invalid topic provided";
    this.ctx.assert.unprocessableEntity(invalidTopics.length > 0, invalidMessage);

    const topicsToCreate = body.topics.map((topic) => ({ postId: feed.id, topicId: topic }));
    await this.ctx.postTopicRepository.createMany(topicsToCreate);

    if (body.assets && body.assets.length > 0) {
      const assets = body.assets.map((asset) => ({
        post_id: feed.id,
        type: asset.type,
        url: asset.url
      }));
      await this.ctx.feedAsset.createMany(assets);
    }

    const followers = await this.ctx.followRepository.findByFollowingId(locals.payload.sub);
    const timelines = followers.map((follower) => ({
      user_id: follower.follower_id,
      post_id: feed.id
    }));
    await this.ctx.timelineRepository.createMany(timelines);
    return res.status(StatusCodes.CREATED).json({ id: feed.id, slug });
  }
}
