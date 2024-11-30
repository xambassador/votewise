/*
  Warnings:

  - You are about to drop the column `is_2fa_enabled` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `totp_secret` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "FactorType" AS ENUM ('TOTP', 'PHONE', 'WEB_AUTHN');

-- CreateEnum
CREATE TYPE "FactorStatus" AS ENUM ('UNVERIFIED', 'VERIFIED');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "is_2fa_enabled",
DROP COLUMN "totp_secret",
ADD COLUMN     "banned_until" TIMESTAMP(3),
ADD COLUMN     "email_confirmation_sent_at" TIMESTAMP(3),
ADD COLUMN     "email_confirmed_at" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Factor" (
    "id" TEXT NOT NULL,
    "friendly_name" TEXT NOT NULL,
    "factor_type" "FactorType" NOT NULL,
    "status" "FactorStatus" NOT NULL,
    "secret" TEXT NOT NULL,
    "phone" TEXT,
    "last_challenged_at" TIMESTAMP(3),
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Factor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Challange" (
    "id" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "otp_code" TEXT,
    "factor_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verified_at" TIMESTAMP(3),

    CONSTRAINT "Challange_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "aal" TEXT NOT NULL DEFAULT 'aal1',
    "ip" TEXT NOT NULL,
    "user_agent" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "factor_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_id_index" ON "Factor"("user_id");

-- CreateIndex
CREATE INDEX "user_session_id_index" ON "Session"("user_id");

-- AddForeignKey
ALTER TABLE "Factor" ADD CONSTRAINT "Factor_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Challange" ADD CONSTRAINT "Challange_factor_id_fkey" FOREIGN KEY ("factor_id") REFERENCES "Factor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_factor_id_fkey" FOREIGN KEY ("factor_id") REFERENCES "Factor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
