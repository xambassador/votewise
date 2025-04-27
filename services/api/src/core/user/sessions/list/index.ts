import { AppContext } from "@/context";
import { authMiddlewareFactory } from "@/http/middlewares/auth";
import { ExceptionLayer } from "@/lib/exception-layer";

import { Controller } from "./controller";

export function listSessionsControllerFactory() {
  const sessionManager = AppContext.getInjectionToken("sessionManager");
  const controller = new Controller({ sessionManager });
  const auth = authMiddlewareFactory();
  const exceptionLayer = new ExceptionLayer({ name: "list-sessions" });
  return [auth, exceptionLayer.catch(controller.handle.bind(controller))];
}
