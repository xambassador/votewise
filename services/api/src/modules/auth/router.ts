import type { AppContext } from "@/http/context";

import { Router } from "express";

import { ExceptionLayer } from "@/lib/exception-layer";

import { createRegisterController } from "./register";

const routes = {
  register: "/api/v1/auth/register"
};

export function createAuthRouter(ctx: AppContext): Router {
  const router = Router();
  const authExceptionLayer = new ExceptionLayer({ ctx, name: "auth" });
  const registerController = createRegisterController(ctx);
  router.post(routes.register, authExceptionLayer.cactchException(registerController.handle.bind(registerController)));
  return router;
}
