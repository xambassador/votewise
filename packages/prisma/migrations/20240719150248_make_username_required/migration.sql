/*
  Warnings:

  - The primary key for the `BlacklistedToken` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Comment` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `CommentUpvote` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Follow` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Friend` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Group` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `GroupInvitation` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `GroupMember` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `HashTag` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Notification` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Post` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `PostAsset` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `PostHashTag` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `RefreshToken` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Upvote` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `cover_image` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `facebook` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `instagram` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `onboarded` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `profile_image` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `twitter` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_name]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `first_name` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `last_name` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_name` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "BlacklistedToken" DROP CONSTRAINT "BlacklistedToken_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_post_id_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_user_id_fkey";

-- DropForeignKey
ALTER TABLE "CommentUpvote" DROP CONSTRAINT "CommentUpvote_comment_id_fkey";

-- DropForeignKey
ALTER TABLE "CommentUpvote" DROP CONSTRAINT "CommentUpvote_post_id_fkey";

-- DropForeignKey
ALTER TABLE "CommentUpvote" DROP CONSTRAINT "CommentUpvote_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Follow" DROP CONSTRAINT "Follow_follower_id_fkey";

-- DropForeignKey
ALTER TABLE "Follow" DROP CONSTRAINT "Follow_following_id_fkey";

-- DropForeignKey
ALTER TABLE "Friend" DROP CONSTRAINT "Friend_friend_id_fkey";

-- DropForeignKey
ALTER TABLE "Friend" DROP CONSTRAINT "Friend_user_id_fkey";

-- DropForeignKey
ALTER TABLE "GroupInvitation" DROP CONSTRAINT "GroupInvitation_group_id_fkey";

-- DropForeignKey
ALTER TABLE "GroupInvitation" DROP CONSTRAINT "GroupInvitation_user_id_fkey";

-- DropForeignKey
ALTER TABLE "GroupMember" DROP CONSTRAINT "GroupMember_group_id_fkey";

-- DropForeignKey
ALTER TABLE "GroupMember" DROP CONSTRAINT "GroupMember_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_author_id_fkey";

-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_group_id_fkey";

-- DropForeignKey
ALTER TABLE "PostAsset" DROP CONSTRAINT "PostAsset_post_id_fkey";

-- DropForeignKey
ALTER TABLE "PostHashTag" DROP CONSTRAINT "PostHashTag_hash_tag_id_fkey";

-- DropForeignKey
ALTER TABLE "PostHashTag" DROP CONSTRAINT "PostHashTag_post_id_fkey";

-- DropForeignKey
ALTER TABLE "RefreshToken" DROP CONSTRAINT "RefreshToken_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Upvote" DROP CONSTRAINT "Upvote_post_id_fkey";

-- DropForeignKey
ALTER TABLE "Upvote" DROP CONSTRAINT "Upvote_user_id_fkey";

-- DropIndex
DROP INDEX "User_username_key";

-- AlterTable
ALTER TABLE "BlacklistedToken" DROP CONSTRAINT "BlacklistedToken_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "BlacklistedToken_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "BlacklistedToken_id_seq";

-- AlterTable
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "post_id" SET DATA TYPE TEXT,
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Comment_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Comment_id_seq";

-- AlterTable
ALTER TABLE "CommentUpvote" DROP CONSTRAINT "CommentUpvote_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "comment_id" SET DATA TYPE TEXT,
ALTER COLUMN "post_id" SET DATA TYPE TEXT,
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "CommentUpvote_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "CommentUpvote_id_seq";

-- AlterTable
ALTER TABLE "Follow" DROP CONSTRAINT "Follow_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "follower_id" SET DATA TYPE TEXT,
ALTER COLUMN "following_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Follow_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Follow_id_seq";

-- AlterTable
ALTER TABLE "Friend" DROP CONSTRAINT "Friend_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ALTER COLUMN "friend_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Friend_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Friend_id_seq";

-- AlterTable
ALTER TABLE "Group" DROP CONSTRAINT "Group_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Group_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Group_id_seq";

-- AlterTable
ALTER TABLE "GroupInvitation" DROP CONSTRAINT "GroupInvitation_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "group_id" SET DATA TYPE TEXT,
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "GroupInvitation_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "GroupInvitation_id_seq";

-- AlterTable
ALTER TABLE "GroupMember" DROP CONSTRAINT "GroupMember_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ALTER COLUMN "group_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "GroupMember_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "GroupMember_id_seq";

-- AlterTable
ALTER TABLE "HashTag" DROP CONSTRAINT "HashTag_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "HashTag_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "HashTag_id_seq";

-- AlterTable
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Notification_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Notification_id_seq";

-- AlterTable
ALTER TABLE "Post" DROP CONSTRAINT "Post_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "author_id" SET DATA TYPE TEXT,
ALTER COLUMN "group_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Post_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Post_id_seq";

-- AlterTable
ALTER TABLE "PostAsset" DROP CONSTRAINT "PostAsset_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "post_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "PostAsset_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "PostAsset_id_seq";

-- AlterTable
ALTER TABLE "PostHashTag" DROP CONSTRAINT "PostHashTag_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "post_id" SET DATA TYPE TEXT,
ALTER COLUMN "hash_tag_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "PostHashTag_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "PostHashTag_id_seq";

-- AlterTable
ALTER TABLE "RefreshToken" DROP CONSTRAINT "RefreshToken_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "RefreshToken_id_seq";

-- AlterTable
ALTER TABLE "Upvote" DROP CONSTRAINT "Upvote_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "post_id" SET DATA TYPE TEXT,
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Upvote_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Upvote_id_seq";

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "cover_image",
DROP COLUMN "facebook",
DROP COLUMN "instagram",
DROP COLUMN "name",
DROP COLUMN "onboarded",
DROP COLUMN "profile_image",
DROP COLUMN "twitter",
DROP COLUMN "username",
ADD COLUMN     "avatar_url" TEXT,
ADD COLUMN     "cover_image_url" TEXT,
ADD COLUMN     "facebook_profile_url" TEXT,
ADD COLUMN     "first_name" TEXT NOT NULL,
ADD COLUMN     "github_profile_url" TEXT,
ADD COLUMN     "instagram_profile_url" TEXT,
ADD COLUMN     "is_onboarded" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "last_name" TEXT NOT NULL,
ADD COLUMN     "twitter_profile_url" TEXT,
ADD COLUMN     "user_name" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "User_id_seq";

-- CreateIndex
CREATE UNIQUE INDEX "User_user_name_key" ON "User"("user_name");

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "Group"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostAsset" ADD CONSTRAINT "PostAsset_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Upvote" ADD CONSTRAINT "Upvote_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Upvote" ADD CONSTRAINT "Upvote_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentUpvote" ADD CONSTRAINT "CommentUpvote_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "Comment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentUpvote" ADD CONSTRAINT "CommentUpvote_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentUpvote" ADD CONSTRAINT "CommentUpvote_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostHashTag" ADD CONSTRAINT "PostHashTag_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostHashTag" ADD CONSTRAINT "PostHashTag_hash_tag_id_fkey" FOREIGN KEY ("hash_tag_id") REFERENCES "HashTag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_follower_id_fkey" FOREIGN KEY ("follower_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_following_id_fkey" FOREIGN KEY ("following_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friend" ADD CONSTRAINT "Friend_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friend" ADD CONSTRAINT "Friend_friend_id_fkey" FOREIGN KEY ("friend_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMember" ADD CONSTRAINT "GroupMember_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMember" ADD CONSTRAINT "GroupMember_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupInvitation" ADD CONSTRAINT "GroupInvitation_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupInvitation" ADD CONSTRAINT "GroupInvitation_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlacklistedToken" ADD CONSTRAINT "BlacklistedToken_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
