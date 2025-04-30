import express from 'express';
import {
  createEnrollment,
  getEnrollments,
  getEnrollmentById,
  deleteEnrollment,
} from '../controllers/enrollmentController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { validateDto } from '../middleware/validateDto.js';
import { createEnrollmentDto } from '../dtos/enrollment.dto.js';

const router = express.Router();

router.post('/', authMiddleware(['Student']), validateDto(createEnrollmentDto), createEnrollment);
router.get('/', authMiddleware(['Student', 'Instructor']), getEnrollments);
router.get('/:id', authMiddleware(['Student', 'Instructor']), getEnrollmentById);
router.delete('/:id', authMiddleware(['Student', 'Instructor']), deleteEnrollment);

export default router;