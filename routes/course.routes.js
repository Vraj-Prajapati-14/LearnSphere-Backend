import express from 'express';
import { getCourses, createCourse, updateCourse, deleteCourse, getCategories, getCourseById, allcourse, getCourseDetails } from '../controllers/courseController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { validateDto } from '../middleware/validateDto.js';
import { courseQueryDto, createCourseDto, updateCourseDto, courseIdDto } from '../dtos/course.dto.js';
import { upload } from '../middleware/uploadMiddleware.js';
import sessionRoutes from './session.routes.js';

const router = express.Router();

router.use('/:courseId/sessions', sessionRoutes);

router.get('/categories', getCategories);

router.get('/allcourse', allcourse);
router.get('/:id/details', getCourseDetails);
router.get('/', authMiddleware(['Student', 'Instructor']), validateDto(courseQueryDto), getCourses);

router.post(
  '/',
  authMiddleware(['Instructor']),
  upload.single('image'),
  validateDto(createCourseDto),
  createCourse
);

router.get(
  '/:id',
  authMiddleware(['Student', 'Instructor']),
  validateDto(courseIdDto),
  getCourseById
);

router.put(
  '/:id',
  authMiddleware(['Instructor']),
  upload.single('image'),
  validateDto(updateCourseDto),
  updateCourse
);


router.delete('/:id', authMiddleware(['Instructor']), validateDto(courseIdDto), deleteCourse);

export default router;