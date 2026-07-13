import * as facultyRepo from "./faculty.repository.js";
import { randomUUID, randomBytes } from "crypto";


export const getLabs = async (facultyId) => {
    const labs = await facultyRepo.getLabs(facultyId);
    return labs.map(lab => {
        const sections = lab.exam_target_sections?.map(s => s.section) || [];
        const { exam_target_sections, ...labData } = lab;
        return {
            ...labData,
            target_section: sections.join(", ")
        };
    });
}

// export const getLabDetails = async (examId) => {
//     const sessions = await facultyRepo.getLabDetails(examId)

//     return sessions.map(session => ({
//         session_id: session.id,
//         university_id: session.users?.university_id,
//         name: session.users?.name,
//         section: session.users?.section,
//         language: session.submissions?.[0]?.language,
//         status: session.status,
//         graduation_year: session.users?.graduation_year,
//         start_time: session.exams?.start_time,
//         total_manual_score: session.submissions?.reduce(
//                 (sum, sub) => sum + (sub.manual_score || 0),
//                 0
//             ) || null,   
//         total_autograding_score: session.submissions?.reduce(
//                 (sum, sub) => sum + (sub.autograding_score || 0),
//                 0
//             ) || null,
//         title: session.exams?.title,
//     }));
// }

export const getLabDetails = async (examId) => {
  const sessions = await facultyRepo.getLabDetails(examId);

  return sessions.map((session) => {
    const bestManualScores = new Map();
    const bestAutoScores = new Map();

    for (const submission of session.submissions ?? []) {
      const questionId = submission.question_id;

      const manualScore = submission.manual_score ?? 0;
      const autoScore = submission.autograding_score ?? 0;

      bestManualScores.set(
        questionId,
        Math.max(
          bestManualScores.get(questionId) ?? 0,
          manualScore
        )
      );

      bestAutoScores.set(
        questionId,
        Math.max(
          bestAutoScores.get(questionId) ?? 0,
          autoScore
        )
      );
    }

    return {
      session_id: session.id,
      university_id: session.users?.university_id,
      name: session.users?.name,
      section: session.users?.section,
      language: session.submissions?.[0]?.language,
      status: session.status,
      graduation_year: session.users?.graduation_year,
      start_time: session.exams?.start_time,
      title: session.exams?.title,

      total_manual_score: [...bestManualScores.values()].reduce(
        (sum, score) => sum + score,
        null
      ),

      total_autograding_score: [...bestAutoScores.values()].reduce(
        (sum, score) => sum + score,
        0
      ),
    };
  });
};

export const getAllSubmissions = async (facultyId) => {
    return await facultyRepo.getAllSubmissions(facultyId)
}


export const getSubmissionById = async (examId, sessionId) => {
    const session =  await facultyRepo.getSubmissionById(examId, sessionId);     

    const response = {
        session_id: session.id,

        student_details: {
            university_id: session.users.university_id,
            name: session.users.name,
        },

        exam_details: {
            title: session.exams.title,
        },

        responses: [],
        };

    // group by questions 
    const grouped = {};

    session.submissions.forEach((submission) => {
        const qid = submission.question_id;

        if (!grouped[qid]) {
            grouped[qid] = {
                question_id: qid,
                title: submission.question_bank.title,
                description: submission.question_bank.description,
                submission_history: [],
            };
        }

        grouped[qid].autograding_score = submission.autograding_score;
        grouped[qid].manual_score = submission.manual_score;

        grouped[qid].submission_history.push({
            id: submission.id,
            code: submission.submitted_code,
            language: submission.language,
            manual_score: submission.manual_score,
            autograding_score: submission.autograding_score,
            created_at: submission.created_at,
        });
    });

    response.responses = Object.values(grouped);

    return response;
}


export const getMetaData = async () => {
    const [years, sections] = await Promise.all([
        facultyRepo.years(),
        facultyRepo.sections()
    ]);

     const graduationYears = years
    .map(y => y.graduation_year)
    .sort((a, b) => b - a)
    .slice(0, 4)
    .sort((a, b) => a - b);

  return {
    target_graduation_year: graduationYears,
    target_section: sections
      .map(s => s.section)
      .sort()
  };
};

export const getSessions = async () => {
  const res = await facultyRepo.getSessions();

  return res.map((session) => {
    const bestManualScores = new Map();
    const bestAutoScores = new Map();

    for (const submission of session.submissions ?? []) {
      const questionId = submission.question_id;

      bestManualScores.set(
        questionId,
        Math.max(
          bestManualScores.get(questionId) ?? 0,
          submission.manual_score ?? 0
        )
      );

      bestAutoScores.set(
        questionId,
        Math.max(
          bestAutoScores.get(questionId) ?? 0,
          submission.autograding_score ?? 0
        )
      );
    }

    return {
      session_id: session.id,
      university_id: session.users?.university_id,
      name: session.users?.name,
      section: session.users?.section,
      language: session.submissions?.[0]?.language,
      status: session.status,
      title: session.exams?.title,

      total_manual_score: [...bestManualScores.values()].reduce(
        (sum, score) => sum + score,
        0
      ),

      total_autograding_score: [...bestAutoScores.values()].reduce(
        (sum, score) => sum + score,
        0
      ),
    };
  });
};

export const fetchLab = async (labId) => {
  const lab = await facultyRepo.fetchLabById(labId);

  return {
    id: lab.id,
    title: lab.title,
    total_marks: lab.total_marks,
    start_password: lab.start_password_hash,
    duration_minutes: lab.duration_minutes,
    target_graduation_year: lab.target_graduation_year,
    start_time: lab.start_time,
    end_time: lab.end_time,
    is_active: lab.is_active,
    is_live: lab.is_live,
    target_sections: lab.exam_target_sections.map((s) => s.section),
    questions: lab.exam_questions.map((q) => {
        return {
            id: q.question_id,
            type: null,
            title: q.question_bank.title,
            statement: q.question_bank.description,
            marks: q.marks_weightage,
            difficulty: q.question_bank.difficulty,
            diagram: null,
            testCases: q.question_bank.test_cases.map(t => {
                return {
                    id: t.id,
                    input: t.input_data,
                    output: t.expected_output,
                    is_hidden: t.is_hidden
                }
            })

        }
    })
  };
};

// export const createLab = async (facultyId, data) => {
//   const examId = randomUUID();

//   return await facultyRepo.createLab({
//     id: examId,
//     title: data.title,
//     start_password_hash: data.start_password,
//     total_marks: data.total_marks,
//     duration_minutes: data.duration_minutes,
//     target_graduation_year: data.target_graduation_year,
//     start_time: data.start_time,
//     end_time: data.end_time,
//     created_by: facultyId,
//     sections: data.target_sections,
//     questions: data.questions.map((question) => ({
//       id: question.id,
//       title: question.title,
//       statement: question.statement,
//       marks: question.marks,
//       difficulty: question.difficulty,
//       subject_tag: data.subject || "test",
//       testCases: question.testCases.map(testCase => ({
//         id: testCase.id,
//         input_data: testCase.input_data,
//         expected_output: testCase.expected_output,
//         is_hidden: testCase.is_hidden || true
//       })),
//     })),
//   });
// };

export const createLab = async (data) => {
  return facultyRepo.createLab({
    id: data.id ?? randomBytes(4).toString("hex"),

    title: data.title,
    start_password: data.start_password,
    total_marks: data.total_marks,
    duration_minutes: data.duration_minutes,

    target_graduation_year: data.target_graduation_year,
    target_sections: data.target_sections,

    start_time: data.start_time,
    end_time: data.end_time,

    created_by: data.created_by,

    questions: (data.questions ?? []).map((question) => ({
      id: question.id ?? randomUUID(),

      title: question.title,
      statement: question.statement,
      difficulty: question.difficulty,
      marks: question.marks,

      subject_tag: data.subject ?? "test",

      testCases: (question.testCases ?? []).map((tc) => ({
        id: tc.id ?? randomUUID(),
        input: tc.input,
        output: tc.output,
      })),
    })),
  });
};


export const updateLab = async (labId, data) => {
  const existingLab = await facultyRepo.findLabById(labId);

  if (!existingLab) {
    throw new NotFoundError("Lab not found");
  }

  // if (existingLab.created_by !== facultyId) {
  //   throw new ForbiddenError("Not authorized");
  // }

  return facultyRepo.updateLab(labId, {
    ...data,
    created_by: existingLab.created_by,
  });
};



export const deleteLab = async (labId, facultyId) => {
  const existingLab = await facultyRepo.findLabById(labId);

  if (!existingLab) {
    throw new NotFoundError("Lab not found");
  }

  if (existingLab.created_by !== facultyId) {
    throw new ForbiddenError("Not authorized");
  }

  await facultyRepo.deleteLab(labId);
};



export const updateManualScore = async(submissionId, manualScore) =>{
  return await facultyRepo.updateManualScore(submissionId, manualScore);
}


export const publishResult = async(examId) => {
  return await facultyRepo.publishResult(examId);
}