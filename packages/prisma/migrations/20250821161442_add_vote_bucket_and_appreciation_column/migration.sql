-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "appreciated" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "last_bucket_reset_at" TIMESTAMP(3),
ADD COLUMN     "vote_bucket" INTEGER NOT NULL DEFAULT 10;

-- CreateIndex
CREATE INDEX "Comment_user_id_idx" ON "Comment"("user_id");
