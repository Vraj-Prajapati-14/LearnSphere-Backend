
import Joi from 'joi';

export const createEnrollmentDto = Joi.object({
  courseId: Joi.number().integer().required(),
});

export const completeSessionDto = Joi.object({
  sessionId: Joi.number().integer().required(),
});