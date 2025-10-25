import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../../service/AuthService';
import { AuthenticationError } from '../../utils/error';

export function createAuthMiddleware(authService: AuthService) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        throw new AuthenticationError('No authorization header');
      }

      const parts = authHeader.split(' ');
      if (parts.length !== 2 || parts[0] !== 'Bearer') {
        throw new AuthenticationError('Invalid authorization header format');
      }

      const token = parts[1];
      const payload = authService.verifyToken(token);

      (req as any).user = payload;
      next();
    } catch (error) {
      next(error);
    }
  };
}