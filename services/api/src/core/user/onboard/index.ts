import { yellow } from "chalk";

import { AppContext } from "@/context";
import { authMiddlewareFactory } from "@/http/middlewares/auth";
import { ExceptionLayer } from "@/lib/exception-layer";

import { Controller } from "./controller";

export function onboardControllerFactory() {
  const ctx = AppContext.getInjectionTokens(["assert", "repositories", "plugins", "queues", "config", "logger"]);
  const controller = new Controller({
    assert: ctx.assert,
    requestParser: ctx.plugins.requestParser,
    userRepository: ctx.repositories.user,
    userInterestRepository: ctx.repositories.userInterest,
    taskQueue: ctx.queues.tasksQueue,
    appUrl: ctx.config.appUrl
  });
  const auth = authMiddlewareFactory();
  const exceptionLayer = new ExceptionLayer({ name: "onboard" });
  ctx.logger.info(`[${yellow("OnboardController")}] dependencies initialized`);
  return [auth, exceptionLayer.catch(controller.handle.bind(controller))];
}
