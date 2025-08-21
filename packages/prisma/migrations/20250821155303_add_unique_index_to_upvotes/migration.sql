/*
  Warnings:

  - The primary key for the `Upvote` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Upvote` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[post_id,user_id]` on the table `Upvote` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Upvote" DROP CONSTRAINT "Upvote_pkey",
DROP COLUMN "id";

-- CreateIndex
CREATE UNIQUE INDEX "Upvote_post_id_user_id_key" ON "Upvote"("post_id", "user_id");
