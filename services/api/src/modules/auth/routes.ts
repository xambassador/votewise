import { Router } from "express";

import { signupController } from "@/modules/auth/actions";

const router = Router();

router.post("/signup", (req, res) => signupController.handle(req, res));

export default router;
