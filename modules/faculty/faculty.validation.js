import { z } from 'zod';

// const labBaseSchema = z.object({
//   title: z.string().min(3).max(255),
//   start_password_hash: z.string().min(3).max(255),
//   total_marks: z.number().positive("Total marks must be positive"),
//   duration_minutes: z.number().positive("Duration must be positive"),
//   target_graduation_year: z.number().int().min(2020).max(2100),
//   target_section: z.union([z.string().max(10), z.array(z.string().max(10))]),
//   start_time: z.coerce.date(),
//   end_time: z.coerce.date(),
// });

export const createLabSchema = z.object({
  id: z.string().nullish(),
  title: z.string().max(255),
  subject: z.string().max(255),
  duration: z.number().positive("duration must be positive"),
  totalMarks: z.number().positive("total marks must be positive"),
  targetYears: z.array(z.string().max(10)),
  targetSections: z.array(z.string().max(10)),
  start_time: z.coerce.date(),
  end_time: z.coerce.date(),
  questions: z.array(
    z.object({
      id: z.string(),
      // type: z.enum(["coding", "subjective"]).nullish(),
      statement: z.string(),
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