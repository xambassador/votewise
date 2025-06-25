-- CreateIndex
CREATE INDEX "follower_following_index" ON "Follow"("follower_id", "following_id");
