import prisma from '../config/database.js';
import { AppError } from '../utils/errorHandler.js';

export const getUserProgress = async (userId, sessionId) => {
  return await prisma.progress.findFirst({
    where: {
      userId,
      sessionId,
    },
  });
};

export const getCourseProgress = async (user, courseId) => {
  // Fetch course and sessions
  const course = await prisma.course.findUnique({
    where: { id: Number(courseId) },
    include: { sessions: true },
  });
  if (!course) throw new AppError('Course not found', 404);

  const totalSessions = course.sessions.length;

  if (user.role === 'Instructor') {
    // Verify instructor owns the course
    if (course.instructorId !== user.id) {
      throw new AppError('Unauthorized: You are not the instructor of this course', 403);
    }

    // Fetch enrollments for the course
    const enrollments = await prisma.enrollment.findMany({
      where: { courseId: Number(courseId) },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    // Fetch progress for all enrolled students
    const progressRecords = await prisma.progress.findMany({
      where: {
        session: { courseId: Number(courseId) },
        userId: { in: enrollments.map((e) => e.userId) },
      },
      include: { session: true },
    });

    // Map progress by userId
    const progressByUser = progressRecords.reduce((acc, p) => {
      if (!acc[p.userId]) acc[p.userId] = [];
      acc[p.userId].push(p);
      return acc;
    }, {});

    // Calculate progress for each student
    return enrollments.map((enrollment) => {
      const userProgress = progressByUser[enrollment.userId] || [];
      const completedSessions = userProgress.filter((p) => p.isCompleted).length;
      const overallProgress = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;
      return {
        enrollmentId: enrollment.id,
        userId: enrollment.userId,
        user: enrollment.user,
        overallProgress,
      };
    });
  }

  // Student role: Return progress for the requesting user
  const progress = await prisma.progress.findMany({
    where: {
      userId: user.id,
      session: { courseId: Number(courseId) },
    },
    include: { session: true },
  });

  const completedSessions = progress.filter((p) => p.isCompleted).length;
  const overallProgress = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

  return {
    overallProgress,
    progress: progress.map((p) => ({
      sessionId: p.sessionId,
      isCompleted: p.isCompleted,
    })),
    sessions: course.sessions,
  };
};
  

export const createProgress = async (data, user) => {
  return await prisma.progress.create({
    data: {
      userId: user.id,
      sessionId: data.sessionId,
      isCompleted: data.isCompleted || false,
    },
  });
};

export const updateProgress = async (id, data, user) => {
  const progress = await prisma.progress.findUnique({ where: { id } });
  if (!progress) throw new AppError('Progress not found', 404);
  if (progress.userId !== user.id) throw new AppError('Unauthorized', 403);

  return await prisma.progress.update({
    where: { id },
    data: {
      isCompleted: data.isCompleted,
    },
  });
};

export const deleteProgress = async (id, user) => {
  const progress = await prisma.progress.findUnique({ where: { id } });
  if (!progress) throw new AppError('Progress not found', 404);
  if (progress.userId !== user.id) throw new AppError('Unauthorized', 403);

  return await prisma.progress.delete({ where: { id } });
};
