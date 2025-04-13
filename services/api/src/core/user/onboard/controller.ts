import type { AppContext } from "@/context";
import type { Request, Response } from "express";

import { StatusCodes } from "http-status-codes";

import { ZOnboard } from "@votewise/schemas/onboard";

import { getAuthenticateLocals } from "@/utils/locals";

type ControllerOptions = {
  assert: AppContext["assert"];
  userRepository: AppContext["repositories"]["user"];
  userInterestRepository: AppContext["repositories"]["userInterest"];
  requestParser: AppContext["plugins"]["requestParser"];
  taskQueue: AppContext["queues"]["tasksQueue"];
  appUrl: AppContext["config"]["appUrl"];
};

export class Controller {
  private readonly ctx: ControllerOptions;

  constructor(opts: ControllerOptions) {
    this.ctx = opts;
  }

  async handle(req: Request, res: Response) {
    const locals = getAuthenticateLocals(res);
    const _userId = req.params.user_id;
    this.ctx.assert.badRequest(!_userId, "User ID is missing");
    const userId = _userId!;
    this.ctx.assert.forbidden(userId !== locals.payload.sub, "Forbidden access");
    const { body } = this.ctx.requestParser.getParser(ZOnboard).parseRequest(req, res);
    const userTopics = await this.ctx.userInterestRepository.findByUserId(userId);
    const user = await this.ctx.userRepository.update(locals.payload.sub, {
      user_name: body.user_name,
      location: body.location,
      is_onboarded: true,
      first_name: body.first_name,
      last_name: body.last_name,
      gender: body.gender,
      about: body.about,
      cover_image_url: body.cover_url,
      avatar_url: body.avatar_url,
      facebook_profile_url: body.facebook_url,
      twitter_profile_url: body.twitter_url,
      instagram_profile_url: body.instagram_url
    });

    const topics: string[] = [];
    body.topics.forEach((topic) => {
      const isAlreadyAdded = userTopics.some((userTopic) => userTopic.topic_id === topic);
      if (!isAlreadyAdded) topics.push(topic);
    });

    await this.ctx.userInterestRepository.create(userId, topics);

    this.ctx.taskQueue.add({
      name: "email",
      payload: {
        templateName: "welcome",
        to: user.email,
        subject: "Welcome to VoteWise",
        locals: {
          name: user.first_name + " " + user.last_name,
          logo: this.ctx.appUrl + "/assets/logo.png"
        }
      }
    });

    return res.status(StatusCodes.OK).json({ is_onboarded: user.is_onboarded, ...body });
  }
}
