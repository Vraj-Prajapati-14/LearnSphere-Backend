import { register, login } from '../services/authService.js';
import prisma from '../config/database.js';
import { sendResponse } from '../utils/response.js';
import { verifyRefreshToken, generateAccessToken, generateRefreshToken } from '../config/jwt.js';

const setCookies = (res, user, accessToken, refreshToken) => {
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
  // Only set user cookie if it doesn't exist or needs update
  if (!res.get('user') || JSON.parse(res.get('user') || '{}').id !== user.id) {
    res.cookie('user', JSON.stringify({
      id: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
    }), {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      secure: isProduction,
      sameSite: isProduction ? 'Strict' : 'Lax',
    });
  }
};

export const registerController = async (req, res) => {
  try {
    const { user, accessToken, refreshToken } = await register(req.body);
    setCookies(res, user, accessToken, refreshToken);
    sendResponse(res, 201, {
      user: { id: user.id, role: user.role, name: user.name, email: user.email },
      token: accessToken,
    });
  } catch (error) {
    sendResponse(res, 400, null, error.message);
  }
};

export const loginController = async (req, res) => {
  try {
    const { user, accessToken, refreshToken } = await login(req.body);
    setCookies(res, user, accessToken, refreshToken);
    sendResponse(res, 200, {
      user: { id: user.id, role: user.role, name: user.name, email: user.email },
      token: accessToken,
    });
  } catch (error) {
    sendResponse(res, 401, null, error.message);
  }
};

export const validateToken = async (req, res) => {
  try {
    const user = req.user;
    const token = req.cookies.token;
    sendResponse(res, 200, {
      user: { id: user.id, role: user.role, name: user.name, email: user.email },
      token,
    });
  } catch (error) {
    sendResponse(res, 401, null, 'Invalid token');
  }
};

export const refreshTokenController = async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    res.clearCookie('user');
    res.clearCookie('token');
    return sendResponse(res, 401, null, 'No refresh token provided');
  }

  try {
    const payload = verifyRefreshToken(refreshToken);
    const storedToken = await prisma.refreshToken.findFirst({
      where: { userId: payload.id },
    });

    if (!storedToken || storedToken.token !== refreshToken) {
      res.clearCookie('user');
      res.clearCookie('token');
      res.clearCookie('refreshToken');
      if (storedToken) {
        await prisma.refreshToken.delete({ where: { id: storedToken.id } });
      }
      return sendResponse(res, 403, null, 'Invalid refresh token');
    }

    if (storedToken.expiresAt < new Date()) {
      res.clearCookie('user');
      res.clearCookie('token');
      res.clearCookie('refreshToken');
      await prisma.refreshToken.delete({ where: { id: storedToken.id } });
      return sendResponse(res, 403, null, 'Refresh token has expired');
    }

    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user) {
      res.clearCookie('user');
      res.clearCookie('token');
      res.clearCookie('refreshToken');
      await prisma.refreshToken.delete({ where: { id: storedToken.id } });
      return sendResponse(res, 403, null, 'User not found');
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    // Update the existing refresh token instead of creating a new one
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: {
        token: newRefreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    setCookies(res, user, newAccessToken, newRefreshToken);

    sendResponse(res, 200, {
      user: { id: user.id, role: user.role, name: user.name, email: user.email },
      token: newAccessToken,
    });
  } catch (err) {
    res.clearCookie('user');
    res.clearCookie('token');
    res.clearCookie('refreshToken');
    await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
    return sendResponse(res, 403, null, 'Invalid refresh token');
  }
};

export const logoutController = async (req, res) => {
  const { refreshToken } = req.cookies;
  
  if (refreshToken) {
    await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
  }

  res.clearCookie('user');
  res.clearCookie('token');
  res.clearCookie('refreshToken');
  
  sendResponse(res, 200, null, 'Logged out successfully');
};