import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import { sendResponse } from '../utils/response.js';

export const authMiddleware = (roles = []) => (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return sendResponse(res, 401, null, 'No token provided');
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.user = decoded;
    if (roles.length && !roles.includes(decoded.role)) {
      return sendResponse(res, 403, null, 'Forbidden');
    }
    next();
  } catch (error) {
    return sendResponse(res, 401, null, 'Invalid token');
  }
};