import { yellow } from "chalk";

import { AppContext } from "@/context";
import { ExceptionLayer } from "@/lib/exception-layer";

import { Controller } from "./controller";

export function statusControllerFactory() {
  const ctx = AppContext.instance;
  const controller = new Controller({ ctx });
  const exceptionLayer = new ExceptionLayer({ ctx, name: "status" });
  ctx.logger.info(`[${yellow("StatusController")}] dependencies initialized`);
  return exceptionLayer.catch(controller.handle.bind(controller));
}
