/*
  Warnings:

  - You are about to drop the column `content` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `event_type` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `is_read` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the `GroupNotification` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `source_id` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `source_type` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "GroupNotification" DROP CONSTRAINT "GroupNotification_group_invitation_id_fkey";

-- DropForeignKey
ALTER TABLE "GroupNotification" DROP CONSTRAINT "GroupNotification_notification_id_fkey";

-- DropIndex
DROP INDEX "user_notification_index";

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "content",
DROP COLUMN "event_type",
DROP COLUMN "is_read",
ADD COLUMN     "creator_id" TEXT,
ADD COLUMN     "read_at" TIMESTAMP(3),
ADD COLUMN     "source_id" TEXT NOT NULL,
ADD COLUMN     "source_type" TEXT NOT NULL;

-- DropTable
DROP TABLE "GroupNotification";

-- DropEnum
DROP TYPE "NotificationType";

-- CreateIndex
CREATE INDEX "user_notifications_index" ON "Notification"("user_id", "read_at", "created_at" DESC);

-- CreateIndex
CREATE INDEX "notification_source_index" ON "Notification"("source_type", "source_id");

-- CreateIndex
CREATE INDEX "notification_creator_index" ON "Notification"("creator_id");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
