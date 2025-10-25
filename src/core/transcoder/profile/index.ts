import { TranscodeProfile } from '../../../types/stream.types';
import { adaptiveProfile } from './adaptive';
import { lowLatencyProfile } from './lowlatency';

export const profiles: Record<string, TranscodeProfile> = {
  adaptive: adaptiveProfile,
  low_latency: lowLatencyProfile,
};

export function getProfile(name: string): TranscodeProfile {
  const profile = profiles[name];
  if (!profile) {
    throw new Error(`Unknown transcode profile: ${name}`);
  }
  return profile;
}