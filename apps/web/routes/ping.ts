import pingController from "@/server/controllers/ping";

import Router from "./Router";

const router = new Router();

router.get("/api/ping", pingController);

export default router;
