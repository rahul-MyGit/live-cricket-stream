import { logger } from '../../utils/logger';
import { TranscoderManager } from '../transcoder/transcoderManager';
import { validateStreamKey } from '../../utils/validation';
import { ValidationError } from '../../utils/error';

export class RTMPEventHandler {
  constructor(private transcoderManager: TranscoderManager) {}

  async onPrePublish(id: string, streamPath: string, args: Record<string, unknown>): Promise<void> {
    logger.info('[RTMP] Pre-publish event', { id, streamPath, args });

    const streamKey = this.extractStreamKey(streamPath);
    
    try {
      validateStreamKey(streamKey);
      // TODO: Add authentication logic here
      // const token = args.token as string;
      // await authService.validateStreamToken(streamKey, token);
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