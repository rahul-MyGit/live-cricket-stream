export class AppError extends Error {
    constructor(
      public statusCode: number,
      public code: string,
      message: string,
      public isOperational = true
    ) {
      super(message);
      Object.setPrototypeOf(this, AppError.prototype);
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  export class ValidationError extends AppError {
    constructor(message: string, details?: unknown) {
      super(400, 'VALIDATION_ERROR', message);
      this.details = details;
    }
    details?: unknown;
  }
  
  export class AuthenticationError extends AppError {
    constructor(message: string) {
      super(401, 'AUTHENTICATION_ERROR', message);
    }
  }
  
  export class NotFoundError extends AppError {
    constructor(resource: string) {
      super(404, 'NOT_FOUND', `${resource} not found`);
    }
  }
  
  export class StreamLimitError extends AppError {
    constructor(limit: number) {
      super(429, 'STREAM_LIMIT_EXCEEDED', `Maximum ${limit} concurrent streams allowed`);
    }
  }
  
  export class TranscodingError extends AppError {
    constructor(message: string) {
      super(500, 'TRANSCODING_ERROR', message);
    }
  }