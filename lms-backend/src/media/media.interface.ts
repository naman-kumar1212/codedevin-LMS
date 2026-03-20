/**
 * MediaProvider interface — the only abstraction needed to swap
 * from local storage to Cloudflare Stream/R2 without touching controllers.
 */
export interface UploadResult {
  providerFileId: string; // local filename | cloudflare stream UID | R2 object key
  url: string;            // public-facing URL for immediate use
  durationSeconds?: number;
  size?: number;
}

export interface MediaProvider {
  uploadVideo(file: Express.Multer.File, meta?: { title?: string }): Promise<UploadResult>;
  uploadPDF(file: Express.Multer.File): Promise<UploadResult>;
  getUrl(provider: string, providerFileId: string): string;
  deleteMedia(providerFileId: string): Promise<void>;
}

export const MEDIA_PROVIDER = Symbol('MEDIA_PROVIDER');
