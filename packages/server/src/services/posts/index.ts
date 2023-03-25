/**
 * @file: index.ts
 * @description: Contains all posts related services
 */
// eslint-disable-next-line max-classes-per-file
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
  COMMENT_POST_CLOSED_MSG,
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
  FORBIDDEN_MSG,
  POST_ALREADY_LIKED_MSG,
  POST_CLOSED_MSG,
  POST_NOT_FOUND_MSG,
  POST_NOT_LIKED_MSG,
  getErrorReason,
  getPagination,
} from "@/src/utils";
import { validateCreatePostPayload } from "@/src/zodValidation";

// TODO: Move this class to its own file. Add more methods to it.
class BasePostService {
  async isPostExist(postId: number) {
    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
    });
    return post;
  }
}

// FIXME: Remove comments logic to its own service
class PostService extends BasePostService {
  /**
   * @description Get all posts
   * @param userId Authenticated user id
   * @param limit Limit of posts to fetch
   * @param offset Offset of posts to fetch
   * @param sortby Sort by upvote, comment or date
   * @param sortorder Sort order asc or desc
   * @returns
   */
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

  // ---------------------------------
  /**
   * @description Get post details for a given post id
   * @param postId Post id for which details are to be fetched
   * @param userId Authenticated user id
   * @returns
   */
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
    } catch (err) {
      throw new Error(ERROR_FETCHING_POST_MSG);
    }
  }

  // ---------------------------------
  /**
   * @description Get comments for given post id
   * @param postId Post id for which comments are to be fetched
   * @param userId Authenticated user id
   * @param limit Limit to fetch comments
   * @param offset Offset to skip comments
   * @returns
   * @throws Error if post is not found,
   */
  async getCommentsForPost(postId: number, userId: number, limit = 5, offset = 0) {
    try {
      // Check for post exists
      const post = await this.isPostExist(postId);
      if (!post) throw new Error(POST_NOT_FOUND_MSG);

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
    } catch (err) {
      const msg = getErrorReason(err) || ERROR_FETCHING_COMMENTS_FOR_POST_MSG;
      throw new Error(msg);
    }
  }

  // ---------------------------------
  /**
   * @description Like a post
   * @param postId Post id for like
   * @param userId Authenticated user id
   * @returns
   * @throws Error if post is not found, post is closed, user has already liked the post or error while liking the post
   */
  async likePost(postId: number, userId: number) {
    try {
      const post = await this.isPostExist(postId);
      if (!post) throw new Error(POST_NOT_FOUND_MSG);

      // If post is closed, then throw error
      if (post.status === "CLOSED") throw new Error(POST_CLOSED_MSG);

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
      const msg = getErrorReason(err) || ERROR_LIKING_POST_MSG;
      throw new Error(msg);
    }
  }

  // ---------------------------------
  /**
   * @description Unlike a post
   * @param postId Post id for unlike
   * @param userId Authenticated user id
   * @returns
   * @throws Error if post is not found, post is closed, user has not liked the post or error while unliking the post
   */
  async unlikePost(postId: number, userId: number) {
    try {
      const post = await this.isPostExist(postId);
      if (!post) throw new Error(POST_NOT_FOUND_MSG);

      // If post is closed, then throw error
      if (post.status === "CLOSED") throw new Error(POST_CLOSED_MSG);

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
        throw new Error(POST_NOT_LIKED_MSG);
      }

      if (isAlreadyLiked && isAlreadyLiked.upvotes.length === 0) {
        throw new Error(POST_NOT_LIKED_MSG);
      }

      // Check is same user who liked the post is trying to unlike it.
      if (isAlreadyLiked && isAlreadyLiked.upvotes[0].user_id !== userId) {
        throw new Error(FORBIDDEN_MSG);
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
      const msg = getErrorReason(err) || ERROR_UNLIKING_POST_MSG;
      throw new Error(msg);
    }
  }

  // ---------------------------------
  /**
   * @description Add comment to a post
   * @param postId Post id for adding comment
   * @param userId Authenticated user id
   * @param text Comment text
   * @returns
   * @throws Error if post is not found, post is closed or error while adding comment
   */
  async addComment(postId: number, userId: number, text: string) {
    try {
      const isPostExist = await this.isPostExist(postId);
      if (!isPostExist) throw new Error(POST_NOT_FOUND_MSG);
      if (isPostExist.status === "CLOSED") throw new Error(COMMENT_POST_CLOSED_MSG);

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
      const msg = getErrorReason(err) || ERROR_ADDING_COMMENT_MSG;
      throw new Error(msg);
    }
  }

  // ---------------------------------
  /**
   * @description Delete comment from a post
   * @param postId Post id for delete comment
   * @param commentId Comment id of comment to be deleted
   * @param userId Authenticated user id
   * @returns true if comment deleted successfully
   * @throws Error if comment is not found, comment does not belongs to post or user is not authorized to delete the comment.
   * Errors: COMMENT_NOT_FOUND, FORBIDDEN_MSG, ERROR_DELETING_COMMENT
   */
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

      // If no comment found, then throw error
      if (!comment) throw new Error(COMMENT_NOT_FOUND_MSG);

      // If comment found but not belongs to post, then throw error
      if (comment.post_id !== postId) throw new Error(COMMENT_NOT_FOUND_MSG);

      // If comment found but not belongs to user who is trying to delete it, then throw error
      if (comment.user_id !== userId) throw new Error(FORBIDDEN_MSG);

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
    } catch (err) {
      const msg = getErrorReason(err) || ERROR_DELETING_COMMENT_MSG;
      throw new Error(msg);
    }
  }

  // ---------------------------------
  /**
   * @description Update comment
   * @param postId Post id for which comment is to be updated
   * @param commentId Comment id of comment to be updated
   * @param userId Authenticated user id
   * @param text Comment text
   * @returns
   * @throws Error if comment is not found, comment does not belongs to post or user is not authorized to update the comment.
   * Errors: COMMENT_NOT_FOUND, FORBIDDEN_MSG, ERROR_UPDATING_COMMENT
   */
  async updateComment(postId: number, commentId: number, userId: number, text: string) {
    try {
      // Find comment
      const comment = await prisma.comment.findUnique({
        where: {
          id: commentId,
        },
        select: {
          user_id: true,
          post_id: true,
        },
      });

      // If comment not found, then throw error
      if (!comment) throw new Error(COMMENT_NOT_FOUND_MSG);

      // If comment found but not belongs to given post id post, then throw error
      if (comment.post_id !== postId) throw new Error(COMMENT_NOT_FOUND_MSG);

      // If comment found but not belongs to user who is trying to update it, then throw error
      if (comment.user_id !== userId) throw new Error(FORBIDDEN_MSG);

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
    } catch (err) {
      const msg = getErrorReason(err) || ERROR_UPDATING_COMMENT_MSG;
      throw new Error(msg);
    }
  }

  // ---------------------------------
  /**
   * @description Add reply to a comment
   * @param postId Post id for which reply is to be added
   * @param commentId Comment id for which reply is to be added
   * @param userId Authenticated user id
   * @param text Reply text
   * @returns
   * @throws Error if comment is not found, comment does not belongs to post or user is not authorized to add reply to the comment.
   * Errors: COMMENT_NOT_FOUND, FORBIDDEN_MSG, ERROR_ADDING_COMMENT
   */
  async addReplyToComment(postId: number, commentId: number, userId: number, text: string) {
    try {
      // Find comment
      const comment = await prisma.comment.findUnique({
        where: {
          id: commentId,
        },
      });

      // If comment not found
      if (!comment) throw new Error(COMMENT_NOT_FOUND_MSG);

      // If comment found but not belongs to given post id's post, then throw error
      if (comment.post_id !== postId) throw new Error(COMMENT_NOT_FOUND_MSG);

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
    } catch (err) {
      const msg = getErrorReason(err) || ERROR_REPLAYING_COMMENT_MSG;
      throw new Error(msg);
    }
  }

  // ---------------------------------
  /**
   * @description Get replies to a comment
   * @param postId Post id for which replies are to be fetched
   * @param commentId Comment id for which replies are to be fetched
   * @param userId Authenticated user id
   * @param limit Limit of replies to be fetched
   * @param offset Offset of replies to be fetched
   * @returns
   * @throws Error if comment is not found, comment does not belongs to post or user is not authorized to get replies to the comment.
   * Errors: COMMENT_NOT_FOUND, FORBIDDEN_MSG, ERROR_GETTING_REPLIES_FROM_COMMENT_MSG
   */
  async getRepliesToComment(postId: number, commentId: number, userId: number, limit = 5, offset = 0) {
    try {
      const comment = await prisma.comment.findUnique({
        where: {
          id: commentId,
        },
      });

      // If comment not found
      if (!comment) throw new Error(COMMENT_NOT_FOUND_MSG);

      // If comment found but not belongs to given post id's post, then throw error
      if (comment.post_id !== postId) throw new Error(COMMENT_NOT_FOUND_MSG);

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
    } catch (err) {
      const msg = getErrorReason(err) || ERROR_GETTING_REPLIES_FROM_COMMENT_MSG;
      throw new Error(msg);
    }
  }

  // ---------------------------------
  /**
   * @description Like a comment
   * @param postId Post id for which comment is to be liked
   * @param commentId Comment id of comment that is to be liked
   * @param userId Authenticated user id
   * @returns
   * @throws Error if comment is not found, comment does not belongs to post or user is not authorized to like the comment.
   * Errors: COMMENT_NOT_FOUND, FORBIDDEN_MSG, ALREADY_LIKED_COMMENT_MSG, ERROR_LIKING_COMMENT_MSG
   */
  async likeComment(postId: number, commentId: number, userId: number) {
    try {
      const comment = await prisma.comment.findUnique({
        where: {
          id: commentId,
        },
      });

      // If comment not found
      if (!comment) throw new Error(COMMENT_NOT_FOUND_MSG);

      // If comment does not belongs to given post id's post, then throw error
      if (comment.post_id !== postId) throw new Error(COMMENT_NOT_FOUND_MSG);

      // Check for is comment already liked by user
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
        select: {
          id: true,
          updated_at: true,
          user_id: true,
        },
      });

      return data;
    } catch (err) {
      const msg = getErrorReason(err) || ERROR_LIKING_COMMENT_MSG;
      throw new Error(msg);
    }
  }

  // ---------------------------------
  /**
   * @description Unlike a comment
   * @param postId Post id for which comment is to be unliked
   * @param commentId Comment id of comment that is to be unliked
   * @param userId Authenticated user id
   * @returns
   * @throws Error if comment is not found, comment does not belongs to post or user is not authorized to unlike the comment.
   * Errors: COMMENT_NOT_FOUND, FORBIDDEN_MSG, COMMENT_NOT_LIKED_MSG, ERROR_UNLIKING_COMMENT_MSG
   */
  async unlikeComment(postId: number, commentId: number, userId: number) {
    try {
      const comment = await prisma.comment.findUnique({
        where: {
          id: commentId,
        },
      });

      if (!comment) throw new Error(COMMENT_NOT_FOUND_MSG);

      // Comment does not belongs to given post id's post, then throw error
      if (comment.post_id !== postId) throw new Error(COMMENT_NOT_FOUND_MSG);

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

      // Check if current user is unliking his own comment
      if (isAlreadyLiked.upvotes[0].user_id !== userId) throw new Error(FORBIDDEN_MSG);

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
    } catch (err) {
      const msg = getErrorReason(err) || ERROR_UNLIKING_COMMENT_MSG;
      throw new Error(msg);
    }
  }

  // ---------------------------------
  /**
   * @description Create a post
   * @param param0 Create post payload
   * @param userId Authenticated user id
   * @returns
   */
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
  /**
   * @description Get posts by user id
   * @param userId User id of user whose posts are to be fetched
   * @param limit Limit of posts to be fetched
   * @param offset Offset of posts to be fetched
   * @param status Post status
   * @param orderBy Order by
   * @returns
   */
  async getPostsByUserId(
    userId: number,
    limit = 5,
    offset = 0,
    status = "OPEN" as PostStatus,
    orderBy: "asc" | "desc" = "desc"
  ) {
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
    } catch (err) {
      throw new Error(ERROR_GETTING_USER_POSTS);
    }
  }

  // ---------------------------------
  /**
   * @description Update post
   * @param postId Post id of post to be updated
   * @param userId Authenticated user id
   * @param payload Payload to update post
   * @returns
   * @throws Error if post does not exists, if post author is not same as authenticated user
   * Errors, POST_NOT_FOUND_MSG, FORBIDDEN_MSG, ERROR_UPDATING_POST_MSG
   */
  async updatePost(postId: number, userId: number, payload: UpdatePostPayload) {
    const slug = slugify(`${payload.title}-${nanoid(5)}`, { lower: true });
    try {
      const post = await prisma.post.findUnique({
        where: {
          id: postId,
        },
      });

      // If post does not exists, then throw error
      if (!post) throw new Error(POST_NOT_FOUND_MSG);

      // If post author is not same as authenticated user, then throw error
      if (post.author_id !== userId) throw new Error(FORBIDDEN_MSG);

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
    } catch (err) {
      const msg = getErrorReason(err) || ERROR_UPDATING_POST_MSG;
      throw new Error(msg);
    }
  }

  // ---------------------------------
  /**
   * @description Delete post
   * @param postId Post id of post to be deleted
   * @param userId Authenticated user id
   * @returns
   * @throws Error if post does not exists, if post author is not same as authenticated user
   * Errors, POST_NOT_FOUND_MSG, FORBIDDEN_MSG, ERROR_DELETING_POST_MSG
   */
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

      // If post does not exists, then throw error
      if (!post) throw new Error(POST_NOT_FOUND_MSG);

      // If post author is not same as authenticated user, then throw error
      if (post.author_id !== userId) throw new Error(FORBIDDEN_MSG);

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
    } catch (err) {
      const msg = getErrorReason(err) || ERROR_DELETING_POST_MSG;
      throw new Error(msg);
    }
  }

  // ---------------------------------
  /**
   * @description Change post status
   * @param postId Post id for which status is to be changed
   * @param payload Payload to change post status
   * @param userId Authenticated user id
   * @returns
   * @throws Error if post does not exists, if post author is not same as authenticated user
   * Errors, POST_NOT_FOUND_MSG, FORBIDDEN_MSG, ERROR_UPDATING_POST_STATUS_MSG
   */
  async changeStatus(postId: number, payload: ChangeStatusPayload, userId: number) {
    try {
      const post = await prisma.post.findUnique({
        where: {
          id: postId,
        },
      });

      if (!post) throw new Error(POST_NOT_FOUND_MSG);

      if (post.author_id !== userId) throw new Error(FORBIDDEN_MSG);

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
    } catch (err) {
      const msg = getErrorReason(err) || ERROR_UPDATING_POST_STATUS_MSG;
      throw new Error(msg);
    }
  }

  // ---------------------------------
  /**
   * @description Get comments of a user
   * @param userId User id of user whose comments are to be fetched
   * @param limit Limit of comments to be fetched
   * @param offset Offset of comments to be fetched
   * @returns
   */
  async getCommentsByUserId(
    userId: number,
    status: PostStatus = "OPEN",
    orderBy: "asc" | "desc" = "desc",
    limit = 5,
    offset = 0
  ) {
    try {
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
