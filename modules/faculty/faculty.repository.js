import prisma from "../../db.js";
import { randomUUID } from "crypto";

export const getLabs = (facultyId) => {
    return prisma.exams.findMany({
        where: {
            created_by: facultyId
        },
        include: {
            exam_target_sections: true
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
          exams: {
              include: {
                  exam_target_sections: true
              }
          },
          submissions: true
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

// build repository for exam sessions
export const getSessions = async () => {
  return await prisma.student_exam_sessions.findMany({
    include: {
      users: true,
      exams: true,
      submissions: true
    }
  })
}


export const findLabById = async (labId) => {
  return prisma.exams.findUnique({
    where: {
      id: labId,
    },
    select: {
      id: true,
      created_by: true,
      is_active: true,
      is_live: true,
    },
  });
};


export const fetchLabById = async(examId) => {
  return await prisma.exams.findUnique({
    where:{
      id: examId
    },
    include:{
      exam_target_sections: true,
      exam_questions: {
        include:{
          question_bank: {
            include: {
              test_cases: true
            }
          }
        }
      }
    }
  })
}


// export const createLab = async (facultyId, data) => {
//   if (!facultyId) {
//     throw new Error("facultyId is required");
//   }

//   if (!data) {
//     throw new Error("data is required");
//   }

//   const examId = data.id || randomUUID();

//   return prisma.$transaction(async (tx) => {
//     console.log("Creating exam...");

//     const exam = await tx.exams.create({
//       data: {
//         id: examId,
//         title: data.title,
//         start_password_hash: data.start_password,
//         total_marks: data.total_marks,
//         duration_minutes: data.duration_minutes,
//         target_graduation_year: data.target_graduation_year,
//         start_time: data.start_time,
//         end_time: data.end_time,
//         created_by: facultyId,
//       },
//     });

//     console.log("Exam created:", exam.id);

//     if (Array.isArray(data.target_sections) && data.target_sections.length) {
//       console.log("Creating sections");

//       await tx.exam_target_sections.createMany({
//         data: data.target_sections.map((section) => ({
//           exam_id: exam.id,
//           section,
//         })),
//       });

//       console.log("Sections created");
//     }

//     if (Array.isArray(data.questions)) {
//       for (const question of data.questions) {
//         console.log("Creating question:", question.id);

//         const questionId = question.id || randomUUID();

//         await tx.question_bank.create({
//           data: {
//             id: questionId,
//             title: question.title,
//             description: question.statement,
//             subject_tag: question.subject_tag || "test",
//             difficulty: question.difficulty,
//             created_by: facultyId,
//           },
//         });

//         console.log("Question created");

//         if (Array.isArray(question.testCases) && question.testCases.length) {
//           console.log("Creating test cases");

//           await tx.test_cases.createMany({
//             data: question.testCases.map((tc) => ({
//               id: tc.id || randomUUID(),
//               question_id: questionId,
//               input_data: tc.input,
//               expected_output: tc.output,
//               is_hidden: true,
//             })),
//           });

//           console.log("Test cases created");
//         }

//         console.log("Creating exam-question mapping");

//         await tx.exam_questions.create({
//           data: {
//             exam_id: exam.id,
//             question_id: questionId,
//             marks_weightage: question.marks,
//           },
//         });

//         console.log("Mapping created");
//       }
//     }

//     return exam;
//   });
// };



export const createLab = async (data) => {
  return prisma.$transaction(async (tx) => {
    // Create Exam
    const exam = await tx.exams.create({
      data: {
        id: data.id,
        title: data.title,
        start_password_hash: data.start_password,
        total_marks: data.total_marks,
        duration_minutes: data.duration_minutes,
        target_graduation_year: data.target_graduation_year,
        start_time: data.start_time,
        end_time: data.end_time,
        created_by: data.created_by,
      },
    });

    // Target Sections
    if (data.target_sections.length) {
      await tx.exam_target_sections.createMany({
        data: data.target_sections.map((section) => ({
          exam_id: exam.id,
          section,
        })),
      });
    }

    // Questions
    for (const question of data.questions) {
      await tx.question_bank.create({
        data: {
          id: question.id,
          title: question.title,
          description: question.statement,
          subject_tag: question.subject_tag,
          difficulty: question.difficulty,
          created_by: data.created_by,
        },
      });

      // Test Cases
      if (question.testCases.length) {
        await tx.test_cases.createMany({
          data: question.testCases.map((tc) => ({
            id: tc.id,
            question_id: question.id,
            input_data: tc.input,
            expected_output: tc.output,
            is_hidden: true,
          })),
        });
      }

      // Exam Question Mapping
      await tx.exam_questions.create({
        data: {
          exam_id: exam.id,
          question_id: question.id,
          marks_weightage: question.marks,
        },
      });
    }

    return exam;
  }, {
    timeout: 30000
  });
};


export const updateLab = async (labId, data) => {
  return prisma.$transaction(
    async (tx) => {
      await tx.exams.update({
        where: { id: labId },
        data: {
          title: data.title,
          total_marks: data.total_marks,
          start_password_hash: data.start_password,
          duration_minutes: data.duration_minutes,
          target_graduation_year: data.target_graduation_year,
          start_time: data.start_time,
          end_time: data.end_time,
        },
      });

      await tx.exam_target_sections.deleteMany({
        where: { exam_id: labId },
      });

      await tx.exam_questions.deleteMany({
        where: { exam_id: labId },
      });

      for (const q of data.questions) {
  const existingQuestion = await tx.question_bank.findUnique({
    where: {
      id: q.id,
    },
  });

  if (!existingQuestion) {
    await tx.question_bank.create({
      data: {
        id: q.id,
        title: q.title,
        description: q.statement,
        subject_tag: q.subject_tag || 'test',
        difficulty: q.difficulty,
        created_by: data.created_by,
      },
    });
  }
 else {
  await tx.question_bank.update({
    where: {
      id: existingQuestion.id,
    },
    data: {
      title: q.title,
      description: q.statement,
      subject_tag: q.subject_tag || "test",
      difficulty: q.difficulty,
    },
  });
}
}

      if (data.target_sections?.length) {
        await tx.exam_target_sections.createMany({
          data: data.target_sections.map((section) => ({
            exam_id: labId,
            section,
          })),
        });
      }

      if (data.questions?.length) {
        await tx.exam_questions.createMany({
          data: data.questions.map((q) => ({
            exam_id: labId,
            question_id: q.id,
            marks_weightage: q.marks,
          })),
        });
      }

      return tx.exams.findUnique({
        where: { id: labId },
        include: {
          exam_target_sections: true,
          exam_questions: {
            include: {
              question_bank: true,
            },
          },
        },
      });
    },
    {
      timeout: 30000,
    }
  );
};

export const deleteLab = async (labId) => {
  return prisma.exams.delete({
    where: {
      id: labId,
    },
  });
};





