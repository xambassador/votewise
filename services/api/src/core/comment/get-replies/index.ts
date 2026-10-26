import { yellow } from "chalk";

import { AppContext } from "@/context";
import { twoFactorAuthMiddlewareFactory } from "@/http/middlewares/2fa";
import { authMiddlewareFactory } from "@/http/middlewares/auth";
import { ExceptionLayer } from "@/lib/exception-layer";

import { Controller } from "./controller";

export function getRepliesControllerFactory() {
  const ctx = AppContext.instance;
  const controller = new Controller(ctx);
  const auth = authMiddlewareFactory();
  const mfa = twoFactorAuthMiddlewareFactory();
  const exceptionLayer = new ExceptionLayer({ name: "get-replies" });
  ctx.logger.info(`[${yellow("GetRepliesController")}] dependencies initialized`);
  return [auth, mfa, exceptionLayer.catch(controller.handle.bind(controller))];
}
