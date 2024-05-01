import pingController from "@/server/controllers/ping";

import { PING } from "@/config/routes";

import Router from "@votewise/router";

const router = new Router();

router.get(PING, pingController);

export default router;
