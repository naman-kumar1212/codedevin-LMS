import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

/**
 * MOCK Videos Service — no Cloudflare Stream API.
 * Returns fake upload URLs and always reports videos as ready.
 */
@Injectable()
export class VideosService {
  /**
   * Mock: Generate a fake upload URL.
   * In production, this calls Cloudflare Stream direct upload API.
   */
  getUploadUrl(_filename: string) {
    const videoId = `mock-vid-${randomUUID().substring(0, 12)}`;
    return {
      videoId,
      uploadUrl: `http://localhost:3001/api/v1/videos/mock-upload/${videoId}`,
    };
  }
  /**
   * Mock: Always returns ready status.
   * In production, polls Cloudflare Stream for encoding status.
   */
  getStatus(videoId: string) {
    return {
      videoId,
      status: 'ready',
      readyToStream: true,
      durationSeconds: 600,
    };
  }
}
