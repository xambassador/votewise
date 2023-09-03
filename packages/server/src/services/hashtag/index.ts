import { prisma } from "@votewise/prisma";

class HashTagService {
  parseHashTags(content: string) {
    const s = content.split(" ");
    const set = new Set<string>();
    // To avoid duplicates and links
    s.forEach((word) => {
      if (word.startsWith("#")) {
        const tranformedWord = word.substring(1).toLowerCase();
        const hashtag = tranformedWord.trim();
        set.add(hashtag);
      }
    });
    return set;
  }

  async addHashtags(postId: number, content: string) {
    const hashtags = Array.from(this.parseHashTags(content)).map((hashtag) => ({
      name: hashtag,
    }));

    if (hashtags.length === 0) return Promise.resolve();

    const promises = hashtags.map((hashtag) => {
      const tag = prisma.hashTag.upsert({
        where: { name: hashtag.name },
        create: { name: hashtag.name, count: 1 },
        update: { count: { increment: 1 } },
        select: { id: true, name: true },
      });
      return tag;
    });
    const newTags = await prisma.$transaction(promises);

    const isPostExist = await prisma.postHashTag.findFirst({
      where: {
        post_id: postId,
      },
    });

    if (isPostExist) {
      const postTags = await prisma.post.update({
        where: {
          id: postId,
        },
        data: {
          post_hash_tags: {
            deleteMany: {},
            create: newTags.map((tag) => ({ hash_tag_id: tag.id })),
          },
        },
      });

      return postTags;
    }

    const postTags = await prisma.post.update({
      where: {
        id: postId,
      },
      data: {
        post_hash_tags: {
          create: newTags.map((tag) => ({ hash_tag_id: tag.id })),
        },
      },
    });

    return postTags;
  }
}

const hashtagService = new HashTagService();
export default hashtagService;
