import type {
  CommentOnPostPayload,
  ReplyToCommentOnPostPayload,
  UpdateCommentOnPostPayload,
} from "@votewise/types";
import type { NextFunction, Request, Response } from "express";

import { StatusCodes } from "http-status-codes";

import Success from "@/src/classes/Success";
import ValidationError from "@/src/classes/ValidationError";
import PostService from "@/src/services/posts";
import {
  COMMENT_ADDED_SUCCESSFULLY_MSG,
  COMMENT_DELETED_SUCCESSFULLY_MSG,
  COMMENT_LIKE_SUCCESSFULLY_MSG,
  COMMENT_UNLIKE_SUCCESSFULLY_MSG,
  COMMENT_UPDATED_SUCCESSFULLY_MSG,
  ERROR_COMMENT_NOT_EMPTY_MSG,
  getLimitAndOffset,
  GETTING_REPLIES_FROM_COMMENT_MSG,
  INVALID_COMMENT_ID_MSG,
  INVALID_POST_ID_MSG,
  POSTS_FETCHED_SUCCESSFULLY_MSG,
  POST_DETAILS_FETCHED_SUCCESSFULLY_MSG,
  POST_UNLIKED_SUCCESSFULLY_MSG,
  REPLAY_ADDED_SUCCESSFULLY_MSG,
} from "@/src/utils";
/* ----------------------------------------------------------------------------------------------- */

/** Get all posts */
export const getPosts = async (req: Request, res: Response, next: NextFunction) => {
  const { user } = req.session;
  const { limit, offset } = getLimitAndOffset(req);
  const { sortBy, order } = req.query;
  type SortBy = "upvote" | "comment" | "date";
  type OrderType = "desc" | "asc";

  if (sortBy && !["upvote", "comment", "date"].includes(sortBy as SortBy)) {
    return next(new ValidationError("Invalid sort by value"));
  }

  if (order && !["desc", "asc"].includes(order as OrderType)) {
    return next(new ValidationError("Invalid order value"));
  }

  const sortby: SortBy = (sortBy as SortBy) || "date";
  const sortorder: OrderType = (order as OrderType) || "desc";

  try {
    const data = await PostService.getPosts(user.id, limit, offset, sortby, sortorder);

    const response = new Success(POSTS_FETCHED_SUCCESSFULLY_MSG, {
      posts: data.posts,
      meta: data.meta,
    });
    return res.status(StatusCodes.OK).json(response);
  } catch (err) {
    return next(err);
  }
};

/** Get single post details */
export const getPost = async (req: Request, res: Response, next: NextFunction) => {
  const { postId } = req.params;
  const { user } = req.session;

  if (!postId) {
    return next(new ValidationError(INVALID_POST_ID_MSG));
  }

  try {
    const post = await PostService.getPost(Number(postId), user.id);
    const response = new Success(POST_DETAILS_FETCHED_SUCCESSFULLY_MSG, {
      post: {
        ...post,
        meta: undefined,
      },
      meta: post.meta,
    });
    return res.status(StatusCodes.OK).json(response);
  } catch (err) {
    return next(err);
  }
};

/** Get comments for the post */
export const getCommentsForPost = async (req: Request, res: Response, next: NextFunction) => {
  const { postId } = req.params;
  const { user } = req.session;

  if (!postId) {
    return next(new ValidationError(INVALID_POST_ID_MSG));
  }

  try {
    const { limit, offset } = getLimitAndOffset(req);
    const data = await PostService.getCommentsForPost(Number(postId), user.id, limit, offset);
    const response = new Success("Post comments fetched successfully", {
      comments: data.comments,
      meta: data.meta,
    });
    return res.status(StatusCodes.OK).json(response);
  } catch (err) {
    return next(err);
  }
};

/** Like a post */
export const likePost = async (req: Request, res: Response, next: NextFunction) => {
  const { postId } = req.params;
  const { user } = req.session;

  if (!postId) {
    return next(new ValidationError(INVALID_POST_ID_MSG));
  }

  try {
    const data = await PostService.likePost(Number(postId), user.id);
    const response = new Success("Post liked successfully", {
      post_total_upvotes: data,
    });
    return res.status(StatusCodes.OK).json(response);
  } catch (err) {
    return next(err);
  }
};

/** Unlike a post */
export const unlikePost = async (req: Request, res: Response, next: NextFunction) => {
  const { postId } = req.params;
  const { user } = req.session;

  if (!postId) {
    return next(new ValidationError(INVALID_POST_ID_MSG));
  }

  try {
    const data = await PostService.unlikePost(Number(postId), user.id);
    const response = new Success(POST_UNLIKED_SUCCESSFULLY_MSG, {
      post_total_upvotes: data,
    });
    return res.status(StatusCodes.OK).json(response);
  } catch (err) {
    return next(err);
  }
};

/** Comment on a post */
export const commentOnPost = async (req: Request, res: Response, next: NextFunction) => {
  const { text } = req.body as CommentOnPostPayload;
  const { postId } = req.params;

  if (!postId) {
    return next(new ValidationError(INVALID_POST_ID_MSG));
  }

  if (!text) {
    return next(new ValidationError(ERROR_COMMENT_NOT_EMPTY_MSG));
  }

  const { user } = req.session;

  try {
    const data = await PostService.addComment(Number(postId), user.id, text);
    const response = new Success(COMMENT_ADDED_SUCCESSFULLY_MSG, {
      comment: data,
    });
    return res.status(StatusCodes.OK).json(response);
  } catch (err) {
    return next(err);
  }
};

/** Delete a comment on a post */
export const deleteCommentOnPost = async (req: Request, res: Response, next: NextFunction) => {
  const { postId, commentId } = req.params;
  const { user } = req.session;

  if (!postId) {
    return next(new ValidationError(INVALID_POST_ID_MSG));
  }

  if (!commentId) {
    return next(new ValidationError(INVALID_COMMENT_ID_MSG));
  }

  try {
    await PostService.deleteComment(Number(postId), Number(commentId), user.id);
    const response = new Success(COMMENT_DELETED_SUCCESSFULLY_MSG, {
      message: COMMENT_DELETED_SUCCESSFULLY_MSG,
    });
    return res.status(StatusCodes.OK).json(response);
  } catch (err) {
    return next(err);
  }
};

/** Update a comment on a post */
export const updateCommentOnPost = async (req: Request, res: Response, next: NextFunction) => {
  const { commentId, postId } = req.params;
  const { text } = req.body as UpdateCommentOnPostPayload;

  if (!postId) {
    return next(new ValidationError(INVALID_POST_ID_MSG));
  }

  if (!commentId) {
    return next(new ValidationError(INVALID_COMMENT_ID_MSG));
  }

  if (!text) {
    return next(new ValidationError(ERROR_COMMENT_NOT_EMPTY_MSG));
  }

  const { user } = req.session;

  try {
    const data = await PostService.updateComment(Number(postId), Number(commentId), user.id, text);
    const response = new Success(COMMENT_UPDATED_SUCCESSFULLY_MSG, {
      comment: data,
    });
    return res.status(StatusCodes.OK).json(response);
  } catch (err) {
    return next(err);
  }
};

/** Reply to a comment on a post */
export const replyToCommentOnPost = async (req: Request, res: Response, next: NextFunction) => {
  const { text } = req.body as ReplyToCommentOnPostPayload;
  const { postId, commentId } = req.params;

  if (!postId) {
    return next(new ValidationError(INVALID_POST_ID_MSG));
  }

  if (!commentId) {
    return next(new ValidationError(INVALID_COMMENT_ID_MSG));
  }

  if (!text) {
    return next(new ValidationError(ERROR_COMMENT_NOT_EMPTY_MSG));
  }

  const { user } = req.session;

  try {
    const data = await PostService.addReplyToComment(Number(postId), Number(commentId), user.id, text);
    const response = new Success(REPLAY_ADDED_SUCCESSFULLY_MSG, {
      comment: data,
    });
    return res.status(StatusCodes.OK).json(response);
  } catch (err) {
    return next(err);
  }
};

/** Get replies to a comment on a post */
export const getRepliesToCommentOnPost = async (req: Request, res: Response, next: NextFunction) => {
  const { postId, commentId } = req.params;
  const { user } = req.session;

  if (!postId) {
    return next(new ValidationError(INVALID_POST_ID_MSG));
  }

  if (!commentId) {
    return next(new ValidationError(INVALID_COMMENT_ID_MSG));
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
    const response = new Success(GETTING_REPLIES_FROM_COMMENT_MSG, {
      replies: data.comments,
      meta: data.meta,
    });
    return res.status(StatusCodes.OK).json(response);
  } catch (err) {
    return next(err);
  }
};

/** Like a comment on a post */
export const likeComment = async (req: Request, res: Response, next: NextFunction) => {
  const { commentId, postId } = req.params;

  if (!postId) {
    return next(new ValidationError(INVALID_POST_ID_MSG));
  }

  if (!commentId) {
    return next(new ValidationError(INVALID_COMMENT_ID_MSG));
  }

  const { user } = req.session;

  try {
    const data = await PostService.likeComment(Number(postId), Number(commentId), user.id);
    const response = new Success(COMMENT_LIKE_SUCCESSFULLY_MSG, {
      comment: data,
    });
    return res.status(StatusCodes.OK).json(response);
  } catch (err) {
    return next(err);
  }
};

/** Unlike a comment on a post */
export const unlikeComment = async (req: Request, res: Response, next: NextFunction) => {
  const { commentId, postId } = req.params;

  if (!postId) {
    return next(new ValidationError(INVALID_POST_ID_MSG));
  }

  if (!commentId) {
    return next(new ValidationError(INVALID_COMMENT_ID_MSG));
  }

  const { user } = req.session;

  try {
    const data = await PostService.unlikeComment(Number(postId), Number(commentId), user.id);
    const response = new Success(COMMENT_UNLIKE_SUCCESSFULLY_MSG, {
      comment: data,
    });
    return res.status(StatusCodes.OK).json(response);
  } catch (err) {
    return next(err);
  }
};
