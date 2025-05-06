import { Enrollment, Course } from '../models/index.js';
import { AppError } from '../utils/errorHandler.js';

export const createEnrollment = async (userId, courseId) => {
  const course = await Course.findUnique({ where: { id: parseInt(courseId) } });
  if (!course) throw new AppError('Course not found', 404);
  if (!course.isPublished) throw new AppError('Course is not published', 403);
  const existingEnrollment = await Enrollment.findFirst({
    where: { userId: parseInt(userId), courseId: parseInt(courseId) },
  });
  if (existingEnrollment) throw new AppError('User already enrolled in this course', 400);
  return await Enrollment.create({
    data: {
      userId: parseInt(userId),
      courseId: parseInt(courseId),
    },
  });
};

export const getEnrollments = async (user, query = {}) => {
  const { courseId } = query;

  if (courseId) {
    const course = await Course.findUnique({
      where: { id: parseInt(courseId) },
    });
    if (!course) throw new AppError('Course not found', 404);

    if (user.role === 'Instructor') {
      if (course.instructorId !== user.id) {
        throw new AppError('Unauthorized: You are not the instructor of this course', 403);
      }
      return await Enrollment.findMany({
        where: { courseId: parseInt(courseId) },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          course: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    if (user.role === 'Student') {
      return await Enrollment.findMany({
        where: {
          userId: user.id,
          courseId: parseInt(courseId),
        },
        include: { course: true },
      });
    }

    return await Enrollment.findMany({
      where: { courseId: parseInt(courseId) },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        course: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  if (user.role === 'Student') {
    return await Enrollment.findMany({
      where: { userId: user.id },
      include: { course: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  if (user.role === 'Instructor') {
    const instructorCourses = await Course.findMany({
      where: { instructorId: user.id },
      select: { id: true },
    });
    const courseIds = instructorCourses.map((course) => course.id);
    return await Enrollment.findMany({
      where: {
        courseId: { in: courseIds },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        course: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  return await Enrollment.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      course: true,
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const getEnrollmentById = async (enrollmentId, user) => {
  const enrollment = await Enrollment.findUnique({
    where: { id: parseInt(enrollmentId) },
    include: { course: true, user: { select: { id: true, name: true, email: true } } },
  });
  if (!enrollment) throw new AppError('Enrollment not found', 404);
  if (user.role === 'Instructor' && enrollment.course.instructorId !== user.id) {
    throw new AppError('Unauthorized: You are not the instructor of this course', 403);
  }
  if (user.role === 'Student' && enrollment.userId !== user.id) {
    throw new AppError('Unauthorized: You can only view your own enrollments', 403);
  }
  return enrollment;
};

export const deleteEnrollment = async (enrollmentId, user) => {
  const enrollment = await Enrollment.findUnique({
    where: { id: parseInt(enrollmentId) },
    include: { course: true },
  });
  if (!enrollment) throw new AppError('Enrollment not found', 404);
  if (user.role === 'Instructor' && enrollment.course.instructorId !== user.id) {
    throw new AppError('Unauthorized: You are not the instructor of this course', 403);
  }
  if (user.role === 'Student' && enrollment.userId !== user.id) {
    throw new AppError('Unauthorized: You can only delete your own enrollments', 403);
  }
  await Enrollment.delete({ where: { id: parseInt(enrollmentId) } });
  return { message: 'Enrollment deleted successfully' };
};