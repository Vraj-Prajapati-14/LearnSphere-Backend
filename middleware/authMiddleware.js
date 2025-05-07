import jwt from 'jsonwebtoken';
import { sendResponse } from '../utils/response.js';
import env from '../config/env.js';

export const authMiddleware = (roles = []) => async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return sendResponse(res, 401, null, 'No token provided');
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.user = decoded;

    if (roles.length && !roles.includes(decoded.role)) {
      return sendResponse(res, 403, null, 'Access denied: insufficient permissions');
    }

    next();
  } catch (error) {
    return sendResponse(res, 401, null, 'Invalid token');
  }
};