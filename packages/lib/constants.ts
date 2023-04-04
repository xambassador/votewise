export const SOMETHING_WENT_WRONG_MSG = "Something went wrong";
export const VALIDATION_FAILED_MSG = "Validation failed";
export const INTERNAL_SERVER_ERROR_MSG = "Internal server error";

export const INVALID_CREDENTIALS_MSG = "Invalid credentials";
export const REFRESHTOKEN_REQUIRED_MSG = "Refresh token is required";
export const INVALID_REFRESHTOKEN_MSG = "Invalid refresh token";
export const ACCESS_TOKEN_REVOKE_MSG = "Access token revoked successfully";
export const UNAUTHORIZED_MSG = "Unauthorized";
export const FORBIDDEN_MSG = "Forbidden";

export const EMAIL_SENT_MSG = "Email sent successfully";
export const EMAIL_QUEUE_MSG = "Request is queued for process. Check your mail box..";
export const PASSWORD_RESET_MSG = "Password reset successfully";
export const EMAIL_VERIFIED_MSG = "Email verified successfully";
export const EMAIL_ALREADY_VERIFIED_MSG = "Email already verified";
export const LOGIN_SUCCESS_MSG = "Login successful";
export const EMAIL_REQUIRED_MSG = "Email is required";
export const TOKEN_REQUIRED_MSG = "Token is required";
export const INVALID_EMAIL_MSG = "Invalid email";

export const USER_ALREADY_EXISTS_MSG = "User already exists";
export const USER_CREATED_SUCCESSFULLY_MSG = "User created successfully";
export const USER_DETAILS_FETCHED_SUCCESSFULLY_MSG = "User details fetched successfully";
export const USERNAME_AVAIALABLE_MSG = "Username is available";
export const USER_NOT_FOUND_MSG = "User not found";
export const USERNAME_ALREADY_TAKEN_MSG = "Username is already taken";
export const USERNAME_REQUIRED_MSG = "Username is required";
export const USER_ALREADY_ONBOARDED_MSG = "User already onboarded";

export const POSTS_FETCHED_SUCCESSFULLY_MSG = "Posts fetched successfully";
export const POST_DETAILS_FETCHED_SUCCESSFULLY_MSG = "Post details fetched successfully";
export const POST_CREATED_SUCCESSFULLY_MSG = "Post created successfully";
export const POST_LIKED_SUCCESSFULLY_MSG = "Post liked successfully";
export const POST_UNLIKED_SUCCESSFULLY_MSG = "Post unliked successfully";
export const POST_UPDATE_SUCCESSFULLY_MSG = "Post update successfully";
export const POST_DELETED_SUCCESSFULLY_MSG = "Post deleted successfully";
export const POST_STATUS_CHANGED_SUCCESSFULLY_MSG = "Post status changed successfully";
export const POST_ARCHIVED_SUCCESSFULLY_MSG = "Post archived successfully";
export const INVALID_POST_ID_MSG = "Invalid post id";
export const POSTID_REQUIRED_MSG = "Post id is required";
export const POST_NOT_FOUND_MSG = "Post not found";
export const POST_NOT_LIKED_MSG = "Post not liked";
export const POST_ALREADY_LIKED_MSG = "Post already liked";
export const COMMENT_POST_CLOSED_MSG = "This idea is now closed. You can't comment on this post anymore.";
export const POST_CLOSED_MSG = "This idea is now closed. You can't like or comment on this post anymore.";
export const ERROR_UNLIKING_POST_MSG = "Error while unliking post";
export const ERROR_LIKING_POST_MSG = "Error while liking post";
export const ERROR_FETCHING_POSTS_MSG = "Error while fetching posts";
export const ERROR_FETCHING_POST_MSG = "Error while fetching post";
export const ERROR_CREATING_POST_MSG = "Error while creating post";
export const ERROR_CHECKING_SLUG_MSG = "Error while checking slug";
export const ERROR_GETTING_USER_POSTS = "Error while fetching user posts";
export const ERROR_UPDATING_POST_MSG = "Error while updating post";
export const ERROR_DELETING_POST_MSG = "Error while deleting post";
export const ERROR_UPDATING_POST_STATUS_MSG = "Error while updating post status";
export const ERROR_ARCHIVE_POST_MSG = "Error while archiving post";

export const COMMENT_ADDED_SUCCESSFULLY_MSG = "Comment added successfully";
export const COMMENT_DELETED_SUCCESSFULLY_MSG = "Comment deleted successfully";
export const COMMENT_UPDATED_SUCCESSFULLY_MSG = "Comment updated successfully";
export const REPLAY_ADDED_SUCCESSFULLY_MSG = "Reply added successfully";
export const REPLAY_DELETED_SUCCESSFULLY_MSG = "Reply deleted successfully";
export const GETTING_REPLIES_FROM_COMMENT_MSG = "Replies from comment fetched successfully";
export const COMMENT_LIKE_SUCCESSFULLY_MSG = "Comment liked successfully";
export const COMMENT_UNLIKE_SUCCESSFULLY_MSG = "Comment unliked successfully";
export const COMMENT_FETCHED_SUCCESSFULLY_MSG = "Comment fetched successfully";
export const FRIENDS_FETCHED_SUCCESSFULLY_MSG = "Friends fetched successfully";
export const FRIEND_REQUEST_SENT_SUCCESSFULLY_MSG = "Friend request sent successfully";
export const FRIEND_REQUEST_ACCEPTED_SUCCESSFULLY_MSG = "Friend request accepted successfully";
export const FRIEND_REQUEST_REJECTED_SUCCESSFULLY_MSG = "Friend request rejected successfully";
export const FRIEDN_REQUESTS_FETCHED_SUCCESSFULLY_MSG = "Friend requests fetched successfully";
export const ALREADY_LIKED_COMMENT_MSG = "Comment already liked";
export const COMMENT_NOT_LIKED_MSG = "Comment not liked";
export const FRIEND_REQUEST_NOT_FOUND_MSG = "Friend request not found";
export const ALREADY_FRIENDS_MSG = "You are already friends";
export const ERROR_GETTING_REPLIES_FROM_COMMENT_MSG = "Error while getting replies from comment";
export const INVALID_COMMENT_ID_MSG = "Invalid comment id";
export const COMMENT_NOT_FOUND_MSG = "Comment not found";
export const ERROR_DELETING_COMMENT_MSG = "Error while deleting comment";
export const ERROR_ADDING_COMMENT_MSG = "Error while adding comment";
export const ERROR_UPDATING_COMMENT_MSG = "Error while updating comment";
export const ERROR_REPLAYING_COMMENT_MSG = "Error while replying to comment";
export const ERROR_DELETING_REPLAY_MSG = "Error while deleting replay";
export const ERROR_FETCHING_COMMENTS_FOR_POST_MSG = "Error while fetching comments for post";
export const ERROR_COMMENT_NOT_EMPTY_MSG = "Comment should not be empty";
export const ERROR_LIKING_COMMENT_MSG = "Error while liking comment";
export const ERROR_UNLIKING_COMMENT_MSG = "Error while unliking comment";
export const ERROR_COMMENT_FETCHED_MSG = "Error while fetching comment";
export const ERROR_FETCHING_FRIENDS = "Error while fetching friends";
export const ERROR_ADDING_FRIEND = "Error while adding friend";
export const ERROR_ACCEPTING_FRIEND_REQUEST = "Error while accepting friend request";
export const ERROR_REJECTING_FRIEND_REQUEST = "Error while rejecting friend request";
export const ERROR_FETCHING_FRIEND_REQUESTS = "Error while fetching friend requests";

export const USER_ALREADY_EXISTS_RESPONSE = {
  message: USER_ALREADY_EXISTS_MSG,
  data: null,
  error: {
    message: USER_ALREADY_EXISTS_MSG,
  },
  success: false,
};

export const USERNAME_ALREADY_TAKEN_RESPONSE = {
  message: USERNAME_ALREADY_TAKEN_MSG,
  data: null,
  error: {
    message: USERNAME_ALREADY_TAKEN_MSG,
  },
  success: false,
};

export const USERNAME_REQUIRED_RESPONSE = {
  message: VALIDATION_FAILED_MSG,
  data: null,
  error: {
    message: USERNAME_REQUIRED_MSG,
  },
  success: false,
};

export const USER_NOT_FOUND_RESPONSE = {
  message: USER_NOT_FOUND_MSG,
  data: null,
  error: {
    message: USER_NOT_FOUND_MSG,
  },
  success: false,
};

export const USER_ALREADY_ONBOARDED_RESPONSE = {
  message: USER_ALREADY_ONBOARDED_MSG,
  data: null,
  error: {
    message: USER_ALREADY_ONBOARDED_MSG,
  },
  success: false,
};

export const INVALID_CREDENTIALS_RESPONSE = {
  message: INVALID_CREDENTIALS_MSG,
  data: null,
  error: {
    message: INVALID_CREDENTIALS_MSG,
  },
  success: false,
};

export const INVALID_REFRESHTOKEN_RESPONSE = {
  message: INVALID_REFRESHTOKEN_MSG,
  data: null,
  error: {
    message: INVALID_REFRESHTOKEN_MSG,
  },
  success: false,
};

export const UNAUTHORIZED_RESPONSE = {
  message: UNAUTHORIZED_MSG,
  data: null,
  error: {
    message: UNAUTHORIZED_MSG,
  },
  success: false,
};

export const FORBIDDEN_RESPONSE = {
  message: FORBIDDEN_MSG,
  data: null,
  error: {
    message: `You don't have permission to access this resource or perform this action.`,
  },
  success: false,
};

export const PASSWORD_RESET_RESPONSE = {
  message: PASSWORD_RESET_MSG,
  data: {
    message: PASSWORD_RESET_MSG,
  },
  error: null,
  success: true,
};

export const EMAIL_VERIFIED_RESPONSE = {
  message: EMAIL_VERIFIED_MSG,
  data: {
    message: EMAIL_VERIFIED_MSG,
  },
  error: null,
  success: true,
};

export const EMAIL_SENT_RESPONSE = {
  message: EMAIL_SENT_MSG,
  data: {
    message: EMAIL_QUEUE_MSG,
  },
  error: null,
  success: true,
};

export const EMAIL_REQUIRED_RESPONSE = {
  message: VALIDATION_FAILED_MSG,
  data: null,
  error: {
    message: EMAIL_REQUIRED_MSG,
  },
  success: false,
};

export const INVALID_EMAIL_RESPONSE = {
  message: VALIDATION_FAILED_MSG,
  data: null,
  error: {
    message: INVALID_EMAIL_MSG,
  },
  success: false,
};

export const TOKEN_REQUIRED_RESPONSE = {
  message: VALIDATION_FAILED_MSG,
  data: null,
  error: {
    message: TOKEN_REQUIRED_MSG,
  },
  success: false,
};

export const EMAIL_ALREADY_VERIFIED_RESPONSE = {
  message: EMAIL_ALREADY_VERIFIED_MSG,
  data: null,
  error: {
    message: EMAIL_ALREADY_VERIFIED_MSG,
  },
  success: false,
};

export const INVALID_POST_ID_RESPONSE = {
  message: VALIDATION_FAILED_MSG,
  data: null,
  error: {
    message: INVALID_POST_ID_MSG,
  },
  success: false,
};

export const INVALID_COMMENT_ID_RESPONSE = {
  message: VALIDATION_FAILED_MSG,
  data: null,
  error: {
    message: INVALID_COMMENT_ID_MSG,
  },
  success: false,
};

export const COMMENT_NOT_FOUND_RESPONSE = {
  message: COMMENT_NOT_FOUND_MSG,
  data: null,
  error: {
    message: COMMENT_NOT_FOUND_MSG,
  },
  success: false,
};

export const COMMENT_NOT_EMPTY_RESPONSE = {
  message: VALIDATION_FAILED_MSG,
  data: null,
  error: {
    message: ERROR_COMMENT_NOT_EMPTY_MSG,
  },
  success: false,
};

export const COMMENT_NOT_LIKED_RESPONSE = {
  message: COMMENT_NOT_LIKED_MSG,
  data: null,
  error: {
    message: COMMENT_NOT_LIKED_MSG,
  },
  success: false,
};

export const ALREADY_LIKED_COMMENT_RESPONSE = {
  message: ALREADY_LIKED_COMMENT_MSG,
  data: null,
  error: {
    message: ALREADY_LIKED_COMMENT_MSG,
  },
  success: false,
};

export const POST_NOT_FOUND_RESPONSE = {
  message: POST_NOT_FOUND_MSG,
  data: null,
  error: {
    message: POST_NOT_FOUND_MSG,
  },
  success: false,
};

export const COMMENT_POST_CLOSED_RESPONSE = {
  message: COMMENT_POST_CLOSED_MSG,
  data: null,
  error: {
    message: COMMENT_POST_CLOSED_MSG,
  },
  success: false,
};

export const POST_CLOSED_RESPONSE = {
  message: POST_CLOSED_MSG,
  data: null,
  error: {
    message: POST_CLOSED_MSG,
  },
  success: false,
};

export const POST_ALREADY_LIKED_RESPONSE = {
  message: POST_ALREADY_LIKED_MSG,
  data: null,
  error: {
    message: POST_ALREADY_LIKED_MSG,
  },
  success: false,
};

export const POST_NOT_LIKED_RESPONSE = {
  message: POST_NOT_LIKED_MSG,
  data: null,
  error: {
    message: POST_NOT_LIKED_MSG,
  },
  success: false,
};
