import type { AppContext } from "@/context";

import { ExceptionLayer } from "@/lib/exception-layer";

import { Controller } from "./controller";
import { Filters } from "./filter";

export function forgotPasswordControllerFactory(ctx: AppContext) {
  const filters = new Filters();
  const controller = new Controller({
    filters,
    assert: ctx.assert,
    userRepository: ctx.repositories.user,
    cryptoService: ctx.cryptoService,
    jwtService: ctx.jwtService,
    tasksQueue: ctx.queues.tasksQueue,
    appUrl: ctx.config.appUrl
  });
  const exceptionLayer = new ExceptionLayer({ name: "forgot-password", ctx });
  return exceptionLayer.catch(controller.handle.bind(controller));
}
