/*
  Warnings:

  - You are about to drop the column `coverImageUrl` on the `Group` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Group" DROP COLUMN "coverImageUrl",
ADD COLUMN     "cover_image_url" TEXT,
ADD COLUMN     "logo_url" TEXT;
