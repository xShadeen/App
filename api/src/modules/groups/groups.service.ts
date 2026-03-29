import { prisma } from "../../prisma";

export const groupsService = {
  getAll: async () => {
    return prisma.group.findMany({
      include: {
        students: true,
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
        groupId: group?.id || null,
      },
    });
  },
};
