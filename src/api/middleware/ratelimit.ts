import rateLimit from 'express-rate-limit';
import { config } from '../../config';

export const apiLimiter = rateLimit({
  windowMs: config.env === 'production' ? 15 * 60 * 1000 : 60 * 1000,
  max: config.env === 'production' ? 100 : 1000,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later',
    },
    timestamp: new Date().toISOString(),
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const streamLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many stream operations, please try again later',
    },
    timestamp: new Date().toISOString(),
  },
});