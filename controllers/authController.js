import { register, login } from '../services/authService.js';
import prisma from '../config/database.js';
import { sendResponse } from '../utils/response.js';
import { verifyRefreshToken } from '../config/jwt.js'; // Make sure this import exists
import { generateAccessToken,generateRefreshToken } from '../config/jwt.js';
import { log } from 'console';

const setCookies = (res, user, accessToken, refreshToken) => {
  console.log('Setting cookies:', { accessToken, refreshToken, user });
  if (!accessToken || !refreshToken) {
    throw new Error('Tokens are undefined');
  }
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('token', accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'Strict' : 'Lax',
    maxAge: 15 * 60 * 1000,
  });
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'Strict' : 'Lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.cookie('user', JSON.stringify({ id: user.id, role: user.role }), {
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};
export const registerController = async (req, res) => {
  try {
    const { user, accessToken, refreshToken } = await register(req.body);
    setCookies(res, user, accessToken, refreshToken);
    sendResponse(res, 201, { user });
  } catch (error) {
    sendResponse(res, 400, null, error.message);
  }
};



export const loginController = async (req, res) => {
  try {
    const { user, accessToken, refreshToken } = await login(req.body);
    setCookies(res, user, accessToken, refreshToken);
    sendResponse(res, 200, { user });
  } catch (error) {
    sendResponse(res, 401, null, error.message);
  }
};

export const validateToken = async (req, res) => {
  try {
    const user = req.user; // Set by authMiddleware
    const token = req.cookies.token; // Assumes token is in httpOnly cookie
    console.log('validateToken - Validating user:', { userId: user.id });
    sendResponse(res, 200, { user, token });
  } catch (error) {
    console.error('validateToken - Error:', {
      message: error.message,
      stack: error.stack,
    });
    sendResponse(res, 401, null, 'Invalid token');
  }
};
export const refreshTokenController = async (req, res) => {
  const { refreshToken } = req.cookies;
  console.log('Received refresh token:', refreshToken);

  if (!refreshToken) {
    console.log('No refresh token provided');
    return sendResponse(res, 401, null, 'No refresh token');
  }

  try {
    const payload = verifyRefreshToken(refreshToken);
    console.log('Refresh token payload:', payload);

    const storedToken = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
    console.log('Stored token:', storedToken);

    if (!storedToken) {
      console.log('Refresh token not found in database');
      return sendResponse(res, 403, null, 'Refresh token not found');
    }

    if (storedToken.expiresAt < new Date()) {
      console.log('Refresh token expired:', storedToken.expiresAt);
      return sendResponse(res, 403, null, 'Refresh token expired');
    }

    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user) {
      console.log('User not found for ID:', payload.id);
      return sendResponse(res, 403, null, 'User not found');
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    await prisma.refreshToken.update({
      where: { token: refreshToken },
      data: {
        token: newRefreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('token', newAccessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'Strict' : 'Lax',
      maxAge: 15 * 60 * 1000,
    });
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'Strict' : 'Lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    console.log('Tokens refreshed:', { newAccessToken, newRefreshToken });
    sendResponse(res, 200, { message: 'Refreshed' });
  } catch (err) {
    console.error('Refresh token error:', err.message);
    return sendResponse(res, 403, null, 'Invalid refresh token');
  }
};