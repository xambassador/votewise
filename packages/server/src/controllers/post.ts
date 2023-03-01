/**
 * @file: post.ts
 * @description: Contains all posts related controllers
 */
import type { Request, Response } from "express";
import httpStatusCodes from "http-status-codes";

import { CommentOnPostPayload } from "@votewise/types";

// -----------------------------------------------------------------------------------------
import { JSONResponse } from "@/src/lib";
import PostService from "@/src/services/posts";
import {
  INVALID_POST_ID_RESPONSE,
  POSTS_FETCHED_SUCCESSFULLY_MSG,
  POST_DETAILS_FETCHED_SUCCESSFULLY_MSG,
  SOMETHING_WENT_WRONG_MSG,
  VALIDATION_FAILED_MSG,
  getErrorReason,
  getLimitAndOffset,
} from "@/src/utils";

// -----------------------------------------------------------------------------------------
const { OK, BAD_REQUEST, INTERNAL_SERVER_ERROR } = httpStatusCodes;

// -----------------------------------------------------------------------------------------
export const getPosts = async (req: Request, res: Response) => {
  const { user } = req.session;
  const { limit, offset } = getLimitAndOffset(req);
  const data = await PostService.getPosts(user.id, limit, offset);

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
};

// -----------------------------------------------------------------------------------------
export const getPost = async (req: Request, res: Response) => {
  const { postId } = req.params;

  if (!postId) {
    return res.status(BAD_REQUEST).json(INVALID_POST_ID_RESPONSE);
  }

  try {
    const post = await PostService.getPost(Number(postId));
    return res.status(OK).json(
      new JSONResponse(
        POST_DETAILS_FETCHED_SUCCESSFULLY_MSG,
        {
          message: POST_DETAILS_FETCHED_SUCCESSFULLY_MSG,
          post: {
            ...post,
            meta: undefined,
          },
          meta: post.meta,
        },
        null,
        true
      )
    );
  } catch (err) {
    let message;
    if (err instanceof Error) {
      message = err.message;
    } else {
      message = SOMETHING_WENT_WRONG_MSG;
    }
    return res.status(INTERNAL_SERVER_ERROR).json(
      new JSONResponse(
        SOMETHING_WENT_WRONG_MSG,
        null,
        {
          message,
        },
        false
      )
    );
  }
};

// -----------------------------------------------------------------------------------------
export const getCommentsForPost = async (req: Request, res: Response) => {
  const { postId } = req.params;

  if (!postId) {
    return res.status(BAD_REQUEST).json(INVALID_POST_ID_RESPONSE);
  }

  try {
    const { limit, offset } = getLimitAndOffset(req);
    const data = await PostService.getCommentsForPost(Number(postId), limit, offset);
    return res.status(OK).json(
      new JSONResponse(
        "Post comments fetched successfully",
        {
          message: "Post comments fetched successfully",
          comments: data.comments,
          meta: data.meta,
        },
        null,
        false
      )
    );
  } catch (err) {
    const msg = getErrorReason(err) || "Something went wrong";
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
export const likePost = async (req: Request, res: Response) => {
  const { postId } = req.params;
  const { user } = req.session;

  if (!postId) {
    return res.status(BAD_REQUEST).json(INVALID_POST_ID_RESPONSE);
  }

  try {
    const data = await PostService.likePost(Number(postId), user.id);
    return res.status(OK).json(
      new JSONResponse(
        "Post liked successfully",
        {
          message: "Post liked successfully",
          post_total_upvotes: data,
        },
        null,
        true
      )
    );
  } catch (err) {
    const msg = getErrorReason(err) || "Something went wrong";
    if (msg === "Post already liked") {
      return res.status(BAD_REQUEST).json(
        new JSONResponse(
          "Post already liked",
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
export const unlikePost = async (req: Request, res: Response) => {
  const { postId } = req.params;
  const { user } = req.session;

  if (!postId) {
    return res.status(BAD_REQUEST).json(INVALID_POST_ID_RESPONSE);
  }

  try {
    const data = await PostService.unlikePost(Number(postId), user.id);
    return res.status(OK).json(
      new JSONResponse(
        "Post unliked successfully",
        {
          message: "Post unliked successfully",
          post_total_upvotes: data,
        },
        null,
        true
      )
    );
  } catch (err) {
    const msg = getErrorReason(err) || "Something went wrong";
    if (msg === "Post not liked") {
      return res.status(BAD_REQUEST).json(
        new JSONResponse(
          "Post not liked",
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
export const commentOnPost = async (req: Request, res: Response) => {
  const { text } = req.body as CommentOnPostPayload;
  const { postId } = req.params;

  if (!postId) {
    return res.status(BAD_REQUEST).json(INVALID_POST_ID_RESPONSE);
  }

  if (!text) {
    return res.status(BAD_REQUEST).json(
      new JSONResponse(
        VALIDATION_FAILED_MSG,
        null,
        {
          message: "Comment should not be empty",
        },
        false
      )
    );
  }

  const { user } = req.session;

  try {
    const data = await PostService.addComment(Number(postId), user.id, text);
    return res.status(OK).json(
      new JSONResponse(
        "Comment added successfully",
        {
          message: "Comment added successfully",
          comment: data,
        },
        null,
        true
      )
    );
  } catch (err) {
    const msg = getErrorReason(err) || "Something went wrong";
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
