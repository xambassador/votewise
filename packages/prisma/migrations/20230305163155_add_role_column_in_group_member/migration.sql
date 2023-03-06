-- CreateEnum
CREATE TYPE "GroupMemberRole" AS ENUM ('ADMIN', 'MODERATOR', 'MEMBER');

-- AlterTable
ALTER TABLE "GroupMember" ADD COLUMN     "role" "GroupMemberRole" NOT NULL DEFAULT 'MEMBER';
