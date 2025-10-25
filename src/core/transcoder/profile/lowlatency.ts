import { TranscodeProfile } from '../../../types/stream.types';

export const lowLatencyProfile: TranscodeProfile = {
  name: 'low_latency',
  video: [
    {
      width: 1280,
      height: 720,
      bitrate: '2000k',
      maxrate: '2200k',
      bufsize: '4000k',
      audioBitrate: '128k',
    },
    {
      width: 854,
      height: 480,
      bitrate: '1000k',
      maxrate: '1100k',
      bufsize: '2000k',
      audioBitrate: '96k',
    },
  ],
  hls: {
    segmentTime: 2,
    listSize: 3,
    flags: ['independent_segments', 'omit_endlist', 'delete_segments'],
  },
};