-- CreateTable
CREATE TABLE "GroupNotification" (
    "group_invitation_id" TEXT NOT NULL,
    "notification_id" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "GroupNotification_group_invitation_id_key" ON "GroupNotification"("group_invitation_id");

-- CreateIndex
CREATE UNIQUE INDEX "GroupNotification_notification_id_key" ON "GroupNotification"("notification_id");

-- AddForeignKey
ALTER TABLE "GroupNotification" ADD CONSTRAINT "GroupNotification_group_invitation_id_fkey" FOREIGN KEY ("group_invitation_id") REFERENCES "GroupInvitation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupNotification" ADD CONSTRAINT "GroupNotification_notification_id_fkey" FOREIGN KEY ("notification_id") REFERENCES "Notification"("id") ON DELETE CASCADE ON UPDATE CASCADE;
