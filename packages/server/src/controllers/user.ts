/**
 * @file: user.ts
 * @description: Contains all users related controllers
 */
import type { PostStatus } from "@prisma/client";
import type { Request, Response } from "express";
import httpStatusCodes from "http-status-codes";

import type {
  AcceptOrRejectFriendRequestPayload,
  ChangeStatusPayload,
  CreatePostPayload,
  UpdatePostPayload,
} from "@votewise/types";

import { JSONResponse } from "@/src/lib";
import FollowerService from "@/src/services/follower";
import FriendService from "@/src/services/friends";
import GroupService from "@/src/services/group";
import PostService from "@/src/services/posts";
import UserService from "@/src/services/user";
import {
  ALREADY_FRIENDS_MSG,
  COMMENT_FETCHED_SUCCESSFULLY_MSG,
  FORBIDDEN_MSG,
  FORBIDDEN_RESPONSE,
  FRIEDN_REQUESTS_FETCHED_SUCCESSFULLY_MSG,
  FRIENDS_FETCHED_SUCCESSFULLY_MSG,
  FRIEND_REQUEST_ACCEPTED_SUCCESSFULLY_MSG,
  FRIEND_REQUEST_NOT_FOUND_MSG,
  FRIEND_REQUEST_REJECTED_SUCCESSFULLY_MSG,
  FRIEND_REQUEST_SENT_SUCCESSFULLY_MSG,
  INTERNAL_SERVER_ERROR_MSG,
  INVALID_POST_ID_RESPONSE,
  POSTS_FETCHED_SUCCESSFULLY_MSG,
  POST_CREATED_SUCCESSFULLY_MSG,
  POST_DELETED_SUCCESSFULLY_MSG,
  POST_NOT_FOUND_MSG,
  POST_NOT_FOUND_RESPONSE,
  POST_STATUS_CHANGED_SUCCESSFULLY_MSG,
  POST_UPDATE_SUCCESSFULLY_MSG,
  SOMETHING_WENT_WRONG_MSG,
  UNAUTHORIZED_MSG,
  UNAUTHORIZED_RESPONSE,
  USERNAME_ALREADY_TAKEN_RESPONSE,
  USERNAME_AVAIALABLE_MSG,
  USERNAME_REQUIRED_RESPONSE,
  USER_DETAILS_FETCHED_SUCCESSFULLY_MSG,
  VALIDATION_FAILED_MSG,
  getErrorReason,
  getLimitAndOffset,
} from "@/src/utils";

const { BAD_REQUEST, OK, INTERNAL_SERVER_ERROR, NOT_FOUND, UNAUTHORIZED, FORBIDDEN } = httpStatusCodes;

// -----------------------------------------------------------------------------------------
export const checkUsernameAvailability = async (req: Request, res: Response) => {
  const { username } = req.query as { username: string };

  if (!username) {
    return res.status(BAD_REQUEST).json(USERNAME_REQUIRED_RESPONSE);
  }

  const user = await UserService.checkIfUsernameExists(username);

  if (user) {
    return res.status(BAD_REQUEST).json(USERNAME_ALREADY_TAKEN_RESPONSE);
  }

  return res.status(OK).json(
    new JSONResponse(
      USERNAME_AVAIALABLE_MSG,
      {
        username,
        message: `Username ${username} is available`,
      },
      null,
      true
    )
  );
};

// -----------------------------------------------------------------------------------------
export const getMyDetails = async (req: Request, res: Response) => {
  const { user } = req.session;
  try {
    const data = await UserService.getMyDetails(user.id);
    return res.status(OK).json(
      new JSONResponse(
        USER_DETAILS_FETCHED_SUCCESSFULLY_MSG,
        {
          message: USER_DETAILS_FETCHED_SUCCESSFULLY_MSG,
          user: data,
        },
        null,
        true
      )
    );
  } catch (err) {
    const msg = getErrorReason(err);
    return res.status(INTERNAL_SERVER_ERROR).json(
      new JSONResponse(
        SOMETHING_WENT_WRONG_MSG,
        null,
        {
          message: msg,
        },
        false
      )
    );
  }
};

// -----------------------------------------------------------------------------------------
export const createPost = async (req: Request, res: Response) => {
  const payload = req.body as CreatePostPayload;

  const isValidPayload = PostService.validatePostPayload(payload);

  if (!isValidPayload.success) {
    return res.status(BAD_REQUEST).json(
      new JSONResponse(
        VALIDATION_FAILED_MSG,
        null,
        {
          message: isValidPayload.message,
        },
        false
      )
    );
  }

  const { user } = req.session;

  try {
    const data = await PostService.createPost(payload, user.id);
    return res.status(OK).json(
      new JSONResponse(
        POST_CREATED_SUCCESSFULLY_MSG,
        {
          message: POST_CREATED_SUCCESSFULLY_MSG,
          post: data,
        },
        null,
        true
      )
    );
  } catch (err) {
    const msg = getErrorReason(err) || SOMETHING_WENT_WRONG_MSG;
    return res.status(INTERNAL_SERVER_ERROR).json(
      new JSONResponse(
        INTERNAL_SERVER_ERROR_MSG,
        null,
        {
          message: msg,
        },
        false
      )
    );
  }
};

// -----------------------------------------------------------------------------------------
export const getMyPosts = async (req: Request, res: Response) => {
  const { limit, offset } = getLimitAndOffset(req);
  const { user } = req.session;
  const { status, orderBy } = req.query;

  type Status = "open" | "closed" | "archived" | "inprogress";
  type OrderBy = "asc" | "desc";

  if (status && !["open", "closed", "archived", "inprogress"].includes(status as Status)) {
    return res.status(BAD_REQUEST).json(
      new JSONResponse(
        VALIDATION_FAILED_MSG,
        null,
        {
          message: "Invalid status",
        },
        false
      )
    );
  }

  let mappedStatus: PostStatus = "OPEN";
  const order = orderBy ? (orderBy as OrderBy) : "asc";
  switch (status) {
    case "open":
      mappedStatus = "OPEN";
      break;
    case "closed":
      mappedStatus = "CLOSED";
      break;
    case "archived":
      mappedStatus = "ARCHIVED";
      break;
    case "inprogress":
      mappedStatus = "INPROGRESS";
      break;
    default:
      mappedStatus = "OPEN";
  }

  try {
    const data = await PostService.getPostsByUserId(user.id, limit, offset, mappedStatus, order);
    return res.status(OK).json(
      new JSONResponse(
        POSTS_FETCHED_SUCCESSFULLY_MSG,
        {
          message: POSTS_FETCHED_SUCCESSFULLY_MSG,
          posts: data.posts,
          meta: data.meta,
        },
        null,
        true
      )
    );
  } catch (err) {
    const msg = getErrorReason(err) || SOMETHING_WENT_WRONG_MSG;
    return res.status(INTERNAL_SERVER_ERROR).json(
      new JSONResponse(
        INTERNAL_SERVER_ERROR_MSG,
        null,
        {
          message: msg,
        },
        false
      )
    );
  }
};

// -----------------------------------------------------------------------------------------
export const updateMyPost = async (req: Request, res: Response) => {
  const payload = req.body as UpdatePostPayload;
  const { postId } = req.params;

  const isValid = PostService.validatePostPayload(payload);

  if (!isValid.success) {
    return res.status(BAD_REQUEST).json(
      new JSONResponse(
        VALIDATION_FAILED_MSG,
        null,
        {
          message: isValid.message,
        },
        false
      )
    );
  }

  if (!postId) {
    return res.status(BAD_REQUEST).json(INVALID_POST_ID_RESPONSE);
  }

  const { user } = req.session;

  try {
    const data = await PostService.updatePost(Number(postId), user.id, payload);
    return res.status(OK).json(
      new JSONResponse(
        POST_UPDATE_SUCCESSFULLY_MSG,
        {
          message: POST_UPDATE_SUCCESSFULLY_MSG,
          post: data,
        },
        null,
        true
      )
    );
  } catch (err) {
    const msg = getErrorReason(err) || SOMETHING_WENT_WRONG_MSG;
    if (msg === POST_NOT_FOUND_MSG) {
      return res.status(NOT_FOUND).json(POST_NOT_FOUND_RESPONSE);
    }

    if (msg === UNAUTHORIZED_MSG) {
      return res.status(UNAUTHORIZED).json(UNAUTHORIZED_RESPONSE);
    }

    if (msg === FORBIDDEN_MSG) {
      return res.status(FORBIDDEN).json(FORBIDDEN_RESPONSE);
    }

    return res.status(INTERNAL_SERVER_ERROR).json(
      new JSONResponse(
        INTERNAL_SERVER_ERROR_MSG,
        null,
        {
          message: msg,
        },
        false
      )
    );
  }
};

// -----------------------------------------------------------------------------------------
export const deleteMyPost = async (req: Request, res: Response) => {
  const { postId } = req.params;

  if (!postId) {
    return res.status(BAD_REQUEST).json(INVALID_POST_ID_RESPONSE);
  }

  const { user } = req.session;

  try {
    await PostService.deleteMyPost(Number(postId), user.id);
    return res.status(OK).json(
      new JSONResponse(
        POST_DELETED_SUCCESSFULLY_MSG,
        {
          message: POST_DELETED_SUCCESSFULLY_MSG,
        },
        null,
        true
      )
    );
  } catch (err) {
    const msg = getErrorReason(err) || SOMETHING_WENT_WRONG_MSG;
    if (msg === POST_NOT_FOUND_MSG) {
      return res.status(NOT_FOUND).json(POST_NOT_FOUND_RESPONSE);
    }
    if (msg === UNAUTHORIZED_MSG) {
      return res.status(UNAUTHORIZED).json(UNAUTHORIZED_RESPONSE);
    }
    if (msg === FORBIDDEN_MSG) {
      return res.status(FORBIDDEN).json(FORBIDDEN_RESPONSE);
    }
    return res.status(INTERNAL_SERVER_ERROR).json(
      new JSONResponse(
        INTERNAL_SERVER_ERROR_MSG,
        null,
        {
          message: msg,
        },
        false
      )
    );
  }
};

// -----------------------------------------------------------------------------------------
export const updateStatus = async (req: Request, res: Response) => {
  const payload = req.body as ChangeStatusPayload;
  const { postId } = req.params;

  if (!postId) {
    return res.status(BAD_REQUEST).json(INVALID_POST_ID_RESPONSE);
  }

  const { user } = req.session;

  try {
    const data = await PostService.changeStatus(Number(postId), payload, user.id);
    return res.status(OK).json(
      new JSONResponse(
        POST_STATUS_CHANGED_SUCCESSFULLY_MSG,
        {
          message: POST_STATUS_CHANGED_SUCCESSFULLY_MSG,
          post: data,
        },
        null,
        true
      )
    );
  } catch (err) {
    const msg = getErrorReason(err) || SOMETHING_WENT_WRONG_MSG;
    if (msg === POST_NOT_FOUND_MSG) {
      return res.status(NOT_FOUND).json(POST_NOT_FOUND_RESPONSE);
    }

    if (msg === UNAUTHORIZED_MSG) {
      return res.status(UNAUTHORIZED).json(UNAUTHORIZED_RESPONSE);
    }

    if (msg === FORBIDDEN_MSG) {
      return res.status(FORBIDDEN).json(FORBIDDEN_RESPONSE);
    }

    return res.status(INTERNAL_SERVER_ERROR).json(
      new JSONResponse(
        INTERNAL_SERVER_ERROR_MSG,
        null,
        {
          message: msg,
        },
        false
      )
    );
  }
};

// -----------------------------------------------------------------------------------------
export const getMyComments = async (req: Request, res: Response) => {
  const { limit, offset } = getLimitAndOffset(req);
  const { orderBy, status } = req.query;
  const { user } = req.session;
  const defaulOrderBy = (orderBy || "desc") as "asc" | "desc";
  const defaultStatus = (status || "OPEN") as "OPEN" | "CLOSED" | "INPROGRESS" | "ARCHIVED";

  try {
    const data = await PostService.getCommentsByUserId(user.id, defaultStatus, defaulOrderBy, limit, offset);
    return res.status(OK).json(
      new JSONResponse(
        COMMENT_FETCHED_SUCCESSFULLY_MSG,
        {
          message: COMMENT_FETCHED_SUCCESSFULLY_MSG,
          comments: data.comments,
          meta: data.meta,
        },
        null,
        true
      )
    );
  } catch (err) {
    const msg = getErrorReason(err) || SOMETHING_WENT_WRONG_MSG;
    return res.status(INTERNAL_SERVER_ERROR).json(
      new JSONResponse(
        INTERNAL_SERVER_ERROR_MSG,
        null,
        {
          message: msg,
        },
        false
      )
    );
  }
};

// -----------------------------------------------------------------------------------------
export const getMyFriends = async (req: Request, res: Response) => {
  const { limit, offset } = getLimitAndOffset(req);
  const { user } = req.session;

  try {
    const data = await FriendService.getFriends(user.id, limit, offset);
    return res.status(OK).json(
      new JSONResponse(
        FRIENDS_FETCHED_SUCCESSFULLY_MSG,
        {
          message: FRIENDS_FETCHED_SUCCESSFULLY_MSG,
          friends: data.friends,
          meta: data.meta,
        },
        null,
        true
      )
    );
  } catch (err) {
    const msg = getErrorReason(err) || SOMETHING_WENT_WRONG_MSG;
    return res.status(INTERNAL_SERVER_ERROR).json(
      new JSONResponse(
        INTERNAL_SERVER_ERROR_MSG,
        null,
        {
          message: msg,
        },
        false
      )
    );
  }
};

// -----------------------------------------------------------------------------------------
export const addFriend = async (req: Request, res: Response) => {
  const { friendId } = req.params;

  // TODO: Create Invalid friend id response
  if (!friendId) {
    return res.status(BAD_REQUEST).json(
      new JSONResponse(
        VALIDATION_FAILED_MSG,
        null,
        {
          message: "Invalid friend id",
        },
        false
      )
    );
  }

  const { user } = req.session;

  try {
    const data = await FriendService.addFriend(user.id, Number(friendId));
    // TODO: send notification to the user and send email
    return res.status(OK).json(
      new JSONResponse(
        FRIEND_REQUEST_SENT_SUCCESSFULLY_MSG,
        {
          message: FRIEND_REQUEST_SENT_SUCCESSFULLY_MSG,
          friend: data,
        },
        null,
        true
      )
    );
  } catch (err) {
    const msg = getErrorReason(err) || SOMETHING_WENT_WRONG_MSG;
    if (msg === ALREADY_FRIENDS_MSG) {
      return res.status(BAD_REQUEST).json(
        new JSONResponse(
          ALREADY_FRIENDS_MSG,
          null,
          {
            message: msg,
          },
          false
        )
      );
    }
    if (msg === "Friend request already sent") {
      return res.status(BAD_REQUEST).json(
        new JSONResponse(
          "Friend request already sent",
          null,
          {
            message: msg,
          },
          false
        )
      );
    }
    return res.status(INTERNAL_SERVER_ERROR).json(
      new JSONResponse(
        INTERNAL_SERVER_ERROR_MSG,
        null,
        {
          message: msg,
        },
        false
      )
    );
  }
};

// -----------------------------------------------------------------------------------------
export const acceptOrRejectFriendRequest = async (req: Request, res: Response) => {
  const { friendId } = req.params;
  const payload = req.body as AcceptOrRejectFriendRequestPayload;
  const { user } = req.session;

  const isValid = FriendService.validateAcceptOrRejectFriendRequestPayload(payload);

  if (!isValid.success) {
    return res.status(BAD_REQUEST).json(
      new JSONResponse(
        VALIDATION_FAILED_MSG,
        null,
        {
          message: isValid.message,
        },
        false
      )
    );
  }

  // TODO: Create Invalid friend id response
  if (!friendId) {
    return res.status(BAD_REQUEST).json(
      new JSONResponse(
        VALIDATION_FAILED_MSG,
        null,
        {
          message: "Invalid friend id",
        },
        false
      )
    );
  }

  try {
    const data = await FriendService.acceptOrRejectFriendRequest(
      user.id,
      Number(friendId),
      payload.requestId,
      payload.type
    );
    // TODO: send notification to the user who sent the request

    const msg =
      payload.type === "ACCEPT"
        ? FRIEND_REQUEST_ACCEPTED_SUCCESSFULLY_MSG
        : FRIEND_REQUEST_REJECTED_SUCCESSFULLY_MSG;
    return res.status(OK).json(
      new JSONResponse(
        msg,
        {
          message: msg,
          friend: data,
        },
        null,
        true
      )
    );
  } catch (err) {
    const msg = getErrorReason(err) || SOMETHING_WENT_WRONG_MSG;
    if (msg === FRIEND_REQUEST_NOT_FOUND_MSG) {
      return res.status(NOT_FOUND).json(
        new JSONResponse(
          FRIEND_REQUEST_NOT_FOUND_MSG,
          null,
          {
            message: msg,
          },
          false
        )
      );
    }

    if (msg === UNAUTHORIZED_MSG) {
      return res.status(UNAUTHORIZED).json(UNAUTHORIZED_RESPONSE);
    }

    if (msg === FORBIDDEN_MSG) {
      return res.status(FORBIDDEN).json(FORBIDDEN_RESPONSE);
    }

    return res.status(INTERNAL_SERVER_ERROR).json(
      new JSONResponse(
        INTERNAL_SERVER_ERROR_MSG,
        null,
        {
          message: msg,
        },
        false
      )
    );
  }
};

// -----------------------------------------------------------------------------------------
export const getMyFriendRequests = async (req: Request, res: Response) => {
  const { limit, offset } = getLimitAndOffset(req);
  const { user } = req.session;

  try {
    const data = await FriendService.getFriendRequests(user.id, limit, offset);
    return res.status(OK).json(
      new JSONResponse(
        FRIEDN_REQUESTS_FETCHED_SUCCESSFULLY_MSG,
        {
          message: FRIEDN_REQUESTS_FETCHED_SUCCESSFULLY_MSG,
          requests: data.requests,
          meta: data.meta,
        },
        null,
        true
      )
    );
  } catch (err) {
    const msg = getErrorReason(err) || SOMETHING_WENT_WRONG_MSG;
    return res.status(INTERNAL_SERVER_ERROR).json(
      new JSONResponse(
        INTERNAL_SERVER_ERROR_MSG,
        null,
        {
          message: msg,
        },
        false
      )
    );
  }
};

// -----------------------------------------------------------------------------------------
export const getMyFollowers = async (req: Request, res: Response) => {
  const { limit, offset } = getLimitAndOffset(req);
  const { user } = req.session;

  try {
    const data = await FollowerService.getFollowersByUserId(user.id, limit, offset);
    return res.status(OK).json(
      new JSONResponse(
        "Followers fetched successfully",
        {
          message: "Followers fetched successfully",
          followers: data.followers,
          meta: data.meta,
        },
        null,
        true
      )
    );
  } catch (err) {
    const msg = getErrorReason(err) || SOMETHING_WENT_WRONG_MSG;
    return res.status(INTERNAL_SERVER_ERROR).json(
      new JSONResponse(
        INTERNAL_SERVER_ERROR_MSG,
        null,
        {
          message: msg,
        },
        false
      )
    );
  }
};

// -----------------------------------------------------------------------------------------
export const getMyFollowings = async (req: Request, res: Response) => {
  const { limit, offset } = getLimitAndOffset(req);
  const { user } = req.session;

  try {
    const data = await FollowerService.getFollowingByUserId(user.id, limit, offset);
    return res.status(OK).json(
      new JSONResponse(
        "Followings fetched successfully",
        {
          message: "Followings fetched successfully",
          followers: data.following,
          meta: data.meta,
        },
        null,
        true
      )
    );
  } catch (err) {
    const msg = getErrorReason(err) || SOMETHING_WENT_WRONG_MSG;
    return res.status(INTERNAL_SERVER_ERROR).json(
      new JSONResponse(
        INTERNAL_SERVER_ERROR_MSG,
        null,
        {
          message: msg,
        },
        false
      )
    );
  }
};

// -----------------------------------------------------------------------------------------
export const startFollowing = async (req: Request, res: Response) => {
  const { followingId } = req.params;
  const { user } = req.session;

  if (!followingId) {
    return res.status(BAD_REQUEST).json(
      new JSONResponse(
        VALIDATION_FAILED_MSG,
        null,
        {
          message: "Invalid following id",
        },
        false
      )
    );
  }

  try {
    const data = await FollowerService.startFollowing(user.id, Number(followingId));
    return res.status(OK).json(
      new JSONResponse(
        "Started following successfully",
        {
          message: "Started following successfully",
          follower: data,
        },
        null,
        true
      )
    );
  } catch (err) {
    const msg = getErrorReason(err) || SOMETHING_WENT_WRONG_MSG;
    if (msg === "Already following") {
      return res.status(BAD_REQUEST).json(
        new JSONResponse(
          "Already following",
          null,
          {
            message: msg,
          },
          false
        )
      );
    }

    return res.status(INTERNAL_SERVER_ERROR).json(
      new JSONResponse(
        INTERNAL_SERVER_ERROR_MSG,
        null,
        {
          message: msg,
        },
        false
      )
    );
  }
};

// -----------------------------------------------------------------------------------------
export const stopFollowing = async (req: Request, res: Response) => {
  const { followingId } = req.params;
  const { user } = req.session;

  if (!followingId) {
    return res.status(BAD_REQUEST).json(
      new JSONResponse(
        VALIDATION_FAILED_MSG,
        null,
        {
          message: "Invalid following id",
        },
        false
      )
    );
  }

  try {
    const data = await FollowerService.stopFollowing(user.id, Number(followingId));
    return res.status(OK).json(
      new JSONResponse(
        "Unfollowed successfully",
        {
          message: "Unfollowed successfully",
          follower: data,
        },
        null,
        true
      )
    );
  } catch (err) {
    const msg = getErrorReason(err) || SOMETHING_WENT_WRONG_MSG;
    if (msg === "Not following") {
      return res.status(BAD_REQUEST).json(
        new JSONResponse(
          "Not following",
          null,
          {
            message: msg,
          },
          false
        )
      );
    }

    return res.status(INTERNAL_SERVER_ERROR).json(
      new JSONResponse(
        INTERNAL_SERVER_ERROR_MSG,
        null,
        {
          message: msg,
        },
        false
      )
    );
  }
};

// -----------------------------------------------------------------------------------------
export const getAllMyGroups = async (req: Request, res: Response) => {
  const { limit, offset } = getLimitAndOffset(req);
  const { created, joined } = req.query;
  const { user } = req.session;

  if (created && joined && typeof created !== "boolean" && typeof joined !== "boolean") {
    return res.status(BAD_REQUEST).json(
      new JSONResponse(
        VALIDATION_FAILED_MSG,
        null,
        {
          message: "Invalid query params",
        },
        false
      )
    );
  }

  const isCreated = created === "true";
  const isJoined = joined === "true";

  try {
    const data = await GroupService.getAllGroupsByUserId(user.id, limit, offset, isCreated, isJoined);
    // TODO: Move messages to constants
    return res.status(OK).json(
      new JSONResponse(
        "Groups fetched successfully",
        {
          message: "Groups fetched successfully",
          groups: data.groups,
          meta: data.meta,
        },
        null,
        true
      )
    );
  } catch (err) {
    const msg = getErrorReason(err) || SOMETHING_WENT_WRONG_MSG;
    return res.status(INTERNAL_SERVER_ERROR).json(
      new JSONResponse(
        INTERNAL_SERVER_ERROR_MSG,
        null,
        {
          message: msg,
        },
        false
      )
    );
  }
};

// -----------------------------------------------------------------------------------------
export const getRequestedGroups = async (req: Request, res: Response) => {
  const { limit, offset } = getLimitAndOffset(req);
  const { user } = req.session;
  const { pending, rejected } = req.query;

  if (pending && rejected && typeof pending !== "boolean" && typeof rejected !== "boolean") {
    return res.status(BAD_REQUEST).json(
      new JSONResponse(
        VALIDATION_FAILED_MSG,
        null,
        {
          message: "Invalid query params",
        },
        false
      )
    );
  }

  const isPending = pending === "true";
  const isRejected = rejected === "true";

  try {
    const data = await GroupService.getRequestedGroupsByUserId(user.id, limit, offset, isPending, isRejected);
    return res.status(OK).json(
      new JSONResponse(
        "Requested groups fetched successfully",
        {
          message: "Requested groups fetched successfully",
          groups: data.groups,
          meta: data.meta,
        },
        null,
        true
      )
    );
  } catch (err) {
    const msg = getErrorReason(err) || SOMETHING_WENT_WRONG_MSG;
    // REFACTOR: Create a function to handle errors
    return res.status(INTERNAL_SERVER_ERROR).json(
      new JSONResponse(
        INTERNAL_SERVER_ERROR_MSG,
        null,
        {
          message: msg,
        },
        false
      )
    );
  }
};
