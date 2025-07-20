import { environment } from "@votewise/env";
import { JWT } from "@votewise/jwt";

export const COOKIE_KEYS = {
  userId: "__votewise_uid",
  verificationCode: "__votewise_vcode",
  email: "__votewise_email",
  accessToken: "__votewise_access_token",
  refreshToken: "__votewise_refresh_token",
  user: "__votewise_user",
  onboard: "__votewise_onboard",
  isOnboarded: "__votewise_is_onboarded",
  challengeId: "__votewise_challenge_id",
  factorId: "__votewise_factor_id"
};

export const jwt = new JWT({ accessTokenSecret: environment.ACCESS_TOKEN_SECRET });

if (typeof window !== "undefined") {
  throw new Error("This module should not be imported in the browser.");
}
