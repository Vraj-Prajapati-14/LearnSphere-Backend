import { findUserByEmail, createUser } from '../models/user.model.js';
import { hashPassword, comparePassword } from '../utils/bcrypt.js';
import { generateAccessToken, generateRefreshToken } from '../config/jwt.js';
import prisma from '../config/database.js';

export const register = async ({ name, email, password, role }) => {
  const existingUser = await findUserByEmail(email);
  if (existingUser) throw new Error('Email already exists');
  const hashedPassword = await hashPassword(password);
  const user = await createUser({ name, email, password: hashedPassword, role });

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return { user, accessToken, refreshToken };
};

export const login = async ({ email, password }) => {
  const user = await findUserByEmail(email);
  if (!user) throw new Error('Invalid credentials');
  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) throw new Error('Invalid credentials');

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  console.log('Stored refresh token:', refreshToken);
  return { user, accessToken, refreshToken };
};