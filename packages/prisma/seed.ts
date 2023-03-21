/* eslint-disable no-restricted-syntax */

/* eslint-disable no-await-in-loop */

/* eslint-disable no-console */
import { faker } from "@faker-js/faker";
import type { Comment, Post, User } from "@prisma/client";
import { PrismaClient } from "@prisma/client";
import chalk from "chalk";
import ora from "ora";
import slugify from "slugify";

const prisma = new PrismaClient();

const NUM_USERS = 10;
const POSTS_PER_USER = 5;
const COMMENTS_PER_POST = 5;
const FOLLOWING_PER_USER = 5;
const FRIENDS_PER_USER = 5;

const spinner = ora();

function createUser() {
  const email = faker.internet.email();
  const user: Partial<User> = {
    name: faker.name.firstName(),
    about: faker.lorem.paragraph(),
    cover_image: faker.image.imageUrl(),
    profile_image: faker.image.avatar(),
    email,
    password: email,
    created_at: faker.date.past(),
    updated_at: faker.date.past(),
    facebook: `https://facebook.com/${faker.internet.userName()}`,
    gender: ["MALE", "FEMALE"][Math.floor(Math.random() * 2)] as "MALE" | "FEMALE" | "OTHER",
    instagram: `https://instagram.com/${faker.internet.userName()}`,
    is_email_verify: faker.datatype.boolean(),
    last_login: faker.date.past(),
    location: faker.address.country(),
    twitter: `https://twitter.com/${faker.internet.userName()}`,
    onboarded: faker.datatype.boolean(),
    username: faker.internet.userName(),
  };
  return user;
}

function createPost() {
  const posts: Partial<Post>[] = Array(POSTS_PER_USER)
    .fill({} as Post)
    .map(() => {
      const title = faker.lorem.sentence();
      const slug = slugify(title, { lower: true });
      return {
        title,
        slug,
        content: faker.lorem.paragraphs(),
        created_at: faker.date.past(),
        updated_at: faker.date.past(),
        status: ["OPEN", "CLOSED", "ARCHIVED", "INPROGRESS"][Math.floor(Math.random() * 4)] as
          | "OPEN"
          | "CLOSED"
          | "ARCHIVED"
          | "INPROGRESS",
        type: ["PUBLIC"][0] as "PUBLIC" | "GROUP_ONLY",
      };
    });

  return posts;
}

function createCommentOnPost() {
  const comments: Partial<Comment>[] = Array(COMMENTS_PER_POST)
    .fill({} as Comment)
    .map(() => {
      return {
        text: faker.lorem.sentence(),
      };
    });
  return comments;
}

async function main() {
  console.log(chalk.blue("🤠 Seeding database..."));
  spinner.start(chalk.blue("🧟‍♀️ Deleting all data..."));
  await prisma.postHashTag.deleteMany();
  await prisma.hashTag.deleteMany();
  await prisma.friend.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.upvote.deleteMany();
  await prisma.commentUpvote.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.postAsset.deleteMany();
  await prisma.post.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
  spinner.succeed(chalk.blue("✨✨ Deleted all data... ✨✨"));

  spinner.start(chalk.blue("👦👩 Creating users..."));
  const users = Array(NUM_USERS)
    .fill({} as User)
    .map(() => createUser());
  await prisma.user.createMany({
    data: users as User[],
  });
  spinner.succeed(chalk.blue("👯‍♀️ Users created..."));

  spinner.start(chalk.blue("📝 Creating posts..."));
  const createdUsersId = await prisma.user.findMany({
    select: {
      id: true,
    },
  });

  for (const user of createdUsersId) {
    const postForUser = createPost();

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        posts: {
          createMany: {
            data: postForUser as Post[],
          },
        },
      },
    });
  }
  spinner.succeed(chalk.blue("📝 Posts created..."));

  spinner.start(chalk.blue("🐶 Creating comments..."));
  const createdPosts = await prisma.post.findMany({
    select: {
      id: true,
      author_id: true,
    },
  });

  for (const post of createdPosts) {
    const notCurrentUsersPosts = createdPosts.filter((p) => p.author_id !== post.author_id);
    // current user commenting on other users posts
    const currentUserId = post.author_id;
    for (const comment of createCommentOnPost()) {
      const randomPost = notCurrentUsersPosts[Math.floor(Math.random() * notCurrentUsersPosts.length)];
      await prisma.post.update({
        where: {
          id: randomPost.id,
        },
        data: {
          comments: {
            create: {
              text: comment.text as string,
              user_id: currentUserId as number,
            },
          },
          upvotes: {
            create: {
              user_id: currentUserId as number,
            },
          },
        },
      });
    }
  }
  spinner.succeed(chalk.blue("🐶 Comments created..."));

  spinner.start(chalk.blue("👯‍♀️ Creating followers and following..."));
  for (const user of createdUsersId) {
    const otherUsers = createdUsersId.filter((u) => u.id !== user.id);
    const suffledUsers = otherUsers.sort(() => Math.random() - 0.5);
    const following = suffledUsers.slice(0, FOLLOWING_PER_USER);
    const currentUserId = user.id;
    for (const follow of following) {
      await prisma.follow.create({
        data: {
          follower_id: follow.id,
          following_id: currentUserId,
        },
      });
    }
  }
  spinner.succeed(chalk.blue("👯‍♀️ Followers and following created..."));

  spinner.start(chalk.blue("👯‍♀️ Creating friends..."));
  for (const user of createdUsersId) {
    const otherUsers = createdUsersId.filter((u) => u.id !== user.id);
    const currentUserId = user.id;
    const suffledUsers = otherUsers.sort(() => Math.random() - 0.5);
    const friends = suffledUsers.slice(0, FRIENDS_PER_USER);
    for (const friend of friends) {
      await prisma.friend.create({
        data: {
          user_id: currentUserId,
          friend_id: friend.id,
          type: "FRIENDS",
        },
      });
    }
  }
  spinner.succeed(chalk.blue("👯‍♀️ Friends created..."));
}

main()
  .then(() => {
    console.log("Done");
    prisma.$disconnect();
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    spinner.fail();
    spinner.stop();
    prisma.$disconnect();
    process.exit(1);
  });
