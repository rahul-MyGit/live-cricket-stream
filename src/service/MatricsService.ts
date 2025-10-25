import { register, collectDefaultMetrics, Counter, Gauge, Histogram } from 'prom-client';
import { logger } from '../utils/logger';

export class MetricsService {
  private activeStreamsGauge: Gauge;
  private streamStartCounter: Counter;
  private streamEndCounter: Counter;
  private transcodingErrorCounter: Counter;
  private streamDurationHistogram: Histogram;

  constructor() {
    collectDefaultMetrics();

    this.activeStreamsGauge = new Gauge({
      name: 'rtmp_active_streams',
      help: 'Number of currently active streams',
    });

    this.streamStartCounter = new Counter({
      name: 'rtmp_stream_starts_total',
      help: 'Total number of stream starts',
      labelNames: ['profile'],
    });

    this.streamEndCounter = new Counter({
      name: 'rtmp_stream_ends_total',
      help: 'Total number of stream ends',
      labelNames: ['reason'],
    });

    this.transcodingErrorCounter = new Counter({
      name: 'rtmp_transcoding_errors_total',
      help: 'Total number of transcoding errors',
      labelNames: ['stream_key'],
    });

    this.streamDurationHistogram = new Histogram({
      name: 'rtmp_stream_duration_seconds',
      help: 'Duration of streams in seconds',
      buckets: [60, 300, 900, 1800, 3600, 7200],
    });

    logger.info('Metrics service initialized');
  }

  public recordStreamStart(profile: string): void {
    this.streamStartCounter.inc({ profile });
    this.activeStreamsGauge.inc();
  }

  public recordStreamEnd(reason: string, durationSeconds: number): void {
    this.streamEndCounter.inc({ reason });
    this.activeStreamsGauge.dec();
    this.streamDurationHistogram.observe(durationSeconds);
  }

  public recordTranscodingError(streamKey: string): void {
    this.transcodingErrorCounter.inc({ stream_key: streamKey });
  }

  public updateActiveStreams(count: number): void {
    this.activeStreamsGauge.set(count);
  }

  public getMetrics(): Promise<string> {
    return register.metrics();
  }

  public getContentType(): string {
    return register.contentType;
  }
}