export interface RTMPConfig {
    port: number;
    chunkSize: number;
    gopCache: boolean;
    ping: number;
    pingTimeout: number;
}

export interface StorageConfig {
    type: 'local' | 's3';
    hlsRoot: string;
    s3?: {
      bucket?: string;
      region?: string;
    };
}

export interface TranscodingConfig {
    ffmpegPath: string;
    maxConcurrentStreams: number;
    profiles: string[];
}

export interface Config {
    env: string;
    port: number;
    host: string;
    rtmp: RTMPConfig;
    storage: StorageConfig;
    transcoding: TranscodingConfig;
    security: SecurityConfig;
    logging: LoggingConfig;
    metrics: MetricsConfig;
    cleanup: CleanupConfig;
}

export interface SecurityConfig {
    jwtSecret: string;
    jwtExpiry: string;
    streamSecret: string;
  }
  
  export interface LoggingConfig {
    level: string;
    format: string;
  }
  
  export interface MetricsConfig {
    enabled: boolean;
    port: number;
  }
  
  export interface CleanupConfig {
    enabled: boolean;
    intervalHours: number;
    retentionHours: number;
  }
  