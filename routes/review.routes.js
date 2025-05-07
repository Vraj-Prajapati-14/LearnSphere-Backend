import express from 'express';
import { createReview, commentOnReview, getReviewsByCourse } from '../controllers/reviewController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { validateDto } from '../middleware/validateDto.js';
import { createReviewDto, createCommentDto } from '../dtos/review.dto.js';

const router = express.Router();

router.post('/:courseId', authMiddleware(['Student']), validateDto(createReviewDto), createReview);

router.post('/comment/:reviewId', authMiddleware(['Student', 'Instructor']), validateDto(createCommentDto), commentOnReview);

router.get('/course/:courseId', getReviewsByCourse);

export default router;
