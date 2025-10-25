export default {
    rtmp: {
      port: 1935,
      chunkSize: 60000,
      gopCache: true,
      ping: 30,
      pingTimeout: 60,
    },
    transcoding: {
      ffmpegPath: 'ffmpeg',
      maxConcurrentStreams: 10,
      profiles: ['adaptive'],
    },
    logging: {
      level: 'info',
      format: 'json',
    },
    metrics: {
      enabled: true,
      port: 9090,
    },
    cleanup: {
      enabled: true,
      intervalHours: 6,
      retentionHours: 24,
    },
  };