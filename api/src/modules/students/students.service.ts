import { prisma } from "../../prisma";

function normalizePhone(phone: string): string {
  return phone.replace(/[^\d+]/g, "");
}

export const studentsService = {
  async getAll() {
    return prisma.student.findMany({
      include: {
        group: true,
      },
    });
  },

  create: async ({ firstName, email, phone, groupId }: any) => {
    let group = null;

    if (groupId && groupId.trim() !== "") {
      group = await prisma.group.upsert({
        where: { name: groupId },
        update: {},
        create: { name: groupId },
      });
    }

    return prisma.student.create({
      data: {
        firstName,
        email,
        phone,
        groupId: group ? group.id : null,
      },
    });
  },

  async delete(id: number) {
    return prisma.student.update({
      where: { id },
      data: {
        isActive: false,
        deletedAt: new Date(),
      },
    });
  },

  async restore(id: number) {
    return prisma.student.update({
      where: { id },
      data: {
        isActive: true,
        deletedAt: null,
      },
    });
  },

  async getById(id: number) {
    return prisma.student.findUnique({
      where: { id },
      include: {
        group: true,
      },
    });
  },

  updateGroup: async (id: number, groupId?: string | null) => {
    return prisma.student.update({
      where: { id },
      data: {
        groupId: groupId ?? null,
      },
    });
  },
};
