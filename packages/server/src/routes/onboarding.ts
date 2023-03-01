/**
 * @file: onboarding.ts
 * @description: Onboarding routes.
 */
import { Router } from "express";

import { ONBOARDING_STATUS_V1, ONBOARDING_UPDATE_V1 } from "@/src/configs";
import { onboardUser, onboardingStatus } from "@/src/controllers";
import authorizationMiddleware from "@/src/middlewares/auth";

const router = Router();

router.get(ONBOARDING_STATUS_V1, authorizationMiddleware, onboardingStatus);
router.patch(ONBOARDING_UPDATE_V1, authorizationMiddleware, onboardUser);

export default router;
