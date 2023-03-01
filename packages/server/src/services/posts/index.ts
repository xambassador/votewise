/**
 * @file: index.ts
 * @description: Contains all posts related services
 */
import { prisma } from "@votewise/prisma";

class PostService {
  async getPosts(userId: number, limit = 10, offset = 0) {
    // fetch all post where user_id = userId or type is PUBLIC also fetch numbers of upvotes and comments
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
        upvotes: {
          select: {
            user_id: true,
          },
        },
        comments: {
          select: {
            user_id: true,
          },
        },
      },
      take: limit,
      skip: offset,
      orderBy: {
        created_at: "desc",
      },
    });
    return posts;
  }

  async getPost(postId: number) {
    try {
      const post = await prisma.post.findUnique({
        where: {
          id: postId,
        },
      });
      return post;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      throw new Error(`Error while fetching post`);
    }
  }
}

export default new PostService();
