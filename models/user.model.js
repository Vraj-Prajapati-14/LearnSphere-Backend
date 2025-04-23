import prisma from '../config/database.js';

export const findUserByEmail = async (email) => {
  return await prisma.user.findUnique({ where: { email } });
};

export const createUser = async (userData) => {
  return await prisma.user.create({ data: userData });
};