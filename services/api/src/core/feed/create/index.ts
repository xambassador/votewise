import { yellow } from "chalk";

import { AppContext } from "@/context";
import { authMiddlewareFactory } from "@/http/middlewares/auth";
import { rateLimitMiddlewareFactory } from "@/http/middlewares/rate-limit";
import { ExceptionLayer } from "@/lib/exception-layer";
import { rateLimitStrategies } from "@/lib/rate-limiter";

import { Controller } from "./controller";

export function createFeedControllerFactory(path: string) {
  const ctx = AppContext.getInjectionTokens(["repositories", "plugins", "logger", "assert"]);
  const controller = new Controller({
    feedRepository: ctx.repositories.feed,
    requestParser: ctx.plugins.requestParser,
    timelineRepository: ctx.repositories.timeline,
    followRepository: ctx.repositories.follow,
    feedAsset: ctx.repositories.feedAsset,
    postTopicRepository: ctx.repositories.postTopic,
    topicRepository: ctx.repositories.topic,
    transaction: ctx.repositories.transactionManager,
    assert: ctx.assert
  });
  const auth = authMiddlewareFactory();
  const limiter = rateLimitMiddlewareFactory(path, {
    ...rateLimitStrategies.FIVE_PER_MINUTE,
    keyPrefix: "rtCreateFeed"
  });
  const exceptionLayer = new ExceptionLayer({ name: "create-feed" });
  ctx.logger.info(`[${yellow("CreateFeedController")}] dependencies initialized`);
  return [limiter, auth, exceptionLayer.catch(controller.handle.bind(controller))];
}
