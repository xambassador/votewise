import { AppContext } from "@/context";
import { ExceptionLayer } from "@/lib/exception-layer";

import { Controller } from "./controller";
import { UserRegisterService } from "./service";

export function registerControllerFactory() {
  const ctx = AppContext.getInjectionTokens(["repositories", "assert", "queues", "cache", "cryptoService", "plugins"]);
  const service = new UserRegisterService({
    cache: ctx.cache,
    cryptoService: ctx.cryptoService,
    tasksQueue: ctx.queues.tasksQueue
  });
  const controller = new Controller({
    userRepository: ctx.repositories.user,
    assert: ctx.assert,
    cryptoService: ctx.cryptoService,
    requestParser: ctx.plugins.requestParser,
    userRegisterService: service
  });
  const exceptionLayer = new ExceptionLayer({ name: "register" });
  return exceptionLayer.catch(controller.handle.bind(controller));
}
