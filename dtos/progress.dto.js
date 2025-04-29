import Joi from 'joi';

export const createProgressDto = Joi.object({
  sessionId: Joi.number().integer().required(),
  isCompleted: Joi.boolean().default(false),
});

export const updateProgressDto = Joi.object({
  isCompleted: Joi.boolean().required(),
});

export const progressIdDto = Joi.object({
  id: Joi.number().integer().required(),
});
