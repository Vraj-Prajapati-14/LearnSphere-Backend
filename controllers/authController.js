import { register, login } from '../services/authService.js';
import prisma from '../config/database.js';
import { sendResponse } from '../utils/response.js';
import { verifyRefreshToken, generateAccessToken, generateRefreshToken } from '../config/jwt.js';

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
    maxAge: 15 * 60 * 1000, // 15 minutes
  });
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'Strict' : 'Lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
  res.cookie('user', JSON.stringify({
    id: user.id,
    role: user.role,
    name: user.name,
    email: user.email,
  }), {
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const registerController = async (req, res) => {
  try {
    const { user, accessToken, refreshToken } = await register(req.body);
    setCookies(res, user, accessToken, refreshToken);
    sendResponse(res, 201, {
      user: {
        id: user.id,
        role: user.role,
        name: user.name,
        email: user.email,
      },
      token: accessToken,
    });
  } catch (error) {
    console.error('Register error:', error.message);
    sendResponse(res, 400, null, error.message);
  }
};

export const loginController = async (req, res) => {
  console.log('Login request body:', req.body);
  try {
    const { user, accessToken, refreshToken } = await login(req.body);
    setCookies(res, user, accessToken, refreshToken);
    sendResponse(res, 200, {
      user: {
        id: user.id,
        role: user.role,
        name: user.name,
        email: user.email,
      },
      token: accessToken,
    });
  } catch (error) {
    console.error('Login error:', error.message);
    sendResponse(res, 401, null, error.message);
  }
};

export const validateToken = async (req, res) => {
  try {
    const user = req.user; // Set by authMiddleware
    const token = req.cookies.token;
    console.log('validateToken - Validating user:', { userId: user.id });
    sendResponse(res, 200, {
      user: {
        id: user.id,
        role: user.role,
        name: user.name,
        email: user.email,
      },
      token,
    });
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
    return sendResponse(res, 401, null, 'No refresh token provided');
  }

  try {
    const payload = verifyRefreshToken(refreshToken);
    console.log('Refresh token payload:', payload);

    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });
    console.log('Stored token:', storedToken);

    if (!storedToken) {
      console.log('Refresh token not found in database');
      return sendResponse(res, 403, null, 'Refresh token not found');
    }

    if (storedToken.expiresAt < new Date()) {
      console.log('Refresh token expired:', storedToken.expiresAt);
      await prisma.refreshToken.delete({ where: { token: refreshToken } });
      return sendResponse(res, 403, null, 'Refresh token has expired');
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

    setCookies(res, user, newAccessToken, newRefreshToken);

    console.log('Tokens refreshed:', { newAccessToken, newRefreshToken });
    sendResponse(res, 200, {
      user: {
        id: user.id,
        role: user.role,
        name: user.name,
        email: user.email,
      },
      token: newAccessToken,
    });
  } catch (err) {
    console.error('Refresh token error:', err.message, err.stack);
    return sendResponse(res, 403, null, `Invalid refresh token: ${err.message}`);
  }
};