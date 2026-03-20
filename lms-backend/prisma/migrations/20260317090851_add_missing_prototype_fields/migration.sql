/*
  Warnings:

  - The values [DRAFT,PUBLISHED,ARCHIVED] on the enum `CourseStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [VIDEO,RECORDING,RESOURCE] on the enum `LessonType` will be removed. If these variants are still used in the database, this will fail.
  - The values [USER,AUTHOR,ADMIN] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `authorId` on the `Course` table. All the data in the column will be lost.
  - You are about to alter the column `price` on the `Course` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to drop the column `order` on the `Lesson` table. All the data in the column will be lost.
  - You are about to drop the column `completed` on the `LessonProgress` table. All the data in the column will be lost.
  - You are about to drop the column `watchedPercentage` on the `LessonProgress` table. All the data in the column will be lost.
  - You are about to drop the column `order` on the `Module` table. All the data in the column will be lost.
  - You are about to alter the column `amount` on the `Payment` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `passingScore` on the `Quiz` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to drop the column `attemptNumber` on the `QuizAttempt` table. All the data in the column will be lost.
  - You are about to drop the column `passed` on the `QuizAttempt` table. All the data in the column will be lost.
  - You are about to alter the column `score` on the `QuizAttempt` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to drop the column `text` on the `QuizOption` table. All the data in the column will be lost.
  - You are about to drop the column `question` on the `QuizQuestion` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `QuizQuestion` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[lessonId]` on the table `Quiz` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `createdBy` to the `Course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `optionText` to the `QuizOption` table without a default value. This is not possible if the table is not empty.
  - Added the required column `questionText` to the `QuizQuestion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "CourseStatus_new" AS ENUM ('draft', 'published', 'archived');
ALTER TABLE "Course" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Course" ALTER COLUMN "status" TYPE "CourseStatus_new" USING ("status"::text::"CourseStatus_new");
ALTER TYPE "CourseStatus" RENAME TO "CourseStatus_old";
ALTER TYPE "CourseStatus_new" RENAME TO "CourseStatus";
DROP TYPE "CourseStatus_old";
ALTER TABLE "Course" ALTER COLUMN "status" SET DEFAULT 'draft';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "LessonType_new" AS ENUM ('video', 'recording', 'resource');
ALTER TABLE "Lesson" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "Lesson" ALTER COLUMN "type" TYPE "LessonType_new" USING ("type"::text::"LessonType_new");
ALTER TYPE "LessonType" RENAME TO "LessonType_old";
ALTER TYPE "LessonType_new" RENAME TO "LessonType";
DROP TYPE "LessonType_old";
ALTER TABLE "Lesson" ALTER COLUMN "type" SET DEFAULT 'video';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('student', 'admin', 'author');
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "Role_old";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'student';
COMMIT;

-- DropForeignKey
ALTER TABLE "Course" DROP CONSTRAINT "Course_authorId_fkey";

-- AlterTable
ALTER TABLE "Course" DROP COLUMN "authorId",
ADD COLUMN     "createdBy" TEXT NOT NULL,
ALTER COLUMN "price" SET DEFAULT 0,
ALTER COLUMN "price" SET DATA TYPE INTEGER,
ALTER COLUMN "status" SET DEFAULT 'draft';

-- AlterTable
ALTER TABLE "Lesson" DROP COLUMN "order",
ADD COLUMN     "durationSeconds" INTEGER,
ADD COLUMN     "orderIndex" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "type" SET DEFAULT 'video';

-- AlterTable
ALTER TABLE "LessonProgress" DROP COLUMN "completed",
DROP COLUMN "watchedPercentage",
ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "isCompleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "LiveClass" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "durationMinutes" INTEGER NOT NULL DEFAULT 60,
ADD COLUMN     "recordingUrl" TEXT;

-- AlterTable
ALTER TABLE "Module" DROP COLUMN "order",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "orderIndex" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Payment" ALTER COLUMN "amount" SET DATA TYPE INTEGER,
ALTER COLUMN "status" SET DEFAULT 'pending';

-- AlterTable
ALTER TABLE "Quiz" ALTER COLUMN "passingScore" SET DEFAULT 80,
ALTER COLUMN "passingScore" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "QuizAttempt" DROP COLUMN "attemptNumber",
DROP COLUMN "passed",
ADD COLUMN     "attemptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isPassed" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "score" SET DEFAULT 0,
ALTER COLUMN "score" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "QuizOption" DROP COLUMN "text",
ADD COLUMN     "optionText" TEXT NOT NULL,
ADD COLUMN     "orderIndex" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "QuizQuestion" DROP COLUMN "question",
DROP COLUMN "type",
ADD COLUMN     "orderIndex" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "questionText" TEXT NOT NULL,
ADD COLUMN     "questionType" TEXT NOT NULL DEFAULT 'mcq';

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'student';

-- CreateIndex
CREATE UNIQUE INDEX "Quiz_lessonId_key" ON "Quiz"("lessonId");

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
