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

// PATCH /api/v1/onboarding/:userId
export const ONBOARDING_UPDATE_V1 = "/:userId";
// GET /api/v1/onboarding/:userId/status
export const ONBOARDING_STATUS_V1 = "/:userId/status";

export const POST_ROUTE_V1 = "/api/v1/posts";
// GET /api/v1/posts?limit=10&offset=0 => Get all posts (public, public groups, friends posts)
export const GET_POSTS_V1 = "";
// GET /api/v1/posts/:postId => Get post by id
export const GET_POST_V1 = "/:postId";
// GET /api/v1/posts/:postId/comments?limit=10&offset=0 => Get post comments
export const GET_POST_COMMENTS_V1 = "/:postId/comments";
// PATCH /api/v1/posts/:postId/like => Like post
export const LIKE_POST_V1 = "/:postId/like";
// PATCH /api/v1/posts/:postId/unlike => Unlike post
export const UNLIKE_POST_V1 = "/:postId/unlike";
// POST /api/v1/posts/:postId/comment => Comment on post
export const COMMENT_ON_POST_V1 = "/:postId/comment";
// PATCH /api/v1/posts/:postId/comment => Update comment on post
export const UPDATE_COMMENT_ON_POST_V1 = "/:postId/comment";
// DELETE /api/v1/posts/:postId/comment/:commentId => Delete comment on post
export const DELETE_COMMENT_ON_POST_V1 = "/:postId/comment/:commentId";
// PATCH /api/v1/posts/:postId/comment/:commentId/like => Like comment on post
export const LIKE_COMMENT_ON_POST_V1 = "/:postId/comment/:commentId/like";
// PATCH /api/v1/posts/:postId/comment/:commentId/unlike => Unlike comment on post
export const UNLIKE_COMMENT_ON_POST_V1 = "/:postId/comment/:commentId/unlike";

// User routes.
export const USER_ROUTE_V1 = "/api/v1/user";
// GET /api/v1/user/me
export const GET_ME_V1 = "/me";
// GET /api/v1/user/usernames?username=example
export const CHECK_USERNAME_AVAILABILITY_V1 = "/usernames";
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
