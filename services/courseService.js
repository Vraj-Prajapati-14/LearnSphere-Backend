// import { Course } from '../models/course.model.js';
// import { AppError } from '../utils/errorHandler.js';
// import prisma from '../config/database.js';


// export const getCourses = async ({ instructorId }, user) => {
//   if (instructorId) {
//     if (parseInt(instructorId) !== user.id) {
//       throw new AppError('Unauthorized', 403);
//     }
//     return await Course.findMany({
//       where: { instructorId: parseInt(instructorId) },
//       include: { sessions: true },
//     });
//   }
//   return await Course.findMany({
//     where: { isPublished: true },
//     include: { sessions: true },
//   });
// };

// export const getCourseById = async (id, user) => {
//   const course = await prisma.course.findUnique({
//     where: { id: Number(id) },
//     include: {
//       sessions: true, // include related sessions if needed
//       enrollments: true, // or anything else you need
//     },
//   });
//   return course;
// };
// export const createCourse = async (courseData, user) => {
//   return await Course.create({
//     data: {
//       title: courseData.title,
//       description: courseData.description,
//       category:courseData.category,
//       isPublished: courseData.isPublished || false,
//       instructorId: user.id,
//     },
//     include: { sessions: true },
//   });
// };

// export const updateCourse = async (id, courseData, user) => {
//   const course = await Course.findUnique({ where: { id: parseInt(id) } });
//   if (!course) {
//     throw new AppError('Course not found', 404);
//   }
//   if (course.instructorId !== user.id) {
//     throw new AppError('Unauthorized', 403);
//   }
//   return await Course.update({
//     where: { id: parseInt(id) },
//     data: {
//       title: courseData.title,
//       description: courseData.description,
//       category:courseData.category,
//       isPublished: courseData.isPublished,
//     },
//     include: { sessions: true },
//   });
// };

// export const deleteCourse = async (id, user) => {
//   const course = await Course.findUnique({ where: { id: parseInt(id) } });
//   if (!course) {
//     throw new AppError('Course not found', 404);
//   }
//   if (course.instructorId !== user.id) {
//     throw new AppError('Unauthorized', 403);
//   }
//   await Course.delete({ where: { id: parseInt(id) } });
// };
import prisma from '../config/database.js';
import { AppError } from '../utils/errorHandler.js';

export const allcourse=async(user)=>{
  if (!user) {
    return {
      enrolledCourses: [], // No enrolled courses for unauthenticated users
      remainingCourses: await prisma.course.findMany({
        include: { sessions: true ,
          category:true
        },
      }),
    };
  }
}

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
export const getCourses = async ({ instructorId }, user) => {
  try {
    if (user.role === 'Instructor') {
      if (instructorId && parseInt(instructorId) !== user.id) {
        throw new AppError('Unauthorized', 403);
      }

      return await prisma.course.findMany({
        where: { instructorId: user.id },
        include: { sessions: true },
      });
    }

    if (user.role === 'Student') {
      // Get IDs of courses the student is already enrolled in
      const enrolledCourses = await prisma.enrollment.findMany({
        where: { userId: user.id },  // Use userId instead of studentId
        select: { courseId: true },
      });

      const enrolledIds = enrolledCourses.map((e) => e.courseId);

      // Return published courses NOT already enrolled in
      return await prisma.course.findMany({
        where: {
          isPublished: true,
          id: { notIn: enrolledIds },
        },
        include: { sessions: true },
      });
    }

    // Fallback for unauthenticated or unknown roles
    return await prisma.course.findMany({
      where: { isPublished: true },
      include: { sessions: true },
    });
  } catch (error) {
    console.error('Error in getCourses:', error);
    throw new AppError('Internal Server Error', 500);
  }
};


export const getCourseById = async (id, user) => {
  const course = await prisma.course.findUnique({
    where: { id: Number(id) },
    include: {
      // sessions: true,
      enrollments: true,
    },
  });

  if (!course) {
    throw new AppError('Course not found', 404);
  }

  return course;
};

export const createCourse = async (courseData, user) => {
  // No need to manually check category if you have categoryId
  return await prisma.course.create({
    data: {
      title: courseData.title,
      description: courseData.description,
      image: courseData.image || null,
      categoryId: courseData.categoryId, // <-- categoryId coming from dropdown (integer)
      instructorId: user.id,
      isPublished: courseData.isPublished || false,
    },
    // include: { sessions: true },
  });
};

export const updateCourse = async (id, courseData, user) => {
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
    // include: { sessions: true },
  });
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
    throw new AppError('Unauthorized', 403);
  }

  // Delete reviews related to the course (if applicable)
  await prisma.review.deleteMany({
    where: { courseId },
  });

  // Delete progress tracking related to enrollments (if applicable)
  await prisma.progress.deleteMany({
    where: {
      enrollment: {
        courseId,
      },
    },
  });

  // Delete enrollments
  await prisma.enrollment.deleteMany({
    where: { courseId },
  });

  // Delete sessions
  await prisma.session.deleteMany({
    where: { courseId },
  });

  // Finally delete the course
  await prisma.course.delete({
    where: { id: courseId },
  });
};