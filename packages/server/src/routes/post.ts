/**
 * @file: post.ts
 * @description: Contains all posts related routes
 */
import { Router } from "express";

import {
  COMMENT_ON_POST_V1,
  DELETE_COMMENT_ON_POST_V1,
  GET_POSTS_V1,
  GET_POST_COMMENTS_V1,
  GET_POST_V1,
  GET_REPLIES_TO_COMMENT_ON_POST_V1,
  LIKE_COMMENT_ON_POST_V1,
  LIKE_POST_V1,
  REPLY_TO_COMMENT_ON_POST_V1,
  UNLIKE_COMMENT_ON_POST_V1,
  UNLIKE_POST_V1,
  UPDATE_COMMENT_ON_POST_V1,
} from "@votewise/lib/routes";

import {
  commentOnPost,
  deleteCommentOnPost,
  getCommentsForPost,
  getPost,
  getPosts,
  getRepliesToCommentOnPost,
  likeComment,
  likePost,
  replyToCommentOnPost,
  unlikeComment,
  unlikePost,
  updateCommentOnPost,
} from "@/src/controllers/post";
import authorizationMiddleware from "@/src/middlewares/auth";
import onboardedMiddleware from "@/src/middlewares/onboarded";

const router = Router();

router.get(GET_POST_V1, authorizationMiddleware, onboardedMiddleware, getPost);
router.get(GET_POSTS_V1, authorizationMiddleware, onboardedMiddleware, getPosts);
router.get(GET_POST_COMMENTS_V1, authorizationMiddleware, onboardedMiddleware, getCommentsForPost);

router.patch(LIKE_POST_V1, authorizationMiddleware, onboardedMiddleware, likePost);
router.delete(UNLIKE_POST_V1, authorizationMiddleware, onboardedMiddleware, unlikePost);

router.post(COMMENT_ON_POST_V1, authorizationMiddleware, onboardedMiddleware, commentOnPost);
router.patch(UPDATE_COMMENT_ON_POST_V1, authorizationMiddleware, onboardedMiddleware, updateCommentOnPost);
router.delete(DELETE_COMMENT_ON_POST_V1, authorizationMiddleware, onboardedMiddleware, deleteCommentOnPost);

router.get(
  GET_REPLIES_TO_COMMENT_ON_POST_V1,
  authorizationMiddleware,
  onboardedMiddleware,
  getRepliesToCommentOnPost
);
router.post(REPLY_TO_COMMENT_ON_POST_V1, authorizationMiddleware, onboardedMiddleware, replyToCommentOnPost);

router.patch(LIKE_COMMENT_ON_POST_V1, authorizationMiddleware, onboardedMiddleware, likeComment);
router.delete(UNLIKE_COMMENT_ON_POST_V1, authorizationMiddleware, onboardedMiddleware, unlikeComment);

export default router;
