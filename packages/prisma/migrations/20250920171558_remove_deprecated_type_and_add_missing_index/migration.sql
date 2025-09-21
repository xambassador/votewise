/*
  Warnings:

  - The values [JOIN_GROUP_REQUEST] on the enum `NotificationType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "NotificationType_new" AS ENUM ('PUBLIC_POST_UPVOTE', 'PUBLIC_POST_COMMENT_UPVOTE', 'PUBLIC_POST_COMMENT', 'START_FOLLOWING', 'FRIEND_REQUEST', 'FRIEND_REQUEST_ACCEPTED', 'GROUP_POST_UPVOTE', 'GROUP_POST_COMMENT_UPVOTE', 'GROUP_POST_COMMENT', 'GROUP_INVITATION', 'GROUP_INVITATION_ACCEPTED', 'GROUP_INVITATION_REJECTED', 'GROUP_JOINED', 'GROUP_JOIN_REQUEST', 'GROUP_JOIN_REQUEST_ACCEPTED', 'GROUP_JOIN_REQUEST_REJECTED');
ALTER TABLE "Notification" ALTER COLUMN "event_type" TYPE "NotificationType_new" USING ("event_type"::text::"NotificationType_new");
ALTER TYPE "NotificationType" RENAME TO "NotificationType_old";
ALTER TYPE "NotificationType_new" RENAME TO "NotificationType";
DROP TYPE "NotificationType_old";
COMMIT;

-- CreateIndex
CREATE INDEX "user_refresh_token_index" ON "RefreshToken"("user_id");

-- CreateIndex
CREATE INDEX "timeline_created_at_index" ON "Timeline"("created_at");

-- CreateIndex
CREATE INDEX "timeline_user_index" ON "Timeline"("user_id");
