-- CreateTable
CREATE TABLE "Timeline" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Timeline_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Timeline_user_id_created_at_idx" ON "Timeline"("user_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "UserInterests_user_id_topic_id_key" ON "UserInterests"("user_id", "topic_id");

-- AddForeignKey
ALTER TABLE "Timeline" ADD CONSTRAINT "Timeline_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Timeline" ADD CONSTRAINT "Timeline_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
