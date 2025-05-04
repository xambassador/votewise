import { yellow } from "chalk";

import { AppContext } from "@/context";
import { authMiddlewareFactory } from "@/http/middlewares/auth";
import { ExceptionLayer } from "@/lib/exception-layer";

import { Controller } from "./controller";

export function getOnboardSessionControllerFactory() {
  const ctx = AppContext.getInjectionTokens(["assert", "repositories", "logger", "cache", "minio", "onboardService"]);
  const controller = new Controller({ onboardService: ctx.onboardService });
  const auth = authMiddlewareFactory();
  const exceptionLayer = new ExceptionLayer({ name: "get-onboard-session" });
  ctx.logger.info(`[${yellow("GetOnboardSessionController")}] dependencies initialized`);
  return [auth, exceptionLayer.catch(controller.handle.bind(controller))];
}
