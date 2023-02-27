-- AlterTable
ALTER TABLE "User" ADD COLUMN     "is_email_verify" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "last_login" TIMESTAMP(3);
