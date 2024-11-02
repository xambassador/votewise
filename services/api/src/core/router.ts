import { Router } from "express";

import { twoFactorAuthMiddlewareFactory } from "@/http/middlewares/2fa";
import { authMiddlewareFactory } from "@/http/middlewares/auth";

import { disable2FAControllerFactory } from "./auth/2fa/disable";
import { enable2FAControllerFactory } from "./auth/2fa/enable";
import { generate2FAControllerFactory } from "./auth/2fa/generate";
import { verify2FAControllerFactory } from "./auth/2fa/verify";
import { forgotPasswordControllerFactory } from "./auth/forgot-password";
import { logoutControllerFactory } from "./auth/logout";
import { refreshControllerFactory } from "./auth/refresh";
import { registerControllerFactory } from "./auth/register";
import { resetPasswordControllerFactory } from "./auth/reset-password";
import { singinControllerFactory } from "./auth/signin";
import { verifyControllerFactory } from "./auth/verify";
import { listSessionsControllerFactory } from "./user/sessions/list";

/**
 * Factory function to create an application router for the specified base path.
 *
 * @default basePath "/api"
 * @param {string} basePath - The base path for the router.
 * @returns {Router} - Express router
 */
export function moduleRouterFactory(basePath: string): Router {
  const router = Router();
  const path = basePath + "/v1";
  const auth = authMiddlewareFactory();
  const twoFactorAuth = twoFactorAuthMiddlewareFactory();

  router.post(path + "/auth/register", registerControllerFactory());
  router.patch(path + "/auth/verify", verifyControllerFactory());
  router.post(path + "/auth/signin", singinControllerFactory());
  router.post(path + "/auth/refresh", refreshControllerFactory());
  router.post(path + "/auth/forgot-password", forgotPasswordControllerFactory());
  router.patch(path + "/auth/reset-password", resetPasswordControllerFactory());
  router.delete(path + "/auth/logout", auth, logoutControllerFactory());
  router.get(path + "/user/sessions", auth, listSessionsControllerFactory());
  router.get(path + "/auth/2fa/generate", auth, generate2FAControllerFactory());
  router.post(path + "/auth/2fa/enable", auth, enable2FAControllerFactory());
  router.post(path + "/auth/2fa/verify", auth, verify2FAControllerFactory());
  router.post(path + "/auth/2fa/disable", auth, twoFactorAuth, disable2FAControllerFactory());

  return router;
}
