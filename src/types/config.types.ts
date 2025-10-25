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