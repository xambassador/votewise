import { yellow } from "chalk";

import { AppContext } from "@/context";
import { twoFactorAuthMiddlewareFactory } from "@/http/middlewares/2fa";
import { authMiddlewareFactory } from "@/http/middlewares/auth";
import { ExceptionLayer } from "@/lib/exception-layer";

import { Controller } from "./controller";

export function markReadNotificationControllerFactory() {
  const ctx = AppContext.getInjectionTokens(["assert", "repositories", "logger"]);
  const controller = new Controller({
    assert: ctx.assert,
    notificationRepository: ctx.repositories.notification
  });
  const auth = authMiddlewareFactory();
  const mfa = twoFactorAuthMiddlewareFactory();
  const exceptionLayer = new ExceptionLayer({ name: "mark-read-notification" });
  ctx.logger.info(`[${yellow("MarkReadNotificationController")}] dependencies initialized`);
  return [auth, mfa, exceptionLayer.catch(controller.handle.bind(controller))];
}
