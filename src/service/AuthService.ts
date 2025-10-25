import jwt from 'jsonwebtoken';
import { SecurityConfig } from '../types/config.types';
import { AuthenticationError } from '../utils/error';
import { generateStreamToken } from '../utils/helper';

export interface JWTPayload {
  userId: string;
  role: string;
}

export class AuthService {
  constructor(private config: SecurityConfig) {}

  public generateToken(payload: JWTPayload): string {
    return jwt.sign(payload, this.config.jwtSecret);
  }

  public verifyToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, this.config.jwtSecret) as JWTPayload;
    } catch (error) {
      throw new AuthenticationError('Invalid or expired token');
    }
  }

  public generateStreamKey(userId: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    return `${userId}_${timestamp}_${random}`;
  }

  public validateStreamToken(streamKey: string, token: string): boolean {
    const expectedToken = generateStreamToken(streamKey, this.config.streamSecret);
    return token === expectedToken;
  }

  public createStreamToken(streamKey: string): string {
    return generateStreamToken(streamKey, this.config.streamSecret);
  }
}