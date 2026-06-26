import prisma from "../../db.js";

export const getProfile = (studentId) => {
  return prisma.users.findUnique({
    where: {
      id: studentId,
    },
    select: {
      id: true,
      university_id: true,
      name: true,
      email: true,
      section: true,
      graduation_year: true,
      role: true,
    },
  });
};

export const getExams = (studentId) => {
  return prisma.student_exam_sessions.findMany({
    where: {
      student_id: studentId,
      exams: {
        result_published: true,
      },
    },
    include: {
      exams: true,
      submissions: true,
    },
    orderBy: {
      submitted_at: "desc",
    },
  });
};

export const getExamById = (examId, studentId) => {
  return prisma.student_exam_sessions.findFirst({
    where: {
      exam_id: examId,
      student_id: studentId,
      exams: {
        result_published: true,
      },
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
};
