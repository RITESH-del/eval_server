import { Router } from 'express';
import { authMiddleware } from '../../shared/middleware/auth.middleware.js';
import { allow } from '../../shared/middleware/RABC.middleware.js';
import * as studentController from './student.controller.js';

const router = Router();

// ===== OPTIMIZED ROUTES =====

/**
 * GET /api/student/profile
 * Returns student profile data
 * Benefits from caching (1 hour TTL)
 * 
 * Response: { id, university_id, name, email, section, graduation_year, role }
 */
router.get(
  '/profile',
  authMiddleware,
  allow('student'),
  studentController.getProfile
);

/**
 * GET /api/student/exams?page=1
 * Returns paginated list of exams with published results
 * 
 * Query Params:
 * - page: integer (default: 1)
 * 
 * Response:
 * {
 *   exams: [
 *     {
 *       session_id,
 *       exam_id,
 *       title,
 *       status,
 *       submitted_at,
 *       start_time,
 *       total_marks,
 *       total_manual_score,
 *       total_autograding_score,
 *       submission_count
 *     }
 *   ],
 *   pagination: {
 *     page: 1,
 *     limit: 15,
 *     total: 47,
 *     hasMore: true
 *   }
 * }
 */
router.get(
  '/exams',
  authMiddleware,
  allow('student'),
  studentController.getExams
);

/**
 * GET /api/student/exams/:id
 * Returns detailed exam with all submissions and question history
 * 
 * Path Params:
 * - id: exam ID
 * 
 * Response:
 * {
 *   session_id,
 *   student_details: { university_id, name },
 *   exam_details: { title, total_marks },
 *   total_manual_score,
 *   total_autograding_score,
 *   responses: [
 *     {
 *       question_id,
 *       title,
 *       description,
 *       autograding_score,
 *       manual_score,
 *       submission_history: [
 *         {
 *           id,
 *           code,
 *           language,
 *           created_at
 *         }
 *       ]
 *     }
 *   ]
 * }
 */
router.get(
  '/exams/:id',
  authMiddleware,
  allow('student'),
  studentController.getExamById
);

export default router;