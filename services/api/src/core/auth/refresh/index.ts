import type { AppContext } from "@/context";

import { ExceptionLayer } from "@/lib/exception-layer";

import { Controller } from "./controller";

export function refreshControllerFactory(ctx: AppContext) {
  const controller = new Controller({
    assert: ctx.assert,
    useRepository: ctx.repositories.user,
    sessionManager: ctx.sessionManager,
    requestParser: ctx.plugins.requestParser,
    jwtPlugin: ctx.plugins.jwt
  });
  const exceptionLayer = new ExceptionLayer({ name: "refresh", ctx });
  return exceptionLayer.catch(controller.handle.bind(controller));
}
