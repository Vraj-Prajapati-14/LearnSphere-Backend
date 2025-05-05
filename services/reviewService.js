import prisma from '../config/database.js';
import { AppError } from '../utils/errorHandler.js';

export const addReview = async (data, user) => {
  const { courseId, rating, text } = data;

  const enrollment = await prisma.enrollment.findFirst({
    where: {
    courseId: Number(courseId),
      userId: user.id,
    },
  });

  if (!enrollment) throw new AppError('You must be enrolled to review this course.', 403);

  const existing = await prisma.review.findFirst({
    where: { userId: user.id, courseId },
  });

  if (existing) throw new AppError('You have already reviewed this course.', 400);

  return await prisma.review.create({
    data: {
      userId: user.id,
      courseId,
      rating,
      text,
    },
  });
};

export const addComment = async (data, user) => {
  const { reviewId, text } = data;

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: { course: true },
  });

  if (!review) throw new AppError('Review not found', 404);

  const isStudent = await prisma.enrollment.findFirst({
    where: {
      courseId: review.courseId,
      userId: user.id,
    },
  });

  const isInstructor = review.course.instructorId === user.id;

  if (!isStudent && !isInstructor)
    throw new AppError('Only enrolled students or instructors can comment.', 403);

  return await prisma.reviewComment.create({
    data: {
      reviewId,
      userId: user.id,
      text,
    },
  });
};

export const getCourseReviews = async (courseId) => {
  return await prisma.review.findMany({
    where: { courseId: Number(courseId) },
    include: {
      user: { select: { id: true, name: true } },
      comments: {
        include: { user: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};
