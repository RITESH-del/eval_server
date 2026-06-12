import * as facultyRepo from "./faculty.repository.js";

export const createLab = async (examData, facultyId) => {
        await facultyRepo.createLab({
            ...examData,
            created_by: facultyId
        })  

        return "Exam created successfully";
}

export const getLabs = async (facultyId) => {
    return await facultyRepo.getLabs(facultyId)  
}

export const getLabDetails = async (examId) => {
    const sessions = await facultyRepo.getLabDetails(examId)

    return sessions.map(session => ({
        session_id: session.id,
        university_id: session.users?.university_id,
        name: session.users?.name,
        section: session.users?.section,
        language: session.submissions?.[0]?.language,
        status: session.status,
        manual_score: session.submissions?.[0]?.manual_score,
        autograding_score: session.submissions?.[0]?.autograding_score,
        title: session.exams?.title,
    }));
}

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
      autograding_score: null,
      manual_score: null,
    };
  }

    grouped[qid].submission_history.push({
        id: submission.id,
        created_at: submission.created_at,
    });

    // latest scores overwrite older ones
    grouped[qid].autograding_score = submission.autograding_score;
    grouped[qid].manual_score = submission.manual_score;
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