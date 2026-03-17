import { prisma } from "../../prisma";

export const lessonsService = {
  getByStudentId: async (studentId: number, year: number, month: number) => {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);

    const lessons = await prisma.lesson.findMany({
      where: {
        studentId,
        date: {
          gte: start,
          lt: end,
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    return lessons;
  },

  markAsPaid: async (lessonId: number) => {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
    });

    if (!lesson) {
      throw new Error("Lesson not found");
    }

    return prisma.lesson.update({
      where: { id: lessonId },
      data: {
        paid: true,
      },
    });
  },
  updateNotes: async (lessonId: number, notes: string) => {
    return prisma.lesson.update({
      where: { id: lessonId },
      data: {
        notes,
      },
    });
  },
};
