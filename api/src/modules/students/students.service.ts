import { prisma } from "../../prisma";

export const studentsService = {
  getAll: async () => {
    return prisma.student.findMany({
      orderBy: {
        firstName: "asc",
      },
    });
  },

  create: async (data: {
    firstName: string;
    email?: string;
    phone: string;
  }) => {
    return prisma.student.create({
      data,
    });
  },

  delete: async (id: string) => {
    return prisma.student.delete({
      where: { id },
    });
  },
};
