import { prisma } from "@votewise/prisma";

export default class BasePostService {
  async isPostExist(postId: number) {
    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
    });
    return post;
  }
}
