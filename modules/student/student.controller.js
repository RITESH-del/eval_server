import * as studentService from "./student.service.js";

export const getProfile = async (req, res, next) => {
  try {
    const profile = await studentService.getProfile(req.user.id);
    res.json(profile);
  } catch (err) {
    next(err);
  }
};

export const getExams = async (req, res, next) => {
  try {
    const exams = await studentService.getExams(req.user.id);
    res.status(200).json(exams);
  } catch (err) {
    next(err);
  }
};

export const getExamById = async (req, res, next) => {
  try {
    const exam = await studentService.getExamById(req.params.id, req.user.id);
    res.json(exam);
  } catch (err) {
    next(err);
  }
};
