import dotenv from 'dotenv';
import Joi from 'joi';
import { Config } from '../types/config.types';
import defaultConfig from './default';
import developmentConfig from './development';
import productionConfig from './production';

dotenv.config();

const envSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(8000),
  RTMP_PORT: Joi.number().default(1935),
  HOST: Joi.string().default('0.0.0.0'),
  HLS_ROOT: Joi.string().default('./hls'),
  STORAGE_TYPE: Joi.string().valid('local', 's3').default('local'),
  LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'info', 'debug')
    .default('info'),
  JWT_SECRET: Joi.string().default('change-me-in-production'),
  STREAM_SECRET: Joi.string().default('change-me-in-production'),
  MAX_CONCURRENT_STREAMS: Joi.number().default(10),
}).unknown();

const { error, value: envVars } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const envConfig = envVars.NODE_ENV === 'production' 
  ? productionConfig 
  : developmentConfig;

export const config: Config = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  host: envVars.HOST,
  rtmp: {
    ...defaultConfig.rtmp,
    port: envVars.RTMP_PORT,
  },
  storage: {
    type: envVars.STORAGE_TYPE || 'local',
    hlsRoot: envVars.HLS_ROOT,
    s3: {
      bucket: envVars.S3_BUCKET,
      region: envVars.S3_REGION,
    },
  },
  transcoding: {
    ...defaultConfig.transcoding,
    ...envConfig.transcoding,
    ffmpegPath: envVars.FFMPEG_PATH || 'ffmpeg',
    maxConcurrentStreams: envVars.MAX_CONCURRENT_STREAMS,
  },
  security: {
    jwtSecret: envVars.JWT_SECRET,
    streamSecret: envVars.STREAM_SECRET,
  },
  logging: {
    ...defaultConfig.logging,
    ...envConfig.logging,
    level: envVars.LOG_LEVEL,
  },
  metrics: {
    ...defaultConfig.metrics,
    ...envConfig.metrics,
    enabled: envVars.ENABLE_METRICS === 'true',
    port: envVars.METRICS_PORT || 9090,
  },
  cleanup: {
    ...defaultConfig.cleanup,
    enabled: envVars.CLEANUP_ENABLED !== 'false',
    intervalHours: parseInt(envVars.CLEANUP_INTERVAL_HOURS || '6'),
    retentionHours: parseInt(envVars.STREAM_RETENTION_HOURS || '24'),
  },
};