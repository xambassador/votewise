import { yellow } from "chalk";

import { AppContext } from "@/context";
import { authMiddlewareFactory } from "@/http/middlewares/auth";
import { ExceptionLayer } from "@/lib/exception-layer";

import { Controller } from "./controller";

export function logoutControllerFactory() {
  const ctx = AppContext.getInjectionTokens(["sessionManager", "assert", "logger"]);
  const controller = new Controller({ sessionManager: ctx.sessionManager, assert: ctx.assert });
  const auth = authMiddlewareFactory();
  const exceptionLayer = new ExceptionLayer({ name: "logout" });
  ctx.logger.info(`[${yellow("LogoutController")}] dependencies initialized`);
  return [auth, exceptionLayer.catch(controller.handle.bind(controller))];
}
