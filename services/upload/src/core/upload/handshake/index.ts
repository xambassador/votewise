import { AppContext } from "@/context";
import { ExceptionLayer } from "@/lib/exception-layer";

import { Controller } from "./controller";

export function handshakeControllerFactory() {
  const ctx = AppContext.instance;
  const controller = new Controller({ ctx });
  const exceptionLayer = new ExceptionLayer({ ctx, name: "handshake" });
  return exceptionLayer.catch(controller.handle.bind(controller));
}
