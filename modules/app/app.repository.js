import prisma from "../../db.js";
import { randomUUID } from 'node:crypto';


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

// export const handleSubmission = async (data) => {
//   return prisma.$transaction(async (tx) => {

//     const student = await tx.users.findUnique({
//       where: {
//         university_id: data.university_id
//       }
//     })

//      if (!student) {
//       throw new Error("Student not found.");
//     }
    
//     console.log(student);

//     const student_exam_session = await tx.student_exam_sessions.create({
//       data: {
//             id: randomUUID(),
//             exam_id: data.exam_id,
//             student_id: student.id,
//             started_at: data.started_at,
//             submitted_at: data.submitted_at,
//             status: data.status,
//             ip_address: data.ip_address,
//       }
//     })

//     for (const sub of data.submissions) {
//       await tx.submissions.create({
//         data: {
//           id: randomUUID(),
//           session_id: student_exam_session.id,
//           question_id: sub.question_id,
//           submitted_code: sub.submitted_code,
//           language: sub.language,
//           autograding_status: sub.autograding_status,
//           autograding_score: sub.autograding_score,
//         },
//       });
//     }

//     return student_exam_session;
//   })
// }


export const handleSubmission = async (data) => {
  return prisma.$transaction(async (tx) => {

    const student = await tx.users.findUnique({
      where: {
        university_id: data.university_id,
      },
    });

    if (!student) {
      throw new Error("Student not found.");
    }

    const session = await tx.student_exam_sessions.create({
      data: {
        id: randomUUID(),
        exam_id: data.exam_id,
        student_id: student.id,
        started_at: data.started_at,
        submitted_at: data.submitted_at,
        status: data.status,
        ip_address: data.ip_address,
      },
    });

    for (const sub of data.submissions) {
      await tx.submissions.create({
        data: {
          id: randomUUID(),
          session_id: session.id,
          question_id: sub.question_id,
          submitted_code: sub.submitted_code,
          language: sub.language,
          autograding_status: sub.autograding_status,
          autograding_score: sub.autograding_score,
        },
      });
    }

    return session;
  }, {
    timeout: 30000
  });
};