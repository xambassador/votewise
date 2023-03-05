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
// GET /api/v1/posts?limit=10&offset=0&sortBy=upvotes&order=desc|asc => Get all posts (public, public groups, friends posts)
export const GET_POSTS_V1 = "";
// GET /api/v1/posts/:postId => Get post by id
export const GET_POST_V1 = "/:postId";
// GET /api/v1/posts/:postId/comments?limit=10&offset=0 => Get post comments
export const GET_POST_COMMENTS_V1 = "/:postId/comments";
// PATCH /api/v1/posts/:postId/like => Like post
export const LIKE_POST_V1 = "/:postId/like";
// DELETE /api/v1/posts/:postId/unlike => Unlike post
export const UNLIKE_POST_V1 = "/:postId/unlike";
// POST /api/v1/posts/:postId/comment => Comment on post
export const COMMENT_ON_POST_V1 = "/:postId/comment";
// PATCH /api/v1/posts/:postId/comment/:commentId => Update comment on post
export const UPDATE_COMMENT_ON_POST_V1 = "/:postId/comment/:commentId";
// POST /api/v1/posts/:postId/comment/:commentId => Reply to comment on post
export const REPLY_TO_COMMENT_ON_POST_V1 = "/:postId/comment/:commentId";
// GET /api/v1/posts/:postId/comment/:commentId/replies?limit=10&offset=0 => Get replies to comment on post
export const GET_REPLIES_TO_COMMENT_ON_POST_V1 = "/:postId/comment/:commentId/replies";
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
// POST /api/v1/user/posts => Create new post
export const USER_CREATE_POST_V1 = "/posts";
// GET /api/v1/user/posts?limit=5&offset=0&status=open => Get all posts of current user
export const USER_GET_POSTS_V1 = "/posts";
// PATCH /api/v1/user/posts/:postId (update post)
export const USER_UPDATE_POST_V1 = "/posts/:postId";
// DELETE /api/v1/user/posts/:postId
export const DELETE_POST_V1 = "/posts/:postId";
// PATCH /api/v1/user/posts/:postId/status => Update post status
export const UPDATE_POST_STATUS_V1 = "/posts/:postId/status";
// GET /api/v1/user/comments?limit=5&offset=0 => Get all comments of current user
export const USER_GET_COMMENTS_V1 = "/comments";

// GET /api/v1/user/friends?limit=5&offset=0 => Get all friends of current user
export const USER_GET_FRIENDS_V1 = "/friends";
// POST /api/v1/user/friends/:friendId => Send friend request to user
export const USER_SEND_FRIEND_REQUEST_V1 = "/friends/:friendId";
// PATCH /api/v1/user/friends/:friendId => Accept or Reject friend request from user
export const USER_ACCEPT_REJECT_FRIEND_REQUEST_V1 = "/friends/:friendId";
// GET /api/v1/user/friends/requests?limit=5&offset=0 => Get all friend requests of current user
export const USER_GET_FRIEND_REQUESTS_V1 = "/friends/requests";

// IMPLEMENTME: Implement this route
// GET /api/v1/user/followers?limit=5&offset=0 => Get all followers of current user
export const USER_GET_FOLLOWERS_V1 = "/followers";
// IMPLEMENTME: Implement this route
// PATCH /api/v1/user/followers/:userId => Follow user
export const USER_FOLLOW_USER_V1 = "/followers/:userId";

// IMPLEMENTME: Implement this route
// GET /api/v1/user/following?limit=5&offset=0 => Get all users current user is following
export const USER_GET_FOLLOWING_V1 = "/following";

// IMPLEMENTME: Implement this route
// GET /api/v1/user/groups?limit=5&offset=0 => Get all groups of current user
export const USER_GET_GROUPS_V1 = "/groups";
