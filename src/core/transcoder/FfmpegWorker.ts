import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import { EventEmitter } from 'events';
import { logger } from '../../utils/logger';
import { TranscodeProfile } from '../../types/stream.types';
import { TranscodingError } from '../../utils/error';

export class FFmpegWorker extends EventEmitter {
  private process?: ChildProcess;
  private startTime: Date;
  private isRunning = false;

  constructor(
    private streamKey: string,
    private outputDir: string,
    private profile: TranscodeProfile,
    private ffmpegPath: string
  ) {
    super();
    this.startTime = new Date();
  }

  public start(): void {
    if (this.isRunning) {
      logger.warn(`FFmpeg worker already running for ${this.streamKey}`);
      return;
    }

    const inputUrl = `rtmp://127.0.0.1/live/${this.streamKey}`;
    const args = this.buildFFmpegArgs(inputUrl);

    logger.info(`Starting FFmpeg for ${this.streamKey}`, {
      profile: this.profile.name,
      outputDir: this.outputDir,
    });

    try {
      this.process = spawn(this.ffmpegPath, args, {
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      this.isRunning = true;

      if (this.process.stdout) {
        this.process.stdout.on('data', (data) => {
          logger.debug(`[FFmpeg ${this.streamKey}] ${data.toString()}`);
        });
      }

      if (this.process.stderr) {
        this.process.stderr.on('data', (data) => {
          const output = data.toString();
          logger.debug(`[FFmpeg ${this.streamKey}] ${output}`);
          this.emit('progress', this.parseProgress(output));
        });
      }

      this.process.on('exit', (code, signal) => {
        this.isRunning = false;
        logger.info(`FFmpeg for ${this.streamKey} exited`, { code, signal });
        this.emit('exit', { code, signal });
      });

      this.process.on('error', (error) => {
        this.isRunning = false;
        logger.error(`FFmpeg error for ${this.streamKey}`, { error });
        this.emit('error', new TranscodingError(error.message));
      });
    } catch (error) {
      this.isRunning = false;
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new TranscodingError(`Failed to start FFmpeg: ${message}`);
    }
  }

  public stop(): void {
    if (!this.process || !this.isRunning) {
      logger.warn(`No running FFmpeg process for ${this.streamKey}`);
      return;
    }

    logger.info(`Stopping FFmpeg for ${this.streamKey}`);
    this.process.kill('SIGINT');
    this.isRunning = false;
  }

  public getStatus(): { running: boolean; uptime: number } {
    return {
      running: this.isRunning,
      uptime: Date.now() - this.startTime.getTime(),
    };
  }

  private buildFFmpegArgs(inputUrl: string): string[] {
    const segmentFilename = path.join(this.outputDir, 'seg_%v_%03d.ts');
    const streamTemplate = path.join(this.outputDir, 'stream_%v.m3u8');
    const masterPl = path.join(this.outputDir, 'master.m3u8');

    const args: string[] = ['-y', '-i', inputUrl];

    const splits = this.profile.video.map((_, i) => `[v${i}]`).join('');
    const filterParts = this.profile.video.map((v, i) => {
      return `[v${i}]scale=w=${v.width}:h=${v.height}:force_original_aspect_ratio=decrease,setsar=1[v${i}out]`;
    });

    args.push(
      '-filter_complex',
      `[0:v]split=${this.profile.video.length}${splits}; ${filterParts.join('; ')}`
    );

    // Add encoding parameters for each rendition
    this.profile.video.forEach((v, i) => {
      args.push(
        '-map', `[v${i}out]`,
        '-map', '0:a?',
        `-c:v:${i}`, 'libx264',
        '-preset', 'veryfast',
        `-b:v:${i}`, v.bitrate,
        `-maxrate:v:${i}`, v.maxrate,
        `-bufsize:v:${i}`, v.bufsize,
        '-g', '48',
        '-keyint_min', '48',
        '-sc_threshold', '0',
        `-c:a:${i}`, 'aac',
        `-b:a:${i}`, v.audioBitrate
      );
    });

    // HLS parameters
    args.push(
      '-f', 'hls',
      '-hls_time', this.profile.hls.segmentTime.toString(),
      '-hls_list_size', this.profile.hls.listSize.toString(),
      '-hls_flags', this.profile.hls.flags.join('+'),
      '-hls_segment_filename', segmentFilename,
      '-master_pl_name', path.basename(masterPl),
      streamTemplate
    );

    return args;
  }

  private parseProgress(output: string): { fps?: number; bitrate?: string } {
    const fpsMatch = output.match(/fps=\s*(\d+)/);
    const bitrateMatch = output.match(/bitrate=\s*([\d.]+\w+)/);

    return {
      fps: fpsMatch ? parseInt(fpsMatch[1]) : undefined,
      bitrate: bitrateMatch ? bitrateMatch[1] : undefined,
    };
  }
}
