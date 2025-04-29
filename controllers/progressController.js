import * as progressService from '../services/progressService.js';
import { sendResponse } from '../utils/response.js';

export const createProgress = async (req, res, next) => {
  try {
    const progress = await progressService.createProgress(req.body, req.user);
    sendResponse(res, 201, progress);
  } catch (err) {
    next(err);
  }
};

export const updateProgress = async (req, res, next) => {
  try {
    const progress = await progressService.updateProgress(Number(req.params.id), req.body, req.user);
    sendResponse(res, 200, progress);
  } catch (err) {
    next(err);
  }
};
export const getCourseProgress = async (req, res, next) => {
    try {
      const { courseId } = req.params;
      const progress = await progressService.getCourseProgress(req.user.id, Number(courseId));
      sendResponse(res, 200, progress);
    } catch (err) {
      next(err);
    }
  };

export const getUserProgress = async (req, res, next) => {
  try {
    const progress = await progressService.getUserProgress(req.user.id, Number(req.params.sessionId));
    if (!progress) return sendResponse(res, 404, null, 'Progress not found');
    sendResponse(res, 200, progress);
  } catch (err) {
    next(err);
  }
};

export const deleteProgress = async (req, res, next) => {
  try {
    await progressService.deleteProgress(Number(req.params.id), req.user);
    sendResponse(res, 200, null, 'Progress deleted');
  } catch (err) {
    next(err);
  }
};
