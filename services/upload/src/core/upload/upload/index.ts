import { yellow } from "chalk";

import { AppContext } from "@/context";
import { ExceptionLayer } from "@/lib/exception-layer";

import { Controller } from "./controller";

export function uploadControllerFactory() {
  const ctx = AppContext.instance;
  const controller = new Controller({ ctx });
  const exceptionLayer = new ExceptionLayer({ ctx, name: "upload" });
  ctx.logger.info(`[${yellow("UploadController")}] dependencies initialized`);
  return exceptionLayer.catch(controller.handle.bind(controller));
}
