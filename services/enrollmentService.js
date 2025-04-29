import { Enrollment, Course, Session } from '../models/index.js';
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
      completedSessions: [],
    },
  });
};

export const getEnrollments = async (user, query = {}) => {
  const { courseId } = query;
  if (user.role === 'Student') {
    return await Enrollment.findMany({
      where: {
        userId: user.id,
        ...(courseId && { courseId: parseInt(courseId) }),
      },
      include: { course: { include: { category: true } } },
    });
  }
  return await Enrollment.findMany({
    where: {
      ...(courseId && { courseId: parseInt(courseId) }),
    },
    include: { user: true, course: { include: { category: true } } },
  });
};

export const getEnrollmentById = async (enrollmentId, user) => {
  const enrollment = await Enrollment.findUnique({
    where: { id: parseInt(enrollmentId) },
    include: { course: { include: { category: true } }, user: true },
  });
  if (!enrollment) throw new AppError('Enrollment not found', 404);
  if (enrollment.userId !== user.id && user.role !== 'Instructor') {
    throw new AppError('Unauthorized', 403);
  }
  return enrollment;
};

export const deleteEnrollment = async (enrollmentId, user) => {
  const enrollment = await Enrollment.findUnique({ where: { id: parseInt(enrollmentId) } });
  if (!enrollment) throw new AppError('Enrollment not found', 404);
  if (enrollment.userId !== user.id && user.role !== 'Instructor') {
    throw new AppError('Unauthorized', 403);
  }
  await Enrollment.delete({ where: { id: parseInt(enrollmentId) } });
};

export const getProgress = async (enrollmentId, user) => {
  const enrollment = await Enrollment.findUnique({
    where: { id: parseInt(enrollmentId) },
    include: { course: { include: { sessions: true } } },
  });
  if (!enrollment) throw new AppError('Enrollment not found', 404);
  if (enrollment.userId !== user.id && user.role !== 'Instructor') {
    throw new AppError('Unauthorized', 403);
  }
  const totalSessions = enrollment.course.sessions.length;
  const completedSessions = enrollment.completedSessions.length;
  const progress = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;
  return { completedSessions: enrollment.completedSessions, totalSessions, progress };
};

export const markSessionComplete = async (enrollmentId, sessionId, user) => {
  const enrollment = await Enrollment.findUnique({
    where: { id: parseInt(enrollmentId) },
    include: { course: { include: { sessions: true } } },
  });
  if (!enrollment) throw new AppError('Enrollment not found', 404);
  if (enrollment.userId !== user.id) throw new AppError('Unauthorized', 403);
  const sessionExists = enrollment.course.sessions.some(s => s.id === parseInt(sessionId));
  if (!sessionExists) throw new AppError('Session not found in course', 404);
  if (enrollment.completedSessions.includes(parseInt(sessionId))) {
    throw new AppError('Session already completed', 400);
  }
  return await Enrollment.update({
    where: { id: parseInt(enrollmentId) },
    data: { completedSessions: { push: parseInt(sessionId) } },
  });
};