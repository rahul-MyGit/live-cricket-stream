import NodeMediaServer from 'node-media-server';
import { RTMPConfig } from '../../types/config.types';
import { RTMPEventHandler } from './RTMPEventHandler';
import { TranscoderManager } from '../transcoder/transcoderManager';
import { logger } from '../../utils/logger';

export class RTMPServer {
  private nms?: NodeMediaServer;
  private eventHandler: RTMPEventHandler;

  constructor(
    private config: RTMPConfig,
    private transcoderManager: TranscoderManager
  ) {
    this.eventHandler = new RTMPEventHandler(transcoderManager);
  }

  public async start(): Promise<void> {
    const nmsConfig = {
      rtmp: {
        port: this.config.port,
        chunk_size: this.config.chunkSize,
        gop_cache: this.config.gopCache,
        ping: this.config.ping,
        ping_timeout: this.config.pingTimeout,
      },
      http: {
        port: 8001,
        allow_origin: '*',
      },
    };

    this.nms = new NodeMediaServer(nmsConfig as any);

    this.nms.on('prePublish', async (id: string, StreamPath: string, args: object) => {
      try {
        await this.eventHandler.onPrePublish(id, StreamPath, args as Record<string, unknown>);
      } catch (error) {
        logger.error('[RTMP] Pre-publish rejected', { error });
        const session = (this.nms as any)?.getSession(id);
        if (session && typeof session.reject === 'function') {
          session.reject();
        }
      }
    });

    this.nms.on('postPublish', async (id: string, StreamPath: string, args: object) => {
      await this.eventHandler.onPostPublish(id, StreamPath, args as Record<string, unknown>);
    });

    this.nms.on('donePublish', async (id: string, StreamPath: string, args: object) => {
      await this.eventHandler.onDonePublish(id, StreamPath, args as Record<string, unknown>);
    });

    this.nms.run();
    logger.info(`RTMP server started on port ${this.config.port}`);
  }

  public async stop(): Promise<void> {
    if (this.nms) {
      this.nms.stop();
      logger.info('RTMP server stopped');
    }
  }
}
