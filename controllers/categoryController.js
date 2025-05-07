import {
    createCategoryService,
    getAllCategoriesService,
    getCategoryByIdService,
    updateCategoryService,
    deleteCategoryService
  } from '../services/categoryService.js';
  
  export const createCategory = async (req, res, next) => {
    try {
      const category = await createCategoryService(req.body);
      res.status(201).json({ message: 'Category created successfully', category });
    } catch (error) {
      next(error);
    }
  };
  
  export const getCategories = async (req, res, next) => {
    try {
      const categories = await getAllCategoriesService();
      res.status(200).json({ categories });
    } catch (error) {
      next(error);
    }
  };
  
  export const getCategoryById = async (req, res, next) => {
    try {
      const { id } = req.params;
      const category = await getCategoryByIdService(Number(id));
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }
      res.status(200).json({ category });
    } catch (error) {
      next(error);
    }
  };
  
  export const updateCategory = async (req, res, next) => {
    try {
      const { id } = req.params;
      const updatedCategory = await updateCategoryService(Number(id), req.body);
      res.status(200).json({ message: 'Category updated successfully', updatedCategory });
    } catch (error) {
      next(error);
    }
  };
  
  export const deleteCategory = async (req, res, next) => {
    try {
      const { id } = req.params;
      await deleteCategoryService(Number(id));
      res.status(200).json({ message: 'Category deleted successfully' });
    } catch (error) {
      next(error);
    }
  };
  