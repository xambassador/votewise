import { yellow } from "chalk";

import { AppContext } from "@/context";
import { authMiddlewareFactory } from "@/http/middlewares/auth";
import { ExceptionLayer } from "@/lib/exception-layer";

import { Controller } from "./controller";

export function listSessionsControllerFactory() {
  const { services, logger } = AppContext.getInjectionTokens(["services", "logger"]);
  const controller = new Controller({ sessionManager: services.session });
  const auth = authMiddlewareFactory();
  const exceptionLayer = new ExceptionLayer({ name: "list-sessions" });
  logger.info(`[${yellow("ListSessionsController")}] dependencies initialized`);
  return [auth, exceptionLayer.catch(controller.handle.bind(controller))];
}
