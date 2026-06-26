import Router from "express";
import * as authController from "./auth.controller.js";
import { authMiddleware } from "../../shared/middleware/auth.middleware.js";
import { validate, signupSchema, loginSchema, googleLoginSchema } from "./auth.validation.js";
// import passport from "../../config/passport.js";


const router = Router();

router.post("/signup", validate(signupSchema), authController.signup); // won't need it later with SSO + OIDC Authentication
router.post("/login", validate(loginSchema), authController.login);
router.post("/google", validate(googleLoginSchema), authController.googleLogin);
router.post("/logout", authMiddleware, authController.logout);
// router.get("/me", authMiddleware, authController); // to recongnize the user after login

// For SSO + OIDC based Authentication (For later use, when i get the credetials)
// router.get("/login", passport.authenticate("oidc"));
// router.get( "/callback", passport.authenticate("oidc",{ failureRedirect: "/login" }, authController.ssoCallback ));
// before all this add this to user schema  `oidcSub   String @unique` (in prisma) and migrate


export default router;
