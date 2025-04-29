
import Joi from 'joi';

export const createCategoryDto = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().allow('').optional(),
});

export const categoryIdDto = Joi.object({
  id: Joi.number().integer().positive().required(),
});
