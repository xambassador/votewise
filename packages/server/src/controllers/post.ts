/**
 * @file: post.ts
 * @description: Contains all posts related controllers
 */
import type { Request, Response } from "express";
import httpStatusCodes from "http-status-codes";

import { JSONResponse } from "@/src/lib";
import PostService from "@/src/services/posts";
import { getLimitAndOffset } from "@/src/utils";

const { OK, BAD_REQUEST, INTERNAL_SERVER_ERROR } = httpStatusCodes;

export const getPosts = async (req: Request, res: Response) => {
  const { user } = req.session;
  const { limit, offset } = getLimitAndOffset(req);
  const posts = await PostService.getPosts(user.id, limit, offset);

  return res.status(OK).json(
    new JSONResponse(
      "Posts fetched successfully",
      {
        message: "Posts fetched successfully",
        posts,
        meta: {
          pagination: {
            total: posts.length,
            limit,
            next: offset + limit,
          },
        },
      },
      null,
      true
    )
  );
};

export const getPost = async (req: Request, res: Response) => {
  const { postId } = req.params;

  if (!postId) {
    return res.status(BAD_REQUEST).json(
      new JSONResponse(
        "Invalid post id",
        null,
        {
          message: "Post id is required",
        },
        false
      )
    );
  }

  try {
    const post = await PostService.getPost(Number(postId));
    return res.status(OK).json(
      new JSONResponse(
        "Post details fetched successfully",
        {
          message: "Post details fetched successfully",
          post,
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
      message = "Something went wrong";
    }
    return res.status(INTERNAL_SERVER_ERROR).json(
      new JSONResponse(
        "Something went wrong",
        null,
        {
          message,
        },
        false
      )
    );
  }
};
