import fs from 'fs';
import path from 'path';
import { EventEmitter } from 'events';
import { FFmpegWorker } from './FfmpegWorker';
import { getProfile } from './profile/index';
import { logger } from '../../utils/logger';
import { sanitizeStreamName } from '../../utils/helper';
import { TranscodingConfig } from '../../types/config.types';
import { StreamInfo } from '../../types/stream.types';
import { StreamLimitError, TranscodingError } from '../../utils/error';

export class TranscoderManager extends EventEmitter {
  private workers = new Map<string, FFmpegWorker>();
  private streamInfo = new Map<string, StreamInfo>();

  constructor(private config: TranscodingConfig) {
    super();
  }

  public async startStream(streamKey: string, profileName?: string): Promise<void> {
    const safeName = sanitizeStreamName(streamKey);

    if (this.workers.has(safeName)) {
      logger.warn(`Stream ${safeName} already transcoding`);
      return;
    }

    if (this.workers.size >= this.config.maxConcurrentStreams) {
      throw new StreamLimitError(this.config.maxConcurrentStreams);
    }

    const profile = getProfile(profileName || this.config.profiles[0]);
    const outputDir = path.join(process.cwd(), 'hls', safeName);

    try {
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const worker = new FFmpegWorker(
        streamKey,
        outputDir,
        profile,
        this.config.ffmpegPath
      );

      worker.on('error', (error) => {
        logger.error(`Transcoding error for ${safeName}`, { error });
        this.streamInfo.set(safeName, {
          ...this.getStreamInfo(safeName)!,
          status: 'error',
        });
        this.emit('streamError', safeName, error);
      });

      worker.on('exit', ({ code, signal }) => {
        logger.info(`Stream ${safeName} ended`, { code, signal });
        this.stopStream(streamKey);
        this.emit('streamEnded', safeName);
      });

      worker.on('progress', (progress) => {
        this.emit('streamProgress', safeName, progress);
      });

      worker.start();
      this.workers.set(safeName, worker);
      this.streamInfo.set(safeName, {
        streamKey: safeName,
        startTime: new Date(),
        status: 'active',
        profile: profile.name,
      });

      logger.info(`Started transcoding for ${safeName}`, { profile: profile.name });
      this.emit('streamStarted', safeName);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Failed to start stream ${safeName}`, { error: message });
      throw new TranscodingError(message);
    }
  }

  public stopStream(streamKey: string): void {
    const safeName = sanitizeStreamName(streamKey);
    const worker = this.workers.get(safeName);

    if (!worker) {
      logger.warn(`No worker found for stream ${safeName}`);
      return;
    }

    worker.stop();
    this.workers.delete(safeName);
    
    const info = this.streamInfo.get(safeName);
    if (info) {
      this.streamInfo.set(safeName, {
        ...info,
        status: 'stopped',
      });
    }

    logger.info(`Stopped transcoding for ${safeName}`);
  }

  public async stopAll(): Promise<void> {
    logger.info('Stopping all transcoding workers');
    const stopPromises = Array.from(this.workers.keys()).map((key) => {
      return new Promise<void>((resolve) => {
        this.stopStream(key);
        resolve();
      });
    });
    await Promise.all(stopPromises);
  }

  public getActiveStreams(): StreamInfo[] {
    return Array.from(this.streamInfo.values()).filter(
      (info) => info.status === 'active'
    );
  }

  public getStreamInfo(streamKey: string): StreamInfo | undefined {
    const safeName = sanitizeStreamName(streamKey);
    return this.streamInfo.get(safeName);
  }

  public getWorkerCount(): number {
    return this.workers.size;
  }
}