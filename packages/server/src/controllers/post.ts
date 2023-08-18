import type { NextFunction, Request, Response } from "express";
import createError from "http-errors";
import { StatusCodes } from "http-status-codes";

import type {
  CommentOnPostPayload,
  ReplyToCommentOnPostPayload,
  UpdateCommentOnPostPayload,
} from "@votewise/types";

import { JSONResponse } from "@/src/lib";
import PostService from "@/src/services/posts";
import {
  ALREADY_LIKED_COMMENT_MSG,
  COMMENT_ADDED_SUCCESSFULLY_MSG,
  COMMENT_DELETED_SUCCESSFULLY_MSG,
  COMMENT_LIKE_SUCCESSFULLY_MSG,
  COMMENT_NOT_FOUND_MSG,
  COMMENT_NOT_LIKED_MSG,
  COMMENT_POST_CLOSED_MSG,
  COMMENT_UNLIKE_SUCCESSFULLY_MSG,
  COMMENT_UPDATED_SUCCESSFULLY_MSG,
  ERROR_COMMENT_NOT_EMPTY_MSG,
  FORBIDDEN_MSG,
  GETTING_REPLIES_FROM_COMMENT_MSG,
  INVALID_COMMENT_ID_MSG,
  INVALID_POST_ID_MSG,
  POSTS_FETCHED_SUCCESSFULLY_MSG,
  POST_ALREADY_LIKED_MSG,
  POST_CLOSED_MSG,
  POST_DETAILS_FETCHED_SUCCESSFULLY_MSG,
  POST_NOT_FOUND_MSG,
  POST_NOT_LIKED_MSG,
  POST_UNLIKED_SUCCESSFULLY_MSG,
  REPLAY_ADDED_SUCCESSFULLY_MSG,
  SOMETHING_WENT_WRONG_MSG,
  UNAUTHORIZED_MSG,
  VALIDATION_FAILED_MSG,
  getErrorReason,
  getLimitAndOffset,
} from "@/src/utils";

/* ----------------------------------------------------------------------------------------------- */

export const getPosts = async (req: Request, res: Response, next: NextFunction) => {
  const { user } = req.session;
  const { limit, offset } = getLimitAndOffset(req);
  const { sortBy, order } = req.query;
  type SortBy = "upvote" | "comment" | "date";
  type OrderType = "desc" | "asc";

  if (sortBy && !["upvote", "comment", "date"].includes(sortBy as SortBy)) {
    return next(
      createError(StatusCodes.BAD_REQUEST, VALIDATION_FAILED_MSG, {
        reason: "Invalid sort by value",
      })
    );
  }

  if (order && !["desc", "asc"].includes(order as OrderType)) {
    return next(
      createError(StatusCodes.BAD_REQUEST, VALIDATION_FAILED_MSG, { reason: "Invalid order value" })
    );
  }

  const sortby: SortBy = (sortBy as SortBy) || "date";
  const sortorder: OrderType = (order as OrderType) || "desc";

  const data = await PostService.getPosts(user.id, limit, offset, sortby, sortorder);

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
};

/* ----------------------------------------------------------------------------------------------- */
export const getPost = async (req: Request, res: Response, next: NextFunction) => {
  const { postId } = req.params;
  const { user } = req.session;

  if (!postId) {
    return next(createError(StatusCodes.BAD_REQUEST, VALIDATION_FAILED_MSG, { reason: INVALID_POST_ID_MSG }));
  }

  try {
    const post = await PostService.getPost(Number(postId), user.id);
    return res.status(StatusCodes.OK).json(
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
    const msg = getErrorReason(err);
    return next(
      createError(StatusCodes.INTERNAL_SERVER_ERROR, SOMETHING_WENT_WRONG_MSG, {
        reason: msg,
      })
    );
  }
};

/* ----------------------------------------------------------------------------------------------- */
export const getCommentsForPost = async (req: Request, res: Response, next: NextFunction) => {
  const { postId } = req.params;
  const { user } = req.session;

  if (!postId) {
    return next(createError(StatusCodes.BAD_REQUEST, VALIDATION_FAILED_MSG, { reason: INVALID_POST_ID_MSG }));
  }

  try {
    const { limit, offset } = getLimitAndOffset(req);
    const data = await PostService.getCommentsForPost(Number(postId), user.id, limit, offset);
    return res.status(StatusCodes.OK).json(
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
    return next(createError(StatusCodes.INTERNAL_SERVER_ERROR, SOMETHING_WENT_WRONG_MSG, { reason: msg }));
  }
};

/* ----------------------------------------------------------------------------------------------- */
export const likePost = async (req: Request, res: Response, next: NextFunction) => {
  const { postId } = req.params;
  const { user } = req.session;

  if (!postId) {
    return next(createError(StatusCodes.BAD_REQUEST, VALIDATION_FAILED_MSG, { reason: INVALID_POST_ID_MSG }));
  }

  try {
    const data = await PostService.likePost(Number(postId), user.id);
    return res.status(StatusCodes.OK).json(
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
    if (msg === POST_ALREADY_LIKED_MSG || msg === POST_CLOSED_MSG) {
      return next(createError(StatusCodes.BAD_REQUEST, msg));
    }

    return next(createError(StatusCodes.INTERNAL_SERVER_ERROR, SOMETHING_WENT_WRONG_MSG, { reason: msg }));
  }
};

/* ----------------------------------------------------------------------------------------------- */
export const unlikePost = async (req: Request, res: Response, next: NextFunction) => {
  const { postId } = req.params;
  const { user } = req.session;

  if (!postId) {
    return next(createError(StatusCodes.BAD_REQUEST, VALIDATION_FAILED_MSG, { reason: INVALID_POST_ID_MSG }));
  }

  try {
    const data = await PostService.unlikePost(Number(postId), user.id);
    return res.status(StatusCodes.OK).json(
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

    if (msg === POST_NOT_LIKED_MSG || msg === POST_CLOSED_MSG) {
      return next(createError(StatusCodes.BAD_REQUEST, msg));
    }
    if (msg === FORBIDDEN_MSG) return next(createError(StatusCodes.FORBIDDEN, msg));
    return next(createError(StatusCodes.INTERNAL_SERVER_ERROR, SOMETHING_WENT_WRONG_MSG, { reason: msg }));
  }
};

/* ----------------------------------------------------------------------------------------------- */
export const commentOnPost = async (req: Request, res: Response, next: NextFunction) => {
  const { text } = req.body as CommentOnPostPayload;
  const { postId } = req.params;

  if (!postId) {
    return next(createError(StatusCodes.BAD_REQUEST, VALIDATION_FAILED_MSG, { reason: INVALID_POST_ID_MSG }));
  }

  if (!text) {
    return next(
      createError(StatusCodes.BAD_REQUEST, VALIDATION_FAILED_MSG, { reason: ERROR_COMMENT_NOT_EMPTY_MSG })
    );
  }

  const { user } = req.session;

  try {
    const data = await PostService.addComment(Number(postId), user.id, text);
    return res.status(StatusCodes.OK).json(
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
    if (msg === POST_NOT_FOUND_MSG) return next(createError(StatusCodes.NOT_FOUND, msg));
    if (msg === COMMENT_POST_CLOSED_MSG) return next(createError(StatusCodes.BAD_REQUEST, msg));
    return next(createError(StatusCodes.INTERNAL_SERVER_ERROR, SOMETHING_WENT_WRONG_MSG, { reason: msg }));
  }
};

/* ----------------------------------------------------------------------------------------------- */
export const deleteCommentOnPost = async (req: Request, res: Response, next: NextFunction) => {
  const { postId, commentId } = req.params;
  const { user } = req.session;

  if (!postId) {
    return next(createError(StatusCodes.BAD_REQUEST, VALIDATION_FAILED_MSG, { reason: INVALID_POST_ID_MSG }));
  }

  if (!commentId) {
    return next(
      createError(StatusCodes.BAD_REQUEST, VALIDATION_FAILED_MSG, { reason: INVALID_COMMENT_ID_MSG })
    );
  }

  try {
    await PostService.deleteComment(Number(postId), Number(commentId), user.id);
    return res.status(StatusCodes.OK).json(
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
    if (msg === COMMENT_NOT_FOUND_MSG) return next(createError(StatusCodes.NOT_FOUND, msg));
    if (msg === UNAUTHORIZED_MSG) return next(createError(StatusCodes.UNAUTHORIZED, msg));
    if (msg === FORBIDDEN_MSG) return next(createError(StatusCodes.FORBIDDEN, msg));
    return next(createError(StatusCodes.INTERNAL_SERVER_ERROR, SOMETHING_WENT_WRONG_MSG, { reason: msg }));
  }
};

/* ----------------------------------------------------------------------------------------------- */
export const updateCommentOnPost = async (req: Request, res: Response, next: NextFunction) => {
  const { commentId, postId } = req.params;
  const { text } = req.body as UpdateCommentOnPostPayload;

  if (!postId) {
    return next(createError(StatusCodes.BAD_REQUEST, VALIDATION_FAILED_MSG, { reason: INVALID_POST_ID_MSG }));
  }

  if (!commentId) {
    return next(
      createError(StatusCodes.BAD_REQUEST, VALIDATION_FAILED_MSG, { reason: INVALID_COMMENT_ID_MSG })
    );
  }

  if (!text) {
    return next(
      createError(StatusCodes.BAD_REQUEST, VALIDATION_FAILED_MSG, { reason: ERROR_COMMENT_NOT_EMPTY_MSG })
    );
  }

  const { user } = req.session;

  try {
    const data = await PostService.updateComment(Number(postId), Number(commentId), user.id, text);
    return res.status(StatusCodes.OK).json(
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
    if (msg === COMMENT_NOT_FOUND_MSG) return next(createError(StatusCodes.NOT_FOUND, msg));
    if (msg === UNAUTHORIZED_MSG) return next(createError(StatusCodes.UNAUTHORIZED, msg));
    if (msg === FORBIDDEN_MSG) return next(createError(StatusCodes.FORBIDDEN, msg));
    return next(createError(StatusCodes.INTERNAL_SERVER_ERROR, SOMETHING_WENT_WRONG_MSG, { reason: msg }));
  }
};

/* ----------------------------------------------------------------------------------------------- */
export const replyToCommentOnPost = async (req: Request, res: Response, next: NextFunction) => {
  const { text } = req.body as ReplyToCommentOnPostPayload;
  const { postId, commentId } = req.params;

  if (!postId) {
    return next(createError(StatusCodes.BAD_REQUEST, VALIDATION_FAILED_MSG, { reason: INVALID_POST_ID_MSG }));
  }

  if (!commentId) {
    return next(
      createError(StatusCodes.BAD_REQUEST, VALIDATION_FAILED_MSG, { reason: INVALID_COMMENT_ID_MSG })
    );
  }

  if (!text) {
    return next(
      createError(StatusCodes.BAD_REQUEST, VALIDATION_FAILED_MSG, { reason: ERROR_COMMENT_NOT_EMPTY_MSG })
    );
  }

  const { user } = req.session;

  try {
    const data = await PostService.addReplyToComment(Number(postId), Number(commentId), user.id, text);
    return res.status(StatusCodes.OK).json(
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
    if (msg === COMMENT_NOT_FOUND_MSG) return next(createError(StatusCodes.NOT_FOUND, msg));
    return next(createError(StatusCodes.INTERNAL_SERVER_ERROR, SOMETHING_WENT_WRONG_MSG, { reason: msg }));
  }
};

/* ----------------------------------------------------------------------------------------------- */
export const getRepliesToCommentOnPost = async (req: Request, res: Response, next: NextFunction) => {
  const { postId, commentId } = req.params;
  const { user } = req.session;

  if (!postId) {
    return next(createError(StatusCodes.BAD_REQUEST, VALIDATION_FAILED_MSG, { reason: INVALID_POST_ID_MSG }));
  }

  if (!commentId) {
    return next(
      createError(StatusCodes.BAD_REQUEST, VALIDATION_FAILED_MSG, { reason: INVALID_COMMENT_ID_MSG })
    );
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
    return res.status(StatusCodes.OK).json(
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
    if (msg === COMMENT_NOT_FOUND_MSG) return next(createError(StatusCodes.NOT_FOUND, msg));
    return next(createError(StatusCodes.INTERNAL_SERVER_ERROR, SOMETHING_WENT_WRONG_MSG, { reason: msg }));
  }
};

/* ----------------------------------------------------------------------------------------------- */
export const likeComment = async (req: Request, res: Response, next: NextFunction) => {
  const { commentId, postId } = req.params;

  if (!postId) {
    return next(createError(StatusCodes.BAD_REQUEST, VALIDATION_FAILED_MSG, { reason: INVALID_POST_ID_MSG }));
  }

  if (!commentId) {
    return next(
      createError(StatusCodes.BAD_REQUEST, VALIDATION_FAILED_MSG, { reason: INVALID_COMMENT_ID_MSG })
    );
  }

  const { user } = req.session;

  try {
    const data = await PostService.likeComment(Number(postId), Number(commentId), user.id);
    return res.status(StatusCodes.OK).json(
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
    if (msg === COMMENT_NOT_FOUND_MSG) return next(createError(StatusCodes.NOT_FOUND, msg));
    if (msg === ALREADY_LIKED_COMMENT_MSG) return next(createError(StatusCodes.BAD_REQUEST, msg));
    return next(createError(StatusCodes.INTERNAL_SERVER_ERROR, SOMETHING_WENT_WRONG_MSG, { reason: msg }));
  }
};

/* ----------------------------------------------------------------------------------------------- */
export const unlikeComment = async (req: Request, res: Response, next: NextFunction) => {
  const { commentId, postId } = req.params;

  if (!postId) {
    return next(createError(StatusCodes.BAD_REQUEST, VALIDATION_FAILED_MSG, { reason: INVALID_POST_ID_MSG }));
  }

  if (!commentId) {
    return next(
      createError(StatusCodes.BAD_REQUEST, VALIDATION_FAILED_MSG, { reason: INVALID_COMMENT_ID_MSG })
    );
  }

  const { user } = req.session;

  try {
    const data = await PostService.unlikeComment(Number(postId), Number(commentId), user.id);
    return res.status(StatusCodes.OK).json(
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
    if (msg === COMMENT_NOT_FOUND_MSG) return next(createError(StatusCodes.NOT_FOUND, msg));
    if (msg === COMMENT_NOT_LIKED_MSG) return next(createError(StatusCodes.BAD_REQUEST, msg));
    return next(createError(StatusCodes.INTERNAL_SERVER_ERROR, SOMETHING_WENT_WRONG_MSG, { reason: msg }));
  }
};
