import { HealthCheckResponse } from '../types/api.types';
import { TranscoderManager } from '../core/transcoder/transcoderManager';
import fs from 'fs/promises';

export class HealthService {
  private startTime: Date;

  constructor() {
    this.startTime = new Date();
  }

  public async checkHealth(transcoderManager?: TranscoderManager): Promise<HealthCheckResponse> {
    const checks = {
      rtmp: true,
      storage: await this.checkStorage(),
      transcoding: transcoderManager ? this.checkTranscoding(transcoderManager) : true,
    };

    const isHealthy = Object.values(checks).every((check) => check === true);

    return {
      status: isHealthy ? 'healthy' : 'unhealthy',
      uptime: Math.floor((Date.now() - this.startTime.getTime()) / 1000),
      version: process.env.npm_package_version || '2.0.0',
      checks,
    };
  }

  private async checkStorage(): Promise<boolean> {
    try {
      const testPath = './hls/.health-check';
      await fs.writeFile(testPath, 'ok');
      await fs.unlink(testPath);
      return true;
    } catch {
      return false;
    }
  }

  private checkTranscoding(transcoderManager: TranscoderManager): boolean {
    try {
      transcoderManager.getWorkerCount();
      return true;
    } catch {
      return false;
    }
  }
}