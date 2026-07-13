import { PrismaClient } from "./generated/prisma/index.js";

const prisma = new PrismaClient({
  log: [
    { emit: "event", level: "query" },
  ],
});


prisma.$on("query", (e) => {
  console.log(`${e.duration} ms`);
  console.log(e.query);
});

export default prisma;