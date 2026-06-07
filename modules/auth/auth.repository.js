import prisma from "../../db.js";
import { randomUUID } from "crypto";

// find user by id
export const findByEmail = (email) => {
  return prisma.users.findUnique({
    where: {
      email,
    },
  });
};

// create user by id
export const create = (data) => {
  const id = randomUUID();
  return prisma.users.create({
    data: { id, ...data },
  });
};
