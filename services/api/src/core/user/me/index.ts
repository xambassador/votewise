import { yellow } from "chalk";

import { AppContext } from "@/context";
import { authMiddlewareFactory } from "@/http/middlewares/auth";
import { ExceptionLayer } from "@/lib/exception-layer";

import { Controller } from "./controller";

export function getMeControllerFactory() {
  const ctx = AppContext.getInjectionTokens(["assert", "repositories", "bucketService", "logger"]);
  const controller = new Controller({
    assert: ctx.assert,
    bucketService: ctx.bucketService,
    userRepository: ctx.repositories.user
  });
  const auth = authMiddlewareFactory();
  const exceptionLayer = new ExceptionLayer({ name: "get-me" });
  ctx.logger.info(`[${yellow("GetMeController")}] dependencies initialized`);
  return [auth, exceptionLayer.catch(controller.handle.bind(controller))];
}
