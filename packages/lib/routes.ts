// Health check routes.
export const HEALTH_ROUTE = "/api/health";
export const HEALTH_CHECK = "/health-check";
export const PING = "/ping";

export const HEALTH = {
  BASE_ROUTE: HEALTH_ROUTE,
  HEALTH_CHECK,
  PING,
} as const;

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

export const AUTH = {
  BASE_ROUTE: AUTH_ROUTE_V1,
  REGISTER_USER: REGISTER_USER_V1,
  LOGIN_USER: LOGIN_USER_V1,
  LOGOUT_USER: LOGOUT_USER_V1,
  FORGOT_PASSWORD: FORGOT_PASSWORD_V1,
  RESET_PASSWORD: RESET_PASSWORD_V1,
  VERIFY_EMAIL: VERIFY_EMAIL_V1,
  RESEND_EMAIL_VERIFICATION: RESEND_EMAIL_VERIFICATION_V1,
  REVOKE_ACCESS_TOKEN: REVOKE_ACCESS_TOKEN_V1,
} as const;

// Onboarding routes.
export const ONBOARDING_ROUTE_V1 = "/api/v1/onboarding";
export const ONBOARDING_UPDATE_V1 = "/";
export const ONBOARDING_STATUS_V1 = "/";

export const ONBOARDING = {
  BASE_ROUTE: ONBOARDING_ROUTE_V1,
  ONBOARDING_UPDATE: ONBOARDING_UPDATE_V1,
  ONBOARDING_STATUS: ONBOARDING_STATUS_V1,
};

// GET /api/v1/posts?limit=10&offset=0&sortBy=upvotes&order=desc|asc => Get all posts (public, public groups, friends posts)
// GET /api/v1/posts/:postId => Get post by id
// GET /api/v1/posts/:postId/comments?limit=10&offset=0 => Get post comments
// PATCH /api/v1/posts/:postId/like => Like post
// DELETE /api/v1/posts/:postId/unlike => Unlike post
// POST /api/v1/posts/:postId/comment => Comment on post
// PATCH /api/v1/posts/:postId/comment/:commentId => Update comment on post
// GET /api/v1/posts/:postId/comment/:commentId/replies?limit=10&offset=0 => Get replies to comment on post
// POST /api/v1/posts/:postId/comment/:commentId => Reply to comment on post
// DELETE /api/v1/posts/:postId/comment/:commentId => Delete comment on post
// PATCH /api/v1/posts/:postId/comment/:commentId/like => Like comment on post
// DELETE /api/v1/posts/:postId/comment/:commentId/unlike => Unlike comment on post
export const POST_ROUTE_V1 = "/api/v1/posts";
export const GET_POSTS_V1 = "";
export const GET_POST_V1 = "/:postId";
export const GET_POST_COMMENTS_V1 = "/:postId/comments";
export const LIKE_POST_V1 = "/:postId/like";
export const UNLIKE_POST_V1 = "/:postId/unlike";
export const COMMENT_ON_POST_V1 = "/:postId/comment";
export const UPDATE_COMMENT_ON_POST_V1 = "/:postId/comment/:commentId";
export const REPLY_TO_COMMENT_ON_POST_V1 = "/:postId/comment/:commentId";
export const GET_REPLIES_TO_COMMENT_ON_POST_V1 = "/:postId/comment/:commentId/replies";
export const DELETE_COMMENT_ON_POST_V1 = "/:postId/comment/:commentId";
export const LIKE_COMMENT_ON_POST_V1 = "/:postId/comment/:commentId/like";
export const UNLIKE_COMMENT_ON_POST_V1 = "/:postId/comment/:commentId/unlike";

export const POST = {
  BASE_ROUTE: POST_ROUTE_V1,
  GET_POSTS: GET_POSTS_V1,
  GET_POST: GET_POST_V1,
  GET_POST_COMMENTS: GET_POST_COMMENTS_V1,
  LIKE_POST: LIKE_POST_V1,
  UNLIKE_POST: UNLIKE_POST_V1,
  COMMENT_ON_POST: COMMENT_ON_POST_V1,
  UPDATE_COMMENT_ON_POST: UPDATE_COMMENT_ON_POST_V1,
  REPLY_TO_COMMENT_ON_POST: REPLY_TO_COMMENT_ON_POST_V1,
  GET_REPLIES_TO_COMMENT_ON_POST: GET_REPLIES_TO_COMMENT_ON_POST_V1,
  DELETE_COMMENT_ON_POST: DELETE_COMMENT_ON_POST_V1,
  LIKE_COMMENT_ON_POST: LIKE_COMMENT_ON_POST_V1,
  UNLIKE_COMMENT_ON_POST: UNLIKE_COMMENT_ON_POST_V1,
} as const;

// User routes.
// GET /api/v1/user/me
// PATCH /api/v1/user/me => Update user profile
// GET /api/v1/user/usernames?username=example
// POST /api/v1/user/posts => Create new post
// GET /api/v1/user/posts?limit=5&offset=0&status=open&orderBy=desc => Get all posts of current user
// PATCH /api/v1/user/posts/:postId (update post)
// DELETE /api/v1/user/posts/:postId
// PATCH /api/v1/user/posts/:postId/status => Update post status
// GET /api/v1/user/comments?limit=5&offset=0&status=open&orderBy=desc => Get all comments of current user
export const USER_ROUTE_V1 = "/api/v1/user";
export const GET_ME_V1 = "/me";
export const USER_UPDATE_PROFILE_V1 = "/me";
export const CHECK_USERNAME_AVAILABILITY_V1 = "/usernames";
export const USER_CREATE_POST_V1 = "/posts";
export const USER_GET_POSTS_V1 = "/posts";
export const USER_UPDATE_POST_V1 = "/posts/:postId";
export const DELETE_POST_V1 = "/posts/:postId";
export const UPDATE_POST_STATUS_V1 = "/posts/:postId/status";
export const USER_GET_COMMENTS_V1 = "/comments";

export const USER = {
  BASE_ROUTE: USER_ROUTE_V1,
  GET_ME: GET_ME_V1,
  USER_UPDATE_PROFILE: USER_UPDATE_PROFILE_V1,
  CHECK_USERNAME_AVAILABILITY: CHECK_USERNAME_AVAILABILITY_V1,
  USER_CREATE_POST: USER_CREATE_POST_V1,
  USER_GET_POSTS: USER_GET_POSTS_V1,
  USER_UPDATE_POST: USER_UPDATE_POST_V1,
  DELETE_POST: DELETE_POST_V1,
  UPDATE_POST_STATUS: UPDATE_POST_STATUS_V1,
  USER_GET_COMMENTS: USER_GET_COMMENTS_V1,
} as const;

// GET /api/v1/user/friends?limit=5&offset=0 => Get all friends of current user
// POST /api/v1/user/friends/:friendId => Send friend request to user
// PATCH /api/v1/user/friends/:friendId => Accept or Reject friend request from user
// GET /api/v1/user/friends/requests?limit=5&offset=0 => Get all friend requests of current user
export const USER_GET_FRIENDS_V1 = "/friends";
export const USER_SEND_FRIEND_REQUEST_V1 = "/friends/:friendId";
export const USER_ACCEPT_REJECT_FRIEND_REQUEST_V1 = "/friends/:friendId";
export const USER_GET_FRIEND_REQUESTS_V1 = "/friends/requests";

export const FRIENDS = {
  BASE_ROUTE: USER_ROUTE_V1,
  GET_FRIENDS: USER_GET_FRIENDS_V1,
  SEND_FRIEND_REQUEST: USER_SEND_FRIEND_REQUEST_V1,
  ACCEPT_REJECT_FRIEND_REQUEST: USER_ACCEPT_REJECT_FRIEND_REQUEST_V1,
  GET_FRIEND_REQUESTS: USER_GET_FRIEND_REQUESTS_V1,
} as const;

// GET /api/v1/user/followers?limit=5&offset=0 => Get all followers of current user
// POST /api/v1/user/followers/:userId => Follow user
export const USER_GET_FOLLOWERS_V1 = "/followers";
export const USER_FOLLOW_USER_V1 = "/followers/:followingId";

export const FOLLOWERS = {
  BASE_ROUTE: USER_ROUTE_V1,
  GET_FOLLOWERS: USER_GET_FOLLOWERS_V1,
  FOLLOW_USER: USER_FOLLOW_USER_V1,
} as const;

// GET /api/v1/user/following?limit=5&offset=0 => Get all users current user is following
// DELETE /api/v1/user/following/:folloingId => Unfollow user
export const USER_GET_FOLLOWING_V1 = "/following";
export const USER_UNFOLLOW_USER_V1 = "/following/:followingId";

export const FOLLOWING = {
  BASE_ROUTE: USER_ROUTE_V1,
  GET_FOLLOWING: USER_GET_FOLLOWING_V1,
  UNFOLLOW_USER: USER_UNFOLLOW_USER_V1,
} as const;

// GET /api/v1/user/groups?limit=5&offset=0?created=true/false&joined=true/false => Get all groups of current user
// GET /api/v1/user/groups/requested?limit=5&offset=0&pending=true/false&rejected=true/false => Get all groups of current user has requested to join
export const USER_GET_GROUPS_V1 = "/groups";
export const USER_GET_GROUPS_REQUESTED_V1 = "/groups/requested";

// GET /api/v1/groups?limit=5&offset=0 => Get all groups
// POST /api/v1/groups => Create new group
// PATCH /api/v1/groups/:groupId => Update group
// POST /api/v1/groups/:groupId/join => Join group
// GET /api/v1/groups/requestes?limit=5&offset=0?groupId=1 => Get all group join request of group author by current user
// PATCH /api/v1/groups/:groupId/requests/:userId => Accept or reject request to join group
// PATCH /api/v1/groups/:groupId/requets/me => Accept or reject request to join group
// DELETE /api/v1/groups/:groupId/leave => Leave group
// PATCH /api/v1/groups/:groupId/members/:userId => Remove member from group
// GET /api/v1/groups/:groupId/members?limit=5&offset=0 => Get all members of group
export const GROUPS_ROUTE_V1 = "/api/v1/groups";
export const GET_GROUPS_V1 = "";
export const CREATE_GROUP_V1 = "";
export const UPDATE_GROUP_V1 = "/:groupId";
export const JOIN_GROUP_V1 = "/:groupId/join";
export const GET_GROUP_REQUESTS_V1 = "/requests";
export const ACCEPT_REJECT_GROUP_REQUEST_V1 = "/:groupId/requests/:userId";

export const ACCEPT_REJECT_GROUP_REQUEST_ME_V1 = "/:groupId/requests/me";
export const LEAVE_GROUP_V1 = "/:groupId/leave";
export const REMOVE_MEMBER_FROM_GROUP_V1 = "/:groupId/members/:userId";
export const GET_GROUP_MEMBERS_V1 = "/:groupId/members";
