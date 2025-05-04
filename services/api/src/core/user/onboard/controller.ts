import type { AppContext } from "@/context";
import type { ExtractControllerResponse } from "@/types";
import type { Request, Response } from "express";

import { StatusCodes } from "http-status-codes";

import { ERROR_CODES } from "@votewise/constant";
import { ZOnboard } from "@votewise/schemas/onboard";

import { getAuthenticateLocals } from "@/utils/locals";

type ControllerOptions = {
  assert: AppContext["assert"];
  userRepository: AppContext["repositories"]["user"];
  userInterestRepository: AppContext["repositories"]["userInterest"];
  requestParser: AppContext["plugins"]["requestParser"];
  taskQueue: AppContext["queues"]["tasksQueue"];
  uploadQueue: AppContext["queues"]["uploadQueue"];
  appUrl: AppContext["config"]["appUrl"];
  postTopicRepository: AppContext["repositories"]["postTopic"];
  timelineRepository: AppContext["repositories"]["timeline"];
  onboardService: AppContext["onboardService"];
  sessionManager: AppContext["sessionManager"];
};

const { USERNAME_ALREADY_EXISTS } = ERROR_CODES.USER;

export class Controller {
  private readonly ctx: ControllerOptions;

  constructor(opts: ControllerOptions) {
    this.ctx = opts;
  }

  async handle(req: Request, res: Response) {
    const locals = getAuthenticateLocals(res);
    const { body } = this.ctx.requestParser.getParser(ZOnboard).parseRequest(req, res);
    const userId = locals.payload.sub;

    const _user = await this.ctx.userRepository.findById(userId);
    this.ctx.assert.resourceNotFound(!_user, "User not found");
    const user = _user!;

    switch (body.step) {
      case 1: {
        const isUsernameTaken = await this.ctx.userRepository.findByUsername(body.user_name);
        this.ctx.assert.unprocessableEntity(!!isUsernameTaken, "Username already exists", USERNAME_ALREADY_EXISTS);
        await this.ctx.userRepository.update(userId, {
          user_name: body.user_name,
          first_name: body.first_name,
          last_name: body.last_name
        });
        await this.ctx.onboardService.updateUserOnboardCache(userId, {
          user_name: body.user_name,
          last_name: body.last_name,
          first_name: body.first_name
        });
        const result = { is_onboarded: user.is_onboarded };
        return res.status(StatusCodes.OK).json(result) as Response<typeof result>;
      }

      case 2: {
        await this.ctx.userRepository.update(userId, {
          gender: body.gender,
          about: body.about
        });
        await this.ctx.onboardService.updateUserOnboardCache(userId, {
          gender: body.gender as "MALE",
          about: body.about
        });
        const result = { is_onboarded: user.is_onboarded };
        return res.status(StatusCodes.OK).json(result) as Response<typeof result>;
      }

      case 3: {
        const url = body.avatar;
        const searchParams = new URLSearchParams(url.split("?")[1]);
        const fileName = searchParams.get("file_name")!;
        const fileToken = searchParams.get("file_token")!;
        this.ctx.assert.unprocessableEntity(!fileName && !fileToken, "Invalid avatar url");
        await this.ctx.userRepository.update(userId, {
          avatar_url: body.avatar
        });
        await this.ctx.onboardService.updateUserOnboardCache(userId, { avatar_url: body.avatar });
        const result = { is_onboarded: user.is_onboarded };
        this.ctx.uploadQueue.add({
          name: "uploadToS3",
          payload: {
            userId,
            assetType: "avatar",
            fileName,
            path: userId + "/" + fileName,
            fileToken
          }
        });
        return res.status(StatusCodes.OK).json(result) as Response<typeof result>;
      }

      case 4: {
        const url = body.cover;
        const searchParams = new URLSearchParams(url.split("?")[1]);
        const fileName = searchParams.get("file_name")!;
        const fileToken = searchParams.get("file_token")!;
        this.ctx.assert.unprocessableEntity(!fileName && !fileToken, "Invalid cover url");
        await this.ctx.userRepository.update(userId, {
          cover_image_url: body.cover
        });
        await this.ctx.onboardService.updateUserOnboardCache(userId, { cover_image_url: body.cover });
        const result = { is_onboarded: user.is_onboarded };
        this.ctx.uploadQueue.add({
          name: "uploadToS3",
          payload: {
            userId,
            fileName,
            path: userId + "/" + fileName,
            fileToken,
            assetType: "cover_image"
          }
        });
        return res.status(StatusCodes.OK).json(result) as Response<typeof result>;
      }

      case 5: {
        await this.ctx.userRepository.update(userId, {
          facebook_profile_url: body.facebook,
          location: body.location,
          instagram_profile_url: body.instagram,
          twitter_profile_url: body.twitter
        });
        await this.ctx.onboardService.updateUserOnboardCache(userId, {
          facebook_profile_url: body.facebook,
          location: body.location,
          instagram_profile_url: body.instagram,
          twitter_profile_url: body.twitter
        });
        const result = { is_onboarded: user.is_onboarded };
        return res.status(StatusCodes.OK).json(result) as Response<typeof result>;
      }

      case 6: {
        const userTopics = await this.ctx.userInterestRepository.findByUserId(userId);
        const topics: string[] = [];
        body.topics.forEach((topic) => {
          const isAlreadyAdded = userTopics.some((userTopic) => userTopic.topic_id === topic);
          if (!isAlreadyAdded) topics.push(topic);
        });
        await this.ctx.userRepository.update(userId, { is_onboarded: true });
        await this.ctx.userInterestRepository.create(userId, topics);
        await this.ctx.sessionManager.updateOnboardStatus(userId, "ONBOARDED");
        await this.ctx.onboardService.clearUserOnboardCache(userId);
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
        await this.hydrateUserTimeline(userId, topics).catch(() => {});
        const result = { is_onboarded: true };
        return res.status(StatusCodes.OK).json(result) as Response<typeof result>;
      }

      default:
        break;
    }

    const result = { is_onboarded: user.is_onboarded };
    return res.status(StatusCodes.OK).json(result) as Response<typeof result>;
  }

  private async hydrateUserTimeline(userId: string, topics: string[]) {
    const feeds = await this.ctx.postTopicRepository.getInterestedFeedIds(topics);
    const timeline = feeds.map((feed) => ({ user_id: userId, post_id: feed.post_id }));
    await this.ctx.timelineRepository.createMany(timeline);
  }
}

export type OnboardUserResponse = ExtractControllerResponse<Controller>;
