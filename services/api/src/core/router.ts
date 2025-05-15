import { Router } from "express";

import { auth, feeds, topics, user } from "@votewise/constant/routes";

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
import { createFeedControllerFactory } from "./feed/create";
import { getAllFeedControllerFactory } from "./feed/get-all";
import { getGroupRecommendationsControllerFactory } from "./recommendation/group";
import { getRecommendateUserControllerFactory } from "./recommendation/user";
import { getAllTopicsControllerFactory } from "./topics/get-all";
import { getUsernameExistsControllerFactory } from "./user/exists";
import { getMeControllerFactory } from "./user/me";
import { onboardControllerFactory } from "./user/onboard";
import { getOnboardStatusControllerFactory } from "./user/onboard/get";
import { getOnboardSessionControllerFactory } from "./user/onboard/get-session";
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

  router.post(auth.paths.register(path), ...registerControllerFactory(auth.paths.register(path)));
  router.patch(auth.paths.verify(path), ...verifyControllerFactory());
  router.post(auth.paths.signin(path), ...singinControllerFactory(auth.paths.signin(path)));
  router.post(auth.paths.refresh(path), ...refreshControllerFactory());
  router.post(auth.paths.forgotPassword(path), ...forgotPasswordControllerFactory(auth.paths.forgotPassword(path)));
  router.patch(auth.paths.resetPassword(path), ...resetPasswordControllerFactory(auth.paths.resetPassword(path)));
  router.delete(auth.paths.logout(path), ...logoutControllerFactory());
  router.post(auth.paths.factors.enroll(path), ...enrollMFAControllerFactory());
  router.post(auth.paths.factors.challengeFactor(path), ...challengeMFAControllerFactory());
  router.post(auth.paths.factors.verifyFactor(path), ...verifyChallangeControllerFactory());
  router.get(auth.paths.emailVerificationSession(path), ...getVerificationSessionControllerFactory());
  router.get(user.paths.sessions(path), ...listSessionsControllerFactory());
  router.patch(user.paths.onboard.update(path), ...onboardControllerFactory());
  router.get(user.paths.onboard.getStatus(path), ...getOnboardStatusControllerFactory());
  router.get(user.paths.onboard.getOnboardSession(path), ...getOnboardSessionControllerFactory());
  router.get(user.paths.usernameExists(path), ...getUsernameExistsControllerFactory());
  router.get(user.paths.me.get(path), ...getMeControllerFactory());
  router.get(user.paths.recommendations.get(path), ...getRecommendateUserControllerFactory());
  router.get(user.paths.recommendations.getGroupRecommendations(path), ...getGroupRecommendationsControllerFactory());
  router.get(topics.paths.all(path), ...getAllTopicsControllerFactory());
  router.post(feeds.paths.create(path), ...createFeedControllerFactory());
  router.get(feeds.paths.all(path), ...getAllFeedControllerFactory());

  return router;
}
