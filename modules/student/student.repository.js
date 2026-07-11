import prisma from "../../db.js";

// ===== Get minimal student details (only 2 columns) =====
// Used by getExamById to avoid redundant user join in main query
export const getStudentDetails = (studentId) => {
  return prisma.users.findUnique({
    where: { id: studentId },
    select: {
      university_id: true,
      name: true,
    },
  });
};

// ===== Profile =====
export const getProfile = (studentId) => {
  return prisma.users.findUnique({
    where: { id: studentId },
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

// ===== Lightweight exam list - NO submissions, use aggregation =====
export const getExamsListPaginated = (studentId, page = 1, limit = 15) => {
  const skip = (page - 1) * limit;

  return prisma.student_exam_sessions.findMany({
    where: {
      student_id: studentId,
      exams: {
        result_published: true,
      },
    },
    select: {
      id: true,
      exam_id: true,
      status: true,
      submitted_at: true,
      exams: {
        select: {
          title: true,
          start_time: true,
          total_marks: true,
        },
      },
      _count: {
        select: { submissions: true },
      },
    },
    orderBy: {
      submitted_at: "desc",
    },
    skip,
    take: limit,
  });
};

// ===== Get exam scores separately with aggregation =====
export const getExamScoresBatch = (sessionIds) => {
  return prisma.submissions.groupBy({
    by: ["session_id"],
    where: {
      session_id: {
        in: sessionIds,
      },
    },
    _sum: {
      manual_score: true,
      autograding_score: true,
    },
  });
};

// ===== Count total exams for pagination =====
export const countStudentExams = (studentId) => {
  return prisma.student_exam_sessions.count({
    where: {
      student_id: studentId,
      exams: {
        result_published: false,
      },
    },
  });
};

// ===== Exam detail - optimized without redundant user join =====
export const getExamById = (examId, studentId) => {
  return prisma.student_exam_sessions.findFirst({
    where: {
      exam_id: examId,
      student_id: studentId,
      exams: {
        result_published: true,
      },
    },
    select: {
      id: true,
      status: true,
      submitted_at: true,
      exams: {
        select: {
          title: true,
          total_marks: true,
          exam_questions: {
            select: {
              question_id: true,
              marks_weightage: true,
            },
          },
        },
      },
      submissions: {
        select: {
          id: true,
          question_id: true,
          submitted_code: true,
          language: true,
          autograding_score: true,
          autograding_status: true,
          manual_score: true,
          created_at: true,
          question_bank: {
            select: {
              title: true,
              description: true,
            },
          },
        },
        orderBy: {
          created_at: "asc", // oldest -> newest, service.js relies on this order
        },
      },
    },
  });
};