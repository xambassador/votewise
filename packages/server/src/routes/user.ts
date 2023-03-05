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
  USER_GET_COMMENTS_V1,
  USER_GET_FRIENDS_V1,
  USER_GET_FRIEND_REQUESTS_V1,
  USER_GET_POSTS_V1,
  USER_SEND_FRIEND_REQUEST_V1,
  USER_UPDATE_POST_V1,
} from "@/src/configs";
import {
  acceptOrRejectFriendRequest,
  addFriend,
  checkUsernameAvailability,
  createPost,
  deleteMyPost,
  getMyComments,
  getMyDetails,
  getMyFriendRequests,
  getMyFriends,
  getMyPosts,
  updateMyPost,
  updateStatus,
} from "@/src/controllers/user";

import authorizationMiddleware from "../middlewares/auth";
import onboardedMiddleware from "../middlewares/onboarded";

const router = Router();

router.get(CHECK_USERNAME_AVAILABILITY_V1, checkUsernameAvailability);
router.get(USER_GET_POSTS_V1, authorizationMiddleware, onboardedMiddleware, getMyPosts);
router.get(GET_ME_V1, authorizationMiddleware, onboardedMiddleware, getMyDetails);
router.get(USER_GET_COMMENTS_V1, authorizationMiddleware, onboardedMiddleware, getMyComments);
router.get(USER_GET_FRIENDS_V1, authorizationMiddleware, onboardedMiddleware, getMyFriends);
router.get(USER_GET_FRIEND_REQUESTS_V1, authorizationMiddleware, onboardedMiddleware, getMyFriendRequests);

router.post(USER_CREATE_POST_V1, authorizationMiddleware, onboardedMiddleware, createPost);
router.post(USER_SEND_FRIEND_REQUEST_V1, authorizationMiddleware, onboardedMiddleware, addFriend);

router.patch(USER_UPDATE_POST_V1, authorizationMiddleware, onboardedMiddleware, updateMyPost);
router.patch(UPDATE_POST_STATUS_V1, authorizationMiddleware, onboardedMiddleware, updateStatus);
router.patch(
  USER_ACCEPT_REJECT_FRIEND_REQUEST_V1,
  authorizationMiddleware,
  onboardedMiddleware,
  acceptOrRejectFriendRequest
);

router.delete(DELETE_POST_V1, authorizationMiddleware, onboardedMiddleware, deleteMyPost);

export default router;
