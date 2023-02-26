/**
 * @file: auth.ts
 * @description: Authentication routes
 */
import { Router } from "express";

import { REGISTER_USER_V1, LOGIN_USER_V1, REVOKE_ACCESS_TOKEN_V1 } from "../configs";
import { register, login, refreshAccessToken } from "../controllers";

const router = Router();

router.post(REGISTER_USER_V1, register);
router.post(LOGIN_USER_V1, login);
router.post(REVOKE_ACCESS_TOKEN_V1, refreshAccessToken);

export default router;
