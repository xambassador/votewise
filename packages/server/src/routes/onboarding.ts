/**
 * @file: onboarding.ts
 * @description: Onboarding routes.
 */
import { Router } from "express";

import { ONBOARDING_UPDATE_V1, ONBOARDING_STATUS_V1 } from "../configs";
import { onboardingStatus, onboardUser } from "../controllers";
import authMiddleware from "../middlewares/auth";

const router = Router();

router.get(ONBOARDING_STATUS_V1, authMiddleware, onboardingStatus);
router.put(ONBOARDING_UPDATE_V1, authMiddleware, onboardUser);

export default router;
