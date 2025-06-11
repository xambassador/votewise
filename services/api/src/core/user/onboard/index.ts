import { yellow } from "chalk";

import { AppContext } from "@/context";
import { authMiddlewareFactory } from "@/http/middlewares/auth";
import { rateLimitMiddlewareFactory } from "@/http/middlewares/rate-limit";
import { ExceptionLayer } from "@/lib/exception-layer";
import { rateLimitStrategies } from "@/lib/rate-limiter";

import { Controller } from "./controller";

export function onboardControllerFactory(path: string) {
  const ctx = AppContext.getInjectionTokens([
    "assert",
    "repositories",
    "plugins",
    "queues",
    "config",
    "logger",
    "cache",
    "minio",
    "onboardService",
    "sessionManager"
  ]);
  const controller = new Controller({
    assert: ctx.assert,
    requestParser: ctx.plugins.requestParser,
    userRepository: ctx.repositories.user,
    userInterestRepository: ctx.repositories.userInterest,
    taskQueue: ctx.queues.tasksQueue,
    uploadQueue: ctx.queues.uploadQueue,
    appUrl: ctx.config.appUrl,
    avatarsBucket: ctx.config.avatarsBucket,
    backgroundsBucket: ctx.config.backgroundsBucket,
    postTopicRepository: ctx.repositories.postTopic,
    timelineRepository: ctx.repositories.timeline,
    onboardService: ctx.onboardService,
    sessionManager: ctx.sessionManager
  });
  const auth = authMiddlewareFactory();
  const limiter = rateLimitMiddlewareFactory(path, {
    ...rateLimitStrategies.FIFTEEN_PER_MINUTE,
    keyPrefix: "rtOnboard"
  });
  const exceptionLayer = new ExceptionLayer({ name: "onboard" });
  ctx.logger.info(`[${yellow("OnboardController")}] dependencies initialized`);
  return [limiter, auth, exceptionLayer.catch(controller.handle.bind(controller))];
}
