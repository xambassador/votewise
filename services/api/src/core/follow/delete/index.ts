import { yellow } from "chalk";

import { AppContext } from "@/context";
import { authMiddlewareFactory } from "@/http/middlewares/auth";
import { ExceptionLayer } from "@/lib/exception-layer";

import { Controller } from "./controller";

export function deleteFollowControllerFactory() {
  const ctx = AppContext.getInjectionTokens(["assert", "repositories", "logger"]);
  const controller = new Controller({
    assert: ctx.assert,
    followRepository: ctx.repositories.follow,
    userRepository: ctx.repositories.user
  });
  const auth = authMiddlewareFactory();
  const exceptionLayer = new ExceptionLayer({ name: "delete-follow" });
  ctx.logger.info(`[${yellow("DeleteFollowController")}] dependencies initialized`);
  return [auth, exceptionLayer.catch(controller.handle.bind(controller))];
}
