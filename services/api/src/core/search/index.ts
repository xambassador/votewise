import { yellow } from "chalk";

import { AppContext } from "@/context";
import { authMiddlewareFactory } from "@/http/middlewares/auth";
import { ExceptionLayer } from "@/lib/exception-layer";

import { Controller } from "./controller";

export function searchControllerFactory() {
  const ctx = AppContext.getInjectionTokens(["assert", "repositories", "services", "logger"]);
  const controller = new Controller({
    assert: ctx.assert,
    bucketService: ctx.services.bucket,
    searchRepository: ctx.repositories.search
  });
  const auth = authMiddlewareFactory();
  const exceptionLayer = new ExceptionLayer({ name: "search" });
  ctx.logger.info(`[${yellow("SearchController")}] dependencies initialized`);
  return [auth, exceptionLayer.catch(controller.handle.bind(controller))];
}
