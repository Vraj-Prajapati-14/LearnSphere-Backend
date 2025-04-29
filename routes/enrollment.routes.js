
import express from 'express';
import {
  createEnrollment,
  getEnrollments,
  getEnrollmentById,
  deleteEnrollment,
  getProgress,
  markSessionComplete,
} from '../controllers/enrollmentController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { validateDto } from '../middleware/validateDto.js';
import { createEnrollmentDto, completeSessionDto } from '../dtos/enrollment.dto.js';

const router = express.Router();

router.post('/', authMiddleware(['Student']), validateDto(createEnrollmentDto), createEnrollment);
router.get('/', authMiddleware(['Student', 'Instructor']), getEnrollments);
router.get('/:id', authMiddleware(['Student', 'Instructor']), getEnrollmentById);
router.delete('/:id', authMiddleware(['Student', 'Instructor']), deleteEnrollment);
router.get('/:id/progress', authMiddleware(['Student', 'Instructor']), getProgress);
router.post(
  '/:id/complete-session',
  authMiddleware(['Student']),
  validateDto(completeSessionDto),
  markSessionComplete
);

export default router;