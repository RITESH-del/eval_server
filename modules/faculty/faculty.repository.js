import prisma from "../../db.js";
import { randomUUID } from "crypto";

export const createLab = (exam, facultyId) => {
    return prisma.exams.create({ data: {
        id: randomUUID(),
        ...exam
    } })
}

export const getLabs = (facultyId) => {
    return prisma.exams.findMany({
        where: {
            created_by: facultyId
        }
    })
}
 

export const getLabDetails = (examId) => {
    return prisma.student_exam_sessions.findMany({
        where: {
            exam_id: examId
        },
        include: {
          users: true,
          exams: true,
          submissions: true
        }
    })
}

// use it later 
export const updateLab = (examId, examData) => {
    return prisma.exams.update({
        where: {
            id: examId
        },
        data: {
            ...examData
        }
    })
}

// may need later
export const deleteLab = (examId) => {
    return prisma.exams.delete({
        where: {
            id: examId
        }
    })
}   



export const getAllSubmissions = async (examId) => {
const sessions =  await prisma.student_exam_sessions.findMany({
  where: {
    exam_id: examId
  }
});

return sessions;
}


export const getSubmissionById = async (examId, sessionId) => {
  const session = await prisma.student_exam_sessions.findFirst({
  where: {
    id: sessionId,
    exam_id: examId,
  },
  include: {
    users: true,
    exams: true,
    submissions: {
      include: {
        question_bank: true,
      },
      orderBy: {
        created_at: "asc",
      },
    },
  },
});

  if (!session) return null;

  return session;
};


export const years = async () => await prisma.users.findMany({
  distinct: ["graduation_year"],
  select: {
    graduation_year: true
  }
});

export const sections = async () => await prisma.users.findMany({
  where: { role: "student" },
  distinct: ["section"],
  select: {
    section: true
  }
});


