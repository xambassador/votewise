/**
 * @file: index.ts
 * @description: Contains all posts related services
 */
import type { PostStatus } from "@prisma/client";
import { nanoid } from "nanoid";
import slugify from "slugify";

import { prisma } from "@votewise/prisma";
import type { ChangeStatusPayload, CreatePostPayload, UpdatePostPayload } from "@votewise/types";

import HashTagService from "@/src/services/hashtag";
import {
  ALREADY_LIKED_COMMENT_MSG,
  COMMENT_NOT_FOUND_MSG,
  COMMENT_NOT_LIKED_MSG,
  ERROR_ADDING_COMMENT_MSG,
  ERROR_COMMENT_FETCHED_MSG,
  ERROR_CREATING_POST_MSG,
  ERROR_DELETING_COMMENT_MSG,
  ERROR_DELETING_POST_MSG,
  ERROR_FETCHING_COMMENTS_FOR_POST_MSG,
  ERROR_FETCHING_POST_MSG,
  ERROR_GETTING_REPLIES_FROM_COMMENT_MSG,
  ERROR_GETTING_USER_POSTS,
  ERROR_LIKING_COMMENT_MSG,
  ERROR_LIKING_POST_MSG,
  ERROR_REPLAYING_COMMENT_MSG,
  ERROR_UNLIKING_COMMENT_MSG,
  ERROR_UNLIKING_POST_MSG,
  ERROR_UPDATING_COMMENT_MSG,
  ERROR_UPDATING_POST_MSG,
  ERROR_UPDATING_POST_STATUS_MSG,
  POST_ALREADY_LIKED_MSG,
  POST_NOT_FOUND_MSG,
  POST_NOT_LIKED_MSG,
  UNAUTHORIZED_MSG,
  getErrorReason,
  getPagination,
} from "@/src/utils";
import { validateCreatePostPayload } from "@/src/zodValidation";

// FIXME: Remove comments logic to its own service
class PostService {
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
          created_at: sortorder,
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
            comments: true,
            upvotes: true,
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
        comments_count: post._count.comments,
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

  // ---------------------------------
  async getPost(postId: number, userId: number) {
    try {
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
          comments: {
            where: {
              parent_id: null,
            },
            select: {
              id: true,
              user_id: true,
              updated_at: true,
              text: true,
              user: {
                select: {
                  id: true,
                  profile_image: true,
                  name: true,
                },
              },
              _count: {
                select: {
                  upvotes: true,
                },
              },
            },
            take: 5,
            skip: 0,
            orderBy: {
              created_at: "desc",
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
              comments: true,
              upvotes: true,
            },
          },
        },
      });
      return {
        ...post,
        comments: post?.comments.map((comment) => ({
          ...comment,
          upvotes_count: comment._count.upvotes,
          _count: undefined,
        })),
        upvotes_count: post?._count.upvotes,
        comments_count: post?._count.comments,
        _count: undefined,
        meta: {
          pagination: {
            ...getPagination(post?._count.comments || 0, 5, 0),
          },
        },
      };
    } catch (err) {
      throw new Error(ERROR_FETCHING_POST_MSG);
    }
  }

  // ---------------------------------
  async getCommentsForPost(postId: number, limit = 5, offset = 0) {
    try {
      const totalComments = await prisma.comment.count({
        where: {
          post_id: postId,
        },
      });
      const comments = await prisma.comment.findMany({
        where: {
          post_id: postId,
        },
        select: {
          user: {
            select: {
              name: true,
              id: true,
              profile_image: true,
            },
          },
          id: true,
          updated_at: true,
          text: true,
          _count: {
            select: {
              upvotes: true,
            },
          },
        },
        take: limit,
        skip: offset,
        orderBy: {
          created_at: "desc",
        },
      });
      const data = comments.map((comment) => ({
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
    } catch (err) {
      throw new Error(ERROR_FETCHING_COMMENTS_FOR_POST_MSG);
    }
  }

  // ---------------------------------
  async likePost(postId: number, userId: number) {
    try {
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

      if (isAlreadyLiked && isAlreadyLiked.upvotes.length > 0) {
        throw new Error(POST_ALREADY_LIKED_MSG);
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
    } catch (err) {
      const msg = getErrorReason(err);
      if (msg === POST_ALREADY_LIKED_MSG) {
        throw new Error(msg);
      } else {
        throw new Error(ERROR_LIKING_POST_MSG);
      }
    }
  }

  // ---------------------------------
  async unlikePost(postId: number, userId: number) {
    try {
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

      if (!isAlreadyLiked) {
        throw new Error(POST_NOT_LIKED_MSG);
      }

      if (isAlreadyLiked && isAlreadyLiked.upvotes.length === 0) {
        throw new Error(POST_NOT_LIKED_MSG);
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
    } catch (err) {
      const msg = getErrorReason(err);
      if (msg === POST_NOT_LIKED_MSG) {
        throw new Error(msg);
      } else {
        throw new Error(ERROR_UNLIKING_POST_MSG);
      }
    }
  }

  // ---------------------------------
  async addComment(postId: number, userId: number, text: string) {
    try {
      const isPostExist = await prisma.post.findUnique({
        where: {
          id: postId,
        },
      });

      if (!isPostExist) {
        throw new Error(POST_NOT_FOUND_MSG);
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
    } catch (err) {
      throw new Error(ERROR_ADDING_COMMENT_MSG);
    }
  }

  // ---------------------------------
  async deleteComment(postId: number, commentId: number, userId: number) {
    try {
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

      if (!comment) {
        throw new Error(COMMENT_NOT_FOUND_MSG);
      }

      if (comment.post_id !== postId) {
        throw new Error(COMMENT_NOT_FOUND_MSG);
      }

      if (comment.user_id !== userId) {
        throw new Error(UNAUTHORIZED_MSG);
      }

      await prisma.commentUpvote.deleteMany({
        where: {
          comment_id: commentId,
        },
      });
      await prisma.comment.delete({
        where: {
          id: commentId,
        },
      });
    } catch (err) {
      const msg = getErrorReason(err);
      if (msg === COMMENT_NOT_FOUND_MSG || msg === UNAUTHORIZED_MSG) {
        throw new Error(msg);
      } else {
        throw new Error(ERROR_DELETING_COMMENT_MSG);
      }
    }
  }

  // ---------------------------------
  async updateComment(postId: number, commentId: number, userId: number, text: string) {
    try {
      const comment = await prisma.comment.findUnique({
        where: {
          id: commentId,
        },
        select: {
          user_id: true,
          post_id: true,
        },
      });

      if (!comment) {
        throw new Error(COMMENT_NOT_FOUND_MSG);
      }

      if (comment.post_id !== postId) {
        throw new Error(COMMENT_NOT_FOUND_MSG);
      }

      if (comment.user_id !== userId) {
        throw new Error(UNAUTHORIZED_MSG);
      }

      const data = await prisma.comment.update({
        where: {
          id: commentId,
        },
        data: {
          text,
        },
      });

      return data;
    } catch (err) {
      const msg = getErrorReason(err);
      if (msg === COMMENT_NOT_FOUND_MSG || msg === UNAUTHORIZED_MSG) {
        throw new Error(msg);
      } else {
        throw new Error(ERROR_UPDATING_COMMENT_MSG);
      }
    }
  }

  // ---------------------------------
  async addReplyToComment(postId: number, commentId: number, userId: number, text: string) {
    try {
      const comment = await prisma.comment.findUnique({
        where: {
          id: commentId,
        },
      });

      if (!comment) {
        throw new Error(COMMENT_NOT_FOUND_MSG);
      }

      if (comment.post_id !== postId) {
        throw new Error(COMMENT_NOT_FOUND_MSG);
      }

      const data = await prisma.comment.create({
        data: {
          text,
          post_id: postId,
          user_id: userId,
          parent_id: commentId,
        },
      });

      return data;
    } catch (err) {
      const msg = getErrorReason(err);
      if (msg === COMMENT_NOT_FOUND_MSG) {
        throw new Error(msg);
      } else {
        throw new Error(ERROR_REPLAYING_COMMENT_MSG);
      }
    }
  }

  // ---------------------------------
  async getRepliesToComment(postId: number, commentId: number, limit = 5, offset = 0) {
    try {
      const comment = await prisma.comment.findUnique({
        where: {
          id: commentId,
        },
      });

      if (!comment) {
        throw new Error(COMMENT_NOT_FOUND_MSG);
      }

      if (comment.post_id !== postId) {
        throw new Error(COMMENT_NOT_FOUND_MSG);
      }

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
          updated_at: true,
          created_at: true,
          text: true,
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
        })),
        meta: {
          pagination: {
            ...getPagination(totalReplyCount, limit, offset),
          },
        },
      };
    } catch (err) {
      const msg = getErrorReason(err);
      if (msg === COMMENT_NOT_FOUND_MSG) {
        throw new Error(msg);
      } else {
        throw new Error(ERROR_GETTING_REPLIES_FROM_COMMENT_MSG);
      }
    }
  }

  // ---------------------------------
  async likeComment(postId: number, commentId: number, userId: number) {
    try {
      const comment = await prisma.comment.findUnique({
        where: {
          id: commentId,
        },
      });

      if (!comment) {
        throw new Error(COMMENT_NOT_FOUND_MSG);
      }

      if (comment.post_id !== postId) {
        throw new Error(COMMENT_NOT_FOUND_MSG);
      }

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
        throw new Error(ALREADY_LIKED_COMMENT_MSG);
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
      });

      return data;
    } catch (err) {
      const msg = getErrorReason(err);
      if (msg === COMMENT_NOT_FOUND_MSG || msg === ALREADY_LIKED_COMMENT_MSG) {
        throw new Error(msg);
      } else {
        throw new Error(ERROR_LIKING_COMMENT_MSG);
      }
    }
  }

  // ---------------------------------
  async unlikeComment(postId: number, commentId: number, userId: number) {
    try {
      const comment = await prisma.comment.findUnique({
        where: {
          id: commentId,
        },
      });

      if (!comment) {
        throw new Error(COMMENT_NOT_FOUND_MSG);
      }

      if (comment.post_id !== postId) {
        throw new Error(COMMENT_NOT_FOUND_MSG);
      }

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
        throw new Error(COMMENT_NOT_LIKED_MSG);
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
      });

      return data;
    } catch (err) {
      const msg = getErrorReason(err);
      if (msg === COMMENT_NOT_FOUND_MSG || msg === COMMENT_NOT_LIKED_MSG) {
        throw new Error(msg);
      } else {
        throw new Error(ERROR_UNLIKING_COMMENT_MSG);
      }
    }
  }

  // ---------------------------------
  async createPost(
    { content, title, status, type = "PUBLIC", groupId, postAssets }: CreatePostPayload,
    userId: number
  ) {
    const slug = slugify(`${title}-${nanoid(5)}`, { lower: true });
    try {
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
    } catch (err) {
      throw new Error(ERROR_CREATING_POST_MSG);
    }
  }

  // ---------------------------------
  async getPostsByUserId(userId: number, limit = 5, offset = 0, status = "OPEN" as PostStatus) {
    try {
      const totalPosts = await prisma.post.count({
        where: {
          author_id: userId,
          status,
        },
      });
      const posts = await prisma.post.findMany({
        where: {
          author_id: userId,
        },
        orderBy: {
          updated_at: "desc",
        },
        include: {
          _count: {
            select: {
              upvotes: true,
              comments: true,
            },
          },
        },
        take: limit,
        skip: offset,
      });
      return {
        posts: posts.map((p) => ({
          ...p,
          upvotes: p._count.upvotes,
          comments: p._count.comments,
          _count: undefined,
        })),
        meta: {
          pagination: {
            ...getPagination(totalPosts, limit, offset),
          },
        },
      };
    } catch (err) {
      throw new Error(ERROR_GETTING_USER_POSTS);
    }
  }

  // ---------------------------------
  async updatePost(postId: number, userId: number, payload: UpdatePostPayload) {
    const slug = slugify(`${payload.title}-${nanoid(5)}`, { lower: true });
    try {
      const post = await prisma.post.findUnique({
        where: {
          id: postId,
        },
      });

      if (!post) {
        throw new Error(POST_NOT_FOUND_MSG);
      }

      if (post.author_id !== userId) {
        throw new Error(UNAUTHORIZED_MSG);
      }

      const data = await prisma.post.update({
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
        },
      });
      await HashTagService.addHashtags(postId, payload.content);
      return data;
    } catch (err) {
      const msg = getErrorReason(err);
      if (msg === POST_NOT_FOUND_MSG || msg === UNAUTHORIZED_MSG) {
        throw new Error(msg);
      }
      throw new Error(ERROR_UPDATING_POST_MSG);
    }
  }

  // ---------------------------------
  async deleteMyPost(postId: number, userId: number) {
    try {
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

      if (!post) {
        throw new Error(POST_NOT_FOUND_MSG);
      }

      if (post.author_id !== userId) {
        throw new Error(UNAUTHORIZED_MSG);
      }

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
    } catch (err) {
      const msg = getErrorReason(err);
      if (msg === POST_NOT_FOUND_MSG || msg === UNAUTHORIZED_MSG) {
        throw new Error(msg);
      }
      // eslint-disable-next-line no-console
      console.log(err);
      throw new Error(ERROR_DELETING_POST_MSG);
    }
  }

  // ---------------------------------
  async changeStatus(postId: number, payload: ChangeStatusPayload, userId: number) {
    try {
      const post = await prisma.post.findUnique({
        where: {
          id: postId,
        },
      });

      if (!post) {
        throw new Error(POST_NOT_FOUND_MSG);
      }

      if (post.id !== userId) {
        throw new Error(UNAUTHORIZED_MSG);
      }

      const data = await prisma.post.update({
        where: {
          id: postId,
        },
        data: {
          status: payload.status,
        },
      });

      return data;
    } catch (err) {
      const msg = getErrorReason(err);
      if (msg === POST_NOT_FOUND_MSG || msg === UNAUTHORIZED_MSG) {
        throw new Error(msg);
      }
      throw new Error(ERROR_UPDATING_POST_STATUS_MSG);
    }
  }

  // ---------------------------------
  async getCommentsByUserId(userId: number, limit = 5, offset = 0) {
    try {
      const totalComments = await prisma.comment.count({
        where: {
          user_id: userId,
        },
      });
      const comments = await prisma.comment.findMany({
        where: {
          user_id: userId,
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
                },
              },
            },
          },
        },
        orderBy: {
          updated_at: "desc",
        },
        take: limit,
        skip: offset,
      });
      return {
        comments,
        meta: {
          pagination: {
            ...getPagination(totalComments, limit, offset),
          },
        },
      };
    } catch (err) {
      throw new Error(ERROR_COMMENT_FETCHED_MSG);
    }
  }

  // ---------------------------------
  validatePostPayload(data: CreatePostPayload) {
    return validateCreatePostPayload(data);
  }
}

export default new PostService();
