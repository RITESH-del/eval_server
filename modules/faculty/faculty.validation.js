import { z } from 'zod';

export const createLabSchema = z.object({
  id: z.string().nullish().optional(),
  title: z.string().max(255),
  subject: z.string().max(255).optional(),
  start_password: z.string().max(255).optional(),
  duration_minutes: z.number().positive("duration must be positive"),
  total_marks: z.number().positive("total marks must be positive"),
  target_graduation_year: z.number().int().min(2020).max(2100),
  target_sections: z.array(z.string().max(10)),
  start_time: z.coerce.date(),
  end_time: z.coerce.date(),
  questions: z.array(
    z.object({
      id: z.string(),
      title: z.string().optional(),
      statement: z.string(),
      difficulty: z.enum(["easy", "medium", "hard"]).optional(),
      marks: z.number().positive("marks must be positive"),
      diagram: z.string().nullable().optional(),
      testCases: z.array(
        z.object({
          id: z.string(),
          input: z.string(),
          output: z.string(),
        })
      ).optional(),
    })
  ).max(20).optional()
})



export const updateLabSchema = createLabSchema;

export const manualScoreSchema = z.object({
  manual_score: z.number().positive("manual score must be positive"),
});

export const validate = (schema) => {
  return async (req, res, next) => {
    try {
      const result = schema.safeParse(req.body);
      console.log("BODY:", req.body);

      if (!result.success) {
        return res.status(400).json({
          error: "Validation failed",
          details: result.error.issues,
        });
      }

      req.validatedData = result.data;
      next();
    } catch (err) {
      next(err);
    }
  };
};