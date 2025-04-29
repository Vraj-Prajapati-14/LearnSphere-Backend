import prisma from '../config/database.js';

export const createCategoryService = async (data) => {
  return await prisma.category.create({
    data,
  });
};

export const getAllCategoriesService = async () => {
  return await prisma.category.findMany();
};

export const getCategoryByIdService = async (id) => {
  return await prisma.category.findUnique({
    where: { id },
  });
};

export const updateCategoryService = async (id, data) => {
  return await prisma.category.update({
    where: { id },
    data,
  });
};

export const deleteCategoryService = async (id) => {
  return await prisma.category.delete({
    where: { id },
  });
};
