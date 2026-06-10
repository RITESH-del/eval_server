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
    return await facultyRepo.getLabDetails( examId )
}

export const getAllSubmissions = async (facultyId) => {
    return await facultyRepo.getAllSubmissions(facultyId)
}

export const getSubmissionById = async (examId, studentId) => {
    const session =  await facultyRepo.getSubmissionById(examId, studentId);     

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
