import * as studentService from "./student.service.js";

// ===== Get profile (same but benefits from service caching) =====
export const getProfile = async (req, res, next) => {
  try {
    const profile = await studentService.getProfile(req.user.id);
    res.json(profile);
  } catch (err) {
    next(err);
  }
};

// ===== Get exams with pagination =====
export const getExams = async (req, res, next) => {
  try {
    // Support ?page=2 query param
    const page = parseInt(req.query.page) || 1;

    if (page < 1) {
      return res.status(400).json({ error: "Page must be >= 1" });
    }

    const result = await studentService.getExams(req.user.id, page);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// ===== Get exam by ID - FIXED: fetch student details with caching =====
export const getExamById = async (req, res, next) => {
  try {
    // FIX: JWT only has id/role/email, so fetch university_id & name
    // This query is cached, so repeated views = cache hit (0 DB query)
    const studentDetails = await studentService.getStudentDetails(req.user.id);

    const exam = await studentService.getExamById(
      req.params.id,
      req.user.id,
      studentDetails
    );
    res.json(exam);
  } catch (err) {
    next(err);
  }
};