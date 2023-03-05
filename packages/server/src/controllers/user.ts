/**
 * @file: user.ts
 * @description: Contains all users related controllers
 */
import type { PostStatus } from "@prisma/client";
import type { Request, Response } from "express";
import httpStatusCodes from "http-status-codes";

import type { ChangeStatusPayload, CreatePostPayload, UpdatePostPayload } from "@votewise/types";

import { JSONResponse } from "@/src/lib";
import FriendService from "@/src/services/friends";
import PostService from "@/src/services/posts";
import UserService from "@/src/services/user";
import {
  COMMENT_FETCHED_SUCCESSFULLY_MSG,
  FRIENDS_FETCHED_SUCCESSFULLY_MSG,
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

const { BAD_REQUEST, OK, INTERNAL_SERVER_ERROR, NOT_FOUND, UNAUTHORIZED } = httpStatusCodes;

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
export const getMyDetails = (req: Request, res: Response) => {
  const { user } = req.session;
  try {
    return res.status(OK).json(
      new JSONResponse(
        USER_DETAILS_FETCHED_SUCCESSFULLY_MSG,
        {
          message: USER_DETAILS_FETCHED_SUCCESSFULLY_MSG,
          user,
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
  const { status } = req.query;

  type Status = "open" | "closed" | "archived" | "inprogress";

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
    const data = await PostService.getPostsByUserId(user.id, limit, offset, mappedStatus);
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
  const { user } = req.session;

  try {
    const data = await PostService.getCommentsByUserId(user.id, limit, offset);
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
    const data = await FriendService.getFriends(user.id);
    return res.status(OK).json(
      new JSONResponse(
        FRIENDS_FETCHED_SUCCESSFULLY_MSG,
        {
          message: FRIENDS_FETCHED_SUCCESSFULLY_MSG,
          friends: data,
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
    return res.status(OK).json(
      new JSONResponse(
        "FRIEND_ADDED_SUCCESSFULLY_MSG",
        {
          message: "FRIEND_ADDED_SUCCESSFULLY_MSG",
          friend: data,
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
