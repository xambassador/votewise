/*
  Warnings:

  - A unique constraint covering the columns `[user_id,group_id]` on the table `GroupInvitation` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "GroupInvitation_user_id_group_id_key" ON "GroupInvitation"("user_id", "group_id");
