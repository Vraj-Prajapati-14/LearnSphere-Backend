import * as reviewService from '../services/reviewService.js';
import { sendResponse } from '../utils/response.js';

export const createReview = async (req, res, next) => {
  try {
    const { rating, text } = req.body;
    // const courseId = req.params.courseId; 
    const courseId = Number(req.params.courseId);
    const review = await reviewService.addReview({ courseId, rating, text }, req.user);
    sendResponse(res, 201, review, 'Review added');
  } catch (err) {
    next(err);
  }
};

export const commentOnReview = async (req, res, next) => {
  try {
    const reviewId = Number(req.params.reviewId);  
    const { text } = req.body;
    const comment = await reviewService.addComment({ reviewId, text }, req.user);
    sendResponse(res, 201, comment, 'Comment added');
  } catch (err) {
    next(err);
  }
};

export const getReviewsByCourse = async (req, res, next) => {
  try {
    const courseId = req.params.courseId;  
    const reviews = await reviewService.getCourseReviews(courseId);
    sendResponse(res, 200, reviews);
  } catch (err) {
    next(err);
  }
};
