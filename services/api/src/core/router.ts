import { Router } from "express";

import { auth, comments, feeds, follow, groups, topics, user } from "@votewise/constant/routes";

import { forgotPasswordControllerFactory } from "./auth/forgot-password";
import { getVerificationSessionControllerFactory } from "./auth/get-verification-session";
import { logoutControllerFactory } from "./auth/logout";
import { challengeMFAControllerFactory } from "./auth/mfa/challenge";
import { enrollMFAControllerFactory } from "./auth/mfa/enroll";
import { verifyChallengeControllerFactory } from "./auth/mfa/verify";
import { refreshControllerFactory } from "./auth/refresh";
import { registerControllerFactory } from "./auth/register";
import { resetPasswordControllerFactory } from "./auth/reset-password";
import { singinControllerFactory } from "./auth/signin";
import { verifyControllerFactory } from "./auth/verify";
import { createCommentControllerFactory } from "./comment/create";
import { getCommentsControllerFactory } from "./comment/get-all";
import { getRepliesControllerFactory } from "./comment/get-replies";
import { updateCommentControllerFactory } from "./comment/update";
import { createFeedControllerFactory } from "./feed/create";
import { getFeedControllerFactory } from "./feed/get";
import { getAllFeedControllerFactory } from "./feed/get-all";
import { createFollowControllerFactory } from "./follow/create";
import { deleteFollowControllerFactory } from "./follow/delete";
import { createGroupControllerFactory } from "./group/create";
import { getAllGroupsControllerFactory } from "./group/get-all";
import { sendGroupInviteControllerFactory } from "./group/invite";
import { joinGroupControllerFactory } from "./group/join";
import { getMyGroupsControllerFactory } from "./group/my-groups";
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

  /* ----------------------------------------------------------------------------------------------- */
  router.get(auth.paths.emailVerificationSession(path), ...getVerificationSessionControllerFactory());
  router.get(user.paths.sessions(path), ...listSessionsControllerFactory());
  router.get(
    user.paths.onboard.getStatus(path),
    ...getOnboardStatusControllerFactory(user.paths.onboard.getStatus(path))
  );
  router.get(
    user.paths.onboard.getOnboardSession(path),
    ...getOnboardSessionControllerFactory(user.paths.onboard.getOnboardSession(path))
  );
  router.get(user.paths.usernameExists(path), ...getUsernameExistsControllerFactory(user.paths.usernameExists(path)));
  router.get(user.paths.me.get(path), ...getMeControllerFactory(user.paths.me.get(path)));
  router.get(
    user.paths.recommendations.get(path),
    ...getRecommendateUserControllerFactory(user.paths.recommendations.get(path))
  );
  router.get(
    user.paths.recommendations.getGroupRecommendations(path),
    ...getGroupRecommendationsControllerFactory(user.paths.recommendations.getGroupRecommendations(path))
  );
  router.get(topics.paths.all(path), ...getAllTopicsControllerFactory());
  router.get(feeds.paths.all(path), ...getAllFeedControllerFactory(feeds.paths.all(path)));
  router.get(feeds.paths.get(path), ...getFeedControllerFactory(feeds.paths.get(path)));
  router.get(comments.paths.getAll(path), ...getCommentsControllerFactory());
  router.get(comments.paths.getReplies(path), ...getRepliesControllerFactory());
  router.get(groups.paths.all(path), ...getAllGroupsControllerFactory());
  router.get(groups.paths.myGroups(path), ...getMyGroupsControllerFactory());

  /* ----------------------------------------------------------------------------------------------- */
  router.post(auth.paths.register(path), ...registerControllerFactory(auth.paths.register(path)));
  router.post(auth.paths.signin(path), ...singinControllerFactory(auth.paths.signin(path)));
  router.post(auth.paths.refresh(path), ...refreshControllerFactory(auth.paths.refresh(path)));
  router.post(auth.paths.forgotPassword(path), ...forgotPasswordControllerFactory(auth.paths.forgotPassword(path)));
  router.post(
    auth.paths.factors.challengeFactor(path),
    ...challengeMFAControllerFactory(auth.paths.factors.challengeFactor(path))
  );
  router.post(auth.paths.factors.enroll(path), ...enrollMFAControllerFactory(auth.paths.factors.enroll(path)));
  router.post(
    auth.paths.factors.verifyFactor(path),
    ...verifyChallengeControllerFactory(auth.paths.factors.verifyFactor(path))
  );
  router.post(feeds.paths.create(path), ...createFeedControllerFactory(feeds.paths.create(path)));
  router.post(comments.paths.create(path), ...createCommentControllerFactory(path));
  router.post(follow.paths.followUser(path), ...createFollowControllerFactory());
  router.post(groups.paths.create(path), ...createGroupControllerFactory());
  router.post(groups.paths.join(path), ...joinGroupControllerFactory());
  router.post(groups.paths.invite(path), ...sendGroupInviteControllerFactory());

  /* ----------------------------------------------------------------------------------------------- */
  router.put(comments.paths.update(path), ...updateCommentControllerFactory());

  /* ----------------------------------------------------------------------------------------------- */
  router.patch(auth.paths.verify(path), ...verifyControllerFactory(auth.paths.verify(path)));
  router.patch(auth.paths.resetPassword(path), ...resetPasswordControllerFactory(auth.paths.resetPassword(path)));
  router.patch(user.paths.onboard.update(path), ...onboardControllerFactory(user.paths.onboard.update(path)));

  /* ----------------------------------------------------------------------------------------------- */
  router.delete(auth.paths.logout(path), ...logoutControllerFactory());
  router.delete(follow.paths.unfollowUser(path), ...deleteFollowControllerFactory());

  return router;
}
