import { Router } from 'express';
import { authMiddleware } from '../../shared/middleware/auth.middleware.js';
import { allow } from '../../shared/middleware/RABC.middleware.js';
import * as facultyController from './faculty.controller.js';
import { validate, createLabSchema, updateLabSchema } from './faculty.validation.js';

const router = Router();

router.post('/exams', authMiddleware, allow('faculty'), validate(createLabSchema), facultyController.createLab); // create Lab
router.get('/exams', authMiddleware, allow('faculty'), facultyController.getLabs); // this is for pastpractical.json, to make a list of labs, exam created by faculty
router.get('/exams/:id', authMiddleware, allow('faculty'), facultyController.getLabDetails); // For labSubmissions.json(list of ppl who sat in the exam) - map exam ID to session ID
    
router.get('/submissions/:examId', authMiddleware, allow('faculty'), facultyController.getAllSubmissions); // for reviewSubmissions.json, uncomplete, list of questions and marks
router.get('/submissions/:examId/student/:studentId', authMiddleware, allow('faculty'), facultyController.getSubmissionById); // for submissionSols.json, uncomplete, for one submission or one question ID



export default router;