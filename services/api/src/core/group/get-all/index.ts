import { yellow } from "chalk";

import { AppContext } from "@/context";
import { authMiddlewareFactory } from "@/http/middlewares/auth";
import { ExceptionLayer } from "@/lib/exception-layer";

import { Controller } from "./controller";

export function getAllGroupsControllerFactory() {
  const ctx = AppContext.getInjectionTokens(["assert", "services", "repositories", "logger"]);
  const controller = new Controller({
    assert: ctx.assert,
    bucketService: ctx.services.bucket,
    groupRepository: ctx.repositories.group
  });
  const auth = authMiddlewareFactory();
  const exceptionLayer = new ExceptionLayer({ name: "get-all-groups" });
  ctx.logger.info(`[${yellow("GetAllGroupsController")}] dependencies initialized`);
  return [auth, exceptionLayer.catch(controller.handle.bind(controller))];
}
