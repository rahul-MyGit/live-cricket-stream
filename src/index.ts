import { config } from './config';
import { logger } from './utils/logger';
import { RTMPServer } from './core/rtmp/RTMPServer';
import { TranscoderManager } from './core/transcoder/transcoderManager';
import { createAPIServer } from './api/server';
import { MetricsService } from './service/MatricsService';
import { HealthService } from './service/health';
import { LocalStorage } from './core/storage/StorageManager';
import fs from 'fs';

async function bootstrap(): Promise<void> {
  try {
    logger.info('Starting RTMP Streaming Server...', {
      version: '2.0.0',
      nodeVersion: process.version,
      environment: config.env,
    });

    // Ensure HLS directory exists
    if (!fs.existsSync(config.storage.hlsRoot)) {
      fs.mkdirSync(config.storage.hlsRoot, { recursive: true });
      logger.info(`Created HLS directory: ${config.storage.hlsRoot}`);
    }

    // Initialize services
    const metricsService = new MetricsService();
    const healthService = new HealthService();
    const storage = new LocalStorage(config.storage.hlsRoot);
    const transcoderManager = new TranscoderManager(config.transcoding);

    // Setup transcoder event handlers for metrics
    transcoderManager.on('streamStarted', (streamKey: string) => {
      const info = transcoderManager.getStreamInfo(streamKey);
      metricsService.recordStreamStart(info?.profile || 'unknown');
      metricsService.updateActiveStreams(transcoderManager.getWorkerCount());
    });

    transcoderManager.on('streamEnded', (streamKey: string) => {
      const info = transcoderManager.getStreamInfo(streamKey);
      const duration = info ? (Date.now() - info.startTime.getTime()) / 1000 : 0;
      metricsService.recordStreamEnd('normal', duration);
      metricsService.updateActiveStreams(transcoderManager.getWorkerCount());
    });

    transcoderManager.on('streamError', (streamKey: string) => {
      metricsService.recordTranscodingError(streamKey);
      const info = transcoderManager.getStreamInfo(streamKey);
      const duration = info ? (Date.now() - info.startTime.getTime()) / 1000 : 0;
      metricsService.recordStreamEnd('error', duration);
      metricsService.updateActiveStreams(transcoderManager.getWorkerCount());
    });

    // Start RTMP server
    const rtmpServer = new RTMPServer(config.rtmp, transcoderManager);
    await rtmpServer.start();

    // Start API server
    const apiServer = createAPIServer(
      transcoderManager,
      healthService,
      metricsService
    );

    const server = apiServer.listen(config.port, config.host, () => {
      logger.info(`API server listening on ${config.host}:${config.port}`);
      logger.info(`HLS content available at http://${config.host}:${config.port}/hls/`);
      logger.info(`Metrics available at http://${config.host}:${config.metrics.port}/api/metrics`);
    });

    // Setup cleanup job
    if (config.cleanup.enabled) {
      const cleanupInterval = config.cleanup.intervalHours * 60 * 60 * 1000;
      setInterval(async () => {
        logger.info('Running scheduled cleanup...');
        const deleted = await storage.cleanup(config.cleanup.retentionHours);
        logger.info(`Cleanup completed: ${deleted} files removed`);
      }, cleanupInterval);
    }

    // Graceful shutdown
    const shutdown = async (signal: string): Promise<void> => {
      logger.info(`Received ${signal}, shutting down gracefully...`);

      server.close(() => {
        logger.info('HTTP server closed');
      });

      await rtmpServer.stop();
      await transcoderManager.stopAll();

      logger.info('Server shutdown complete');
      process.exit(0);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught exception', { error });
      shutdown('uncaughtException');
    });
    process.on('unhandledRejection', (reason) => {
      logger.error('Unhandled rejection', { reason });
      shutdown('unhandledRejection');
    });

    logger.info('RTMP Streaming Server started successfully');
  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
}

bootstrap().catch((error) => {
  logger.error('Unhandled error during bootstrap', { error });
  process.exit(1);
});