import type { AppContext } from "@/context";

import { ExceptionLayer } from "@/lib/exception-layer";

import { Controller } from "./controller";

export function registerControllerFactory(ctx: AppContext) {
  const controller = new Controller({
    userRepository: ctx.repositories.user,
    assert: ctx.assert,
    tasksQueue: ctx.queues.tasksQueue,
    cache: ctx.cache,
    cryptoService: ctx.cryptoService,
    requestParser: ctx.plugins.requestParser
  });
  const exceptionLayer = new ExceptionLayer({ ctx, name: "register" });
  return exceptionLayer.catch(controller.handle.bind(controller));
}
