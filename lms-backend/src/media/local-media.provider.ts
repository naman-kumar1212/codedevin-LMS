import { Injectable, Logger } from '@nestjs/common';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { MediaProvider, UploadResult } from './media.interface';

/**
 * LocalMediaProvider — prototype implementation.
 * Stores files under /public/uploads/videos and /public/uploads/pdfs.
 * Status is set to "ready" immediately (mock processing).
 * 
 * To migrate to Cloudflare Stream/R2:
 * 1. Implement CloudflareStreamProvider implements MediaProvider
 * 2. Inject it instead of LocalMediaProvider in MediaModule
 * 3. No controller or service changes needed
 */
@Injectable()
export class LocalMediaProvider implements MediaProvider {
  private readonly logger = new Logger(LocalMediaProvider.name);
  private readonly publicDir = join(process.cwd(), 'public');

  private ensureDir(subdir: string): string {
    const dir = join(this.publicDir, 'uploads', subdir);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    return dir;
  }

  async uploadVideo(
    file: Express.Multer.File,
    _meta?: { title?: string },
  ): Promise<UploadResult> {
    // multer already saved to disk via DiskStorage; file.filename is the saved name
    const dir = this.ensureDir('videos');
    this.logger.log(`Video saved to ${dir}/${file.filename}`);

    return {
      providerFileId: file.filename,
      url: `/public/uploads/videos/${file.filename}`,
    };
  }

  async uploadPDF(file: Express.Multer.File): Promise<UploadResult> {
    const dir = this.ensureDir('pdfs');
    this.logger.log(`PDF saved to ${dir}/${file.filename}`);

    return {
      providerFileId: file.filename,
      url: `/public/uploads/pdfs/${file.filename}`,
      size: file.size,
    };
  }

  getUrl(_provider: string, providerFileId: string): string {
    // For local files, determine type from filename extension
    if (providerFileId.match(/\.(pdf)$/i)) {
      return `/public/uploads/pdfs/${providerFileId}`;
    }
    return `/public/uploads/videos/${providerFileId}`;
  }

  async deleteMedia(providerFileId: string): Promise<void> {
    const { unlink } = await import('fs/promises');
    const paths = [
      join(this.publicDir, 'uploads', 'videos', providerFileId),
      join(this.publicDir, 'uploads', 'pdfs', providerFileId),
    ];
    for (const p of paths) {
      try {
        if (existsSync(p)) {
          await unlink(p);
          this.logger.log(`Deleted: ${p}`);
        }
      } catch {
        // non-fatal
      }
    }
  }
}
