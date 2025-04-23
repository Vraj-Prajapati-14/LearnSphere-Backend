import express from 'express';
import { registerController, loginController } from '../controllers/authController.js';
import { validateDto } from '../middleware/validateDto.js';
import { registerSchema, loginSchema } from '../dtos/auth.dto.js';

const router = express.Router();

router.post('/register', validateDto(registerSchema), registerController);
router.post('/login', validateDto(loginSchema), loginController);

export default router;