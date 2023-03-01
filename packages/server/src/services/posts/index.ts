/**
 * @file: index.ts
 * @description: Contains all posts related services
 */
import { prisma } from "@votewise/prisma";

import { getErrorReason } from "@/src/utils";

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
          total: totalPosts,
          limit,
          next: offset + limit,
          isLastPage: totalPosts <= offset + limit,
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
            total: post?._count.comments,
            limit: 5,
            next: post?.comments.length ? 5 : 0,
          },
        },
      };
    } catch (err) {
      throw new Error(`Error while fetching post`);
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
            total: totalComments,
            limit,
            next: offset + limit,
            isLastPage: totalComments <= offset + limit,
          },
        },
      };
    } catch (err) {
      throw new Error(`Error while fetching comments for post`);
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
        throw new Error(`Post already liked`);
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
      if (msg === "Post already liked") {
        throw new Error(msg);
      } else {
        throw new Error(`Error while liking post`);
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
        throw new Error(`Post not liked`);
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
      if (msg === "Post not liked") {
        throw new Error(msg);
      } else {
        throw new Error(`Error while unliking post`);
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
      throw new Error(`Error while adding comment`);
    }
  }
}

export default new PostService();
