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

export const getProgress = async (req, res, next) => {
  try {
    const progress = await enrollmentService.getProgress(req.params.id, req.user);
    sendResponse(res, 200, progress);
  } catch (error) {
    next(error);
  }
};

export const markSessionComplete = async (req, res, next) => {
  try {
    const { sessionId } = req.body;
    const enrollment = await enrollmentService.markSessionComplete(req.params.id, sessionId, req.user);
    sendResponse(res, 200, enrollment);
  } catch (error) {
    next(error);
  }
};