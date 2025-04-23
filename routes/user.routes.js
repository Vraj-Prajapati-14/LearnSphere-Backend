import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { sendResponse } from '../utils/response.js';

const router = express.Router();

router.get('/profile', authMiddleware(['Student', 'Instructor']), (req, res) => {
  sendResponse(res, 200, { user: req.user });
});

export default router;