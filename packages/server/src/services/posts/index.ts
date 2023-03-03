/**
 * @file: index.ts
 * @description: Contains all posts related services
 */
import { prisma } from "@votewise/prisma";

import {
  ALREADY_LIKED_COMMENT_MSG,
  COMMENT_NOT_FOUND_MSG,
  COMMENT_NOT_LIKED_MSG,
  ERROR_ADDING_COMMENT_MSG,
  ERROR_DELETING_COMMENT_MSG,
  ERROR_FETCHING_COMMENTS_FOR_POST_MSG,
  ERROR_FETCHING_POST_MSG,
  ERROR_GETTING_REPLIES_FROM_COMMENT_MSG,
  ERROR_LIKING_COMMENT_MSG,
  ERROR_LIKING_POST_MSG,
  ERROR_REPLAYING_COMMENT_MSG,
  ERROR_UNLIKING_COMMENT_MSG,
  ERROR_UNLIKING_POST_MSG,
  ERROR_UPDATING_COMMENT_MSG,
  POST_ALREADY_LIKED_MSG,
  POST_NOT_LIKED_MSG,
  UNAUTHORIZED_MSG,
  getErrorReason,
} from "@/src/utils";

function getPagination(total: number, limit: number, offset: number) {
  return {
    total,
    limit,
    next: offset + limit,
    isLastPage: total <= offset + limit,
  };
}

class PostService {
  async getPosts(userId: number, limit = 10, offset = 0) {
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
      orderBy: {
        created_at: "desc",
      },
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
  async getPost(postId: number) {
    try {
      const post = await prisma.post.findUnique({
        where: {
          id: postId,
        },
        include: {
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

      if (isAlreadyLiked?.upvotes) {
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

      if (!isAlreadyLiked?.upvotes) {
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
      const data = await prisma.comment.create({
        data: {
          text,
          post_id: postId,
          user_id: userId,
        },
      });
      return data;
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
}

export default new PostService();
