import * as repo from './app.repository.js';



export const fetchLab = async (labId) => {
  const lab = await repo.fetchLabById(labId);

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


export const handleSubmission = async(data) => {
    return repo.handleSubmission(data);
}