import type { AppContext } from "@/context";
import type { ExtractControllerResponse } from "@/types";
import type { Request, Response } from "express";

import { StatusCodes } from "http-status-codes";

import { COOKIE_KEYS, ERROR_CODES } from "@votewise/constant";
import { ZOnboard } from "@votewise/schemas/onboard";
import { Day } from "@votewise/times";

import { getCookieOptions } from "@/utils/cookie";
import { getAuthenticateLocals } from "@/utils/locals";

const { USERNAME_ALREADY_EXISTS } = ERROR_CODES.USER;

export class Controller {
  private readonly ctx: AppContext;

  constructor(opts: AppContext) {
    this.ctx = opts;
  }

  async handle(req: Request, res: Response) {
    const locals = getAuthenticateLocals(res);
    const { body } = this.ctx.plugins.requestParser.getParser(ZOnboard).parseRequest(req, res);
    const userId = locals.payload.sub;

    const _user = await this.ctx.repositories.user.findById(userId);
    this.ctx.assert.resourceNotFound(!_user, "User not found");
    const user = _user!;

    switch (body.step) {
      case 1: {
        const isUsernameTaken = await this.ctx.repositories.user.findByUsername(body.user_name);
        this.ctx.assert.unprocessableEntity(!!isUsernameTaken, "Username already exists", USERNAME_ALREADY_EXISTS);
        await this.ctx.repositories.user.update(userId, {
          user_name: body.user_name,
          first_name: body.first_name,
          last_name: body.last_name
        });
        await this.ctx.services.onboard.updateUserOnboardCache(userId, {
          user_name: body.user_name,
          last_name: body.last_name,
          first_name: body.first_name
        });
        const result = { is_onboarded: user.is_onboarded };
        return res.status(StatusCodes.OK).json(result) as Response<typeof result>;
      }

      case 2: {
        await this.ctx.repositories.user.update(userId, {
          gender: body.gender,
          about: body.about
        });
        await this.ctx.services.onboard.updateUserOnboardCache(userId, {
          gender: body.gender as "MALE",
          about: body.about
        });
        const result = { is_onboarded: user.is_onboarded };
        return res.status(StatusCodes.OK).json(result) as Response<typeof result>;
      }

      case 3: {
        const url = body.avatar;
        await this.ctx.repositories.user.update(userId, { avatar_url: url });
        await this.ctx.services.onboard.updateUserOnboardCache(userId, { avatar_url: url });
        const result = { is_onboarded: user.is_onboarded };
        return res.status(StatusCodes.OK).json(result) as Response<typeof result>;
      }

      case 4: {
        const url = body.cover;
        await this.ctx.repositories.user.update(userId, { cover_image_url: url });
        await this.ctx.services.onboard.updateUserOnboardCache(userId, { cover_image_url: url });
        const result = { is_onboarded: user.is_onboarded };
        return res.status(StatusCodes.OK).json(result) as Response<typeof result>;
      }

      case 5: {
        await this.ctx.repositories.user.update(userId, {
          facebook_profile_url: body.facebook,
          location: body.location,
          instagram_profile_url: body.instagram,
          twitter_profile_url: body.twitter
        });
        await this.ctx.services.onboard.updateUserOnboardCache(userId, {
          facebook_profile_url: body.facebook,
          location: body.location,
          instagram_profile_url: body.instagram,
          twitter_profile_url: body.twitter
        });
        const result = { is_onboarded: user.is_onboarded };
        return res.status(StatusCodes.OK).json(result) as Response<typeof result>;
      }

      case 6: {
        const userTopics = await this.ctx.repositories.userInterest.findByUserId(userId);
        const topics: string[] = [];
        body.topics.forEach((topic) => {
          const isAlreadyAdded = userTopics.some((userTopic) => userTopic.topic_id === topic);
          if (!isAlreadyAdded) topics.push(topic);
        });
        await this.ctx.repositories.userInterest.create(userId, topics);
        await this.ctx.services.onboard.updateUserOnboardCache(userId, { topics });
        this.ctx.queues.tasksQueue.add({
          name: "email",
          payload: {
            templateName: "welcome",
            to: user.email,
            subject: "Welcome to VoteWise",
            locals: {
              name: user.first_name + " " + user.last_name,
              logo: this.ctx.config.appUrl + "/assets/logo.png"
            }
          }
        });
        this.hydrateUserTimeline(userId, topics).catch(() => {});
        const result = { is_onboarded: user.is_onboarded };
        return res.status(StatusCodes.OK).json(result) as Response<typeof result>;
      }

      case 7: {
        await this.ctx.repositories.user.update(userId, { is_onboarded: true });
        await this.ctx.services.onboard.clearUserOnboardCache(userId);

        const session = this.ctx.services.session.create({
          subject: locals.payload.sub,
          aal: locals.payload.aal,
          amr: locals.payload.amr,
          email: locals.payload.email,
          role: locals.payload.role,
          user_aal_level: locals.payload.user_aal_level,
          appMetaData: locals.payload.app_metadata,
          isOnboarded: true
        });
        await this.ctx.services.session.delete(locals.payload.session_id);
        await this.ctx.services.session.save(session.sessionId, {
          ip: locals.session.ip,
          userAgent: locals.session.userAgent,
          aal: locals.payload.aal,
          userId: locals.payload.sub
        });
        await this.ctx.repositories.refreshToken.create({ token: session.refreshToken, userId });
        const result = {
          is_onboarded: true,
          access_token: session.accessToken,
          refresh_token: session.refreshToken,
          token_type: "Bearer",
          expires_in: session.expiresInMs,
          expires_at: session.expiresAt
        };
        res.cookie(
          COOKIE_KEYS.accessToken,
          session.accessToken,
          getCookieOptions({ expires: new Date(Date.now() + session.expiresInMs) })
        );
        res.cookie(
          COOKIE_KEYS.refreshToken,
          session.refreshToken,
          getCookieOptions({ expires: new Date(Date.now() + 30 * Day) })
        );
        return res.status(StatusCodes.OK).json(result) as Response<typeof result>;
      }

      default:
        break;
    }

    const result = { is_onboarded: user.is_onboarded };
    return res.status(StatusCodes.OK).json(result) as Response<typeof result>;
  }

  private async hydrateUserTimeline(userId: string, topics: string[]) {
    const feeds = await this.ctx.repositories.postTopic.getInterestedFeedIds(topics);
    const timeline = feeds.map((feed) => ({ user_id: userId, post_id: feed.post_id }));
    await this.ctx.repositories.timeline.createMany(timeline);
  }
}

export type OnboardUserResponse = ExtractControllerResponse<Controller>;
