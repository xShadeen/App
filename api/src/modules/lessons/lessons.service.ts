import { prisma } from "../../prisma";

export const lessonsService = {
  getByStudentId: async (studentId: number) => {
    return prisma.lesson.findMany({
      where: {
        studentId,
      },
      orderBy: {
        date: "desc",
      },
    });
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
