import express from 'express';
import { registerController, loginController, validateToken } from '../controllers/authController.js';
import { validateDto } from '../middleware/validateDto.js';
import { registerSchema, loginSchema } from '../dtos/auth.dto.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { googleAuthCallbackController } from '../controllers/googleAuthController.js';
import passport from 'passport';

const router = express.Router();

router.post('/register', validateDto(registerSchema), registerController);
router.post('/login', validateDto(loginSchema), loginController);
router.get('/validate', authMiddleware(['Student', 'Instructor']), validateToken);

// Google OAuth Routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'],prompt: 'select_account', }));
router.get('/google/callback', passport.authenticate('google', { session: false }), googleAuthCallbackController);

export default router;