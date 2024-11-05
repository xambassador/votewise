-- AlterTable
ALTER TABLE "User" ADD COLUMN     "is_2fa_enabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "totp_secret" TEXT;
