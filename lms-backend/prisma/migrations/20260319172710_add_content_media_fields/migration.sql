-- CreateEnum
CREATE TYPE "LessonProvider" AS ENUM ('local', 'cloudflare_stream', 'r2');

-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('uploading', 'processing', 'ready', 'failed');

-- AlterEnum
ALTER TYPE "LessonType" ADD VALUE 'pdf';

-- AlterTable
ALTER TABLE "Certificate" ADD COLUMN     "pdfData" BYTEA;

-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN     "description" TEXT,
ADD COLUMN     "learningOutcome" TEXT,
ADD COLUMN     "provider" "LessonProvider" NOT NULL DEFAULT 'local',
ADD COLUMN     "providerFileId" TEXT,
ADD COLUMN     "status" "ContentStatus" NOT NULL DEFAULT 'ready',
ADD COLUMN     "thumbnail" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "hashedRefreshToken" TEXT;
