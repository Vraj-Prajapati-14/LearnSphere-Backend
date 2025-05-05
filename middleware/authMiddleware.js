import jwt from 'jsonwebtoken';
import { sendResponse } from '../utils/response.js';
import env from '../config/env.js';

export const authMiddleware = (roles) => async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return sendResponse(res, 401, null, 'No token provided');
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.user = decoded;

    if (roles && !roles.includes(decoded.role)) {
      return sendResponse(res, 403, null, 'Unauthorized role');
    }
    next();
  } catch (error) {
    return sendResponse(res, 401, null, 'Invalid token');
  }
};