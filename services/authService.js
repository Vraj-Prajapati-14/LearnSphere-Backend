import { findUserByEmail, createUser } from '../models/user.model.js';
import { hashPassword, comparePassword } from '../utils/bcrypt.js';
import { generateToken } from '../config/jwt.js';

export const register = async ({ name,email, password, role }) => {
  const existingUser = await findUserByEmail(email);
  if (existingUser) throw new Error('Email already exists');
  const hashedPassword = await hashPassword(password);
  const user = await createUser({ name,email, password: hashedPassword, role });
  return { user, token: generateToken(user) };
};

export const login = async ({ email, password }) => {
  const user = await findUserByEmail(email);
  if (!user) throw new Error('Invalid credentials');
  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) throw new Error('Invalid credentials');
  return { user, token: generateToken(user) };
};