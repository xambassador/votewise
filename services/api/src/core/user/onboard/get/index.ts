import { yellow } from "chalk";

import { AppContext } from "@/context";
import { authMiddlewareFactory } from "@/http/middlewares/auth";
import { ExceptionLayer } from "@/lib/exception-layer";

import { Controller } from "./controller";

export function getOnboardStatusControllerFactory() {
  const ctx = AppContext.getInjectionTokens(["assert", "repositories", "logger", "sessionManager"]);
  const controller = new Controller({
    userRepository: ctx.repositories.user,
    sessionManager: ctx.sessionManager,
    assert: ctx.assert
  });
  const auth = authMiddlewareFactory();
  const exceptionLayer = new ExceptionLayer({ name: "get-onboard-status" });
  ctx.logger.info(`[${yellow("GetOnboardStatusController")}] dependencies initialized`);
  return [auth, exceptionLayer.catch(controller.handle.bind(controller))];
}
