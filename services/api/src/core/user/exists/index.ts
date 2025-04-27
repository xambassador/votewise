import { AppContext } from "@/context";
import { authMiddlewareFactory } from "@/http/middlewares/auth";
import { ExceptionLayer } from "@/lib/exception-layer";

import { Controller } from "./controller";

export function getUsernameExistsControllerFactory() {
  const ctx = AppContext.getInjectionTokens(["assert", "repositories"]);
  const controller = new Controller({
    assert: ctx.assert,
    userRepository: ctx.repositories.user
  });
  const auth = authMiddlewareFactory();
  const exceptionLayer = new ExceptionLayer({ name: "get-username-exists" });
  return [auth, exceptionLayer.catch(controller.handle.bind(controller))];
}
