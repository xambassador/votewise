import type { AppContext } from "@/context";

import { ExceptionLayer } from "@/lib/exception-layer";

import { Controller } from "./controller";
import { Service } from "./service";

export function handshakeControllerFactory(ctx: AppContext) {
  const service = new Service(ctx);
  const controller = new Controller({ service });
  const exceptionLayer = new ExceptionLayer({ ctx, name: "handshake" });
  return exceptionLayer.catch(controller.handle.bind(controller));
}
