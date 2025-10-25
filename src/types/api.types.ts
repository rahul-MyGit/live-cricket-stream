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