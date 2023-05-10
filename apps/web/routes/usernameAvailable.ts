import { USERNAME_AVAILABLE } from "@/config/routes";

import Router from "@votewise/router";

import usernameAvailable from "@/server/controllers/usernameAvailable";

const router = new Router();

router.get(USERNAME_AVAILABLE, usernameAvailable);

export default router;
