import { Router } from 'express';
import { HealthService } from '../../service/health';
import { TranscoderManager } from '../../core/transcoder/transcoderManager';
import { ApiResponse } from '../../types/api.types';

export function createHealthRouter(
  healthService: HealthService,
  transcoderManager: TranscoderManager
): Router {
  const router = Router();

  router.get('/', async (req, res, next) => {
    try {
      const health = await healthService.checkHealth(transcoderManager);
      const response: ApiResponse = {
        success: true,
        data: health,
        timestamp: new Date().toISOString(),
      };
      res.status(health.status === 'healthy' ? 200 : 503).json(response);
    } catch (error) {
      next(error);
    }
  });

  router.get('/ready', async (req, res, next) => {
    try {
      const health = await healthService.checkHealth(transcoderManager);
      res.status(health.status === 'healthy' ? 200 : 503).json({
        ready: health.status === 'healthy',
      });
    } catch (error) {
      next(error);
    }
  });

  router.get('/live', (req, res) => {
    res.status(200).json({ alive: true });
  });

  return router;
}