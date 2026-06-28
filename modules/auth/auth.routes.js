import Router from "express";
import * as authController from "./auth.controller.js";
import { authMiddleware } from "../../shared/middleware/auth.middleware.js";
import { validate, signupSchema, loginSchema, googleLoginSchema } from "./auth.validation.js";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique user identifier
 *         university_id:
 *           type: string
 *           description: University-assigned student or faculty identifier
 *         name:
 *           type: string
 *           description: Full name of the user
 *         email:
 *           type: string
 *           format: email
 *           description: Email address of the user
 *         role:
 *           type: string
 *           enum: [admin, faculty, student]
 *           description: Role of the user in the platform
 *         graduation_year:
 *           type: integer
 *           nullable: true
 *           description: Graduation year (only for student role)
 *         section:
 *           type: string
 *           nullable: true
 *           description: Assigned classroom section (only for student role)
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Timestamp when user was created
 *
 *     SignupInput:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *         - universityId
 *       properties:
 *         name:
 *           type: string
 *           minLength: 3
 *           description: User's full name
 *         email:
 *           type: string
 *           format: email
 *           description: Valid university email address
 *         password:
 *           type: string
 *           minLength: 8
 *           description: Secret password (at least 8 characters)
 *         universityId:
 *           type: string
 *           description: University roll number or identification card number
 *
 *     LoginInput:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *         password:
 *           type: string
 *           minLength: 8
 *           description: User's password
 *
 *     GoogleLoginInput:
 *       type: object
 *       required:
 *         - credential
 *       properties:
 *         credential:
 *           type: string
 *           description: Google ID token credential string returned from Google Identity Services
 *
 *     AuthResponse:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *           description: JWT Access Token
 *         user:
 *           $ref: '#/components/schemas/User'
 *
 *     GoogleAuthResponse:
 *       type: object
 *       properties:
 *         accessToken:
 *           type: string
 *           description: JWT Access Token
 *         user:
 *           $ref: '#/components/schemas/User'
 */

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Register a new student or faculty member
 *     description: Creates a user account. Role is determined automatically based on the email domain and pattern.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SignupInput'
 *     responses:
 *       201:
 *         description: Account successfully registered and logged in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Validation failed or email already exists
 */
router.post("/signup", validate(signupSchema), authController.signup); // won't need it later with SSO + OIDC Authentication

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Authenticate user using email and password credentials
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Validation failed or invalid email/password credentials
 */
router.post("/login", validate(loginSchema), authController.login);

/**
 * @swagger
 * /auth/google:
 *   post:
 *     summary: Authenticate / Register using Google Sign-In
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GoogleLoginInput'
 *     responses:
 *       200:
 *         description: Google authentication successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GoogleAuthResponse'
 *       400:
 *         description: Invalid Google credentials or validation failed
 */
router.post("/google", validate(googleLoginSchema), authController.googleLogin);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Log out user session
 *     description: Clears user auth token cookie from browser
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Logged out successfully
 *       401:
 *         description: Unauthorized
 */
router.post("/logout", authMiddleware, authController.logout);

export default router;
