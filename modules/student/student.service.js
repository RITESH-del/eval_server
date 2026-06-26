import * as studentRepo from "./student.repository.js";

export const getProfile = async (studentId) => {
  const profile = await studentRepo.getProfile(studentId);

  if (!profile) {
    const err = new Error("Student not found");
    err.status = 404;
    throw err;
  }

  return profile;
};

export const getExams = async (studentId) => {
  const sessions = await studentRepo.getExams(studentId);

  return sessions.map((session) => ({
    session_id: session.id,
    exam_id: session.exam_id,
    title: session.exams?.title,
    status: session.status,
    submitted_at: session.submitted_at,
    start_time: session.exams?.start_time,
    total_marks: session.exams?.total_marks,
    total_manual_score:
      session.submissions?.reduce(
        (sum, sub) => sum + (sub.manual_score || 0),
        0
      ) || null,
    total_autograding_score:
      session.submissions?.reduce(
        (sum, sub) => sum + (sub.autograding_score || 0),
        0
      ) || null,
  }));
};

export const getExamById = async (examId, studentId) => {
  const session = await studentRepo.getExamById(examId, studentId);

  if (!session) {
    const err = new Error("Exam not found");
    err.status = 404;
    throw err;
  }

  const response = {
    session_id: session.id,
    student_details: {
      university_id: session.users.university_id,
      name: session.users.name,
    },
    exam_details: {
      title: session.exams.title,
      total_marks: session.exams.total_marks,
    },
    total_manual_score:
      session.submissions?.reduce(
        (sum, sub) => sum + (sub.manual_score || 0),
        0
      ) || null,
    total_autograding_score:
      session.submissions?.reduce(
        (sum, sub) => sum + (sub.autograding_score || 0),
        0
      ) || null,
    responses: [],
  };

  const grouped = {};

  session.submissions.forEach((submission) => {
    const qid = submission.question_id;

    if (!grouped[qid]) {
      grouped[qid] = {
        question_id: qid,
        title: submission.question_bank.title,
        description: submission.question_bank.description,
        submission_history: [],
        autograding_score: submission.autograding_score,
        manual_score: submission.manual_score,
      };
    }

    grouped[qid].submission_history.push({
      id: submission.id,
      code: submission.submitted_code,
      language: submission.language,
      created_at: submission.created_at,
    });

    grouped[qid].autograding_score = submission.autograding_score;
    grouped[qid].manual_score = submission.manual_score;
  });

  response.responses = Object.values(grouped);

  return response;
};
