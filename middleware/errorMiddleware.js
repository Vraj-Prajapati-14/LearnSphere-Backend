// backend/middleware/errorMiddleware.js
import { logger } from '../utils/logger.js';
import { AppError } from '../utils/errorHandler.js';
import { sendResponse } from '../utils/response.js';
import multer from 'multer';

export const errorMiddleware = (err, req, res, next) => {
  // Log the error
  logger.error(err.message, { stack: err.stack, path: req.path, method: req.method });

  // Handle Multer errors
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return sendResponse(res, 400, null, 'File size exceeds 5MB limit');
    }
    return sendResponse(res, 400, null, `Multer error: ${err.message}`);
  }

  // Handle Joi validation errors
  if (err.isJoi) {
    const message = err.details.map((detail) => detail.message).join(', ');
    return sendResponse(res, 400, null, message);
  }

  // Handle custom AppError
  if (err instanceof AppError) {
    return sendResponse(res, err.statusCode, null, err.message);
  }

  // Handle unexpected errors
  sendResponse(res, 500, null, 'Internal server error');
};