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