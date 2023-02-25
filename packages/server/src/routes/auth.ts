/**
 * @file: auth.ts
 * @description: Authentication routes
 */
import { Router } from "express";

import { REGISTER_USER_V1, LOGIN_USER_V1 } from "../configs";
import { register } from "../controllers";

const router = Router();

router.post(REGISTER_USER_V1, register);

router.post(LOGIN_USER_V1, (req, res) => {
  res.status(200).json({
    message: "Login route is not implemented yet.",
    error: null,
    success: true,
  });
});

export default router;
