import prisma from '../config/database.js';
import { AppError } from '../utils/errorHandler.js';

export const getSessions = async (courseId, user) => {
  try {
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
  } catch (error) {
    console.error('Error in getSessions:', error);
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to fetch sessions', 500);
  }
};

export const createSession = async (courseId, sessionData, user) => {
  try {
    console.log('Creating session with data:', sessionData);
    const course = await prisma.course.findUnique({
      where: { id: parseInt(courseId) },
    });

    if (!course) {
      throw new AppError('Course not found', 404);
    }

    if (course.instructorId !== user.id) {
      throw new AppError('Unauthorized', 403);
    }

    return await prisma.session.create({
      data: {
        title: sessionData.title,
        youtubeLink: sessionData.youtubeLink,
        explanation: sessionData.explanation,
        courseId: parseInt(courseId),
      },
    });
  } catch (error) {
    console.error('Error in createSession:', error);
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to create session', 500);
  }
};

export const getSessionById = async (courseId, sessionId) => {
  try {
    const session = await prisma.session.findFirst({
      where: {
        id: parseInt(sessionId),
        courseId: parseInt(courseId),
      },
      include: {
        course: true,
      },
    });

    if (!session) {
      throw new AppError('Session not found', 404);
    }

    return session;
  } catch (error) {
    console.error('Error in getSessionById:', error);
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to fetch session', 500);
  }
};

export const updateSession = async (courseId, sessionId, sessionData, user) => {
  try {
    const course = await prisma.course.findUnique({
      where: { id: parseInt(courseId) },
    });

    if (!course) {
      throw new AppError('Course not found', 404);
    }

    if (course.instructorId !== user.id) {
      throw new AppError('Unauthorized', 403);
    }

    const session = await prisma.session.findUnique({
      where: { id: parseInt(sessionId) },
    });

    if (!session || session.courseId !== parseInt(courseId)) {
      throw new AppError('Session not found', 404);
    }

    return await prisma.session.update({
      where: { id: parseInt(sessionId) },
      data: {
        title: sessionData.title,
        youtubeLink: sessionData.youtubeLink,
        explanation: sessionData.explanation,
      },
    });
  } catch (error) {
    console.error('Error in updateSession:', error);
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to update session', 500);
  }
};
export const deleteSession = async (courseId, sessionId, user) => {
  try {
    if (!sessionId || isNaN(parseInt(sessionId))) {
      console.error('Invalid sessionId:', sessionId);
      throw new AppError('Invalid session ID', 400);
    }
    if (!courseId || isNaN(parseInt(courseId))) {
      console.error('Invalid courseId:', courseId);
      throw new AppError('Invalid course ID', 400);
    }
    if (!user?.id) {
      console.error('Invalid user:', user);
      throw new AppError('User not authenticated', 401);
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

    console.log(`Updating Enrollment.completedSessions for sessionId: ${sessionId}`);
    const enrollments = await prisma.enrollment.findMany({
      where: { courseId: parseInt(courseId) },
    });
    for (const enrollment of enrollments) {
      if (enrollment.completedSessions.includes(parseInt(sessionId))) {
        await prisma.enrollment.update({
          where: { id: enrollment.id },
          data: {
            completedSessions: enrollment.completedSessions.filter(
              (id) => id !== parseInt(sessionId)
            ),
          },
        });
        console.log(`Removed sessionId ${sessionId} from Enrollment id ${enrollment.id}`);
      }
    }

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