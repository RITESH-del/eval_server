import { Router } from 'express';
import { authMiddleware } from '../../shared/middleware/auth.middleware.js';
import { allow } from '../../shared/middleware/RABC.middleware.js';
import * as facultyController from './faculty.controller.js';
import { createLabSchema, updateLabSchema, manualScoreSchema } from './faculty.validation.js';
import { validate } from '../../shared/middleware/validate.middleware.js';
const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     TestCase:
 *       type: object
 *       required:
 *         - input
 *         - output
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique identifier of the test case
 *         input:
 *           type: string
 *           description: Input data for the test case
 *         output:
 *           type: string
 *           description: Expected output from the submission
 *         is_hidden:
 *           type: boolean
 *           default: true
 *           description: Whether this is a hidden test case
 *
 *     Question:
 *       type: object
 *       required:
 *         - statement
 *         - marks
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique identifier of the question
 *         title:
 *           type: string
 *           description: Optional title for the question
 *         statement:
 *           type: string
 *           description: Detailed question description/instructions
 *         difficulty:
 *           type: string
 *           enum: [easy, medium, hard]
 *           description: Question difficulty level
 *         marks:
 *           type: number
 *           description: Marks allocated for the question
 *         diagram:
 *           type: string
 *           nullable: true
 *           description: Optional diagram image url or base64 representation
 *         testCases:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/TestCase'
 *           description: List of test cases for validation
 *
 *     LabInput:
 *       type: object
 *       required:
 *         - title
 *         - duration_minutes
 *         - total_marks
 *         - target_graduation_year
 *         - target_sections
 *         - start_time
 *         - end_time
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Optional unique identifier of the lab
 *         title:
 *           type: string
 *           description: Title of the lab
 *         subject:
 *           type: string
 *           description: Subject of the lab
 *         start_password:
 *           type: string
 *           description: Password required to access the exam
 *         duration_minutes:
 *           type: number
 *           description: Duration of the lab exam in minutes
 *         total_marks:
 *           type: number
 *           description: Total marks weightage of the lab
 *         target_graduation_year:
 *           type: integer
 *           description: Target student graduation year
 *         target_sections:
 *           type: array
 *           items:
 *             type: string
 *           description: List of target student sections
 *         start_time:
 *           type: string
 *           format: date-time
 *           description: Start time of the exam
 *         end_time:
 *           type: string
 *           format: date-time
 *           description: End time of the exam
 *         questions:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Question'
 *           description: Questions assigned to this lab
 *
 *     FacultyExam:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         title:
 *           type: string
 *         total_marks:
 *           type: integer
 *         duration_minutes:
 *           type: integer
 *         target_graduation_year:
 *           type: integer
 *         start_time:
 *           type: string
 *           format: date-time
 *         end_time:
 *           type: string
 *           format: date-time
 *         created_by:
 *           type: string
 *           format: uuid
 *         created_at:
 *           type: string
 *           format: date-time
 *         target_section:
 *           type: string
 *           description: Comma-separated list of target sections
 *
 *     StudentSession:
 *       type: object
 *       properties:
 *         session_id:
 *           type: string
 *           format: uuid
 *         university_id:
 *           type: string
 *         name:
 *           type: string
 *         section:
 *           type: string
 *         language:
 *           type: string
 *         status:
 *           type: string
 *           enum: [allocated, ongoing, submitted, absent]
 *         graduation_year:
 *           type: integer
 *         start_time:
 *           type: string
 *           format: date-time
 *         total_manual_score:
 *           type: number
 *           nullable: true
 *         total_autograding_score:
 *           type: number
 *           nullable: true
 *         title:
 *           type: string
 *
 *     StudentExamSession:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         exam_id:
 *           type: string
 *           format: uuid
 *         student_id:
 *           type: string
 *           format: uuid
 *         status:
 *           type: string
 *           enum: [allocated, ongoing, submitted, absent]
 *         started_at:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         submitted_at:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         ip_address:
 *           type: string
 *           nullable: true
 *
 *     SubmissionHistory:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         code:
 *           type: string
 *         language:
 *           type: string
 *         created_at:
 *           type: string
 *           format: date-time
 *
 *     QuestionSubmission:
 *       type: object
 *       properties:
 *         question_id:
 *           type: string
 *           format: uuid
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         submission_history:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/SubmissionHistory'
 *         autograding_score:
 *           type: integer
 *         manual_score:
 *           type: integer
 *           nullable: true
 *
 *     SubmissionDetails:
 *       type: object
 *       properties:
 *         session_id:
 *           type: string
 *           format: uuid
 *         student_details:
 *           type: object
 *           properties:
 *             university_id:
 *               type: string
 *             name:
 *               type: string
 *         exam_details:
 *           type: object
 *           properties:
 *             title:
 *               type: string
 *         responses:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/QuestionSubmission'
 *
 *     LabDetails:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         title:
 *           type: string
 *         total_marks:
 *           type: number
 *         start_password:
 *           type: string
 *         duration_minutes:
 *           type: number
 *         target_graduation_year:
 *           type: integer
 *         start_time:
 *           type: string
 *           format: date-time
 *         end_time:
 *           type: string
 *           format: date-time
 *         is_active:
 *           type: boolean
 *         is_live:
 *           type: boolean
 *         target_sections:
 *           type: array
 *           items:
 *             type: string
 *         questions:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Question'
 *
 *     MetaData:
 *       type: object
 *       properties:
 *         target_graduation_year:
 *           type: array
 *           items:
 *             type: integer
 *         target_section:
 *           type: array
 *           items:
 *             type: string
 */

/**
 * @swagger
 * /faculty/exams:
 *   get:
 *     summary: Retrieve labs and exams created by the authenticated faculty member
 *     tags: [Faculty]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of labs created by the faculty
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FacultyExam'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Only faculty role allowed)
 */
router.get('/exams', authMiddleware, allow('faculty'), facultyController.getLabs); // this is for pastpractical.json, to make a list of labs, exam created by faculty

/**
 * @swagger
 * /faculty/exams/{id}:
 *   get:
 *     summary: Retrieve detailed sessions of students who registered/sat for a specific exam
 *     tags: [Faculty]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Exam ID
 *     responses:
 *       200:
 *         description: Array of student sessions for this exam
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/StudentSession'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/exams/:id', authMiddleware, allow('faculty'), facultyController.getLabDetails); // For labSubmissions.json(list of ppl who sat in the exam) - map exam ID to session ID

/**
 * @swagger
 * /faculty/exam-sessions:
 *   get:
 *     summary: Retrieve all student exam sessions in real-time
 *     tags: [Faculty]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of student sessions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/StudentSession'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/exam-sessions', authMiddleware, allow('faculty'), facultyController.getSessions); // To see all lab session in real time, for lab Sessions

/**
 * @swagger
 * /faculty/submissions/{examId}:
 *   get:
 *     summary: Retrieve student exam sessions for a specific exam
 *     tags: [Faculty]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: examId
 *         required: true
 *         schema:
 *           type: string
 *         description: Exam ID
 *     responses:
 *       200:
 *         description: List of student exam sessions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/StudentExamSession'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/submissions/:examId', authMiddleware, allow('faculty'), facultyController.getAllSubmissions); // for reviewSubmissions.json, uncomplete, list of questions and marks

/**
 * @swagger
 * /faculty/submissions/{examId}/session/{sessionId}:
 *   get:
 *     summary: Retrieve detailed submission history of a student session
 *     tags: [Faculty]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: examId
 *         required: true
 *         schema:
 *           type: string
 *         description: Exam ID
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Student Exam Session ID
 *     responses:
 *       200:
 *         description: Detailed submission details with response codes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SubmissionDetails'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Submission not found
 */
router.get('/submissions/:examId/session/:sessionId', authMiddleware, allow('faculty'), facultyController.getSubmissionById); // for reviewSols.json, uncomplete, for one submission or one question ID

/**
 * @swagger
 * /faculty/labs:
 *   post:
 *     summary: Create a new lab exam
 *     tags: [Faculty]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LabInput'
 *     responses:
 *       201:
 *         description: Lab created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FacultyExam'
 *       400:
 *         description: Validation failed or database constraint error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/labs', authMiddleware, allow('faculty'), validate(createLabSchema), facultyController.createLab); // create Lab

/**
 * @swagger
 * /faculty/labs/{id}:
 *   get:
 *     summary: Retrieve lab parameters and nested questions/testcases
 *     tags: [Faculty]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Lab/Exam ID
 *     responses:
 *       200:
 *         description: Lab details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LabDetails'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Lab not found
 */
router.get('/labs/:id', authMiddleware, allow('faculty'), facultyController.fetchLab); // fetch lab

/**
 * @swagger
 * /faculty/labs/{id}:
 *   put:
 *     summary: Update an existing lab exam
 *     tags: [Faculty]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Lab/Exam ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LabInput'
 *     responses:
 *       200:
 *         description: Lab updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/LabDetails'
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Lab not found
 */
router.put('/labs/:id', authMiddleware, allow('faculty'), validate(updateLabSchema), facultyController.updateLab); // update lab 

/**
 * @swagger
 * /faculty/labs/{id}:
 *   delete:
 *     summary: Delete a lab exam
 *     tags: [Faculty]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Lab/Exam ID
 *     responses:
 *       204:
 *         description: Lab deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden/Not authorized to delete this lab
 *       404:
 *         description: Lab not found
 */
router.delete('/labs/:id', authMiddleware, allow('faculty'), facultyController.deleteLab);

/**
 * @swagger
 * /faculty/metadata:
 *   get:
 *     summary: Retrieve metadata lists for exam config
 *     tags: [Faculty]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Metadata details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MetaData'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/metadata', authMiddleware, allow('faculty'), facultyController.getMetaData); // for quizConfig.json


router.patch("/submissions/:submissionId/manual-score",  validate(manualScoreSchema), authMiddleware, allow('faculty'), facultyController.updateManualScore);

/**
 * @swagger
 * /faculty/publish_result/{examId}:
 *   post:
 *     summary: Publish or unpublish exam results
 *     tags: [Faculty]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: examId
 *         required: true
 *         schema:
 *           type: string
 *         description: Exam/Lab ID
 *     responses:
 *       200:
 *         description: Results published/unpublished successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     exam_id:
 *                       type: string
 *                       example: "uuid-1234"
 *                     result_published:
 *                       type: boolean
 *                       example: true
 *       400:
 *         description: Invalid request or exam not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Exam not found
 */
router.post("/publish_result/:examId", authMiddleware, allow('faculty'), facultyController.publishResult);

export default router;