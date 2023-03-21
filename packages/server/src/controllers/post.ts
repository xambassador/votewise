/**
 * @file: post.ts
 * @description: Contains all posts related controllers
 */
import type { Request, Response } from "express";
import httpStatusCodes from "http-status-codes";

import type {
  CommentOnPostPayload,
  ReplyToCommentOnPostPayload,
  UpdateCommentOnPostPayload,
} from "@votewise/types";

// -----------------------------------------------------------------------------------------
import { JSONResponse } from "@/src/lib";
import PostService from "@/src/services/posts";
import {
  ALREADY_LIKED_COMMENT_MSG,
  ALREADY_LIKED_COMMENT_RESPONSE,
  COMMENT_ADDED_SUCCESSFULLY_MSG,
  COMMENT_DELETED_SUCCESSFULLY_MSG,
  COMMENT_LIKE_SUCCESSFULLY_MSG,
  COMMENT_NOT_EMPTY_RESPONSE,
  COMMENT_NOT_FOUND_MSG,
  COMMENT_NOT_FOUND_RESPONSE,
  COMMENT_NOT_LIKED_MSG,
  COMMENT_NOT_LIKED_RESPONSE,
  COMMENT_POST_CLOSED_MSG,
  COMMENT_POST_CLOSED_RESPONSE,
  COMMENT_UNLIKE_SUCCESSFULLY_MSG,
  COMMENT_UPDATED_SUCCESSFULLY_MSG,
  GETTING_REPLIES_FROM_COMMENT_MSG,
  INVALID_COMMENT_ID_RESPONSE,
  INVALID_POST_ID_RESPONSE,
  POSTS_FETCHED_SUCCESSFULLY_MSG,
  POST_ALREADY_LIKED_MSG,
  POST_ALREADY_LIKED_RESPONSE,
  POST_CLOSED_MSG,
  POST_CLOSED_RESPONSE,
  POST_DETAILS_FETCHED_SUCCESSFULLY_MSG,
  POST_NOT_FOUND_MSG,
  POST_NOT_FOUND_RESPONSE,
  POST_NOT_LIKED_MSG,
  POST_NOT_LIKED_RESPONSE,
  POST_UNLIKED_SUCCESSFULLY_MSG,
  REPLAY_ADDED_SUCCESSFULLY_MSG,
  SOMETHING_WENT_WRONG_MSG,
  UNAUTHORIZED_MSG,
  UNAUTHORIZED_RESPONSE,
  VALIDATION_FAILED_MSG,
  getErrorReason,
  getLimitAndOffset,
} from "@/src/utils";

// -----------------------------------------------------------------------------------------
const { OK, BAD_REQUEST, INTERNAL_SERVER_ERROR, NOT_FOUND, UNAUTHORIZED } = httpStatusCodes;

// -----------------------------------------------------------------------------------------
export const getPosts = async (req: Request, res: Response) => {
  const { user } = req.session;
  const { limit, offset } = getLimitAndOffset(req);
  const { sortBy, order } = req.query;
  type SortBy = "upvote" | "comment" | "date";
  type OrderType = "desc" | "asc";

  if (sortBy && !["upvote", "comment", "date"].includes(sortBy as SortBy)) {
    return res.status(BAD_REQUEST).json(
      new JSONResponse(
        VALIDATION_FAILED_MSG,
        null,
        {
          message: "Invalid sort by value",
        },
        false
      )
    );
  }

  if (order && !["desc", "asc"].includes(order as OrderType)) {
    return res.status(BAD_REQUEST).json(
      new JSONResponse(
        VALIDATION_FAILED_MSG,
        null,
        {
          message: "Invalid order value",
        },
        false
      )
    );
  }

  const sortby: SortBy = (sortBy as SortBy) || "date";
  const sortorder: OrderType = (order as OrderType) || "desc";

  const data = await PostService.getPosts(user.id, limit, offset, sortby, sortorder);

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
  const { user } = req.session;

  if (!postId) {
    return res.status(BAD_REQUEST).json(INVALID_POST_ID_RESPONSE);
  }

  try {
    const post = await PostService.getPost(Number(postId), user.id);
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
  const { user } = req.session;

  if (!postId) {
    return res.status(BAD_REQUEST).json(INVALID_POST_ID_RESPONSE);
  }

  try {
    const { limit, offset } = getLimitAndOffset(req);
    const data = await PostService.getCommentsForPost(Number(postId), user.id, limit, offset);
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
    const msg = getErrorReason(err) || SOMETHING_WENT_WRONG_MSG;
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
    const msg = getErrorReason(err) || SOMETHING_WENT_WRONG_MSG;
    if (msg === POST_ALREADY_LIKED_MSG) {
      return res.status(BAD_REQUEST).json(POST_ALREADY_LIKED_RESPONSE);
    }
    if (msg === POST_CLOSED_MSG) {
      return res.status(BAD_REQUEST).json(POST_CLOSED_RESPONSE);
    }
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
        POST_UNLIKED_SUCCESSFULLY_MSG,
        {
          message: POST_UNLIKED_SUCCESSFULLY_MSG,
          post_total_upvotes: data,
        },
        null,
        true
      )
    );
  } catch (err) {
    const msg = getErrorReason(err) || SOMETHING_WENT_WRONG_MSG;
    if (msg === POST_NOT_LIKED_MSG) {
      return res.status(BAD_REQUEST).json(POST_NOT_LIKED_RESPONSE);
    }

    if (msg === POST_CLOSED_MSG) {
      return res.status(BAD_REQUEST).json(POST_CLOSED_RESPONSE);
    }

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
export const commentOnPost = async (req: Request, res: Response) => {
  const { text } = req.body as CommentOnPostPayload;
  const { postId } = req.params;

  if (!postId) {
    return res.status(BAD_REQUEST).json(INVALID_POST_ID_RESPONSE);
  }

  if (!text) {
    return res.status(BAD_REQUEST).json(COMMENT_NOT_EMPTY_RESPONSE);
  }

  const { user } = req.session;

  try {
    const data = await PostService.addComment(Number(postId), user.id, text);
    return res.status(OK).json(
      new JSONResponse(
        COMMENT_ADDED_SUCCESSFULLY_MSG,
        {
          message: COMMENT_ADDED_SUCCESSFULLY_MSG,
          comment: data,
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

    if (msg === COMMENT_POST_CLOSED_MSG) {
      return res.status(BAD_REQUEST).json(COMMENT_POST_CLOSED_RESPONSE);
    }

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
export const deleteCommentOnPost = async (req: Request, res: Response) => {
  const { postId, commentId } = req.params;
  const { user } = req.session;

  if (!postId) {
    return res.status(BAD_REQUEST).json(INVALID_POST_ID_RESPONSE);
  }

  if (!commentId) {
    return res.status(BAD_REQUEST).json(INVALID_COMMENT_ID_RESPONSE);
  }

  try {
    await PostService.deleteComment(Number(postId), Number(commentId), user.id);
    return res.status(OK).json(
      new JSONResponse(
        COMMENT_DELETED_SUCCESSFULLY_MSG,
        {
          message: COMMENT_DELETED_SUCCESSFULLY_MSG,
        },
        null,
        true
      )
    );
  } catch (err) {
    const msg = getErrorReason(err) || SOMETHING_WENT_WRONG_MSG;
    if (msg === COMMENT_NOT_FOUND_MSG) {
      return res.status(NOT_FOUND).json(COMMENT_NOT_FOUND_RESPONSE);
    }

    if (msg === UNAUTHORIZED_MSG) {
      return res.status(UNAUTHORIZED).json(UNAUTHORIZED_RESPONSE);
    }

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
export const updateCommentOnPost = async (req: Request, res: Response) => {
  const { commentId, postId } = req.params;
  const { text } = req.body as UpdateCommentOnPostPayload;

  if (!postId) {
    return res.status(BAD_REQUEST).json(INVALID_POST_ID_RESPONSE);
  }

  if (!commentId) {
    return res.status(BAD_REQUEST).json(INVALID_COMMENT_ID_RESPONSE);
  }

  if (!text) {
    return res.status(BAD_REQUEST).json(COMMENT_NOT_EMPTY_RESPONSE);
  }

  const { user } = req.session;

  try {
    const data = await PostService.updateComment(Number(postId), Number(commentId), user.id, text);
    return res.status(OK).json(
      new JSONResponse(
        COMMENT_UPDATED_SUCCESSFULLY_MSG,
        {
          message: COMMENT_UPDATED_SUCCESSFULLY_MSG,
          comment: data,
        },
        null,
        true
      )
    );
  } catch (err) {
    const msg = getErrorReason(err) || SOMETHING_WENT_WRONG_MSG;
    if (msg === COMMENT_NOT_FOUND_MSG) {
      return res.status(NOT_FOUND).json(COMMENT_NOT_FOUND_RESPONSE);
    }
    if (msg === UNAUTHORIZED_MSG) {
      return res.status(UNAUTHORIZED).json(UNAUTHORIZED_RESPONSE);
    }
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
export const replyToCommentOnPost = async (req: Request, res: Response) => {
  const { text } = req.body as ReplyToCommentOnPostPayload;
  const { postId, commentId } = req.params;

  if (!postId) {
    return res.status(BAD_REQUEST).json(INVALID_POST_ID_RESPONSE);
  }

  if (!commentId) {
    return res.status(BAD_REQUEST).json(INVALID_COMMENT_ID_RESPONSE);
  }

  if (!text) {
    return res.status(BAD_REQUEST).json(COMMENT_NOT_EMPTY_RESPONSE);
  }

  const { user } = req.session;

  try {
    const data = await PostService.addReplyToComment(Number(postId), Number(commentId), user.id, text);
    return res.status(OK).json(
      new JSONResponse(
        REPLAY_ADDED_SUCCESSFULLY_MSG,
        {
          message: REPLAY_ADDED_SUCCESSFULLY_MSG,
          comment: data,
        },
        null,
        true
      )
    );
  } catch (err) {
    const msg = getErrorReason(err) || SOMETHING_WENT_WRONG_MSG;
    if (msg === COMMENT_NOT_FOUND_MSG) {
      return res.status(NOT_FOUND).json(COMMENT_NOT_FOUND_RESPONSE);
    }
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
export const getRepliesToCommentOnPost = async (req: Request, res: Response) => {
  const { postId, commentId } = req.params;
  const { user } = req.session;

  if (!postId) {
    return res.status(BAD_REQUEST).json(INVALID_POST_ID_RESPONSE);
  }

  if (!commentId) {
    return res.status(BAD_REQUEST).json(INVALID_COMMENT_ID_RESPONSE);
  }

  const { limit, offset } = getLimitAndOffset(req);

  try {
    const data = await PostService.getRepliesToComment(
      Number(postId),
      Number(commentId),
      user.id,
      limit,
      offset
    );
    return res.status(OK).json(
      new JSONResponse(
        GETTING_REPLIES_FROM_COMMENT_MSG,
        {
          message: GETTING_REPLIES_FROM_COMMENT_MSG,
          replies: data.comments,
          meta: data.meta,
        },
        null,
        true
      )
    );
  } catch (err) {
    const msg = getErrorReason(err) || SOMETHING_WENT_WRONG_MSG;
    if (msg === COMMENT_NOT_FOUND_MSG) {
      return res.status(NOT_FOUND).json(COMMENT_NOT_FOUND_RESPONSE);
    }
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
export const likeComment = async (req: Request, res: Response) => {
  const { commentId, postId } = req.params;

  if (!postId) {
    return res.status(BAD_REQUEST).json(INVALID_POST_ID_RESPONSE);
  }

  if (!commentId) {
    return res.status(BAD_REQUEST).json(INVALID_COMMENT_ID_RESPONSE);
  }

  const { user } = req.session;

  try {
    const data = await PostService.likeComment(Number(postId), Number(commentId), user.id);
    return res.status(OK).json(
      new JSONResponse(
        COMMENT_LIKE_SUCCESSFULLY_MSG,
        {
          message: COMMENT_LIKE_SUCCESSFULLY_MSG,
          comment: data,
        },
        null,
        true
      )
    );
  } catch (err) {
    const msg = getErrorReason(err) || SOMETHING_WENT_WRONG_MSG;
    if (msg === COMMENT_NOT_FOUND_MSG) {
      return res.status(NOT_FOUND).json(COMMENT_NOT_FOUND_RESPONSE);
    }
    if (msg === ALREADY_LIKED_COMMENT_MSG) {
      return res.status(BAD_REQUEST).json(ALREADY_LIKED_COMMENT_RESPONSE);
    }
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
export const unlikeComment = async (req: Request, res: Response) => {
  const { commentId, postId } = req.params;

  if (!postId) {
    return res.status(BAD_REQUEST).json(INVALID_POST_ID_RESPONSE);
  }

  if (!commentId) {
    return res.status(BAD_REQUEST).json(INVALID_COMMENT_ID_RESPONSE);
  }

  const { user } = req.session;

  try {
    const data = await PostService.unlikeComment(Number(postId), Number(commentId), user.id);
    return res.status(OK).json(
      new JSONResponse(
        COMMENT_UNLIKE_SUCCESSFULLY_MSG,
        {
          message: COMMENT_UNLIKE_SUCCESSFULLY_MSG,
          comment: data,
        },
        null,
        true
      )
    );
  } catch (err) {
    const msg = getErrorReason(err) || SOMETHING_WENT_WRONG_MSG;
    if (msg === COMMENT_NOT_FOUND_MSG) {
      return res.status(NOT_FOUND).json(COMMENT_NOT_FOUND_RESPONSE);
    }
    if (msg === COMMENT_NOT_LIKED_MSG) {
      return res.status(BAD_REQUEST).json(COMMENT_NOT_LIKED_RESPONSE);
    }
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
