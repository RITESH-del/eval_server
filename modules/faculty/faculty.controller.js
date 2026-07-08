import * as facultyService from './faculty.service.js'; 

export const getLabs = async (req, res, next) => {
  try {

    const labs = await facultyService.getLabs(req.user.id);
    res.status(200).json(labs);    
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


export const createLab = async (req, res, next) => {
  try {
    const lab = await facultyService.createLab({
      ...req.validatedData,
      created_by: req.user.id,
    });

    res.status(201).json(lab);
  } catch (err) {
    next(err);
  }
};

export const updateLab = async (req, res, next) => {
  try {
    const lab = await facultyService.updateLab(
      req.params.id,
      req.validatedData
    );

    res.json({
      success: true,
      data: lab,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteLab = async (req, res, next) => {
  try {
    await facultyService.deleteLab(
      req.params.id,
      req.user.id
    );

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const fetchLab = async (req, res, next) => {
  try {
    const labs = await facultyService.fetchLab(req.params.id);
    console.log(labs);
    res.json(labs);
  } catch (err) {
    next(err);
  }
}

export const updateManualScore = async (req, res, next) => {
  try {
    const submission = await facultyService.updateManualScore(
      req.params.submissionId,
      req.body.manual_score
    );
    res.json(submission);
  } catch (err) {
    next(err);
  }
}


export const publishResult = async (req, res, next) => {
  try {
    const result = await facultyService.publishResult(req.params.examId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
