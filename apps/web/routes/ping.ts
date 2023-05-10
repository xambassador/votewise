import { PING } from "@/config/routes";

import Router from "@votewise/router";

import pingController from "@/server/controllers/ping";

const router = new Router();

router.get(PING, pingController);

export default router;
