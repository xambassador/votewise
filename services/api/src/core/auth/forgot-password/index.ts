import { AppContext } from "@/context";
import { ExceptionLayer } from "@/lib/exception-layer";

import { Controller } from "./controller";

export function forgotPasswordControllerFactory() {
  const ctx = AppContext.getInjectionTokens([
    "assert",
    "repositories",
    "cryptoService",
    "jwtService",
    "queues",
    "config",
    "plugins",
    "sessionManager"
  ]);
  const controller = new Controller({
    assert: ctx.assert,
    userRepository: ctx.repositories.user,
    cryptoService: ctx.cryptoService,
    jwtService: ctx.jwtService,
    tasksQueue: ctx.queues.tasksQueue,
    appUrl: ctx.config.appUrl,
    requestParser: ctx.plugins.requestParser,
    sessionManager: ctx.sessionManager
  });
  const exceptionLayer = new ExceptionLayer({ name: "forgot-password" });
  return exceptionLayer.catch(controller.handle.bind(controller));
}
