import prisma from '../config/database.js';
import { AppError } from '../utils/errorHandler.js';


export const getCourseProgress = async (userId, courseId) => {
    const progress = await prisma.progress.findMany({
      where: {
        userId,
        session: {
          courseId,  
        },
      },
      include: {
        session: true, 
      },
    });
  
    const totalSessions = progress.length;
    const completedSessions = progress.filter(p => p.isCompleted).length;
    const overallProgress = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;
  
    // Fetching all sessions for the course
    const sessions = await prisma.session.findMany({
      where: {
        courseId,  // Filter sessions by courseId
      },
    });
  
    return {
      overallProgress,
      progress: progress.map(p => ({
        sessionId: p.sessionId,
        isCompleted: p.isCompleted,
      })),
      sessions, // Add all sessions to the response
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
