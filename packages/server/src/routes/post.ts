/**
 * @file: post.ts
 * @description: Contains all posts related routes
 */
import { Router } from "express";

import { GET_POSTS_V1, GET_POST_V1 } from "@/src/configs";
import { getPost, getPosts } from "@/src/controllers/post";
import authorizationMiddleware from "@/src/middlewares/auth";

const router = Router();

router.get(GET_POST_V1, authorizationMiddleware, getPost);
router.get(GET_POSTS_V1, authorizationMiddleware, getPosts);

export default router;
