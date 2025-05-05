import Joi from "joi";

export const createReviewDto = Joi.object({
  rating: Joi.number().integer().min(1).max(5).required(),
  text: Joi.string().max(1000).optional(),
});

export const createCommentDto = Joi.object({
  text: Joi.string().max(1000).required(),
});
