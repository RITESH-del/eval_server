import * as facultyRepo from "./faculty.repository.js";

export const createLab = async (examData, facultyId) => {
        await facultyRepo.createLab({
            ...examData,
            created_by: facultyId
        })  

        return "Exam created successfully";
}

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

export const getLabDetails = async (examId) => {
    const sessions = await facultyRepo.getLabDetails(examId)

    return sessions.map(session => ({
        session_id: session.id,
        university_id: session.users?.university_id,
        name: session.users?.name,
        section: session.users?.section,
        language: session.submissions?.[0]?.language,
        status: session.status,
        graduation_year: session.users?.graduation_year,
        start_time: session.exams?.start_time,
        total_manual_score: session.submissions?.reduce(
                (sum, sub) => sum + (sub.manual_score || 0),
                0
            ) || null,   
        total_autograding_score: session.submissions?.reduce(
                (sum, sub) => sum + (sub.autograding_score || 0),
                0
            ) || null,
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


export const getSessions = async () => {
    const res = await facultyRepo.getSessions();

    let total_manual_score = 0;
    let total_autograding_score = 0;

    return res.map((session) => {
        total_manual_score += session.submissions?.map((sub) => sub.manual_score);
        total_autograding_score += session.submissions?.map((sub) => sub.autograding_score);

        return {
            session_id: session.id,
            university_id: session.users?.university_id,
            name: session.users?.name,
            section: session.users?.section,
            language: session.submissions?.[0]?.language,
            status: session.status,
            total_manual_score: session.submissions?.reduce(
                (sum, sub) => sum + (sub.manual_score || 0),
                0
            ) || null,   
            total_autograding_score: session.submissions?.reduce(
                (sum, sub) => sum + (sub.autograding_score || 0),
                0
            ),
            title: session.exams?.title,
            status: session.status,
        }
    })
}