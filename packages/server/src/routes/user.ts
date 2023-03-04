/**
 * @file: user.ts
 * @description: Contains all users related routes
 */
import { Router } from "express";

import {
  CHECK_USERNAME_AVAILABILITY_V1,
  DELETE_POST_V1,
  GET_ME_V1,
  USER_CREATE_POST_V1,
  USER_GET_POSTS_V1,
  USER_UPDATE_POST_V1,
} from "@/src/configs";
import {
  checkUsernameAvailability,
  createPost,
  deleteMyPost,
  getMyDetails,
  getMyPosts,
  updateMyPost,
} from "@/src/controllers/user";

import authorizationMiddleware from "../middlewares/auth";
import onboardedMiddleware from "../middlewares/onboarded";

const router = Router();

router.get(CHECK_USERNAME_AVAILABILITY_V1, checkUsernameAvailability);
router.get(USER_GET_POSTS_V1, authorizationMiddleware, onboardedMiddleware, getMyPosts);
router.get(GET_ME_V1, authorizationMiddleware, onboardedMiddleware, getMyDetails);

router.post(USER_CREATE_POST_V1, authorizationMiddleware, onboardedMiddleware, createPost);
router.patch(USER_UPDATE_POST_V1, authorizationMiddleware, onboardedMiddleware, updateMyPost);

router.delete(DELETE_POST_V1, authorizationMiddleware, onboardedMiddleware, deleteMyPost);

export default router;
