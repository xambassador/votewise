import type { AppContext } from "@/context";

import { ExceptionLayer } from "@/lib/exception-layer";

import { Controller } from "./controller";

export function listSessionsControllerFactory(ctx: AppContext) {
  const controller = new Controller({ sessionManager: ctx.sessionManager });
  const exceptionLayer = new ExceptionLayer({ name: "list-sessions", ctx });
  return exceptionLayer.catch(controller.handle.bind(controller));
}
