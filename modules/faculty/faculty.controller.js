import * as facultyService from './faculty.service.js'; 
import { Readable } from "stream";
import cloudinary from "../../config/cloudinary.config.js";


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
    const sessionId = req.params?.sessionId;
    const submission = await facultyService.updateManualScore(req.body, sessionId);
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

export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ ok: false, message: "No image uploaded", });
    }

    const streamUpload = () =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "exam-platform/questions",
            resource_type: "image",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        Readable.from(req.file.buffer).pipe(stream);
      });

    const result = await streamUpload();

    return res.json({ ok: true, url: result.secure_url, public_id: result.public_id, });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: "Failed to upload image" });
  }
};



export const uploadTestCases = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        ok: false,
        message: "No file uploaded",
      });
    }

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "exam-platform/test-cases",
          resource_type: "raw", // Required for zip/txt/in/out files
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );

      Readable.from(req.file.buffer).pipe(uploadStream);
    });

    return res.status(200).json({
      ok: true,
      message: "File uploaded successfully",
      url: result.secure_url,
      public_id: result.public_id,
      original_name: req.file.originalname,
      size: req.file.size,
    });
  } catch (error) {
    next(error);
  }
};