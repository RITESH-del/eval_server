import { Router } from 'express';
import { authMiddleware } from '../../shared/middleware/auth.middleware.js';
import { allow } from '../../shared/middleware/RABC.middleware.js';
import * as userController from './user.controller.js';


const router = Router()

router.get('/profile', authMiddleware, userController.getUserProfile);
// router.patch('/profile/', authMiddleware, userController.updateUserProfile);
// router.get('stats', authMiddleware, allow('student'), userController.getUserStats);
// router.get('all-users', authMiddleware, allow('faculty'), userController.getAllUsers);
// router.get('/dashboard', authMiddleware, allow('faculty'), userController.getDashboard);


export default router;