import prisma from "../../db.js";

export const findById = (userId) => {
  return prisma.users.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      university_id: true,
    },
  });
};