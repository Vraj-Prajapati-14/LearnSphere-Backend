import jwt from 'jsonwebtoken';
import env from './env.js';

export const generateAccessToken = (user) => {
  try {
    console.log('User:', user, 'JWT_SECRET:', env.JWT_SECRET);
    if (!user.id || !user.role || !env.JWT_SECRET) {
      throw new Error('Missing user data or JWT_SECRET');
    }
    const token = jwt.sign({ id: user.id, role: user.role }, env.JWT_SECRET, { expiresIn: '10s' });
    console.log('Access Token:', token);
    return token;
  } catch (error) {
    console.error('Error generating access token:', error);
    throw error;
  }
};

export const generateRefreshToken = (user) => {
  try {
    console.log('User:', user, 'JWT_REFRESH_SECRET:', env.JWT_REFRESH_SECRET);
    if (!user.id || !env.JWT_REFRESH_SECRET) {
      throw new Error('Missing user data or JWT_REFRESH_SECRET');
    }
    const token = jwt.sign({ id: user.id }, env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
    console.log('Refresh Token:', token);
    return token;
  } catch (error) {
    console.error('Error generating refresh token:', error);
    throw error;
  }
};

export const verifyAccessToken = (token) => {
  return jwt.verify(token, env.JWT_SECRET);
};

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET);
};
