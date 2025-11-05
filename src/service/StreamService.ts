import { TranscoderManager } from '../core/transcoder/transcoderManager';
import { StreamInfo } from '../types/stream.types';
import { NotFoundError } from '../utils/error';
import { logger } from '../utils/logger';

export class StreamService {
  constructor(private transcoderManager: TranscoderManager) {}

  public async getActiveStreams(): Promise<StreamInfo[]> {
    return this.transcoderManager.getActiveStreams();
  }

  public async getStreamInfo(streamKey: string): Promise<StreamInfo> {
    const info = this.transcoderManager.getStreamInfo(streamKey);
    if (!info) {
      throw new NotFoundError('Stream');
    }
    return info;
  }

  public async stopStream(streamKey: string): Promise<void> {
    const info = this.transcoderManager.getStreamInfo(streamKey);
    if (!info) {
      throw new NotFoundError('Stream');
    }
    this.transcoderManager.stopStream(streamKey);
    logger.info(`Stream ${streamKey} stopped by admin`);
  }

  public getStats(): { activeStreams: number; maxStreams: number } {
    return {
      activeStreams: this.transcoderManager.getWorkerCount(),
      maxStreams: this.transcoderManager.getMaxConcurrentStreams(),
    };
  }
}