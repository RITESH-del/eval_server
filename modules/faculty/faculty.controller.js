import * as facultyService from './faculty.service.js'; 


export const createLab = async (req, res, next) => {
  try {
    const exam = await facultyService.createLab(req.validatedData, req.user.id);
    res.status(201).json(exam);
  } catch (err) {
    next(err);
  }
}

export const getLabs = async (req, res, next) => {
  try {
    const exams = await facultyService.getLabs(req.user.id);
    res.json(exams);    
  } catch (err) {
    next(err);
  }
}

export const getLabDetails = async (req, res, next) => {
  try {
    const exam = await facultyService.getLabDetails(req.params.id);
    res.json(exam);
  } catch (err) {
    next(err);
  }
}

export const getAllSubmissions = async (req, res, next) => {
  try {
    const submissions = await facultyService.getAllSubmissions(req.params.examId);
    res.json(submissions);
  } catch (err) {
    next(err);
  }
}

export const getSubmissionById = async (req, res, next) => {
  try {
    const submission = await facultyService.getSubmissionById(req.params.examId, req.params.sessionId); // its student_exam_session id
    res.json(submission);
  } catch (err) {
    next(err);
  }
}


export const getMetaData = async (req, res, next) => {
  try {
    const metaData = await facultyService.getMetaData();
    res.json(metaData);
  } catch (err) {
    next(err);
  }
}

export const getSessions = async (req, res, next) => {
  try {
    const sessions = await facultyService.getSessions();
    res.json(sessions);
  } catch (err) {
    next(err);
  }
}
