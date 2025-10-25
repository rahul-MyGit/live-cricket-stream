import { Router } from 'express';
import { MetricsService } from '../../service/MatricsService';

export function createMetricsRouter(metricsService: MetricsService): Router {
  const router = Router();

  router.get('/', async (req, res, next) => {
    try {
      res.set('Content-Type', metricsService.getContentType());
      const metrics = await metricsService.getMetrics();
      res.send(metrics);
    } catch (error) {
      next(error);
    }
  });

  return router;
}