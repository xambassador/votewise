import { AppContext } from "@/context";
import { ExceptionLayer } from "@/lib/exception-layer";

import { Controller } from "./controller";

export function getAvatarsControllerFactory() {
  const ctx = AppContext.instance;
  const controller = new Controller({ ctx });
  const exceptionLayer = new ExceptionLayer({ ctx, name: "get-avatars" });
  return exceptionLayer.catch(controller.handle.bind(controller));
}
