-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "category" TEXT,
ADD COLUMN     "duration" TEXT,
ADD COLUMN     "learningOutcomes" TEXT[],
ADD COLUMN     "level" TEXT;
