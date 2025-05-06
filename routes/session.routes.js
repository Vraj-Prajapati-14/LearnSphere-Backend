import express from 'express';
import { getSessions, createSession, updateSession, deleteSession, getSessionById } from '../controllers/sessionController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { validateDto } from '../middleware/validateDto.js';
import { createSessionDto, updateSessionDto, sessionIdDto } from '../dtos/session.dto.js';

const router = express.Router({ mergeParams: true });

router.get('/', authMiddleware(['Student', 'Instructor']), getSessions);
router.get('/:id', authMiddleware(['Student', 'Instructor']), getSessionById);
router.post(
  '/',
  authMiddleware(['Instructor']),
  validateDto(createSessionDto),
  createSession
);
router.put(
  '/:id',
  authMiddleware(['Instructor']),
  validateDto(updateSessionDto),
  updateSession
);
router.delete(
  '/:id',
  authMiddleware(['Instructor']),
  validateDto(sessionIdDto),
  deleteSession
);

export default router;