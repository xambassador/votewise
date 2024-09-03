import type { AppContext } from "@/context";

import { ExceptionLayer } from "@/lib/exception-layer";

import { Controller } from "./controller";

export function logoutControllerFactory(ctx: AppContext) {
  const controller = new Controller({ sessionManager: ctx.sessionManager, assert: ctx.assert });
  const exceptionLayer = new ExceptionLayer({ ctx, name: "logout" });
  return exceptionLayer.catch(controller.handle.bind(controller));
}
