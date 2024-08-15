import type { AppContext } from "@/context";

import { Router } from "express";

import { registerControllerFactory } from "./auth/register";

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
  return router;
}
