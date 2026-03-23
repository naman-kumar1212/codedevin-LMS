/*
  Warnings:

  - A unique constraint covering the columns `[moduleId]` on the table `Quiz` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Quiz" ADD COLUMN     "moduleId" TEXT,
ALTER COLUMN "lessonId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Quiz_moduleId_key" ON "Quiz"("moduleId");

-- AddForeignKey
ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE CASCADE ON UPDATE CASCADE;
