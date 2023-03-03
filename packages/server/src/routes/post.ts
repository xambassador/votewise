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
  LIKE_COMMENT_ON_POST_V1,
  LIKE_POST_V1,
  UNLIKE_COMMENT_ON_POST_V1,
  UNLIKE_POST_V1,
} from "@/src/configs";
import {
  commentOnPost,
  getCommentsForPost,
  getPost,
  getPosts,
  likePost,
  unlikePost,
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
router.delete(DELETE_COMMENT_ON_POST_V1, authorizationMiddleware, onboardedMiddleware, (req, res) => {
  return res.status(200).json({ message: "Delete comment on post" });
});

router.put(LIKE_COMMENT_ON_POST_V1, authorizationMiddleware, onboardedMiddleware, (req, res) => {
  return res.status(200).json({ message: "Like comment on post" });
});
router.put(UNLIKE_COMMENT_ON_POST_V1, authorizationMiddleware, onboardedMiddleware, (req, res) => {
  return res.status(200).json({ message: "UnLike comment on post" });
});

export default router;
