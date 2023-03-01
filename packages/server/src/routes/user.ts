/**
 * @file: user.ts
 * @description: Contains all users related routes
 */
import { Router } from "express";

import { CHECK_USERNAME_AVAILABILITY_V1, GET_POSTS_V1 } from "@/src/configs";
import { checkUsernameAvailability } from "@/src/controllers/user";

const router = Router();

router.get(CHECK_USERNAME_AVAILABILITY_V1, checkUsernameAvailability);
router.get(GET_POSTS_V1, checkUsernameAvailability);

export default router;
