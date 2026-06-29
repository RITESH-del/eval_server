import { Router } from 'express';
import * as controller from './app.controller.js';
import { validate } from '../../shared/middleware/validate.middleware.js';
import { submissionSchema } from './app.validation.js';

const router = Router();

router.get('/lab/:id', controller.fetchLab);
router.post('/lab', validate(submissionSchema), controller.handleSubmission);

export default router;