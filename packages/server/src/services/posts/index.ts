// eslint-disable-next-line max-classes-per-file
import type { PostStatus } from "@prisma/client";
import type { ChangeStatusPayload, CreatePostPayload, UpdatePostPayload } from "@votewise/types";

import { StatusCodes } from "http-status-codes";
import { nanoid } from "nanoid";
import slugify from "slugify";

import { prisma } from "@votewise/prisma";

import ServerError from "@/src/classes/ServerError";
import HashTagService from "@/src/services/hashtag";
import {
  ALREADY_LIKED_COMMENT_MSG,
  COMMENT_NOT_FOUND_MSG,
  COMMENT_NOT_LIKED_MSG,
  COMMENT_POST_CLOSED_MSG,
  FORBIDDEN_MSG,
  getPagination,
  POST_ALREADY_LIKED_MSG,
  POST_CLOSED_MSG,
  POST_NOT_FOUND_MSG,
  POST_NOT_LIKED_MSG,
} from "@/src/utils";
import { validateCreatePostPayload } from "@/src/zodValidation";

import BasePostService from "./Base";

// FIXME: Remove comments logic to its own service
class PostService extends BasePostService {
  /** Get all posts */
  async getPosts(
    userId: number,
    limit = 10,
    offset = 0,
    sortby: "upvote" | "comment" | "date" = "date",
    sortorder: "asc" | "desc" = "desc"
  ) {
    let orderBy;

    switch (sortby) {
      case "upvote":
        orderBy = {
          upvotes: {
            _count: sortorder,
          },
        };
        break;

      case "comment":
        orderBy = {
          comments: {
            _count: sortorder,
          },
        };
        break;

      default:
        orderBy = {
          updated_at: sortorder,
        };
    }

    const posts = await prisma.post.findMany({
      where: {
        OR: [
          {
            author_id: userId,
          },
          {
            type: "PUBLIC",
          },
        ],
      },
      include: {
        _count: {
          select: {
            upvotes: true,
          },
        },
        comments: {
          where: {
            parent_id: null,
          },
          select: {
            id: true,
          },
        },
        // TODO: Should give informative name to this field
        // upvotes: this field indicates whether the user who make request has liked the post or not.
        upvotes: {
          where: {
            user_id: userId,
          },
          select: {
            id: true,
            user_id: true,
          },
        },
        post_assets: {
          select: {
            url: true,
            type: true,
            id: true,
          },
        },
        author: {
          select: {
            profile_image: true,
            name: true,
            location: true,
          },
        },
      },
      take: limit,
      skip: offset,
      orderBy,
    });
    const totalPosts = await prisma.post.count();
    // https://github.com/prisma/prisma/issues/4433
    return {
      posts: posts.map((post) => ({
        ...post,
        comments_count: post.comments.length,
        upvotes_count: post._count.upvotes,
        _count: undefined,
      })),
      meta: {
        pagination: {
          ...getPagination(totalPosts, limit, offset),
        },
      },
    };
  }

  /** Get post details for a given post id */
  async getPost(postId: number, userId: number) {
    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
      include: {
        post_assets: {
          select: {
            url: true,
            type: true,
            id: true,
          },
        },
        author: {
          select: {
            profile_image: true,
            name: true,
            location: true,
          },
        },
        // TODO: Should give informative name to this field
        // upvotes: this field indicates whether the user who make request has liked the post or not.
        upvotes: {
          where: {
            user_id: userId,
          },
          select: {
            user_id: true,
            id: true,
          },
        },
        _count: {
          select: {
            upvotes: true,
          },
        },
      },
    });
    // Total comments for a post
    const totalComments = await prisma.comment.count({
      where: {
        post_id: postId,
        parent_id: null,
      },
    });
    return {
      ...post,
      upvotes_count: post?._count.upvotes,
      comments_count: totalComments,
      _count: undefined,
      meta: {
        pagination: {
          ...getPagination(totalComments || 0, 5, 0),
        },
      },
    };
  }

  /** Get comments for given post id */
  async getCommentsForPost(postId: number, userId: number, limit = 5, offset = 0) {
    // Check for post exists
    const post = await this.isPostExist(postId);
    if (!post) throw new ServerError(StatusCodes.NOT_FOUND, POST_NOT_FOUND_MSG);

    // Total comments for a post
    const totalComments = await prisma.comment.count({
      where: {
        post_id: postId,
        parent_id: null,
      },
    });

    const comments = await prisma.comment.findMany({
      where: {
        post_id: postId,
        parent_id: null,
      },
      select: {
        user: {
          select: {
            name: true,
            id: true,
            profile_image: true,
          },
        },
        parent_id: true,
        user_id: true,
        id: true,
        updated_at: true,
        text: true,
        // TODO: Should give informative name to this field
        // upvotes: this field indicates whether the user who make request has liked the comment or not.
        upvotes: {
          where: {
            user_id: userId,
          },
          select: {
            id: true,
            user_id: true,
          },
        },
        _count: {
          select: {
            upvotes: true,
          },
        },
      },
      take: limit,
      skip: offset,
      orderBy: {
        updated_at: "desc",
      },
    });

    // Get number of replies for each comment
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await prisma.comment.count({
          where: {
            post_id: postId,
            parent_id: comment.id,
          },
        });
        return {
          ...comment,
          num_replies: replies,
        };
      })
    );

    const data = commentsWithReplies.map((comment) => ({
      ...comment,
      upvotes_count: comment._count.upvotes,
      _count: undefined,
    }));

    return {
      comments: data,
      meta: {
        pagination: {
          ...getPagination(totalComments, limit, offset),
        },
      },
    };
  }

  /** Like a post */
  async likePost(postId: number, userId: number) {
    const post = await this.isPostExist(postId);
    if (!post) throw new ServerError(StatusCodes.NOT_FOUND, POST_NOT_FOUND_MSG);

    // If post is closed, then throw error
    if (post.status === "CLOSED") throw new ServerError(StatusCodes.BAD_REQUEST, POST_CLOSED_MSG);

    // Check if user has already liked the post
    const isAlreadyLiked = await prisma.post.findUnique({
      where: {
        id: postId,
      },
      select: {
        upvotes: {
          where: {
            user_id: userId,
          },
        },
      },
    });

    // If user has already liked the post, then throw error
    if (isAlreadyLiked && isAlreadyLiked.upvotes.length > 0) {
      throw new ServerError(StatusCodes.BAD_REQUEST, POST_ALREADY_LIKED_MSG);
    }

    const data = await prisma.post.update({
      where: {
        id: postId,
      },
      data: {
        upvotes: {
          create: {
            user_id: userId,
          },
        },
      },
      select: {
        _count: {
          select: {
            upvotes: true,
          },
        },
      },
    });

    return data._count.upvotes;
  }

  /** Unlike a post */
  async unlikePost(postId: number, userId: number) {
    const post = await this.isPostExist(postId);
    if (!post) throw new ServerError(StatusCodes.NOT_FOUND, POST_NOT_FOUND_MSG);

    // If post is closed, then throw error
    if (post.status === "CLOSED") throw new ServerError(StatusCodes.BAD_REQUEST, POST_CLOSED_MSG);

    // Check if user has already liked the post
    const isAlreadyLiked = await prisma.post.findUnique({
      where: {
        id: postId,
      },
      select: {
        upvotes: {
          where: {
            user_id: userId,
          },
        },
      },
    });

    // If not liked, then throw error
    if (!isAlreadyLiked || isAlreadyLiked.upvotes.length === 0) {
      throw new ServerError(StatusCodes.BAD_REQUEST, POST_NOT_LIKED_MSG);
    }

    if (isAlreadyLiked && isAlreadyLiked.upvotes.length === 0) {
      throw new ServerError(StatusCodes.BAD_REQUEST, POST_NOT_LIKED_MSG);
    }

    // Check is same user who liked the post is trying to unlike it.
    if (isAlreadyLiked && isAlreadyLiked.upvotes[0].user_id !== userId) {
      throw new ServerError(StatusCodes.FORBIDDEN, FORBIDDEN_MSG);
    }

    const data = await prisma.post.update({
      where: {
        id: postId,
      },
      data: {
        upvotes: {
          delete: {
            id: isAlreadyLiked.upvotes[0].id,
          },
        },
      },
      select: {
        _count: {
          select: {
            upvotes: true,
          },
        },
      },
    });

    return data._count.upvotes;
  }

  /** Add comment to a post */
  async addComment(postId: number, userId: number, text: string) {
    const isPostExist = await this.isPostExist(postId);
    if (!isPostExist) throw new ServerError(StatusCodes.NOT_FOUND, POST_NOT_FOUND_MSG);
    if (isPostExist.status === "CLOSED") {
      throw new ServerError(StatusCodes.BAD_REQUEST, COMMENT_POST_CLOSED_MSG);
    }

    const data = await prisma.comment.create({
      data: {
        text,
        post_id: postId,
        user_id: userId,
      },
      select: {
        id: true,
        parent_id: true,
        post_id: true,
        text: true,
        // upvotes represents whether the user who make request has liked the comment or not
        upvotes: {
          where: {
            user_id: userId,
          },
          select: {
            user_id: true,
            id: true,
          },
        },
        user_id: true,
        _count: {
          select: {
            upvotes: true,
          },
        },
        created_at: true,
        updated_at: true,
      },
    });

    return {
      ...data,
      upvotes_count: data._count.upvotes,
      _count: undefined,
    };
  }

  /** Delete comment from a post */
  async deleteComment(postId: number, commentId: number, userId: number) {
    // check if comment belongs to post and user
    const comment = await prisma.comment.findUnique({
      where: {
        id: commentId,
      },
      select: {
        post_id: true,
        user_id: true,
      },
    });

    // If no comment found
    if (!comment) throw new ServerError(StatusCodes.NOT_FOUND, COMMENT_NOT_FOUND_MSG);

    // If comment found but not belongs to post
    if (comment.post_id !== postId) throw new ServerError(StatusCodes.NOT_FOUND, COMMENT_NOT_FOUND_MSG);

    // If comment found but not belongs to user who is trying to delete it
    if (comment.user_id !== userId) throw new ServerError(StatusCodes.FORBIDDEN, FORBIDDEN_MSG);

    // Looks good, delete comment
    const promises = [
      prisma.commentUpvote.deleteMany({
        where: {
          comment_id: commentId,
        },
      }),
      prisma.comment.delete({
        where: {
          id: commentId,
        },
      }),
    ];

    // Delete all upvotes of comment
    // Delete all replies of comment
    await prisma.$transaction(promises);

    return true;
  }

  /** Update comment */
  async updateComment(postId: number, commentId: number, userId: number, text: string) {
    const comment = await prisma.comment.findUnique({
      where: {
        id: commentId,
      },
      select: {
        user_id: true,
        post_id: true,
      },
    });

    // comment not found
    if (!comment) throw new ServerError(StatusCodes.NOT_FOUND, COMMENT_NOT_FOUND_MSG);

    // comment found but not belongs to given post id post
    if (comment.post_id !== postId) throw new ServerError(StatusCodes.NOT_FOUND, COMMENT_NOT_FOUND_MSG);

    // comment found but not belongs to user who is trying to update it
    if (comment.user_id !== userId) throw new ServerError(StatusCodes.FORBIDDEN, FORBIDDEN_MSG);

    const data = await prisma.comment.update({
      where: {
        id: commentId,
      },
      data: {
        text,
      },
      select: {
        id: true,
        text: true,
        user_id: true,
        parent_id: true,
        updated_at: true,
        created_at: true,
      },
    });

    return data;
  }

  /** Add reply to a comment */
  async addReplyToComment(postId: number, commentId: number, userId: number, text: string) {
    const comment = await prisma.comment.findUnique({
      where: {
        id: commentId,
      },
    });

    // comment not found
    if (!comment) throw new ServerError(StatusCodes.NOT_FOUND, COMMENT_NOT_FOUND_MSG);

    // comment found but not belongs to given post id's post
    if (comment.post_id !== postId) throw new ServerError(StatusCodes.NOT_FOUND, COMMENT_NOT_FOUND_MSG);

    const data = await prisma.comment.create({
      data: {
        text,
        post_id: postId,
        user_id: userId,
        parent_id: commentId,
      },
      select: {
        id: true,
        text: true,
        user_id: true,
        parent_id: true,
        updated_at: true,
        created_at: true,
      },
    });

    return data;
  }

  /** Get replies to a comment */
  async getRepliesToComment(postId: number, commentId: number, userId: number, limit = 5, offset = 0) {
    const comment = await prisma.comment.findUnique({
      where: {
        id: commentId,
      },
    });

    // comment not found
    if (!comment) throw new ServerError(StatusCodes.NOT_FOUND, COMMENT_NOT_FOUND_MSG);

    // comment found but not belongs to given post id's post
    if (comment.post_id !== postId) throw new ServerError(StatusCodes.NOT_FOUND, COMMENT_NOT_FOUND_MSG);

    const totalReplyCount = await prisma.comment.count({
      where: {
        parent_id: commentId,
      },
    });

    const data = await prisma.comment.findMany({
      where: {
        parent_id: commentId,
      },
      select: {
        _count: {
          select: {
            upvotes: true,
          },
        },
        updated_at: true,
        created_at: true,
        text: true,
        id: true,
        // TODO: Need to add more informative name
        // upvotes represents whether the user who make request has liked the comment or not
        upvotes: {
          where: {
            user_id: userId,
          },
          select: {
            user_id: true,
            id: true,
          },
        },
        user: {
          select: {
            profile_image: true,
            id: true,
            name: true,
          },
        },
      },
      take: limit,
      skip: offset,
      orderBy: {
        updated_at: "desc",
      },
    });

    return {
      comments: data.map((r) => ({
        ...r,
        upvotes_count: r._count.upvotes,
        _count: undefined,
      })),
      meta: {
        pagination: {
          ...getPagination(totalReplyCount, limit, offset),
        },
      },
    };
  }

  /** Like a comment */
  async likeComment(postId: number, commentId: number, userId: number) {
    const comment = await prisma.comment.findUnique({
      where: {
        id: commentId,
      },
    });

    // comment not found
    if (!comment) throw new ServerError(StatusCodes.NOT_FOUND, COMMENT_NOT_FOUND_MSG);

    // comment does not belongs to given post id's post
    if (comment.post_id !== postId) throw new ServerError(StatusCodes.NOT_FOUND, COMMENT_NOT_FOUND_MSG);

    // comment already liked by user
    const isAlreadyLiked = await prisma.comment.findUnique({
      where: {
        id: commentId,
      },
      select: {
        upvotes: {
          where: {
            user_id: userId,
          },
        },
      },
    });

    if (isAlreadyLiked && isAlreadyLiked.upvotes.length > 0) {
      throw new ServerError(StatusCodes.BAD_REQUEST, ALREADY_LIKED_COMMENT_MSG);
    }

    const data = await prisma.comment.update({
      where: {
        id: commentId,
      },
      data: {
        upvotes: {
          create: {
            post_id: postId,
            user_id: userId,
          },
        },
      },
      select: {
        id: true,
        updated_at: true,
        user_id: true,
      },
    });

    return data;
  }

  /** Unlike a comment */
  async unlikeComment(postId: number, commentId: number, userId: number) {
    const comment = await prisma.comment.findUnique({
      where: {
        id: commentId,
      },
    });

    if (!comment) throw new ServerError(StatusCodes.NOT_FOUND, COMMENT_NOT_FOUND_MSG);

    // Comment does not belongs to given post id's post
    if (comment.post_id !== postId) throw new ServerError(StatusCodes.NOT_FOUND, COMMENT_NOT_FOUND_MSG);

    const isAlreadyLiked = await prisma.comment.findUnique({
      where: {
        id: commentId,
      },
      select: {
        upvotes: {
          where: {
            user_id: userId,
          },
        },
      },
    });

    if (!isAlreadyLiked || isAlreadyLiked.upvotes.length === 0) {
      throw new ServerError(StatusCodes.BAD_REQUEST, COMMENT_NOT_LIKED_MSG);
    }

    // current user is unliking his own comment
    if (isAlreadyLiked.upvotes[0].user_id !== userId) {
      throw new ServerError(StatusCodes.FORBIDDEN, FORBIDDEN_MSG);
    }

    const data = await prisma.comment.update({
      where: {
        id: commentId,
      },
      data: {
        upvotes: {
          delete: {
            id: isAlreadyLiked.upvotes[0].id,
          },
        },
      },
      select: {
        id: true,
        updated_at: true,
        user_id: true,
      },
    });

    return data;
  }

  /** Create a post */
  async createPost(
    { content, title, status, type = "PUBLIC", groupId, postAssets }: CreatePostPayload,
    userId: number
  ) {
    const slug = slugify(`${title}-${nanoid(5)}`, { lower: true });
    const post = await prisma.post.create({
      data: {
        slug,
        content,
        title,
        status,
        type,
        group_id: groupId,
        author_id: userId,
        post_assets: {
          create: postAssets,
        },
      },
    });
    await HashTagService.addHashtags(post.id, content);
    return post;
  }

  /** Get posts by user id */
  async getPostsByUserId(
    userId: number,
    limit = 5,
    offset = 0,
    status = "OPEN" as PostStatus,
    orderBy: "asc" | "desc" = "desc"
  ) {
    const totalPosts = await prisma.post.count({
      where: {
        author_id: userId,
        status,
      },
    });

    const posts = await prisma.post.findMany({
      where: {
        author_id: userId,
        status,
      },
      include: {
        // TODO: Need to give more informative name
        // upvotes indicates whether the user who make request has liked the post or not
        upvotes: {
          where: {
            user_id: userId,
          },
          select: {
            id: true,
            user_id: true,
          },
        },
        author: {
          select: {
            name: true,
            location: true,
            profile_image: true,
          },
        },
        post_assets: {
          select: {
            url: true,
            type: true,
            id: true,
          },
        },
        comments: {
          where: {
            parent_id: null,
          },
          select: {
            id: true,
          },
        },
        _count: {
          select: {
            upvotes: true,
          },
        },
      },
      orderBy: {
        updated_at: orderBy,
      },
      take: limit,
      skip: offset,
    });

    return {
      posts: posts.map((p) => ({
        ...p,
        upvotes_count: p._count.upvotes,
        comments_count: p.comments.length,
        _count: undefined,
      })),
      meta: {
        pagination: {
          ...getPagination(totalPosts, limit, offset),
        },
      },
    };
  }

  /** Update post */
  async updatePost(postId: number, userId: number, payload: UpdatePostPayload) {
    const slug = slugify(`${payload.title}-${nanoid(5)}`, { lower: true });
    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
    });

    // post does not exists, then throw error
    if (!post) throw new ServerError(StatusCodes.NOT_FOUND, POST_NOT_FOUND_MSG);

    // post author is not same as authenticated user
    if (post.author_id !== userId) throw new ServerError(StatusCodes.FORBIDDEN, FORBIDDEN_MSG);

    // TODO: Need to find a better way to update post assets
    const promises = [
      prisma.postAsset.deleteMany({
        where: {
          post_id: postId,
        },
      }),
      prisma.post.update({
        where: {
          id: postId,
        },
        data: {
          content: payload.content,
          title: payload.title,
          slug,
          type: payload.type,
          status: payload.status,
          group_id: payload.groupId,
          post_assets: {
            createMany: {
              data: payload.post_assets,
            },
          },
        },
        select: {
          id: true,
          author_id: true,
          title: true,
          content: true,
          slug: true,
          type: true,
          status: true,
          group_id: true,
          created_at: true,
          updated_at: true,
        },
      }),
    ];

    const [, data] = await prisma.$transaction(promises);

    await HashTagService.addHashtags(postId, payload.content);
    return data;
  }

  /** Delete post */
  async deleteMyPost(postId: number, userId: number) {
    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
      select: {
        author_id: true,
        post_hash_tags: {
          where: {
            post_id: postId,
          },
        },
      },
    });

    // post does not exists
    if (!post) throw new ServerError(StatusCodes.NOT_FOUND, POST_NOT_FOUND_MSG);

    // post author is not same as authenticated user
    if (post.author_id !== userId) throw new ServerError(StatusCodes.FORBIDDEN, FORBIDDEN_MSG);

    await prisma.postHashTag.deleteMany({
      where: {
        post_id: postId,
      },
    });

    // eslint-disable-next-line no-restricted-syntax
    for (const hashtagId of post.post_hash_tags) {
      // eslint-disable-next-line no-await-in-loop
      await prisma.hashTag.update({
        where: {
          id: hashtagId.hash_tag_id,
        },
        data: {
          count: {
            decrement: 1,
          },
        },
      });
    }

    await prisma.commentUpvote.deleteMany({
      where: {
        post_id: postId,
      },
    });

    await prisma.comment.deleteMany({
      where: {
        post_id: postId,
        upvotes: {
          every: {
            post_id: postId,
          },
        },
      },
    });

    await prisma.upvote.deleteMany({
      where: {
        post_id: postId,
      },
    });

    await prisma.post.delete({
      where: {
        id: postId,
      },
    });

    return true;
  }

  /** Change post status */
  async changeStatus(postId: number, payload: ChangeStatusPayload, userId: number) {
    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
    });

    if (!post) throw new ServerError(StatusCodes.NOT_FOUND, POST_NOT_FOUND_MSG);

    if (post.author_id !== userId) throw new ServerError(StatusCodes.FORBIDDEN, FORBIDDEN_MSG);

    const data = await prisma.post.update({
      where: {
        id: postId,
      },
      data: {
        status: payload.status,
      },
      select: {
        id: true,
        status: true,
      },
    });

    return data;
  }

  /** Get comments of a user */
  async getCommentsByUserId(
    userId: number,
    status: PostStatus = "OPEN",
    orderBy: "asc" | "desc" = "desc",
    limit = 5,
    offset = 0
  ) {
    const totalComments = await prisma.comment.count({
      where: {
        user_id: userId,
        post: {
          status,
        },
        parent_id: null,
      },
    });

    const comments = await prisma.comment.findMany({
      where: {
        user_id: userId,
        post: {
          status,
        },
        parent_id: null,
      },
      include: {
        post: {
          select: {
            title: true,
            id: true,
            updated_at: true,
            status: true,
            author: {
              select: {
                name: true,
                profile_image: true,
                id: true,
                location: true,
              },
            },
          },
        },
        _count: {
          select: {
            upvotes: true,
          },
        },
        user: {
          select: {
            profile_image: true,
            name: true,
            id: true,
          },
        },
      },
      orderBy: {
        updated_at: orderBy,
      },
      take: limit,
      skip: offset,
    });

    return {
      comments: comments.map((comment) => ({
        ...comment,
        upvotes_count: comment._count.upvotes,
        _count: undefined,
      })),
      meta: {
        pagination: {
          ...getPagination(totalComments, limit, offset),
        },
      },
    };
  }

  validatePostPayload(data: CreatePostPayload) {
    return validateCreatePostPayload(data);
  }
}

export default new PostService();
