import { yellow } from "chalk";

import { AppContext } from "@/context";
import { authMiddlewareFactory } from "@/http/middlewares/auth";
import { ExceptionLayer } from "@/lib/exception-layer";

import { Controller } from "./controller";

export function serveImageControllerFactory() {
  const ctx = AppContext.instance;
  const controller = new Controller({ ctx });
  const auth = authMiddlewareFactory();
  const exceptionLayer = new ExceptionLayer({ ctx, name: "serve-image" });
  ctx.logger.info(`[${yellow("ServeImageController")}] dependencies initialized`);
  return [auth, exceptionLayer.catch(controller.handle.bind(controller))];
}
