/*
  Warnings:

  - A unique constraint covering the columns `[googleEventId]` on the table `Lesson` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `googleEventId` to the `Lesson` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN     "googleEventId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Lesson_googleEventId_key" ON "Lesson"("googleEventId");
