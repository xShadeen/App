import { prisma } from "../../prisma";

export const studentsService = {
  async getAll() {
    return prisma.student.findMany({
      where: {
        isActive: true,
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

  async delete(id: number) {
    return prisma.student.update({
      where: { id },
      data: {
        isActive: false,
      },
    });
  },

  getById: async (id: number) => {
    return prisma.student.findUnique({
      where: { id },
    });
  },
};
