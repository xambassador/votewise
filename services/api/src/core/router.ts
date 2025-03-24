import { Router } from "express";

import { authMiddlewareFactory } from "@/http/middlewares/auth";

import { forgotPasswordControllerFactory } from "./auth/forgot-password";
import { getVerificationSessionControllerFactory } from "./auth/get-verification-session";
import { logoutControllerFactory } from "./auth/logout";
import { challengeMFAControllerFactory } from "./auth/mfa/challenge";
import { enrollMFAControllerFactory } from "./auth/mfa/enroll";
import { verifyChallangeControllerFactory } from "./auth/mfa/verify";
import { refreshControllerFactory } from "./auth/refresh";
import { registerControllerFactory } from "./auth/register";
import { resetPasswordControllerFactory } from "./auth/reset-password";
import { singinControllerFactory } from "./auth/signin";
import { verifyControllerFactory } from "./auth/verify";
import { getAllTopicsControllerFactory } from "./topics/get-all";
import { getUsernameExistsControllerFactory } from "./user/exists";
import { onboardControllerFactory } from "./user/onboard";
import { getOnboardStatusControllerFactory } from "./user/onboard/get";
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

  router.post(path + "/auth/register", registerControllerFactory());
  router.patch(path + "/auth/verify", verifyControllerFactory());
  router.post(path + "/auth/signin", singinControllerFactory());
  router.post(path + "/auth/refresh", refreshControllerFactory());
  router.post(path + "/auth/forgot-password", forgotPasswordControllerFactory());
  router.patch(path + "/auth/reset-password", resetPasswordControllerFactory());
  router.delete(path + "/auth/logout", auth, logoutControllerFactory());
  router.post(path + "/auth/factors/enroll", auth, enrollMFAControllerFactory());
  router.post(path + "/auth/factors/:factor_id/challenge", auth, challengeMFAControllerFactory());
  router.post(path + "/auth/factors/:factor_id/verify", auth, verifyChallangeControllerFactory());
  router.get(path + "/auth/verify/:email", getVerificationSessionControllerFactory());
  router.get(path + "/users/sessions", auth, listSessionsControllerFactory());
  router.patch(path + "/users/:user_id/onboard", auth, onboardControllerFactory());
  router.get(path + "/users/:user_id/onboard", auth, getOnboardStatusControllerFactory());
  router.get(path + "/users/:username/exists", auth, getUsernameExistsControllerFactory());
  router.get(path + "/topics", getAllTopicsControllerFactory());

  return router;
}
