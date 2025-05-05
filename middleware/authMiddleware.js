import jwt from 'jsonwebtoken';
import { sendResponse } from '../utils/response.js';
import env from '../config/env.js';

export const authMiddleware = (roles) => async (req, res, next) => {
  const token = req.cookies.token;
  console.log('authMiddleware - Token:', { cookieToken: token });

  if (!token) {
    console.log('authMiddleware - No token provided');
    return sendResponse(res, 401, null, 'No token provided');
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    console.log('authMiddleware - Decoded token:', decoded);
    req.user = decoded;

    if (roles && !roles.includes(decoded.role)) {
      console.log('authMiddleware - Unauthorized role:', decoded.role);
      return sendResponse(res, 403, null, 'Unauthorized role');
    }

    next();
  } catch (error) {
    console.error('authMiddleware - Token verification failed:', error.message);
    return sendResponse(res, 401, null, 'Invalid token');
  }
};