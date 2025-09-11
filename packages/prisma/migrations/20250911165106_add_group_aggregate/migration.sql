-- CreateTable
CREATE TABLE "GroupAggregates" (
    "total_posts" INTEGER NOT NULL DEFAULT 0,
    "total_members" INTEGER NOT NULL DEFAULT 0,
    "total_comments" INTEGER NOT NULL DEFAULT 0,
    "total_votes" INTEGER NOT NULL DEFAULT 0,
    "group_id" TEXT NOT NULL,

    CONSTRAINT "GroupAggregates_pkey" PRIMARY KEY ("group_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GroupAggregates_group_id_key" ON "GroupAggregates"("group_id");

-- AddForeignKey
ALTER TABLE "GroupAggregates" ADD CONSTRAINT "GroupAggregates_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;
