import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../utils/error';
import { logger } from '../../utils/logger';
import { ApiResponse } from '../../types/api.types';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (err instanceof AppError) {
    logger.warn('Application error', {
      code: err.code,
      message: err.message,
      path: req.path,
    });

    const response: ApiResponse = {
      success: false,
      error: {
        code: err.code,
        message: err.message,
      },
      timestamp: new Date().toISOString(),
    };

    res.status(err.statusCode).json(response);
  } else {
    logger.error('Unhandled error', {
      error: err.message,
      stack: err.stack,
      path: req.path,
    });

    const response: ApiResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An internal server error occurred',
      },
      timestamp: new Date().toISOString(),
    };

    res.status(500).json(response);
  }
}

export function notFoundHandler(req: Request, res: Response): void {
  const response: ApiResponse = {
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
    },
    timestamp: new Date().toISOString(),
  };

  res.status(404).json(response);
}