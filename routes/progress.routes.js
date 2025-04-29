import express from 'express';
import {
  createProgress,
  updateProgress,
  getUserProgress,
  deleteProgress,
  getCourseProgress
} from '../controllers/progressController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { validateDto } from '../middleware/validateDto.js';
import {
  createProgressDto,
  updateProgressDto,
  progressIdDto,
} from '../dtos/progress.dto.js';

const router = express.Router();

router.post(
  '/',
  authMiddleware(['Student']),
  validateDto(createProgressDto),
  createProgress
);

router.get(
  '/:sessionId',
  authMiddleware(['Student']),
  getUserProgress
);

router.put(
  '/:id',
  authMiddleware(['Student']),
  validateDto(updateProgressDto),
  updateProgress
);

router.get(
    '/course/:courseId/progress',
    authMiddleware(['Student']),
    getCourseProgress
  );
  

router.delete(
  '/:id',
  authMiddleware(['Student']),
  validateDto(progressIdDto),
  deleteProgress
);

export default router;
