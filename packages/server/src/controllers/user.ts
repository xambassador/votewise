/**
 * @file: user.ts
 * @description: Contains all users related controllers
 */
import type { PostStatus } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";
import createError from "http-errors";
import { StatusCodes } from "http-status-codes";

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
  FORBIDDEN_ERROR_MSG,
  FORBIDDEN_MSG,
  FRIEDN_REQUESTS_FETCHED_SUCCESSFULLY_MSG,
  FRIENDS_FETCHED_SUCCESSFULLY_MSG,
  FRIEND_REQUEST_ACCEPTED_SUCCESSFULLY_MSG,
  FRIEND_REQUEST_NOT_FOUND_MSG,
  FRIEND_REQUEST_REJECTED_SUCCESSFULLY_MSG,
  FRIEND_REQUEST_SENT_SUCCESSFULLY_MSG,
  INVALID_FRIEND_ID,
  INVALID_POST_ID_MSG,
  POSTS_FETCHED_SUCCESSFULLY_MSG,
  POST_CREATED_SUCCESSFULLY_MSG,
  POST_DELETED_SUCCESSFULLY_MSG,
  POST_NOT_FOUND_MSG,
  POST_STATUS_CHANGED_SUCCESSFULLY_MSG,
  POST_UPDATE_SUCCESSFULLY_MSG,
  SOMETHING_WENT_WRONG_MSG,
  UNAUTHORIZED_MSG,
  USERNAME_ALREADY_TAKEN_MSG,
  USERNAME_AVAIALABLE_MSG,
  USERNAME_REQUIRED_MSG,
  USER_DETAILS_FETCHED_SUCCESSFULLY_MSG,
  VALIDATION_FAILED_MSG,
  getErrorReason,
  getLimitAndOffset,
} from "@/src/utils";

// -----------------------------------------------------------------------------------------
export const checkUsernameAvailability = async (req: Request, res: Response, next: NextFunction) => {
  const { username } = req.query as { username: string };

  if (!username) {
    return next(
      createError(StatusCodes.BAD_REQUEST, VALIDATION_FAILED_MSG, {
        reason: USERNAME_REQUIRED_MSG,
      })
    );
  }

  const user = await UserService.checkIfUsernameExists(username);

  if (user) return next(createError(StatusCodes.BAD_REQUEST, USERNAME_ALREADY_TAKEN_MSG));

  return res.status(StatusCodes.OK).json(
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
export const getMyDetails = async (req: Request, res: Response, next: NextFunction) => {
  const { user } = req.session;
  try {
    const data = await UserService.getMyDetails(user.id);
    return res.status(StatusCodes.OK).json(
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
    return next(
      createError(StatusCodes.INTERNAL_SERVER_ERROR, SOMETHING_WENT_WRONG_MSG, {
        reason: msg,
      })
    );
  }
};

// -----------------------------------------------------------------------------------------
export const createPost = async (req: Request, res: Response, next: NextFunction) => {
  const payload = req.body as CreatePostPayload;

  const isValidPayload = PostService.validatePostPayload(payload);

  if (!isValidPayload.success) {
    return next(
      createError(StatusCodes.BAD_REQUEST, VALIDATION_FAILED_MSG, {
        reason: isValidPayload.message,
      })
    );
  }

  const { user } = req.session;

  try {
    const data = await PostService.createPost(payload, user.id);
    return res.status(StatusCodes.OK).json(
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
    return next(
      createError(StatusCodes.INTERNAL_SERVER_ERROR, SOMETHING_WENT_WRONG_MSG, {
        reason: msg,
      })
    );
  }
};

// -----------------------------------------------------------------------------------------
export const getMyPosts = async (req: Request, res: Response, next: NextFunction) => {
  const { limit, offset } = getLimitAndOffset(req);
  const { user } = req.session;
  const { status, orderBy } = req.query;

  type Status = "open" | "closed" | "archived" | "inprogress";
  type OrderBy = "asc" | "desc";

  if (status && !["open", "closed", "archived", "inprogress"].includes(status as Status)) {
    return next(createError(StatusCodes.BAD_REQUEST, VALIDATION_FAILED_MSG, { reason: "Invalid status" }));
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
    return res.status(StatusCodes.OK).json(
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
    return next(createError(StatusCodes.INTERNAL_SERVER_ERROR, SOMETHING_WENT_WRONG_MSG, { reason: msg }));
  }
};

// -----------------------------------------------------------------------------------------
export const updateMyPost = async (req: Request, res: Response, next: NextFunction) => {
  const payload = req.body as UpdatePostPayload;
  const { postId } = req.params;

  const isValid = PostService.validatePostPayload(payload);

  if (!isValid.success) {
    return next(createError(StatusCodes.BAD_REQUEST, VALIDATION_FAILED_MSG, { reason: isValid.message }));
  }

  if (!postId) {
    return next(createError(StatusCodes.BAD_REQUEST, VALIDATION_FAILED_MSG, { reason: INVALID_POST_ID_MSG }));
  }

  const { user } = req.session;

  try {
    const data = await PostService.updatePost(Number(postId), user.id, payload);
    return res.status(StatusCodes.OK).json(
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

    if (msg === POST_NOT_FOUND_MSG) return next(createError(StatusCodes.NOT_FOUND, POST_NOT_FOUND_MSG));
    if (msg === UNAUTHORIZED_MSG) return next(createError(StatusCodes.UNAUTHORIZED, UNAUTHORIZED_MSG));
    if (msg === FORBIDDEN_MSG) {
      return next(
        createError(StatusCodes.FORBIDDEN, FORBIDDEN_MSG, {
          reason: FORBIDDEN_ERROR_MSG,
        })
      );
    }

    return next(createError(StatusCodes.INTERNAL_SERVER_ERROR, SOMETHING_WENT_WRONG_MSG, { reason: msg }));
  }
};

// -----------------------------------------------------------------------------------------
export const deleteMyPost = async (req: Request, res: Response, next: NextFunction) => {
  const { postId } = req.params;

  if (!postId) {
    return next(
      createError(StatusCodes.BAD_REQUEST, VALIDATION_FAILED_MSG, {
        reason: INVALID_POST_ID_MSG,
      })
    );
  }

  const { user } = req.session;

  try {
    await PostService.deleteMyPost(Number(postId), user.id);
    return res.status(StatusCodes.OK).json(
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

    if (msg === POST_NOT_FOUND_MSG) return next(createError(StatusCodes.NOT_FOUND, POST_NOT_FOUND_MSG));
    if (msg === UNAUTHORIZED_MSG) return next(createError(StatusCodes.UNAUTHORIZED, UNAUTHORIZED_MSG));
    if (msg === FORBIDDEN_MSG) {
      return next(
        createError(StatusCodes.FORBIDDEN, FORBIDDEN_MSG, {
          reason: FORBIDDEN_ERROR_MSG,
        })
      );
    }

    return next(createError(StatusCodes.INTERNAL_SERVER_ERROR, SOMETHING_WENT_WRONG_MSG, { reason: msg }));
  }
};

// -----------------------------------------------------------------------------------------
export const updateStatus = async (req: Request, res: Response, next: NextFunction) => {
  const payload = req.body as ChangeStatusPayload;
  const { postId } = req.params;

  if (!postId) {
    return next(createError(StatusCodes.BAD_REQUEST, VALIDATION_FAILED_MSG, { reason: INVALID_POST_ID_MSG }));
  }

  const { user } = req.session;

  try {
    const data = await PostService.changeStatus(Number(postId), payload, user.id);
    return res.status(StatusCodes.OK).json(
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

    if (msg === POST_NOT_FOUND_MSG) return next(createError(StatusCodes.NOT_FOUND, POST_NOT_FOUND_MSG));
    if (msg === UNAUTHORIZED_MSG) return next(createError(StatusCodes.UNAUTHORIZED, UNAUTHORIZED_MSG));
    if (msg === FORBIDDEN_MSG) {
      return next(createError(StatusCodes.FORBIDDEN, FORBIDDEN_MSG, { reason: FORBIDDEN_ERROR_MSG }));
    }

    return next(createError(StatusCodes.INTERNAL_SERVER_ERROR, SOMETHING_WENT_WRONG_MSG, { reason: msg }));
  }
};

// -----------------------------------------------------------------------------------------
export const getMyComments = async (req: Request, res: Response, next: NextFunction) => {
  const { limit, offset } = getLimitAndOffset(req);
  const { orderBy, status } = req.query;
  const { user } = req.session;
  const defaulOrderBy = (orderBy || "desc") as "asc" | "desc";
  const defaultStatus = (status || "OPEN") as "OPEN" | "CLOSED" | "INPROGRESS" | "ARCHIVED";

  try {
    const data = await PostService.getCommentsByUserId(user.id, defaultStatus, defaulOrderBy, limit, offset);
    return res.status(StatusCodes.OK).json(
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
    return next(
      createError(StatusCodes.INTERNAL_SERVER_ERROR, SOMETHING_WENT_WRONG_MSG, {
        reason: msg,
      })
    );
  }
};

// -----------------------------------------------------------------------------------------
export const getMyFriends = async (req: Request, res: Response, next: NextFunction) => {
  const { limit, offset } = getLimitAndOffset(req);
  const { user } = req.session;

  try {
    const data = await FriendService.getFriends(user.id, limit, offset);
    return res.status(StatusCodes.OK).json(
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
    return next(
      createError(StatusCodes.INTERNAL_SERVER_ERROR, SOMETHING_WENT_WRONG_MSG, {
        reason: msg,
      })
    );
  }
};

// -----------------------------------------------------------------------------------------
export const addFriend = async (req: Request, res: Response, next: NextFunction) => {
  const { friendId } = req.params;

  if (!friendId) {
    return next(
      createError(StatusCodes.BAD_REQUEST, VALIDATION_FAILED_MSG, {
        reason: INVALID_FRIEND_ID,
      })
    );
  }

  const { user } = req.session;

  try {
    const data = await FriendService.addFriend(user.id, Number(friendId));
    // TODO: send notification to the user and send email
    return res.status(StatusCodes.OK).json(
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
    if (msg === ALREADY_FRIENDS_MSG || msg === "Friend request already sent") {
      return next(createError(StatusCodes.BAD_REQUEST, msg));
    }

    return next(
      createError(StatusCodes.INTERNAL_SERVER_ERROR, SOMETHING_WENT_WRONG_MSG, {
        reason: msg,
      })
    );
  }
};

// -----------------------------------------------------------------------------------------
export const acceptOrRejectFriendRequest = async (req: Request, res: Response, next: NextFunction) => {
  const { friendId } = req.params;
  const payload = req.body as AcceptOrRejectFriendRequestPayload;
  const { user } = req.session;

  const isValid = FriendService.validateAcceptOrRejectFriendRequestPayload(payload);

  if (!isValid.success) {
    return next(
      createError(StatusCodes.BAD_REQUEST, VALIDATION_FAILED_MSG, {
        reason: isValid.message,
      })
    );
  }

  if (!friendId) {
    return next(
      createError(StatusCodes.BAD_REQUEST, VALIDATION_FAILED_MSG, {
        reason: INVALID_FRIEND_ID,
      })
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

    return res.status(StatusCodes.OK).json(
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
    let code = StatusCodes.INTERNAL_SERVER_ERROR;

    if (msg === FRIEND_REQUEST_NOT_FOUND_MSG) code = StatusCodes.NOT_FOUND;
    if (msg === UNAUTHORIZED_MSG) code = StatusCodes.UNAUTHORIZED;
    if (msg === FORBIDDEN_MSG) code = StatusCodes.FORBIDDEN;

    const message = msg !== SOMETHING_WENT_WRONG_MSG ? msg : SOMETHING_WENT_WRONG_MSG;
    return next(
      createError(code, message, {
        reason: msg,
      })
    );
  }
};

// -----------------------------------------------------------------------------------------
export const getMyFriendRequests = async (req: Request, res: Response, next: NextFunction) => {
  const { limit, offset } = getLimitAndOffset(req);
  const { user } = req.session;

  try {
    const data = await FriendService.getFriendRequests(user.id, limit, offset);
    return res.status(StatusCodes.OK).json(
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
    return next(
      createError(StatusCodes.INTERNAL_SERVER_ERROR, SOMETHING_WENT_WRONG_MSG, {
        reason: msg,
      })
    );
  }
};

// -----------------------------------------------------------------------------------------
export const getMyFollowers = async (req: Request, res: Response, next: NextFunction) => {
  const { limit, offset } = getLimitAndOffset(req);
  const { user } = req.session;

  try {
    const data = await FollowerService.getFollowersByUserId(user.id, limit, offset);
    return res.status(StatusCodes.OK).json(
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
    return next(
      createError(StatusCodes.INTERNAL_SERVER_ERROR, SOMETHING_WENT_WRONG_MSG, {
        reason: msg,
      })
    );
  }
};

// -----------------------------------------------------------------------------------------
export const getMyFollowings = async (req: Request, res: Response, next: NextFunction) => {
  const { limit, offset } = getLimitAndOffset(req);
  const { user } = req.session;

  try {
    const data = await FollowerService.getFollowingByUserId(user.id, limit, offset);
    return res.status(StatusCodes.OK).json(
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
    return next(
      createError(StatusCodes.INTERNAL_SERVER_ERROR, SOMETHING_WENT_WRONG_MSG, {
        reason: msg,
      })
    );
  }
};

// -----------------------------------------------------------------------------------------
export const startFollowing = async (req: Request, res: Response, next: NextFunction) => {
  const { followingId } = req.params;
  const { user } = req.session;

  if (!followingId) {
    return next(
      createError(StatusCodes.BAD_REQUEST, VALIDATION_FAILED_MSG, {
        reason: "Invalid following id",
      })
    );
  }

  try {
    const data = await FollowerService.startFollowing(user.id, Number(followingId));
    return res.status(StatusCodes.OK).json(
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
    if (msg === "Already following") return next(createError(StatusCodes.BAD_REQUEST, msg));
    return next(
      createError(StatusCodes.INTERNAL_SERVER_ERROR, SOMETHING_WENT_WRONG_MSG, {
        reason: msg,
      })
    );
  }
};

// -----------------------------------------------------------------------------------------
export const stopFollowing = async (req: Request, res: Response, next: NextFunction) => {
  const { followingId } = req.params;
  const { user } = req.session;

  if (!followingId) {
    return next(
      createError(StatusCodes.BAD_REQUEST, VALIDATION_FAILED_MSG, {
        reason: "Invalid following id",
      })
    );
  }

  try {
    const data = await FollowerService.stopFollowing(user.id, Number(followingId));
    return res.status(StatusCodes.OK).json(
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
      return next(createError(StatusCodes.BAD_REQUEST, msg));
    }

    return next(
      createError(StatusCodes.INTERNAL_SERVER_ERROR, SOMETHING_WENT_WRONG_MSG, {
        reason: msg,
      })
    );
  }
};

// -----------------------------------------------------------------------------------------
export const getAllMyGroups = async (req: Request, res: Response, next: NextFunction) => {
  const { limit, offset } = getLimitAndOffset(req);
  const { created, joined } = req.query;
  const { user } = req.session;

  if (created && joined && typeof created !== "boolean" && typeof joined !== "boolean") {
    return next(
      createError(StatusCodes.BAD_REQUEST, VALIDATION_FAILED_MSG, {
        reason: "Invalid query params",
      })
    );
  }

  const isCreated = created === "true";
  const isJoined = joined === "true";

  try {
    const data = await GroupService.getAllGroupsByUserId(user.id, limit, offset, isCreated, isJoined);
    // TODO: Move messages to constants
    return res.status(StatusCodes.OK).json(
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
    return next(
      createError(StatusCodes.INTERNAL_SERVER_ERROR, SOMETHING_WENT_WRONG_MSG, {
        reason: msg,
      })
    );
  }
};

// -----------------------------------------------------------------------------------------
export const getRequestedGroups = async (req: Request, res: Response, next: NextFunction) => {
  const { limit, offset } = getLimitAndOffset(req);
  const { user } = req.session;
  const { pending, rejected } = req.query;

  if (pending && rejected && typeof pending !== "boolean" && typeof rejected !== "boolean") {
    return next(
      createError(StatusCodes.BAD_REQUEST, VALIDATION_FAILED_MSG, {
        reason: "Invalid query params",
      })
    );
  }

  const isPending = pending === "true";
  const isRejected = rejected === "true";

  try {
    const data = await GroupService.getRequestedGroupsByUserId(user.id, limit, offset, isPending, isRejected);
    return res.status(StatusCodes.OK).json(
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
    return next(
      createError(StatusCodes.INTERNAL_SERVER_ERROR, SOMETHING_WENT_WRONG_MSG, {
        reason: msg,
      })
    );
  }
};

// -----------------------------------------------------------------------------------------
// IMPLEMENTME: Implement this
export const updateMyDetails = async (req: Request, res: Response) => {};
