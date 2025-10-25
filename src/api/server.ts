import express, { Application } from 'express';
import helmet from 'helmet';
import { corsMiddleware } from './middleware/cors';
// import { requestLogger } from './middleware/logger';
import { errorHandler, notFoundHandler } from './middleware/ErrorHandle';
import { apiLimiter } from './middleware/ratelimit';
import { createRoutes } from './routes';
import { TranscoderManager } from '../core/transcoder/transcoderManager';
import { HealthService } from '../service/health';
import { MetricsService } from '../service/MatricsService';
import { StreamService } from '../service/StreamService';
import { config } from '../config';
import path from 'path';

export function createAPIServer(
    transcoderManager: TranscoderManager,
    healthService: HealthService,
    metricsService: MetricsService
): Application {
    const app = express();

    app.use(helmet());
    app.use(corsMiddleware);

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    //   app.use(requestLogger);

    app.use('/api', apiLimiter);

    app.use('/hls', express.static(path.resolve(config.storage.hlsRoot)));

    const streamService = new StreamService(transcoderManager);

    app.use('/api', createRoutes(healthService, streamService, metricsService, transcoderManager));

    app.get('/', (req, res) => {
        res.json({
            name: 'RTMP Streaming Server',
            version: '2.0.0',
            status: 'running',
            endpoints: {
                health: '/api/health',
                streams: '/api/streams',
                metrics: '/api/metrics',
                hls: '/hls/:streamKey/master.m3u8',
            },
        });
    });

    app.use(notFoundHandler);
    app.use(errorHandler);

    return app;
}
