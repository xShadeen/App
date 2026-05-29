-- DropIndex
DROP INDEX IF EXISTS "Lesson_googleEventId_key";

-- CreateIndex
CREATE UNIQUE INDEX "Lesson_googleEventId_studentId_key" ON "Lesson"("googleEventId", "studentId");
