import { Category } from '../models/category.model.js';
import * as courseService from '../services/courseService.js';
import { sendResponse } from '../utils/response.js';

export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.findMany();
    sendResponse(res, 200, categories);
  } catch (error) {
    next(error);
  }
};

export const allcourse = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const courses = await courseService.allcourse(req.user, {
      page: parseInt(page),
      limit: parseInt(limit),
    });
    sendResponse(res, 200, courses);
  } catch (error) {
    next(error);
  }
};

export const getCourseDetails = async (req, res, next) => {
  try {
    const course = await courseService.getCourseDetails(req.params.id);
    sendResponse(res, 200, course);
  } catch (error) {
    next(error);
  }
};

export const getCourses = async (req, res, next) => {
  try {
    const { instructorId, page = 1, limit = 10 } = req.query;
    const courses = await courseService.getCourses(
      { instructorId: instructorId ? parseInt(instructorId) : undefined },
      req.user,
      { page: parseInt(page), limit: parseInt(limit) }
    );
    sendResponse(res, 200, courses);
  } catch (error) {
    next(error);
  }
};

export const getCourseById = async (req, res, next) => {
  try {
    const course = await courseService.getCourseById(req.params.id, req.user);
    if (!course) {
      return sendResponse(res, 404, null, 'Course not found');
    }
    sendResponse(res, 200, course);
  } catch (error) {
    next(error);
  }
};

export const createCourse = async (req, res, next) => {
  try {
    const courseData = {
      ...req.body,
      image: req.file ? `/uploads/images/${req.file.filename}` : null,
    };
    const course = await courseService.createCourse(courseData, req.user);
    sendResponse(res, 201, course);
  } catch (error) {
    next(error);
  }
};

export const updateCourse = async (req, res, next) => {
  try {
    const courseData = {
      ...req.body,
      image: req.file ? `/uploads/images/${req.file.filename}` : req.body.image,
    };
    const course = await courseService.updateCourse(req.params.id, courseData, req.user);
    sendResponse(res, 200, course);
  } catch (error) {
    next(error);
  }
};

export const deleteCourse = async (req, res, next) => {
  try {
    await courseService.deleteCourse(req.params.id, req.user);
    sendResponse(res, 200, null, 'Course deleted');
  } catch (error) {
    console.error('Delete course error:', error);
    next(error);
  }
};