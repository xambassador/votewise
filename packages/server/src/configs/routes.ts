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

export const POST_ROUTE_V1 = "/api/v1/posts";
// GET /api/v1/posts?limit=10&offset=0 => Get all posts (public, public groups, friends posts)
export const GET_POSTS_V1 = "";
// GET /api/v1/posts/:postId => Get post by id
export const GET_POST_V1 = "/:postId";
// GET /api/v1/posts/:postId/comments => Get post comments
export const GET_POST_COMMENTS_V1 = "/:postId/comments";
// GET /api/v1/posts/:postId/likes => Get post likes
export const GET_POST_LIKES_V1 = "/:postId/likes";

// POST /api/v1/user/posts
export const USER_CREATE_POST_V1 = "/posts";
// GET /api/v1/user/posts
export const USER_GET_POSTS_V1 = "/posts";
// GET /api/v1/user/posts/:postId
export const USER_GET_POST_V1 = "/posts/:postId";
// PUT /api/v1/user/posts/:postId (update post)
export const USER_UPDATE_POST_V1 = "/posts/:postId";
// PUT /api/v1/user/posts/:postId/like (like post)
export const USER_LIKE_POST_V1 = "/posts/:postId/like";
// PUT /api/v1/user/posts/:postId/unlike (unlike post)
export const USER_UNLIKE_POST_V1 = "/posts/:postId/unlike";
// PUT /api/v1/user/posts/:postId/comment (comment on post)
export const USER_COMMENT_ON_POST_V1 = "/posts/:postId/comment";

// DELETE /api/v1/user/posts/:postId
export const DELETE_POST_V1 = "/posts/:postId";
