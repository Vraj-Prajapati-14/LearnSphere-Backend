import express from 'express';
import { getSessions, createSession, updateSession, deleteSession ,getSessionById } from '../controllers/sessionController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { validateDto } from '../middleware/validateDto.js';
import { createSessionDto, updateSessionDto, sessionIdDto } from '../dtos/session.dto.js';

const router = express.Router({ mergeParams: true });

router.get('/:courseId/sessions', authMiddleware(['Student', 'Instructor']), getSessions);
router.get('/:courseId/sessions/:id', authMiddleware(['Student', 'Instructor']), getSessionById);
router.post(
  '/:courseId/sessions',
  authMiddleware(['Instructor']),
  validateDto(createSessionDto),
  createSession
);
router.put(
  '/:courseId/sessions/:id',
  authMiddleware(['Instructor']),
  validateDto(updateSessionDto),
  // validateDto(sessionIdDto),
  updateSession
);
router.delete(
  '/:courseId/sessions/:id',
  authMiddleware(['Instructor']),
  validateDto(sessionIdDto),
  deleteSession
);

export default router;