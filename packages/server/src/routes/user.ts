/**
 * @file: user.ts
 * @description: Contains all users related routes
 */
import { Router } from "express";

import { CHECK_USERNAME_AVAILABILITY_V1, GET_ME_V1, GET_POSTS_V1 } from "@/src/configs";
import { checkUsernameAvailability, getMyDetails } from "@/src/controllers/user";

import authorizationMiddleware from "../middlewares/auth";
import onboardedMiddleware from "../middlewares/onboarded";

const router = Router();

router.get(CHECK_USERNAME_AVAILABILITY_V1, checkUsernameAvailability);
router.get(GET_POSTS_V1, onboardedMiddleware, (req, res) => {
  return res.status(200).json({ message: "Get all posts of user" });
});
router.get(GET_ME_V1, authorizationMiddleware, onboardedMiddleware, getMyDetails);

export default router;
