import { logger } from '../../utils/logger';
import { TranscoderManager } from '../transcoder/transcoderManager';
import { validateStreamKey } from '../../utils/validation';
import { ValidationError, AuthenticationError } from '../../utils/error';
import { AuthService } from '../../service/AuthService';
import { config } from '../../config';

export class RTMPEventHandler {
  private authService: AuthService;

  constructor(private transcoderManager: TranscoderManager) {
    this.authService = new AuthService(config.security);
  }

  async onPrePublish(id: string, streamPath: string, args: Record<string, unknown>): Promise<void> {
    logger.info('[RTMP] Pre-publish event', { id, streamPath, args });

    const streamKey = this.extractStreamKey(streamPath);
    
    try {
      validateStreamKey(streamKey);
      
      // Optional authentication - validate stream token if provided
      if (args.token && typeof args.token === 'string') {
        const token = args.token;
        const isValid = this.authService.validateStreamToken(streamKey, token);
        if (!isValid) {
          throw new AuthenticationError('Invalid stream token');
        }
        logger.info('[RTMP] Stream token validated', { streamKey });
      } else {
        // If authentication is optional, log warning in production
        if (config.env === 'production') {
          logger.warn('[RTMP] Stream started without authentication token', { streamKey });
        }
      }
    } catch (error) {
      logger.error('[RTMP] Pre-publish validation failed', { streamKey, error });
      throw error;
    }
  }

  async onPostPublish(id: string, streamPath: string, args: Record<string, unknown>): Promise<void> {
    logger.info('[RTMP] Post-publish event', { id, streamPath, args });

    const streamKey = this.extractStreamKey(streamPath);
    
    try {
      await this.transcoderManager.startStream(streamKey);
    } catch (error) {
      logger.error('[RTMP] Failed to start transcoding', { streamKey, error });
    }
  }

  async onDonePublish(id: string, streamPath: string, args: Record<string, unknown>): Promise<void> {
    logger.info('[RTMP] Done-publish event', { id, streamPath, args });

    const streamKey = this.extractStreamKey(streamPath);
    this.transcoderManager.stopStream(streamKey);
  }

  private extractStreamKey(streamPath: string): string {
    const parts = streamPath.split('/').filter(Boolean);
    const streamKey = parts[parts.length - 1];
    
    if (!streamKey) {
      throw new ValidationError('Invalid stream path');
    }
    
    return streamKey;
  }
}