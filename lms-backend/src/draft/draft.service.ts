import { Injectable, Logger, Inject } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from './draft.constants';

const DRAFT_TTL_SECONDS = 24 * 60 * 60; // 24 hours

@Injectable()
export class DraftService {
  private readonly logger = new Logger(DraftService.name);

  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async saveDraft(courseId: string, data: Record<string, unknown>): Promise<void> {
    const key = `draft:course:${courseId}`;
    await this.redis.setex(key, DRAFT_TTL_SECONDS, JSON.stringify(data));
    this.logger.log(`Draft saved for course ${courseId}`);
  }

  async getDraft(courseId: string): Promise<Record<string, unknown> | null> {
    const key = `draft:course:${courseId}`;
    const raw = await this.redis.get(key);
    if (!raw) return null;
    return JSON.parse(raw) as Record<string, unknown>;
  }

  async clearDraft(courseId: string): Promise<void> {
    const key = `draft:course:${courseId}`;
    await this.redis.del(key);
    this.logger.log(`Draft cleared for course ${courseId}`);
  }

  /**
   * Save upload session — for tracking in-flight upload state.
   * TTL 1 hour.
   */
  async saveUploadSession(
    sessionId: string,
    data: Record<string, unknown>,
  ): Promise<void> {
    const key = `upload-session:${sessionId}`;
    await this.redis.setex(key, 3600, JSON.stringify(data));
  }

  async getUploadSession(sessionId: string): Promise<Record<string, unknown> | null> {
    const key = `upload-session:${sessionId}`;
    const raw = await this.redis.get(key);
    if (!raw) return null;
    return JSON.parse(raw) as Record<string, unknown>;
  }
}
