-- AlterTable
ALTER TABLE "Topics" ADD COLUMN     "is_system_topic" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "PostTopic" (
    "id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "topic_id" TEXT NOT NULL,

    CONSTRAINT "PostTopic_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PostTopic_post_id_topic_id_key" ON "PostTopic"("post_id", "topic_id");

-- AddForeignKey
ALTER TABLE "PostTopic" ADD CONSTRAINT "PostTopic_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostTopic" ADD CONSTRAINT "PostTopic_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "Topics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
