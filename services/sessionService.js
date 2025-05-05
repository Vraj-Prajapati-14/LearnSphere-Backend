import prisma from '../config/database.js';
import { Session } from '../models/index.js'; // Import Session model directly
import { AppError } from '../utils/errorHandler.js';

export const getSessions = async (courseId, user) => {
  const course = await prisma.course.findUnique({
    where: { id: parseInt(courseId) },
    include: { sessions: true },
  });

  if (!course) {
    throw new AppError('Course not found', 404);
  }

  if (!course.isPublished && course.instructorId !== user.id) {
    throw new AppError('Unauthorized', 403);
  }

  return course.sessions;
};

export const createSession = async (courseId, sessionData, user) => {
  console.log("sessiondata:-" ,sessionData);
  const course = await prisma.course.findUnique({
    where: { id: parseInt(courseId) },
  });

  if (!course) {
    throw new AppError('Course not found', 404);
  }

  if (course.instructorId !== user.id) {
    throw new AppError('Unauthorized', 403);
  }

  return await Session.create({  // Use Session.create instead of prisma.session.create
    data: {
      title: sessionData.title,
      youtubeLink: sessionData.youtubeLink,
      explanation: sessionData.explanation,
      courseId: parseInt(courseId),
    },
  });
};

export const getSessionById = async (courseId, sessionId) => {
  try {
    // Use findFirst to query based on multiple conditions
    const session = await prisma.session.findFirst({
      where: {
        id: parseInt(sessionId), // sessionId
        courseId: parseInt(courseId), // courseId
      },
      include: {
        course: true, // You can include the related course if needed
      },
    });

    if (!session) {
      throw new Error('Session not found');
    }

    return session;
  } catch (err) {
    console.error('Error fetching session:', err);
    throw new Error('Error fetching session');
  }
};


export const updateSession = async (courseId, sessionId, sessionData, user) => {
  const course = await prisma.course.findUnique({
    where: { id: parseInt(courseId) },
  });

  if (!course) {
    throw new AppError('Course not found', 404);
  }

  if (course.instructorId !== user.id) {
    throw new AppError('Unauthorized', 403);
  }

  const session = await Session.findUnique({  // Use Session.findUnique
    where: { id: parseInt(sessionId) },
  });

  if (!session || session.courseId !== parseInt(courseId)) {
    throw new AppError('Session not found', 404);
  }

  return await Session.update({  // Use Session.update
    where: { id: parseInt(sessionId) },
    data: {
      title: sessionData.title,
      youtubeLink: sessionData.youtubeLink, // ✅ Now update youtubeLink also
      explanation: sessionData.explanation,
    },
  });
};

export const deleteSession = async (courseId, sessionId, user) => {
  try {
    if (!user) {
      throw new AppError('Unauthorized: No user authenticated', 401);
    }

    console.log(`Attempting to delete session: courseId=${courseId}, sessionId=${sessionId}, userId=${user.id}`);

    const course = await prisma.course.findUnique({
      where: { id: parseInt(courseId) },
    });
    if (!course) {
      throw new AppError('Course not found', 404);
    }
    if (course.instructorId !== user.id) {
      throw new AppError('Unauthorized: You are not the instructor of this course', 403);
    }

    const session = await prisma.session.findFirst({
      where: {
        id: parseInt(sessionId),
        courseId: parseInt(courseId),
      },
    });
    if (!session) {
      throw new AppError('Session not found or does not belong to this course', 404);
    }

    console.log(`Deleting Progress records for sessionId: ${sessionId}`);
    const progressDeleteResult = await prisma.progress.deleteMany({
      where: { sessionId: parseInt(sessionId) },
    });
    console.log(`Deleted ${progressDeleteResult.count} Progress records`);

    console.log(`Deleting Session id: ${sessionId}`);
    await prisma.session.delete({
      where: { id: parseInt(sessionId) },
    });

    return { message: 'Session deleted successfully' };
  } catch (error) {
    console.error('Detailed error in deleteSession:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack,
      courseId,
      sessionId,
      userId: user?.id,
    });
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2003') {
        throw new AppError('Cannot delete session due to existing progress records', 400);
      }
      if (error.code === 'P2025') {
        throw new AppError('Session not found', 404);
      }
    }
    throw error instanceof AppError ? error : new AppError('Failed to delete session', 500);
  }
};