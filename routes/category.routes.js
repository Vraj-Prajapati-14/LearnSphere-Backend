import express from "express";
import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { validateDto } from "../middleware/validateDto.js";
import { createCategoryDto, categoryIdDto } from "../dtos/category.dto.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware(["Instructor"]),
  validateDto(createCategoryDto),
  createCategory
);

router.get("/", authMiddleware(["Student", "Instructor"]), getCategories);

router.get(
  "/:id",
  authMiddleware(["Student", "Instructor"]),
  validateDto(categoryIdDto, "params"),
  getCategoryById
);

router.put(
  "/:id",
  authMiddleware(["Instructor"]),
  validateDto(categoryIdDto, "params"),
  validateDto(createCategoryDto),
  updateCategory
);

router.delete(
  "/:id",
  authMiddleware(["Instructor"]),
  validateDto(categoryIdDto, "params"),
  deleteCategory
);

export default router;
