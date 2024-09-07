import type { AppContext } from "@/context";

import { ExceptionLayer } from "@/lib/exception-layer";

import { Controller } from "./controller";

export function verifyControllerFactory(ctx: AppContext) {
  const controller = new Controller({
    userRepository: ctx.repositories.user,
    cache: ctx.cache,
    assert: ctx.assert,
    requestParser: ctx.plugins.requestParser
  });
  const exceptionLayer = new ExceptionLayer({ name: "verify-email", ctx });
  return exceptionLayer.catch(controller.handle.bind(controller));
}
