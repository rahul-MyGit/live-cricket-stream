import Joi from 'joi';
import { ValidationError } from './error';

export const streamKeySchema = Joi.string()
  .pattern(/^[a-zA-Z0-9_-]+$/)
  .min(3)
  .max(64)
  .required();

export const validateStreamKey = (streamKey: string): void => {
  const { error } = streamKeySchema.validate(streamKey);
  if (error) {
    throw new ValidationError('Invalid stream key format', error.details);
  }
};

export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
});