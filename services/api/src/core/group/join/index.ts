import { yellow } from "chalk";

import { AppContext } from "@/context";
import { authMiddlewareFactory } from "@/http/middlewares/auth";
import { ExceptionLayer } from "@/lib/exception-layer";

import { Controller } from "./controller";

export function joinGroupControllerFactory() {
  const ctx = AppContext.getInjectionTokens(["assert", "repositories", "logger"]);
  const controller = new Controller({ assert: ctx.assert, groupRepository: ctx.repositories.group });
  const auth = authMiddlewareFactory();
  const exceptionLayer = new ExceptionLayer({ name: "join-group" });
  ctx.logger.info(`[${yellow("JoinGroupController")}] dependencies initialized`);
  return [auth, exceptionLayer.catch(controller.handle.bind(controller))];
}
