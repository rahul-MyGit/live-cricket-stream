import { Router } from 'express';
import { createHealthRouter } from './health';
import { createStreamsRouter } from './streams';
import { createMetricsRouter } from './metrics';
import { HealthService } from '../../service/health';
import { StreamService } from '../../service/StreamService';
import { MetricsService } from '../../service/MatricsService';
import { TranscoderManager } from '../../core/transcoder/transcoderManager';

export function createRoutes(
  healthService: HealthService,
  streamService: StreamService,
  metricsService: MetricsService,
  transcoderManager: TranscoderManager
): Router {
  const router = Router();

  router.use('/health', createHealthRouter(healthService, transcoderManager));
  router.use('/streams', createStreamsRouter(streamService));
  router.use('/metrics', createMetricsRouter(metricsService));

  return router;
}