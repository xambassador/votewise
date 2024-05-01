import onboarding from "@/server/controllers/onboarding";

import { ONBOARDING } from "@/config/routes";

import Router from "@votewise/router";

const router = new Router();

router.post(ONBOARDING, onboarding);

export default router;
