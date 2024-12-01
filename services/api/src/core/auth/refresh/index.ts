import { AppContext } from "@/context";
import { ExceptionLayer } from "@/lib/exception-layer";

import { Controller } from "./controller";

export function refreshControllerFactory() {
  const ctx = AppContext.getInjectionTokens(["assert", "repositories", "sessionManager", "jwtService", "plugins"]);
  const controller = new Controller({
    assert: ctx.assert,
    useRepository: ctx.repositories.user,
    sessionManager: ctx.sessionManager,
    requestParser: ctx.plugins.requestParser,
    jwtService: ctx.jwtService,
    refreshTokensRepository: ctx.repositories.refreshToken
  });
  const exceptionLayer = new ExceptionLayer({ name: "refresh" });
  return exceptionLayer.catch(controller.handle.bind(controller));
}
