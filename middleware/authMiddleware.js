import jwt from 'jsonwebtoken';
import { sendResponse } from '../utils/response.js';
import env from '../config/env.js';

export const authMiddleware = (roles) => async (req, res, next) => {
  // Skip middleware for login, register, and refresh-token routes
  if (['/api/auth/login', '/api/auth/register', '/api/auth/refresh-token', '/api/auth/logout'].includes(req.path)) {
    return next();
  }

  const token = req.cookies.token;

  if (!token) {
    res.clearCookie('user');
    res.clearCookie('token');
    res.clearCookie('refreshToken');
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
    res.clearCookie('user');
    res.clearCookie('token');
    res.clearCookie('refreshToken');
    return sendResponse(res, 401, null, 'Invalid token');
  }
};