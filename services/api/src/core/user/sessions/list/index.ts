import { AppContext } from "@/context";
import { ExceptionLayer } from "@/lib/exception-layer";

import { Controller } from "./controller";

export function listSessionsControllerFactory() {
  const sessionManager = AppContext.getInjectionToken("sessionManager");
  const controller = new Controller({ sessionManager });
  const exceptionLayer = new ExceptionLayer({ name: "list-sessions" });
  return exceptionLayer.catch(controller.handle.bind(controller));
}
