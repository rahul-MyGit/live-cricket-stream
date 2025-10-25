import { TranscodeProfile } from '../../../types/stream.types';

export const adaptiveProfile: TranscodeProfile = {
  name: 'adaptive',
  video: [
    {
      width: 1920,
      height: 1080,
      bitrate: '4500k',
      maxrate: '5000k',
      bufsize: '9000k',
      audioBitrate: '128k',
    },
    {
      width: 1280,
      height: 720,
      bitrate: '2500k',
      maxrate: '2750k',
      bufsize: '5000k',
      audioBitrate: '128k',
    },
    {
      width: 854,
      height: 480,
      bitrate: '1200k',
      maxrate: '1320k',
      bufsize: '2400k',
      audioBitrate: '96k',
    },
  ],
  hls: {
    segmentTime: 4,
    listSize: 6,
    flags: ['independent_segments', 'omit_endlist'],
  },
};