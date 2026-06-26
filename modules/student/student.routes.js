import { Router } from 'express';
import { authMiddleware } from '../../shared/middleware/auth.middleware.js';
import { allow } from '../../shared/middleware/RABC.middleware.js';
import * as studentController from './student.controller.js';

const router = Router();

router.get('/profile', authMiddleware, allow('student'), studentController.getProfile); // profile.json
router.get('/exams', authMiddleware, allow('student'), studentController.getExams); // pastpractical.json
router.get('/exams/:id', authMiddleware, allow('student'), studentController.getExamById); // review submissions for one practical

export default router;
