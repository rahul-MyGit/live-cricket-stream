export interface StreamInfo {
    streamKey: string;
    startTime: Date;
    status: 'active' | 'stopped' | 'error';
    profile: string;
    viewerCount?: number;
    bitrate?: number;
}
  
export interface TranscodeProfile {
    name: string;
    video: VideoProfile[];
    hls: HLSConfig;
}

export interface VideoProfile {
    width: number;
    height: number;
    bitrate: string;
    maxrate: string;
    bufsize: string;
    audioBitrate: string;
}
  
export interface HLSConfig {
    segmentTime: number;
    listSize: number;
    flags: string[];
}