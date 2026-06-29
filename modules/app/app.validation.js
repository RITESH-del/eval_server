import { z } from 'zod';


export const submissionSchema = z.object({
    exam_id: z.string(),
    university_id: z.string(),
    started_at: z.coerce.date(),
    submitted_at: z.coerce.date(),
    status: z.enum(['submitted', 'allocated', 'absent']),
    submissions: z.array(
        z.object({
            question_id: z.string(),
            submitted_code: z.string().trim().min(1),
            language: z.string().max(20),
            autograding_status: z.enum(['pending', 'passed', 'failed', 'error']),
            autograding_score: z.number().min(0)
        })
    )
}).refine(
    data => data.submitted_at >= data.started_at,
    {
        path: ["submitted_at"],
        message: "submitted_at must be after started_at"
    }
);

