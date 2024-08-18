import type { AppContext } from "@/context";

import { Router } from "express";

import { forgotPasswordControllerFactory } from "./auth/forgot-password";
import { refreshControllerFactory } from "./auth/refresh";
import { registerControllerFactory } from "./auth/register";
import { resetPasswordControllerFactory } from "./auth/reset-password";
import { singinControllerFactory } from "./auth/signin";
import { verifyControllerFactory } from "./auth/verify";

/**
 * This function creates a router for each module in the application and returns a single router instance that
 * contains all the module routers. So, this function is the entry point for every single routes in the application.
 *
 * @param {string} basePath - The base path for the router. Default is "/api"
 * @param {AppContext} ctx - The application context
 * @returns {Router} - Express router
 */
export function moduleRouterFactory(basePath: string, ctx: AppContext) {
  const router = Router();
  const path = basePath + "/v1";
  router.post(path + "/auth/register", registerControllerFactory(ctx));
  router.patch(path + "/auth/verify", verifyControllerFactory(ctx));
  router.post(path + "/auth/signin", singinControllerFactory(ctx));
  router.post(path + "/auth/refresh", refreshControllerFactory(ctx));
  router.post(path + "/auth/forgot-password", forgotPasswordControllerFactory(ctx));
  router.patch(path + "/auth/reset-password", resetPasswordControllerFactory(ctx));
  return router;
}
