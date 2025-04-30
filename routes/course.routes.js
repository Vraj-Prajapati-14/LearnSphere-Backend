// import express from 'express';
// import { getCourses, createCourse, updateCourse, deleteCourse } from '../controllers/courseController.js';
// import { authMiddleware } from '../middleware/authMiddleware.js';
// import { validateDto } from '../middleware/validateDto.js';
// import { courseQueryDto, createCourseDto, updateCourseDto, courseIdDto } from '../dtos/course.dto.js';
// import { upload } from '../middleware/uploadMiddleware.js';
// import { getCourseById } from '../controllers/courseController.js';


// const router = express.Router();

// router.get('/', authMiddleware(['Student', 'Instructor']), validateDto(courseQueryDto), getCourses);
// router.post(
//   '/',
//   authMiddleware(['Instructor']),
//   upload.single('image'),
//   validateDto(createCourseDto),
//   createCourse
// );

// router.get(
//   '/:id',
//   authMiddleware(['Student', 'Instructor']),
//   validateDto(courseIdDto),
//   getCourseById
// );

// router.put(
//   '/:id',
//   authMiddleware(['Instructor']),
//   upload.single('image'),
//   validateDto(updateCourseDto),
//   validateDto(courseIdDto),
//   updateCourse
// );
// router.delete('/:id', authMiddleware(['Instructor']), validateDto(courseIdDto), deleteCourse);

// export default router;

import express from 'express';
import { getCourses, createCourse, updateCourse, deleteCourse, getCategories, getCourseById, allcourse,getCourseDetails } from '../controllers/courseController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { validateDto } from '../middleware/validateDto.js';
import { courseQueryDto, createCourseDto, updateCourseDto, courseIdDto } from '../dtos/course.dto.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Route to get all categories (for dropdown)
router.get('/categories', getCategories);

// Route to get all courses
router.get('/allcourse',allcourse);
router.get('/:id/details',getCourseDetails);
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
  // validateDto(courseIdDto),
  updateCourse
);

// Route to delete a course
router.delete('/:id', authMiddleware(['Instructor']), validateDto(courseIdDto), deleteCourse);

export default router;
