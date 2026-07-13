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




// export const createLab = async (data) => {
//   console.time("createLab");

//   const result = await prisma.$transaction(async (tx) => {
//     // Create Exam
//     const exam = await tx.exams.create({
//       data: {
//         id: data.id,
//         title: data.title,
//         start_password_hash: data.start_password,
//         total_marks: data.total_marks,
//         duration_minutes: data.duration_minutes,
//         target_graduation_year: data.target_graduation_year,
//         start_time: data.start_time,
//         end_time: data.end_time,
//         created_by: data.created_by,
//       },
//     });

//     // Target Sections
//     if (data.target_sections.length) {
//       await tx.exam_target_sections.createMany({
//         data: data.target_sections.map((section) => ({
//           exam_id: exam.id,
//           section,
//         })),
//       });
//     }

//     // Questions
//     for (const question of data.questions) {
//       await tx.question_bank.create({
//         data: {
//           id: question.id,
//           title: question.title,
//           description: question.statement,
//           subject_tag: question.subject_tag,
//           difficulty: question.difficulty,
//           created_by: data.created_by,
//         },
//       });

//       // Test Cases
//       if (question.testCases.length) {
//         await tx.test_cases.createMany({
//           data: question.testCases.map((tc) => ({
//             id: tc.id,
//             question_id: question.id,
//             input_data: tc.input,
//             expected_output: tc.output,
//             is_hidden: true,
//           })),
//         });
//       }

//       // Exam Question Mapping
//       await tx.exam_questions.create({
//         data: {
//           exam_id: exam.id,
//           question_id: question.id,
//           marks_weightage: question.marks,
//         },
//       });
//     }

//     return exam;
//   }, {
//     timeout: 45000
//   });



//   console.timeEnd("createLab");
//   return result;
// };


export const createLab = async (data) => {
  console.time("createLab");

  const result = await prisma.$transaction(
    async (tx) => {
      // Create exam
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

      // Insert target sections
      if (data.target_sections?.length) {
        await tx.exam_target_sections.createMany({
          data: data.target_sections.map((section) => ({
            exam_id: exam.id,
            section,
          })),
        });
      }

      // Insert all questions in one query
      await tx.question_bank.createMany({
        data: data.questions.map((question) => ({
          id: question.id,
          title: question.title,
          description: question.statement,
          subject_tag: question.subject_tag,
          difficulty: question.difficulty,
          created_by: data.created_by,
        })),
      });

      // Flatten all test cases
      const testCases = data.questions.flatMap((question) =>
        (question.testCases ?? []).map((tc) => ({
          id: tc.id || randomUUID(),
          question_id: question.id,
          input_data: tc.input,
          expected_output: tc.output,
          is_hidden: true,
        }))
      );

      // Insert all test cases in one query
      if (testCases.length) {
        await tx.test_cases.createMany({
          data: testCases,
        });
      }

      // Insert all exam-question mappings in one query
      await tx.exam_questions.createMany({
        data: data.questions.map((question) => ({
          exam_id: exam.id,
          question_id: question.id,
          marks_weightage: question.marks,
        })),
      });

      return exam;
    },
    {
      timeout: 45000,
    }
  );

  console.timeEnd("createLab");

  return result;
};

export const updateLab = async (labId, data) => {
  console.time("updateLab");

  const result = await prisma.$transaction(
    async (tx) => {
      // Update exam
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

      // Delete old mappings in parallel
      await Promise.all([
        tx.exam_target_sections.deleteMany({
          where: {
            exam_id: labId,
          },
        }),

        tx.exam_questions.deleteMany({
          where: {
            exam_id: labId,
          },
        }),
      ]);

      // Upsert all questions in parallel
      await Promise.all(
        data.questions.map((q) =>
          tx.question_bank.upsert({
            where: {
              id: q.id,
            },
            create: {
              id: q.id,
              title: q.title,
              description: q.statement,
              subject_tag: q.subject_tag || "test",
              difficulty: q.difficulty,
              created_by: data.created_by,
            },
            update: {
              title: q.title,
              description: q.statement,
              subject_tag: q.subject_tag || "test",
              difficulty: q.difficulty,
            },
          })
        )
      );

      // Delete all existing test cases for these questions
      await tx.test_cases.deleteMany({
        where: {
          question_id: {
            in: data.questions.map((q) => q.id),
          },
        },
      });

      // Flatten all test cases
      const testCases = data.questions.flatMap((q) =>
        (q.testCases ?? []).map((tc) => ({
          id: tc.id || randomUUID(),
          question_id: q.id,
          input_data: tc.input,
          expected_output: tc.output,
          is_hidden: true,
        }))
      );

      // Insert all test cases in one query
      if (testCases.length) {
        await tx.test_cases.createMany({
          data: testCases,
        });
      }

      // Recreate mappings in parallel
      await Promise.all([
        data.target_sections?.length
          ? tx.exam_target_sections.createMany({
              data: data.target_sections.map((section) => ({
                exam_id: labId,
                section,
              })),
            })
          : Promise.resolve(),

        data.questions?.length
          ? tx.exam_questions.createMany({
              data: data.questions.map((q) => ({
                exam_id: labId,
                question_id: q.id,
                marks_weightage: q.marks,
              })),
            })
          : Promise.resolve(),
      ]);

      return {
        success: true,
        id: labId,
      };
    },
    {
      timeout: 45000,
    }
  );

  console.timeEnd("updateLab");

  return result;
};

export const deleteLab = async (labId) => {
  return prisma.exams.delete({
    where: {
      id: labId,
    },
  });
};


export const updateManualScore = async (
  submissionId,
  manualScore
) => {
  return await prisma.submissions.update({
    where: {
      id: submissionId,
    },
    data: {
      manual_score: manualScore,
    },
  });
};



export const publishResult = async (examId) => {
   const exam = await prisma.exams.findUnique({
    where: {
      id: examId,
    },
    select: {
    result_published: true,
  },
  });

  if (!exam) {
    throw new Error("Exam not found");
  }

  return await prisma.exams.update({
    where: {
      id: examId
    },
    data: {
      result_published: !exam.result_published,
    }
  })
  
}