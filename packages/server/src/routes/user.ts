/**
 * @file: user.ts
 * @description: Contains all users related routes
 */
import { Router } from "express";

import {
  CHECK_USERNAME_AVAILABILITY_V1,
  DELETE_POST_V1,
  GET_ME_V1,
  UPDATE_POST_STATUS_V1,
  USER_ACCEPT_REJECT_FRIEND_REQUEST_V1,
  USER_CREATE_POST_V1,
  USER_FOLLOW_USER_V1,
  USER_GET_COMMENTS_V1,
  USER_GET_FOLLOWERS_V1,
  USER_GET_FOLLOWING_V1,
  USER_GET_FRIENDS_V1,
  USER_GET_FRIEND_REQUESTS_V1,
  USER_GET_GROUPS_REQUESTED_V1,
  USER_GET_GROUPS_V1,
  USER_GET_POSTS_V1,
  USER_SEND_FRIEND_REQUEST_V1,
  USER_UNFOLLOW_USER_V1,
  USER_UPDATE_POST_V1,
  USER_UPDATE_PROFILE_V1,
} from "@votewise/lib";

import {
  acceptOrRejectFriendRequest,
  addFriend,
  checkUsernameAvailability,
  createPost,
  deleteMyPost,
  getAllMyGroups,
  getMyComments,
  getMyDetails,
  getMyFollowers,
  getMyFollowings,
  getMyFriendRequests,
  getMyFriends,
  getMyPosts,
  getRequestedGroups,
  startFollowing,
  stopFollowing,
  updateMyPost,
  updateStatus,
} from "@/src/controllers/user";
import authorizationMiddleware from "@/src/middlewares/auth";
import onboardedMiddleware from "@/src/middlewares/onboarded";

const router = Router();

router.get(CHECK_USERNAME_AVAILABILITY_V1, checkUsernameAvailability);
router.get(USER_GET_POSTS_V1, authorizationMiddleware, onboardedMiddleware, getMyPosts);
router.get(GET_ME_V1, authorizationMiddleware, getMyDetails);
router.get(USER_GET_COMMENTS_V1, authorizationMiddleware, onboardedMiddleware, getMyComments);
router.get(USER_GET_FRIENDS_V1, authorizationMiddleware, onboardedMiddleware, getMyFriends);
router.get(USER_GET_FRIEND_REQUESTS_V1, authorizationMiddleware, onboardedMiddleware, getMyFriendRequests);
router.get(USER_GET_FOLLOWERS_V1, authorizationMiddleware, onboardedMiddleware, getMyFollowers);
router.get(USER_GET_FOLLOWING_V1, authorizationMiddleware, onboardedMiddleware, getMyFollowings);
router.get(USER_GET_GROUPS_V1, authorizationMiddleware, onboardedMiddleware, getAllMyGroups);
router.get(USER_GET_GROUPS_REQUESTED_V1, authorizationMiddleware, onboardedMiddleware, getRequestedGroups);

router.post(USER_CREATE_POST_V1, authorizationMiddleware, onboardedMiddleware, createPost);
router.post(USER_SEND_FRIEND_REQUEST_V1, authorizationMiddleware, onboardedMiddleware, addFriend);
router.post(USER_FOLLOW_USER_V1, authorizationMiddleware, onboardedMiddleware, startFollowing);

router.patch(USER_UPDATE_PROFILE_V1, authorizationMiddleware, onboardedMiddleware, (req, res) => {
  res.status(200).json({ message: "This route is not implemented yet." });
});
router.patch(USER_UPDATE_POST_V1, authorizationMiddleware, onboardedMiddleware, updateMyPost);
router.patch(UPDATE_POST_STATUS_V1, authorizationMiddleware, onboardedMiddleware, updateStatus);
router.patch(
  USER_ACCEPT_REJECT_FRIEND_REQUEST_V1,
  authorizationMiddleware,
  onboardedMiddleware,
  acceptOrRejectFriendRequest
);

router.delete(DELETE_POST_V1, authorizationMiddleware, onboardedMiddleware, deleteMyPost);
router.delete(USER_UNFOLLOW_USER_V1, authorizationMiddleware, onboardedMiddleware, stopFollowing);

export default router;
