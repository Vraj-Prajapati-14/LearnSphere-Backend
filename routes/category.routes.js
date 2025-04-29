
import express from 'express';
import { createCategory, getCategories, getCategoryById, updateCategory, deleteCategory } from '../controllers/categoryController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { validateDto } from '../middleware/validateDto.js';
import { createCategoryDto, categoryIdDto } from '../dtos/category.dto.js';

const router = express.Router();

// Create a new category
router.post(
  '/',
  authMiddleware(['Instructor']),
  validateDto(createCategoryDto),
  createCategory
);

// Get all categories
router.get(
  '/',
  authMiddleware(['Student', 'Instructor']),
  getCategories
);

// Get category by ID
router.get(
  '/:id',
  authMiddleware(['Student', 'Instructor']),
  validateDto(categoryIdDto, 'params'),
  getCategoryById
);

// Update category
router.put(
  '/:id',
  authMiddleware(['Instructor']),
  validateDto(categoryIdDto, 'params'),
  validateDto(createCategoryDto),
  updateCategory
);

// Delete category
router.delete(
  '/:id',
  authMiddleware(['Instructor']),
  validateDto(categoryIdDto, 'params'),
  deleteCategory
);

export default router;
