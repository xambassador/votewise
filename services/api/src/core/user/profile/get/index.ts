import { yellow } from "chalk";

import { AppContext } from "@/context";
import { authMiddlewareFactory } from "@/http/middlewares/auth";
import { ExceptionLayer } from "@/lib/exception-layer";

import { Controller } from "./controller";

export function getUserProfileControllerFactory() {
  const ctx = AppContext.getInjectionTokens(["assert", "repositories", "services", "logger"]);
  const controller = new Controller({
    assert: ctx.assert,
    bucketService: ctx.services.bucket,
    userRepository: ctx.repositories.user
  });
  const auth = authMiddlewareFactory();
  const exceptionLayer = new ExceptionLayer({ name: "get-profile" });
  ctx.logger.info(`[${yellow("GetUserProfileController")}] dependencies initialized`);
  return [auth, exceptionLayer.catch(controller.handle.bind(controller))];
}
