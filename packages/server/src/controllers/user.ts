/**
 * @file: user.ts
 * @description: Contains all users related controllers
 */
import type { Request, Response } from "express";
import httpStatusCodes from "http-status-codes";

import type { CreatePostPayload, UpdatePostPayload } from "@votewise/types";

import { JSONResponse } from "@/src/lib";
import PostService from "@/src/services/posts";
import UserService from "@/src/services/user";
import {
  INTERNAL_SERVER_ERROR_MSG,
  INVALID_POST_ID_RESPONSE,
  POSTS_FETCHED_SUCCESSFULLY_MSG,
  POST_CREATED_SUCCESSFULLY_MSG,
  POST_DELETED_SUCCESSFULLY_MSG,
  POST_NOT_FOUND_MSG,
  POST_UPDATE_SUCCESSFULLY_MSG,
  SOMETHING_WENT_WRONG_MSG,
  VALIDATION_FAILED_MSG,
  getErrorReason,
  getLimitAndOffset,
} from "@/src/utils";

const { BAD_REQUEST, OK, INTERNAL_SERVER_ERROR, NOT_FOUND } = httpStatusCodes;

// -----------------------------------------------------------------------------------------
export const checkUsernameAvailability = async (req: Request, res: Response) => {
  const { username } = req.query as { username: string };

  if (!username) {
    return res.status(BAD_REQUEST).json(
      new JSONResponse(
        "Validation failed",
        null,
        {
          message: "Username is required",
        },
        false
      )
    );
  }

  const user = await UserService.checkIfUsernameExists(username);

  if (user) {
    return res.status(BAD_REQUEST).json(
      new JSONResponse(
        "Username is already taken",
        null,
        {
          message: "Username is already taken",
        },
        false
      )
    );
  }

  return res.status(OK).json(
    new JSONResponse(
      "Username is available",
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
        "User details fetched successfully",
        {
          message: "Get user details",
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
        "Something went wrong",
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

  try {
    const data = await PostService.getPostsByUserId(user.id, limit, offset);
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
      return res.status(NOT_FOUND).json(
        new JSONResponse(
          POST_NOT_FOUND_MSG,
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
