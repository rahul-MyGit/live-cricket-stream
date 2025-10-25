import { Router } from 'express';
import { StreamService } from '../../service/StreamService';
import { ApiResponse, StreamListResponse } from '../../types/api.types';
import { streamLimiter } from '../middleware/ratelimit';
import { validateStreamKey } from '../../utils/validation';

export function createStreamsRouter(streamService: StreamService): Router {
  const router = Router();

  router.get('/', async (req, res, next) => {
    try {
      const streams = await streamService.getActiveStreams();
      const response: ApiResponse<StreamListResponse> = {
        success: true,
        data: {
          streams,
          total: streams.length,
        },
        timestamp: new Date().toISOString(),
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  });

  router.get('/stats', async (req, res, next) => {
    try {
      const stats = streamService.getStats();
      const response: ApiResponse = {
        success: true,
        data: stats,
        timestamp: new Date().toISOString(),
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  });

  router.get('/:streamKey', async (req, res, next) => {
    try {
      const { streamKey } = req.params;
      validateStreamKey(streamKey);
      
      const stream = await streamService.getStreamInfo(streamKey);
      const response: ApiResponse = {
        success: true,
        data: stream,
        timestamp: new Date().toISOString(),
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  });

  router.delete('/:streamKey', streamLimiter, async (req, res, next) => {
    try {
      const { streamKey } = req.params;
      validateStreamKey(streamKey);
      
      await streamService.stopStream(streamKey);
      const response: ApiResponse = {
        success: true,
        data: { message: 'Stream stopped successfully' },
        timestamp: new Date().toISOString(),
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  });

  return router;
}