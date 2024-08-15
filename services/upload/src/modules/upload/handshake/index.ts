import type { AppContext } from "@/context";

import { ExceptionLayer } from "@/lib/exception-layer";

import { Controller } from "./controller";
import { HandshakeFilters } from "./filter";

export function handshakeControllerFactory(ctx: AppContext) {
  const controller = new Controller({ ctx, filters: new HandshakeFilters() });
  const exceptionLayer = new ExceptionLayer({ ctx, name: "handshake" });
  return exceptionLayer.catch(controller.handle.bind(controller));
}
