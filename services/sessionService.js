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

  await Session.delete({  // Use Session.delete
    where: { id: parseInt(sessionId) },
  });
};
