/* eslint-disable no-console */

import type { Comment, Group, HashTag, Post, Topics, User } from "@prisma/client";

import { faker } from "@faker-js/faker";
import {
  FriendType,
  Gender,
  GroupInvitationStatus,
  GroupInvitationType,
  GroupStatus,
  GroupType,
  NotificationType,
  PostStatus
} from "@prisma/client";

import { prisma } from ".";

const args = process.argv.slice(2);

const shouldClean = args.includes("--clean");

async function resetDatabase() {
  console.log("🗑️  Clearing database...");
  await prisma.$queryRaw`TRUNCATE TABLE "User" CASCADE`;
  await prisma.$queryRaw`TRUNCATE TABLE "Topics" CASCADE`;
  await prisma.$queryRaw`TRUNCATE TABLE "HashTag" CASCADE`;
  await prisma.$queryRaw`TRUNCATE TABLE "Group" CASCADE`;
  await prisma.$queryRaw`TRUNCATE TABLE "GroupMember" CASCADE`;
  await prisma.$queryRaw`TRUNCATE TABLE "GroupInvitation" CASCADE`;
  await prisma.$queryRaw`TRUNCATE TABLE "Post" CASCADE`;
  await prisma.$queryRaw`TRUNCATE TABLE "PostHashTag" CASCADE`;
  await prisma.$queryRaw`TRUNCATE TABLE "PostAsset" CASCADE`;
  await prisma.$queryRaw`TRUNCATE TABLE "Comment" CASCADE`;
  await prisma.$queryRaw`TRUNCATE TABLE "CommentUpvote" CASCADE`;
  await prisma.$queryRaw`TRUNCATE TABLE "Upvote" CASCADE`;
  await prisma.$queryRaw`TRUNCATE TABLE "Follow" CASCADE`;
  await prisma.$queryRaw`TRUNCATE TABLE "Friend" CASCADE`;
  await prisma.$queryRaw`TRUNCATE TABLE "UserInterests" CASCADE`;
  await prisma.$queryRaw`TRUNCATE TABLE "Notification" CASCADE`;
  await prisma.$queryRaw`TRUNCATE TABLE "GroupMember" CASCADE`;
  await prisma.$queryRaw`TRUNCATE TABLE "GroupInvitation" CASCADE`;
  console.log("🗑️  Database cleared!");
}

async function main() {
  if (shouldClean) {
    await resetDatabase();
    process.exit();
  }

  console.log("✨ Seeding...");
  await resetDatabase();
  console.log("🌱 Seeding database...");

  const topics = await createTopics();
  const users = await createUsers();
  await createUserInterests(users, topics);
  await createFollows(users);
  await createFriends(users);
  const hashtags = await createHashtags();
  const groups = await createGroups();
  await addUsersToGroups(users, groups);
  await createGroupInvitations(users, groups);
  const posts = await createPosts(users, groups, hashtags, topics);
  const comments = await createComments(users, posts);
  await createUpvotes(users, posts);
  await createCommentUpvotes(users, posts, comments);
  await createNotifications(users);

  console.log("🌱 Seeding completed!");
  process.exit();
}

async function createTopics() {
  const topicNames = [
    "Technology",
    "Science",
    "Health",
    "Business",
    "Entertainment",
    "Sports",
    "Politics",
    "Education",
    "Art",
    "Food",
    "Travel",
    "Fashion",
    "Music",
    "Movies",
    "Books",
    "Gaming",
    "Photography",
    "DIY",
    "Fitness",
    "Environment"
  ];

  const topics: Topics[] = [];

  for (const name of topicNames) {
    const topic = await prisma.topics.create({
      data: {
        name
      }
    });
    topics.push(topic);
  }

  console.log("✅ Topics created!");
  return topics;
}

async function createUsers(count = 100) {
  const users: User[] = [];
  const genders = Object.values(Gender);
  const avatars = Array.from({ length: 50 }).map((_, index) => "avatars/avatar_" + (index + 1) + ".png");
  const backgrounds = Array.from({ length: 10 }).map((_, index) => "backgrounds/bg_" + (index + 1) + ".png");

  for (let i = 0; i < count; i++) {
    const firstName = faker.person.firstName().slice(0, 50);
    const lastName = faker.person.lastName().slice(0, 50);
    const userName = (
      faker.internet.userName({ firstName, lastName }).toLowerCase() +
      "_" +
      faker.number.int(999)
    ).slice(0, 20);

    const user = await prisma.user.create({
      data: {
        email: faker.internet.email({ firstName, lastName }).toLowerCase().trim(),
        user_name: userName,
        password: "$2a$12$WiBdk9VyfUbSb4Ys0ya9Y.3KwbEgDMjWaui9Bfs2pDlBiVdmF/r0u", // Password@123
        first_name: firstName,
        last_name: lastName,
        about: faker.lorem.paragraph().slice(0, 256),
        twitter_profile_url: faker.helpers.maybe(() => `https://twitter.com/${userName}`, { probability: 0.6 }),
        facebook_profile_url: faker.helpers.maybe(() => `https://facebook.com/${userName}`, { probability: 0.5 }),
        instagram_profile_url: faker.helpers.maybe(() => `https://instagram.com/${userName}`, { probability: 0.7 }),
        github_profile_url: faker.helpers.maybe(() => `https://github.com/${userName}`, { probability: 0.4 }),
        avatar_url: avatars[faker.number.int(avatars.length - 1)],
        cover_image_url: backgrounds[faker.number.int(backgrounds.length - 1)],
        location: faker.location.city() + ", " + faker.location.country(),
        gender: faker.helpers.arrayElement(genders),
        last_login: faker.date.recent(),
        is_onboarded: true,
        is_email_verify: faker.helpers.arrayElement([true, false]),
        email_confirmed_at: faker.helpers.maybe(() => faker.date.past(), { probability: 0.8 }),
        created_at: faker.date.past()
      }
    });

    users.push(user);
  }

  console.log(`✅ ${count} users created!`);
  return users;
}

async function createUserInterests(users: User[], topics: Topics[]) {
  for (const user of users) {
    const userTopics = faker.helpers.arrayElements(topics, { min: 3, max: 7 });

    for (const topic of userTopics) {
      await prisma.userInterests.create({
        data: {
          user_id: user.id,
          topic_id: topic.id
        }
      });
    }
  }

  console.log("✅ User interests created!");
}

async function createFollows(users: User[]) {
  for (const user of users) {
    const followCount = faker.number.int({ min: 5, max: 20 });
    const potentialFollowees = users.filter((u) => u.id !== user.id);
    const followees = faker.helpers.arrayElements(potentialFollowees, Math.min(followCount, potentialFollowees.length));

    for (const followee of followees) {
      await prisma.follow.create({
        data: {
          follower_id: user.id,
          following_id: followee.id
        }
      });
    }
  }

  console.log("✅ Follows created!");
}

async function createFriends(users: User[]) {
  const friendTypes = Object.values(FriendType);

  for (const user of users) {
    const friendCount = faker.number.int({ min: 3, max: 10 });
    const potentialFriends = users.filter((u) => u.id !== user.id);
    const friends = faker.helpers.arrayElements(potentialFriends, Math.min(friendCount, potentialFriends.length));

    for (const friend of friends) {
      const existingFriendship = await prisma.friend.findFirst({
        where: {
          OR: [
            { user_id: user.id, friend_id: friend.id },
            { user_id: friend.id, friend_id: user.id }
          ]
        }
      });

      if (!existingFriendship) {
        await prisma.friend.create({
          data: {
            type: faker.helpers.arrayElement(friendTypes),
            user_id: user.id,
            friend_id: friend.id
          }
        });
      }
    }
  }

  console.log("✅ Friendships created!");
}

async function createHashtags() {
  const hashtagNames = [
    "trending",
    "viral",
    "news",
    "tech",
    "innovation",
    "startup",
    "health",
    "wellness",
    "fitness",
    "food",
    "travel",
    "adventure",
    "photography",
    "art",
    "design",
    "music",
    "entertainment",
    "movies",
    "gaming",
    "sports",
    "nature",
    "environment",
    "climate",
    "science",
    "research",
    "education",
    "learning",
    "career",
    "business",
    "marketing",
    "socialmedia",
    "digital",
    "programming",
    "coding",
    "development",
    "motivation",
    "inspiration",
    "success",
    "leadership",
    "productivity"
  ];

  const hashtags: HashTag[] = [];

  for (const name of hashtagNames) {
    const hashtag = await prisma.hashTag.create({
      data: {
        name,
        count: faker.number.int({ min: 10, max: 1000 })
      }
    });
    hashtags.push(hashtag);
  }

  console.log("✅ Hashtags created!");

  return hashtags;
}

async function createGroups() {
  const groupTypes = Object.values(GroupType);
  const groupStatuses = Object.values(GroupStatus);
  const groups: Group[] = [];

  for (let i = 0; i < 20; i++) {
    const name = faker.company.name().slice(0, 21);
    const group = await prisma.group.create({
      data: {
        name,
        about: faker.lorem.paragraphs(2).slice(0, 500),
        type: faker.helpers.arrayElement(groupTypes),
        status: faker.helpers.arrayElement(groupStatuses)
      }
    });
    groups.push(group);
  }

  console.log("✅ Groups created!");
  return groups;
}

async function addUsersToGroups(users: User[], groups: Group[]) {
  for (const group of groups) {
    // Select a random user as admin
    const adminUser = faker.helpers.arrayElement(users);
    await prisma.groupMember.create({
      data: {
        role: "ADMIN",
        user_id: adminUser.id,
        group_id: group.id
      }
    });

    const moderatorCount = faker.number.int({ min: 2, max: 5 });
    const potentialModerators = users.filter((u) => u.id !== adminUser.id);
    const moderators = faker.helpers.arrayElements(potentialModerators, moderatorCount);

    for (const moderator of moderators) {
      await prisma.groupMember.create({
        data: {
          role: "MODERATOR",
          user_id: moderator.id,
          group_id: group.id
        }
      });
    }

    const memberCount = faker.number.int({ min: 10, max: 50 });
    const existingUserIds = [adminUser.id, ...moderators.map((m) => m.id)];
    const potentialMembers = users.filter((u) => !existingUserIds.includes(u.id));
    const members = faker.helpers.arrayElements(potentialMembers, Math.min(memberCount, potentialMembers.length));

    for (const member of members) {
      await prisma.groupMember.create({
        data: {
          role: "MEMBER",
          user_id: member.id,
          group_id: group.id,
          blocked: faker.helpers.maybe(() => true, { probability: 0.05 })
        }
      });
    }
  }

  console.log("✅ Users added to groups!");
}

async function createGroupInvitations(users: User[], groups: Group[]) {
  const invitationTypes = Object.values(GroupInvitationType);
  const statuses = Object.values(GroupInvitationStatus);

  for (const group of groups) {
    // Find users who are not members of this group
    const groupMembers = await prisma.groupMember.findMany({
      where: { group_id: group.id },
      select: { user_id: true }
    });

    const memberUserIds = groupMembers.map((m) => m.user_id);
    const nonMembers = users.filter((u) => !memberUserIds.includes(u.id));

    const invitationCount = faker.number.int({ min: 5, max: 15 });
    const invitedUsers = faker.helpers.arrayElements(nonMembers, Math.min(invitationCount, nonMembers.length));

    for (const user of invitedUsers) {
      const isAlreadyInvited = await prisma.groupInvitation.findFirst({
        where: { group_id: group.id, user_id: user.id }
      });
      if (isAlreadyInvited) continue;
      await prisma.groupInvitation.create({
        data: {
          type: faker.helpers.arrayElement(invitationTypes),
          status: faker.helpers.arrayElement(statuses),
          sent_at: faker.date.recent(),
          group_id: group.id,
          user_id: user.id
        }
      });
    }
  }

  console.log("✅ Group invitations created!");
}

async function createPosts(users: User[], groups: Group[], hashtags: HashTag[], topics: Topics[]) {
  const postStatuses = Object.values(PostStatus);
  const posts: Post[] = [];

  for (const topic of topics) {
    for (let i = 0; i < 20; i++) {
      const user = faker.helpers.arrayElement(users);
      const isGroupPost = faker.datatype.boolean();
      let group: Group | null | undefined = null;

      if (isGroupPost) {
        // Find groups this user is a member of
        const userGroups = await prisma.groupMember.findMany({
          where: { user_id: user.id },
          select: { group_id: true }
        });

        if (userGroups.length > 0) {
          const randomGroupId = faker.helpers.arrayElement(userGroups).group_id;
          group = groups.find((g) => g.id === randomGroupId);
        }
      }

      const title = faker.lorem.sentence().slice(0, 50);
      const slug =
        title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "") +
        "-" +
        faker.string.alphanumeric(8);

      const post = await prisma.post.create({
        data: {
          title,
          content: faker.lorem.paragraphs({ min: 2, max: 5 }).slice(0, 300),
          slug,
          type: group ? "GROUP_ONLY" : "PUBLIC",
          status: faker.helpers.arrayElement(postStatuses),
          group_id: group?.id || null,
          author_id: user.id,
          created_at: faker.date.past()
        }
      });

      await prisma.postTopic.create({
        data: {
          post_id: post.id,
          topic_id: topic.id
        }
      });

      posts.push(post);

      // Add 1-3 hashtags to each post
      const postHashtagCount = faker.number.int({ min: 1, max: 3 });
      const postHashtags = faker.helpers.arrayElements(hashtags, postHashtagCount);

      for (const hashtag of postHashtags) {
        await prisma.postHashTag.create({
          data: {
            post_id: post.id,
            hash_tag_id: hashtag.id
          }
        });
      }

      // Add 0-3 assets to each post
      const assetCount = faker.number.int({ min: 0, max: 3 });

      for (let j = 0; j < assetCount; j++) {
        const url = faker.image.url();
        await prisma.postAsset.create({
          data: {
            type: "image",
            url,
            post_id: post.id
          }
        });
      }
    }
  }

  console.log("✅ Posts created!");
  return posts;
}

async function createComments(users: User[], posts: Post[]) {
  const comments: Comment[] = [];

  for (const post of posts) {
    const commentCount = faker.number.int({ min: 0, max: 10 });

    for (let i = 0; i < commentCount; i++) {
      const user = faker.helpers.arrayElement(users);

      const comment = await prisma.comment.create({
        data: {
          text: faker.lorem.paragraph(),
          parent_id: null, // For simplicity, not creating nested comments
          post_id: post.id,
          user_id: user.id,
          created_at: faker.date.recent()
        }
      });

      comments.push(comment);
    }
  }

  console.log("✅ Comments created!");
  return comments;
}

async function createUpvotes(users: User[], posts: Post[]) {
  for (const post of posts) {
    const upvoteCount = faker.number.int({ min: 0, max: 20 });
    const upvoters = faker.helpers.arrayElements(users, upvoteCount);

    for (const user of upvoters) {
      await prisma.upvote.create({
        data: {
          post_id: post.id,
          user_id: user.id
        }
      });
    }
  }

  console.log("✅ Post upvotes created!");
}

async function createCommentUpvotes(users: User[], posts: Post[], comments: Comment[]) {
  for (const comment of comments) {
    const upvoteCount = faker.number.int({ min: 0, max: 5 });
    const upvoters = faker.helpers.arrayElements(users, upvoteCount);
    const post = posts.find((p) => p.id === comment.post_id);
    if (!post) continue;

    for (const user of upvoters) {
      await prisma.commentUpvote.create({
        data: {
          comment_id: comment.id,
          post_id: post.id,
          user_id: user.id
        }
      });
    }
  }

  console.log("✅ Comment upvotes created!");
}

async function createNotifications(users: User[]) {
  const notificationTypes = Object.values(NotificationType);

  for (let i = 0; i < 300; i++) {
    const user = faker.helpers.arrayElement(users);

    await prisma.notification.create({
      data: {
        event_type: faker.helpers.arrayElement(notificationTypes),
        event_id: faker.number.int({ min: 1, max: 1000 }),
        is_read: faker.helpers.maybe(() => true, { probability: 0.4 }),
        user_id: user.id,
        created_at: faker.date.recent()
      }
    });
  }

  console.log("✅ Notifications created!");
}

main();
