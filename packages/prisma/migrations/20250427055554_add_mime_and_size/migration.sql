-- AlterTable
ALTER TABLE "Post" ALTER COLUMN "type" SET DEFAULT 'PUBLIC',
ALTER COLUMN "status" SET DEFAULT 'OPEN';

-- AlterTable
ALTER TABLE "PostAsset" ADD COLUMN     "mime_type" TEXT,
ADD COLUMN     "size" INTEGER;
