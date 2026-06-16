export const allow = (...roles) => (req, res, next) => {

  if (!roles.includes(req.user.role)) {
    return res.sendStatus(403);
  }

  next();
};


/* 
 * Usage:
 * router.post("/labs", authMiddleware, allow("TEACHER"), createLab);
 */