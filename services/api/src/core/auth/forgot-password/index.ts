import type { AppContext } from "@/context";

import { ExceptionLayer } from "@/lib/exception-layer";

import { Controller } from "./controller";

export function forgotPasswordControllerFactory(ctx: AppContext) {
  const controller = new Controller({
    assert: ctx.assert,
    userRepository: ctx.repositories.user,
    cryptoService: ctx.cryptoService,
    jwtService: ctx.jwtService,
    tasksQueue: ctx.queues.tasksQueue,
    appUrl: ctx.config.appUrl,
    requestParser: ctx.plugins.requestParser
  });
  const exceptionLayer = new ExceptionLayer({ name: "forgot-password", ctx });
  return exceptionLayer.catch(controller.handle.bind(controller));
}
