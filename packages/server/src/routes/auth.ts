/**
 * @file: auth.ts
 * @description: Authentication routes
 */
import { Router } from "express";

import {
  FORGOT_PASSWORD_V1,
  LOGIN_USER_V1,
  REGISTER_USER_V1,
  RESEND_EMAIL_VERIFICATION_V1,
  RESET_PASSWORD_V1,
  REVOKE_ACCESS_TOKEN_V1,
  VERIFY_EMAIL_V1,
} from "@votewise/lib";

import {
  forgotPassword,
  login,
  refreshAccessToken,
  register,
  resendEmailVerification,
  resetPassword,
  verifyEmail,
} from "@/src/controllers";

const router = Router();

router.post(REGISTER_USER_V1, register);
router.patch(LOGIN_USER_V1, login);
router.patch(REVOKE_ACCESS_TOKEN_V1, refreshAccessToken);
router.post(FORGOT_PASSWORD_V1, forgotPassword);
router.patch(RESET_PASSWORD_V1, resetPassword);
router.patch(VERIFY_EMAIL_V1, verifyEmail);
router.post(RESEND_EMAIL_VERIFICATION_V1, resendEmailVerification);

export default router;
