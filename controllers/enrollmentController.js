import * as enrollmentService from '../services/enrollmentService.js';
import { sendResponse } from '../utils/response.js';

export const createEnrollment = async (req, res, next) => {
  try {
    const { courseId } = req.body;
    const enrollment = await enrollmentService.createEnrollment(req.user.id, courseId);
    sendResponse(res, 201, enrollment);
  } catch (error) {
    next(error);
  }
};

export const getEnrollments = async (req, res, next) => {
  try {
    const enrollments = await enrollmentService.getEnrollments(req.user, req.query);
    sendResponse(res, 200, enrollments);
  } catch (error) {
    next(error);
  }
};

export const getEnrollmentById = async (req, res, next) => {
  try {
    const enrollment = await enrollmentService.getEnrollmentById(req.params.id, req.user);
    sendResponse(res, 200, enrollment);
  } catch (error) {
    next(error);
  }
};

export const deleteEnrollment = async (req, res, next) => {
  try {
    await enrollmentService.deleteEnrollment(req.params.id, req.user);
    sendResponse(res, 200, null, 'Enrollment deleted');
  } catch (error) {
    next(error);
  }
};