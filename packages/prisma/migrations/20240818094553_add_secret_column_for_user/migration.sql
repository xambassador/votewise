/*
  Warnings:

  - You are about to drop the `BlacklistedToken` table. If the table is not empty, all the data it contains will be lost.
  - The required column `secret` was added to the `User` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropForeignKey
ALTER TABLE "BlacklistedToken" DROP CONSTRAINT "BlacklistedToken_user_id_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "secret" TEXT NOT NULL;

-- DropTable
DROP TABLE "BlacklistedToken";
