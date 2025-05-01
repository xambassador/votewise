/*
  Warnings:

  - The primary key for the `PostTopic` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `PostTopic` table. All the data in the column will be lost.
  - The primary key for the `Timeline` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Timeline` table. All the data in the column will be lost.
  - The primary key for the `UserInterests` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `created_at` on the `UserInterests` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `UserInterests` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `UserInterests` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_id,post_id]` on the table `Timeline` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Timeline_user_id_created_at_idx";

-- AlterTable
ALTER TABLE "PostTopic" DROP CONSTRAINT "PostTopic_pkey",
DROP COLUMN "id";

-- AlterTable
ALTER TABLE "Timeline" DROP CONSTRAINT "Timeline_pkey",
DROP COLUMN "id";

-- AlterTable
ALTER TABLE "Topics" ALTER COLUMN "is_system_topic" SET DEFAULT true;

-- AlterTable
ALTER TABLE "UserInterests" DROP CONSTRAINT "UserInterests_pkey",
DROP COLUMN "created_at",
DROP COLUMN "id",
DROP COLUMN "updated_at";

-- CreateIndex
CREATE UNIQUE INDEX "Timeline_user_id_post_id_key" ON "Timeline"("user_id", "post_id");
