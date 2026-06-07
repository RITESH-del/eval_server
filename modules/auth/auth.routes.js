import Router from "express";
import * as authController from "./auth.controller.js";
import { authMiddleware } from "../../shared/middleware/auth.middleware.js";
import { validate, signupSchema, loginSchema, googleLoginSchema } from "./auth.validation.js";


const router = Router();

router.post("/signup", validate(signupSchema), authController.signup);
router.post("/login", validate(loginSchema), authController.login);
router.post("/google", validate(googleLoginSchema), authController.googleLogin);
router.post("/logout", authMiddleware, authController.logout);


export default router;
