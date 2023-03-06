/*
  Warnings:

  - You are about to drop the column `abount` on the `Group` table. All the data in the column will be lost.
  - Added the required column `about` to the `Group` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Group" DROP COLUMN "abount",
ADD COLUMN     "about" TEXT NOT NULL;
