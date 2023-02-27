/**
 * @file: routes.ts
 * @description: Contains all the routes for the application
 */

// Health check routes.
export const HEALTH_ROUTE = "/api/health";
export const HEALTH_CHECK = "/health-check";
export const PING = "/ping";

// Authentication routes.
export const AUTH_ROUTE_V1 = "/api/v1/auth";
export const REGISTER_USER_V1 = "/register";
export const LOGIN_USER_V1 = "/login";
export const LOGOUT_USER_V1 = "/logout";
export const FORGOT_PASSWORD_V1 = "/forgot-password";
export const RESET_PASSWORD_V1 = "/reset-password";
export const VERIFY_EMAIL_V1 = "/verify-email";
export const RESEND_EMAIL_VERIFICATION_V1 = "/resend-email-verification";
export const REVOKE_ACCESS_TOKEN_V1 = "/revoke-access-token";

// Onboarding routes.
export const ONBOARDING_ROUTE_V1 = "/api/v1/onboarding";

// PUT /api/v1/onboarding/:userId
export const ONBOARDING_UPDATE_V1 = "/:userId";
// GET /api/v1/onboarding/:userId/status
export const ONBOARDING_STATUS_V1 = "/:userId/status";

// User routes.
export const USER_ROUTE_V1 = "/api/v1/user";

// GET /api/v1/user/usernames?username=example
export const CHECK_USERNAME_AVAILABILITY_V1 = "/usernames";
