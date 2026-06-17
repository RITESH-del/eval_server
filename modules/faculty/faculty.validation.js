import { z } from 'zod';

const labBaseSchema = z.object({
  title: z.string().min(3).max(255),
  start_password_hash: z.string().min(3).max(255),
  total_marks: z.number().positive("Total marks must be positive"),
  duration_minutes: z.number().positive("Duration must be positive"),
  target_graduation_year: z.number().int().min(2020).max(2100),
  target_section: z.union([z.string().max(10), z.array(z.string().max(10))]),
  start_time: z.coerce.date(),
  end_time: z.coerce.date(),
});

export const createLabSchema = labBaseSchema.refine(
  (data) => data.start_time < data.end_time,
  {
    message: "Start time must be before end time",
    path: ["end_time"],
  }
);

export const updateLabSchema = labBaseSchema
  .partial()
  .refine(
    (data) => {
      // Only validate if both dates are provided
      if (data.start_time && data.end_time) {
        return data.start_time < data.end_time;
      }
      return true;
    },
    {
      message: "Start time must be before end time",
      path: ["end_time"],
    }
  );

export const validate = (schema) => {
  return async (req, res, next) => {
    try {
      const result = schema.safeParse(req.body);

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