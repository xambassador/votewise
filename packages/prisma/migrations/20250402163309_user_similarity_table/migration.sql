-- CreateTable
CREATE TABLE "UserSimilarity" (
    "user_id_1" TEXT NOT NULL,
    "user_id_2" TEXT NOT NULL,
    "similarity" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "UserSimilarity_pkey" PRIMARY KEY ("user_id_1","user_id_2")
);
