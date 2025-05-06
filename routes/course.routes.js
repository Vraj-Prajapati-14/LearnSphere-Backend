import express from 'express';
import { getCourses, createCourse, updateCourse, deleteCourse, getCategories, getCourseById, allcourse, getCourseDetails } from '../controllers/courseController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { validateDto } from '../middleware/validateDto.js';
import { courseQueryDto, createCourseDto, updateCourseDto, courseIdDto } from '../dtos/course.dto.js';
import { upload } from '../middleware/uploadMiddleware.js';
import sessionRoutes from './session.routes.js';

const router = express.Router();

// Mount session routes as a sub-router
router.use('/:courseId/sessions', sessionRoutes);

// Route to get all categories (for dropdown)
router.get('/categories', getCategories);

// Route to get all courses
router.get('/allcourse', allcourse);
router.get('/:id/details', getCourseDetails);
router.get('/', authMiddleware(['Student', 'Instructor']), validateDto(courseQueryDto), getCourses);

// Route to create a course
router.post(
  '/',
  authMiddleware(['Instructor']),
  upload.single('image'),
  validateDto(createCourseDto),
  createCourse
);

// Route to get course by ID
router.get(
  '/:id',
  authMiddleware(['Student', 'Instructor']),
  validateDto(courseIdDto),
  getCourseById
);

// Route to update a course
router.put(
  '/:id',
  authMiddleware(['Instructor']),
  upload.single('image'),
  validateDto(updateCourseDto),
  updateCourse
);

// Route to delete a course
router.delete('/:id', authMiddleware(['Instructor']), validateDto(courseIdDto), deleteCourse);

export default router;