import prisma from '../config/database.js';
import { AppError } from '../utils/errorHandler.js';


export const allcourse = async (user, { page = 1, limit = 10 } = {}) => {
  try {
    const skip = (page - 1) * limit;

    if (!user) {
      const [courses, total] = await Promise.all([
        prisma.course.findMany({
          where: { isPublished: true },
          skip,
          take: limit,
          include: {
            sessions: { select: { id: true, title: true } },
            category: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.course.count({ where: { isPublished: true } }),
      ]);

      console.log('Unauthenticated allcourse:', { courses: courses.length, total, page, limit });

      return {
        enrolledCourses: [],
        remainingCourses: courses,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
        },
      };
    }

    const enrolledCourses = await prisma.enrollment.findMany({
      where: { userId: user.id },
      select: { courseId: true },
    });
    const enrolledIds = enrolledCourses.map((e) => e.courseId);
    const [remainingCourses, remainingTotal] = await Promise.all([
      prisma.course.findMany({
        where: {
          id: { notIn: enrolledIds },
          isPublished: true,
        },
        skip,
        take: limit,
        include: {
          sessions: { select: { id: true, title: true } },
          category: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.course.count({
        where: {
          id: { notIn: enrolledIds },
          isPublished: true,
        },
      }),
    ]);

    const [enrolledCoursesData, enrolledTotal] = await Promise.all([
      prisma.course.findMany({
        where: {
          id: { in: enrolledIds },
          isPublished: true,
        },
        skip,
        take: limit,
        include: {
          sessions: { select: { id: true, title: true } },
          category: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.course.count({
        where: {
          id: { in: enrolledIds },
          isPublished: true,
        },
      }),
    ]);

    const total = remainingTotal + enrolledTotal;

    console.log('Authenticated allcourse:', {
      enrolled: enrolledCoursesData.length,
      remaining: remainingCourses.length,
      total,
      page,
      limit,
    });

    return {
      enrolledCourses: enrolledCoursesData,
      remainingCourses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error('Error in allcourse:', {
      message: error.message,
      stack: error.stack,
    });
    throw new AppError('Failed to fetch courses', 500);
  }
};

export const getCourseDetails = async (id) => {
  try {
    const course = await prisma.course.findUnique({
      where: { id: Number(id) },
      include: {
        sessions: {
          select: {
            id: true,
            title: true,
            youtubeLink: true,
            explanation: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!course) {
      throw new AppError('Course not found', 404);
    }

    return course;
  } catch (error) {
    console.error('Error in getCourseDetails:', error);
    if (error instanceof AppError) throw error;
    throw new AppError('Internal Server Error', 500);
  }
};


export const getCourses = async ({ instructorId }, user, { page = 1, limit = 10 } = {}) => {
  try {
    const skip = (page - 1) * limit;
    let where = {};

    if (user && user.role === 'Instructor') {
      if (instructorId && parseInt(instructorId) !== user.id) {
        throw new AppError('Unauthorized', 403);
      }
      where.instructorId = user.id;
    } else if (user && user.role === 'Student') {
      const enrolledCourses = await prisma.enrollment.findMany({
        where: { userId: user.id },
        select: { courseId: true },
      });
      const enrolledIds = enrolledCourses.map((e) => e.courseId);
      where = {
        isPublished: true,
        id: { notIn: enrolledIds },
      };
    } else {
      where.isPublished = true;
    }

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        skip,
        take: limit,
        include: {
          sessions: { select: { id: true, title: true } },
          category: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.course.count({ where }),
    ]);

    console.log('getCourses:', { courses: courses.length, total, page, limit });

    return {
      courses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error('Error in getCourses:', {
      message: error.message,
      stack: error.stack,
    });
    if (error instanceof AppError) throw error;
    throw new AppError('Internal Server Error', 500);
  }
};

export const getCourseById = async (id, user) => {
  try {
    const course = await prisma.course.findUnique({
      where: { id: Number(id) },
      include: {
        sessions: true,
        enrollments: true,
      },
    });

    if (!course) {
      throw new AppError('Course not found', 404);
    }

    return course;
  } catch (error) {
    console.error('Error in getCourseById:', error);
    if (error instanceof AppError) throw error;
    throw new AppError('Internal Server Error', 500);
  }
};

export const createCourse = async (courseData, user) => {
  try {
    return await prisma.course.create({
      data: {
        title: courseData.title,
        description: courseData.description,
        image: courseData.image || null,
        categoryId: courseData.categoryId,
        instructorId: user.id,
        isPublished: courseData.isPublished || false,
      },
    });
  } catch (error) {
    console.error('Error in createCourse:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new AppError('Course with this title already exists', 400);
    }
    throw new AppError('Failed to create course', 500);
  }
};

export const updateCourse = async (id, courseData, user) => {
  try {
    const course = await prisma.course.findUnique({
      where: { id: parseInt(id) },
    });

    if (!course) {
      throw new AppError('Course not found', 404);
    }

    if (course.instructorId !== user.id) {
      throw new AppError('Unauthorized', 403);
    }

    return await prisma.course.update({
      where: { id: parseInt(id) },
      data: {
        title: courseData.title,
        description: courseData.description,
        image: courseData.image || course.image,
        categoryId: courseData.categoryId || course.categoryId,
        isPublished: courseData.isPublished,
      },
    });
  } catch (error) {
    console.error('Error in updateCourse:', error);
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to update course', 500);
  }
};

export const deleteCourse = async (id, user) => {
  const courseId = parseInt(id);

  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });

  if (!course) {
    throw new AppError('Course not found', 404);
  }

  if (course.instructorId !== user.id) {
    throw new AppError('Unauthorized: You are not the instructor of this course', 403);
  }

  try {
    await prisma.$transaction([
      prisma.reviewComment.deleteMany({
        where: {
          review: {
            courseId,
          },
        },
      }),
      prisma.review.deleteMany({
        where: { courseId },
      }),
      prisma.progress.deleteMany({
        where: {
          session: {
            courseId,
          },
        },
      }),
      prisma.enrollment.deleteMany({
        where: { courseId },
      }),
      prisma.session.deleteMany({
        where: { courseId },
      }),
      prisma.course.delete({
        where: { id: courseId },
      }),
    ]);

    console.log(`Successfully deleted course id: ${courseId}`);
    return { message: 'Course deleted successfully' };
  } catch (error) {
    console.error('Detailed error in deleteCourse:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack,
    });
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2003') {
        throw new AppError('Cannot delete course due to foreign key constraints', 400);
      }
      if (error.code === 'P2025') {
        throw new AppError('Course not found', 404);
      }
    }
    throw new AppError('Failed to delete course', 500);
  }
};