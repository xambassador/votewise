import { Router } from "express";

import { ONBOARDING_STATUS_V1, ONBOARDING_UPDATE_V1 } from "@votewise/lib/routes";

import { onboardingStatus, onboardUser } from "@/src/controllers";
import authorizationMiddleware from "@/src/middlewares/auth";

const router = Router();

router.get(ONBOARDING_STATUS_V1, authorizationMiddleware, onboardingStatus);
router.patch(ONBOARDING_UPDATE_V1, authorizationMiddleware, onboardUser);

export default router;
