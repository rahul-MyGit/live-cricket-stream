import { StreamInfo } from "./stream.types";

export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: {
      code: string;
      message: string;
      details?: unknown;
    };
    timestamp: string;
}
  
export interface StreamListResponse {
    streams: StreamInfo[];
    total: number;
}

export interface HealthCheckResponse {
    status: 'healthy' | 'unhealthy';
    uptime: number;
    version: string;
    checks: {
      rtmp: boolean;
      storage: boolean;
      transcoding: boolean;
    };
}