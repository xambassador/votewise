import { yellow } from "chalk";

import { AppContext } from "@/context";
import { authMiddlewareFactory } from "@/http/middlewares/auth";
import { ExceptionLayer } from "@/lib/exception-layer";

import { Controller } from "./controller";

export function createFeedControllerFactory() {
  const ctx = AppContext.getInjectionTokens(["repositories", "plugins", "logger", "assert"]);
  const controller = new Controller({
    feedRepository: ctx.repositories.feed,
    requestParser: ctx.plugins.requestParser,
    timelineRepository: ctx.repositories.timeline,
    followRepository: ctx.repositories.follow,
    feedAsset: ctx.repositories.feedAsset,
    postTopicRepository: ctx.repositories.postTopic,
    topicRepository: ctx.repositories.topic,
    assert: ctx.assert
  });
  const auth = authMiddlewareFactory();
  const exceptionLayer = new ExceptionLayer({ name: "create-feed" });
  ctx.logger.info(`[${yellow("CreateFeedController")}] dependencies initialized`);
  return [auth, exceptionLayer.catch(controller.handle.bind(controller))];
}
