import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().min(3),
  email: z.email(),
  password: z.string().min(8),
  universityId: z.string(),
  // role: z.enum(["student", "faculty"]),
});

// login shcema
export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

// google login schema
export const googleLoginSchema = z.object({
  credential: z.string(),
});



// validation middleware
export const validate = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        errors: result.error.flatten(),
      });
    }

    req.validatedData = result.data;
    next();
  };
};
