import prisma from "../../db.js";
import { randomUUID } from "crypto";

// find user by id
export const findByEmail = (email) => {
  return prisma.users.findUnique({
    where: {
      email,
    }
  });
};

// find user by oidc sub
// export const findByOidcSub = (oidcSub) => {
//   return prisma.users.findUnique({ where: { oidc_sub: oidcSub } });
// };


// create user by id
export const create = (data) => {
  const id = randomUUID();
  return prisma.users.create({
    data: { id, ...data },
  });
};
