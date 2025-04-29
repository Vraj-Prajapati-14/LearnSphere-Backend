import express from 'express';
import { registerController, loginController,validateToken } from '../controllers/authController.js';
import { validateDto } from '../middleware/validateDto.js';
import { registerSchema, loginSchema } from '../dtos/auth.dto.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', validateDto(registerSchema), registerController);
router.post('/login', validateDto(loginSchema), loginController);
router.get('/validate', authMiddleware(['Student', 'Instructor']), validateToken);

export default router;