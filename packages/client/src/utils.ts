export const env = {
  API_URL: process.env.VOTEWISE_API_URL || ""
};

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
