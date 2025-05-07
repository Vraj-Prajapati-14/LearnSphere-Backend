import Joi from 'joi';

export const createSessionDto = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  youtubeLink: Joi.string().uri().required(),
  explanation: Joi.string().max(5000).required()
});


export const updateSessionDto = Joi.object({
  title: Joi.string().min(3).max(100).optional(),
  youtubeLink: Joi.string().uri().optional(),
  explanation: Joi.string().max(5000).optional(),
});


export const sessionIdDto = Joi.object({
  courseId: Joi.number().integer().required(),
  id: Joi.number().integer().required(),
}).unknown(); 