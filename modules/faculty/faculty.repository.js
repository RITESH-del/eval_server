import prisma from "../../db.js";
import { randomUUID } from "crypto";

// export const createLab = (exam, facultyId) => {
//     const { target_section, ...examData } = exam;

//     let sections = [];
//     if (Array.isArray(target_section)) {
//         sections = target_section;
//     } else if (typeof target_section === "string") {
//         sections = target_section.split(",").map(s => s.trim()).filter(Boolean);
//     }

//     const dataToCreate = {
//         id: randomUUID(),
//         ...examData
//     };

//     if (sections.length > 0) {
//         dataToCreate.exam_target_sections = {
//             create: sections.map(sec => ({
//                 section: sec
//             }))
//         };
//     }

//     return prisma.exams.create({ data: dataToCreate });
// }

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

// use it later 
// export const updateLab = (examId, examData) => {
//     const { target_section, ...otherData } = examData;

//     let sections = [];
//     if (Array.isArray(target_section)) {
//         sections = target_section;
//     } else if (typeof target_section === "string") {
//         sections = target_section.split(",").map(s => s.trim()).filter(Boolean);
//     }

//     const updateData = { ...otherData };

//     if (target_section !== undefined) {
//         updateData.exam_target_sections = {
//             deleteMany: {},
//             create: sections.map(sec => ({
//                 section: sec
//             }))
//         };
//     }

//     return prisma.exams.update({
//         where: {
//             id: examId
//         },
//         data: updateData
//     });
// }

// may need later
// export const deleteLab = (examId) => {
//     return prisma.exams.delete({
//         where: {
//             id: examId
//         }
//     })
// }   



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


export const createLab = async (data) => {
  return prisma.$transaction(
    async (tx) => {
    const exam = await tx.exams.create({
      data: {
        id: data.id,
        title: data.title,
        start_password_hash: data.start_password_hash,
        total_marks: data.total_marks,
        duration_minutes: data.duration_minutes,
        target_graduation_year: data.target_graduation_year,
        start_time: data.start_time,
        end_time: data.end_time,
        created_by: data.created_by,
      },
    });

    // Sections
    if (data.sections?.length) {
      await tx.exam_target_sections.createMany({
        data: data.sections.map((section) => ({
          exam_id: exam.id,
          section,
        })),
      });
    }

    // Questions + Test Cases + Exam Mapping
    if (data.questions?.length) {
      for (const question of data.questions) {
        const questionId = question.id || randomUUID();

        await tx.question_bank.create({
          data: {
            id: questionId,
            title: question.title,
            description: question.statement,
            subject_tag: question.subject_tag || "DSA",
            difficulty: question.difficulty || "medium",
            created_by: data.created_by,
          },
        });

        if (question.testCases?.length) {
          await tx.test_cases.createMany({
            data: question.testCases.map((tc) => ({
              id: tc.id,
              question_id: questionId,
              input_data: tc.input_data,
              expected_output: tc.expected_output,
              is_hidden: true,
            })),
          });
        }

        await tx.exam_questions.create({
          data: {
            exam_id: exam.id,
            question_id: questionId,
            marks_weightage: question.marks,
          },
        });
      }
    }

    return exam;
  },  {  maxWait: 5000, timeout: 30000 });
};


export const updateLab = async (labId, data) => {
  return prisma.$transaction(async (tx) => {
    await tx.exams.update({
      where: { id: labId },
      data: {
        title: data.title,
        total_marks: data.totalMarks,
        duration_minutes: data.duration,
        target_graduation_year: Number(data.targetYears[0]),
        start_time: data.startTime,
        end_time: data.endTime,
      },
    });

    await tx.exam_target_sections.deleteMany({
      where: { exam_id: labId },
    });

    await tx.exam_questions.deleteMany({
      where: { exam_id: labId },
    });

    if (data.targetSections?.length) {
      await tx.exam_target_sections.createMany({
        data: data.targetSections.map((section) => ({
          exam_id: labId,
          section,
        })),
      });
    }

//     if (data.questions?.length) {
//     await tx.question_bank.deleteMany({
//   where: {
//     id: {
//       in: oldQuestions.map((q) => q.question_id),
//     },
//   },
// });}

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
        exam_questions: true,
      },
    });
  }, {
    timeout: 30000,
  });
};

export const deleteLab = async (labId) => {
  return prisma.exams.delete({
    where: {
      id: labId,
    },
  });
};





