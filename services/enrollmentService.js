// import { Enrollment, Course, Session } from '../models/index.js';
// import { AppError } from '../utils/errorHandler.js';

// export const createEnrollment = async (userId, courseId) => {
//   const course = await Course.findUnique({ where: { id: parseInt(courseId) } });
//   if (!course) throw new AppError('Course not found', 404);
//   if (!course.isPublished) throw new AppError('Course is not published', 403);
//   const existingEnrollment = await Enrollment.findFirst({
//     where: { userId: parseInt(userId), courseId: parseInt(courseId) },
//   });
//   if (existingEnrollment) throw new AppError('User already enrolled in this course', 400);
//   return await Enrollment.create({
//     data: {
//       userId: parseInt(userId),
//       courseId: parseInt(courseId),
//       completedSessions: [],
//     },
//   });
// };

// export const getEnrollments = async (user, query = {}) => {
//   const { courseId } = query;

//   if (courseId) {
//     // Verify the course exists
//     const course = await Course.findUnique({
//       where: { id: parseInt(courseId) },
//     });
//     if (!course) throw new AppError('Course not found', 404);

//     // For instructors, check if they own the course
//     if (user.role === 'Instructor') {
//       if (course.instructorId !== user.id) {
//         throw new AppError('Unauthorized: You are not the instructor of this course', 403);
//       }
//       return await Enrollment.findMany({
//         where: { courseId: parseInt(courseId) },
//         include: {
//           user: {
//             select: {
//               id: true,
//               name: true,
//               email: true,
//             },
//           },
//           course: {
//             include: { category: true },
//           },
//         },
//         orderBy: { createdAt: 'desc' },
//       });
//     }

//     // For students, return their own enrollments for the course
//     if (user.role === 'Student') {
//       return await Enrollment.findMany({
//         where: {
//           userId: user.id,
//           courseId: parseInt(courseId),
//         },
//         include: { course: { include: { category: true } } },
//       });
//     }

//     // For other roles (e.g., admin), return all enrollments for the course
//     return await Enrollment.findMany({
//       where: { courseId: parseInt(courseId) },
//       include: {
//         user: {
//           select: {
//             id: true,
//             name: true,
//             email: true,
//           },
//         },
//         course: { include: { category: true } },
//       },
//       orderBy: { createdAt: 'desc' },
//     });
//   }

//   // Without courseId, handle based on user role
//   if (user.role === 'Student') {
//     return await Enrollment.findMany({
//       where: { userId: user.id },
//       include: { course: { include: { category: true } } },
//     });
//   }

//   // For instructors or admins, return all enrollments (or restrict further if needed)
//   return await Enrollment.findMany({
//     include: {
//       user: {
//         select: {
//           id: true,
//           name: true,
//           email: true,
//         },
//       },
//       course: { include: { category: true } },
//     },
//   });
// };

// export const getEnrollmentById = async (enrollmentId, user) => {
//   const enrollment = await Enrollment.findUnique({
//     where: { id: parseInt(enrollmentId) },
//     include: { course: { include: { category: true } }, user: true },
//   });
//   if (!enrollment) throw new AppError('Enrollment not found', 404);
//   if (enrollment.userId !== user.id && user.role !== 'Instructor') {
//     throw new AppError('Unauthorized', 403);
//   }
//   return enrollment;
// };

// export const deleteEnrollment = async (enrollmentId, user) => {
//   const enrollment = await Enrollment.findUnique({ where: { id: parseInt(enrollmentId) } });
//   if (!enrollment) throw new AppError('Enrollment not found', 404);
//   if (enrollment.userId !== user.id && user.role !== 'Instructor') {
//     throw new AppError('Unauthorized', 403);
//   }
//   await Enrollment.delete({ where: { id: parseInt(enrollmentId) } });
// };

// export const getProgress = async (enrollmentId, user) => {
//   const enrollment = await Enrollment.findUnique({
//     where: { id: parseInt(enrollmentId) },
//     include: { course: { include: { sessions: true } } },
//   });
//   if (!enrollment) throw new AppError('Enrollment not found', 404);
//   if (enrollment.userId !== user.id && user.role !== 'Instructor') {
//     throw new AppError('Unauthorized', 403);
//   }
//   const totalSessions = enrollment.course.sessions.length;
//   const completedSessions = enrollment.completedSessions.length;
//   const progress = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;
//   return { completedSessions: enrollment.completedSessions, totalSessions, progress };
// };

// export const markSessionComplete = async (enrollmentId, sessionId, user) => {
//   const enrollment = await Enrollment.findUnique({
//     where: { id: parseInt(enrollmentId) },
//     include: { course: { include: { sessions: true } } },
//   });
//   if (!enrollment) throw new AppError('Enrollment not found', 404);
//   if (enrollment.userId !== user.id) throw new AppError('Unauthorized', 403);
//   const sessionExists = enrollment.course.sessions.some(s => s.id === parseInt(sessionId));
//   if (!sessionExists) throw new AppError('Session not found in course', 404);
//   if (enrollment.completedSessions.includes(parseInt(sessionId))) {
//     throw new AppError('Session already completed', 400);
//   }
//   return await Enrollment.update({
//     where: { id: parseInt(enrollmentId) },
//     data: { completedSessions: { push: parseInt(sessionId) } },
//   });
// };

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
    // Verify the course exists
    const course = await Course.findUnique({
      where: { id: parseInt(courseId) },
    });
    if (!course) throw new AppError('Course not found', 404);

    // Instructors: Only their own courses
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

    // Students: Only their own enrollments
    if (user.role === 'Student') {
      return await Enrollment.findMany({
        where: {
          userId: user.id,
          courseId: parseInt(courseId),
        },
        include: { course: true },
      });
    }

    // Other roles (e.g., admin): All enrollments for the course
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

  // No courseId: Return enrollments based on user role
  if (user.role === 'Student') {
    return await Enrollment.findMany({
      where: { userId: user.id },
      include: { course: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Instructors: Only enrollments for their courses
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

  // Other roles: All enrollments
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
};