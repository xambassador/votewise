import { ONBOARDING } from "@/config/routes";

import Router from "@votewise/router";

import onboarding from "@/server/controllers/onboarding";

const router = new Router();

router.post(ONBOARDING, onboarding);

export default router;
