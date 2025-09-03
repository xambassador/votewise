-- CreateTable
CREATE TABLE "PostAggregates" (
    "votes" INTEGER NOT NULL DEFAULT 0,
    "comments" INTEGER NOT NULL DEFAULT 0,
    "views" INTEGER NOT NULL DEFAULT 0,
    "shares" INTEGER NOT NULL DEFAULT 0,
    "post_id" TEXT NOT NULL,

    CONSTRAINT "PostAggregates_pkey" PRIMARY KEY ("post_id")
);

-- CreateTable
CREATE TABLE "UserAggregates" (
    "total_posts" INTEGER NOT NULL DEFAULT 0,
    "total_votes" INTEGER NOT NULL DEFAULT 0,
    "total_comments" INTEGER NOT NULL DEFAULT 0,
    "total_followers" INTEGER NOT NULL DEFAULT 0,
    "total_following" INTEGER NOT NULL DEFAULT 0,
    "total_groups" INTEGER NOT NULL DEFAULT 0,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "UserAggregates_pkey" PRIMARY KEY ("user_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PostAggregates_post_id_key" ON "PostAggregates"("post_id");

-- CreateIndex
CREATE UNIQUE INDEX "UserAggregates_user_id_key" ON "UserAggregates"("user_id");

-- CreateIndex
CREATE INDEX "post_author_index" ON "Post"("author_id");

-- CreateIndex
CREATE INDEX "post_group_index" ON "Post"("group_id");

-- AddForeignKey
ALTER TABLE "PostAggregates" ADD CONSTRAINT "PostAggregates_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAggregates" ADD CONSTRAINT "UserAggregates_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
