export const HEALTH = {
  BASE_ROUTE: "/api/health",
  HEALTH_CHECK: "/health-check",
  PING: "/ping"
} as const;

export const AUTH = {
  v1: {
    BASE_ROUTE: "/api/v1/auth",
    REGISTER_USER: "/register",
    LOGIN_USER: "/login",
    LOGOUT_USER: "/logout",
    FORGOT_PASSWORD: "/forgot-password",
    RESET_PASSWORD: "/reset-password",
    VERIFY_EMAIL: "/verify-email",
    RESEND_EMAIL_VERIFICATION: "/resend-email-verification",
    REVOKE_ACCESS_TOKEN: "/revoke-access-token"
  }
} as const;

export const ONBOARDING = {
  v1: {
    BASE_ROUTE: "/api/v1/onboarding",
    ONBOARDING_UPDATE: "/",
    ONBOARDING_STATUS: "/"
  }
};

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
  UNLIKE_COMMENT_ON_POST: UNLIKE_COMMENT_ON_POST_V1
} as const;

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
  USER_GET_COMMENTS: USER_GET_COMMENTS_V1
} as const;

export const USER_GET_FRIENDS_V1 = "/friends";
export const USER_SEND_FRIEND_REQUEST_V1 = "/friends/:friendId";
export const USER_ACCEPT_REJECT_FRIEND_REQUEST_V1 = "/friends/:friendId";
export const USER_GET_FRIEND_REQUESTS_V1 = "/friends/requests";

export const FRIENDS = {
  BASE_ROUTE: USER_ROUTE_V1,
  GET_FRIENDS: USER_GET_FRIENDS_V1,
  SEND_FRIEND_REQUEST: USER_SEND_FRIEND_REQUEST_V1,
  ACCEPT_REJECT_FRIEND_REQUEST: USER_ACCEPT_REJECT_FRIEND_REQUEST_V1,
  GET_FRIEND_REQUESTS: USER_GET_FRIEND_REQUESTS_V1
} as const;

export const USER_GET_FOLLOWERS_V1 = "/followers";
export const USER_FOLLOW_USER_V1 = "/followers/:followingId";

export const FOLLOWERS = {
  BASE_ROUTE: USER_ROUTE_V1,
  GET_FOLLOWERS: USER_GET_FOLLOWERS_V1,
  FOLLOW_USER: USER_FOLLOW_USER_V1
} as const;

export const USER_GET_FOLLOWING_V1 = "/following";
export const USER_UNFOLLOW_USER_V1 = "/following/:followingId";

export const FOLLOWING = {
  BASE_ROUTE: USER_ROUTE_V1,
  GET_FOLLOWING: USER_GET_FOLLOWING_V1,
  UNFOLLOW_USER: USER_UNFOLLOW_USER_V1
} as const;

export const USER_GET_GROUPS_V1 = "/groups";
export const USER_GET_GROUPS_REQUESTED_V1 = "/groups/requested";

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
