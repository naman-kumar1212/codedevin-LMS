'use client';

import React, { useState } from 'react';
import {
  FileText, Download, ExternalLink, BookOpen,
  AlertCircle, Loader2, Maximize2, ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface LessonPdfViewerProps {
  pdfUrl: string;
  title: string;
}

export function LessonPdfViewer({ pdfUrl, title }: LessonPdfViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const getFullPdfUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:')) return url;
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
    if (url.startsWith('/public/uploads')) return `${backendUrl}${url}`;
    return `${backendUrl}/public/uploads/pdfs/${url}`;
  };

  const resolvedUrl = getFullPdfUrl(pdfUrl);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = resolvedUrl;
    link.download = title + '.pdf';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.click();
  };

  return (
    <div className="flex flex-col gap-0 animate-in fade-in duration-500">
      {/* Document Header Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#f8f9fb] border border-border rounded-t-2xl border-b-0">
        <div className="flex items-center gap-3">
          {/* PDF icon badge */}
          <div className="size-9 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0">
            <FileText className="size-4 text-rose-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary leading-tight truncate max-w-[280px]">{title}</p>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-0.5">PDF Document</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleDownload}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150",
              "bg-white border border-border text-text-secondary hover:text-text-primary hover:border-border/60 hover:bg-white shadow-sm"
            )}
          >
            <Download className="size-3.5" />
            Download
          </button>
          <button
            onClick={() => window.open(resolvedUrl, '_blank')}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150",
              "bg-white border border-border text-text-secondary hover:text-text-primary hover:border-border/60 hover:bg-white shadow-sm"
            )}
            title="Open in new tab"
          >
            <ExternalLink className="size-3.5" />
            Open
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150",
              isExpanded
                ? "bg-primary/10 border border-primary/20 text-primary"
                : "bg-white border border-border text-text-secondary hover:text-text-primary shadow-sm"
            )}
          >
            <Maximize2 className="size-3.5" />
            {isExpanded ? 'Collapse' : 'Expand'}
          </button>
        </div>
      </div>

      {/* PDF Viewer Frame */}
      <div
        className={cn(
          "relative w-full bg-[#525659] border border-border border-t-0 rounded-b-2xl overflow-hidden transition-all duration-300",
          isExpanded ? "h-[85vh]" : "h-[640px]"
        )}
      >
        {/* Loading state */}
        {isLoading && !hasError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#525659] z-10">
            <Loader2 className="size-8 text-white/40 animate-spin mb-3" />
            <p className="text-sm text-white/40 font-medium">Loading document…</p>
          </div>
        )}

        {/* Error state */}
        {hasError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#f8f9fb] z-10 gap-4">
            <div className="size-14 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center">
              <AlertCircle className="size-6 text-rose-500" />
            </div>
            <div className="text-center px-6">
              <p className="text-sm font-semibold text-text-primary mb-1">Could not load document</p>
              <p className="text-xs text-text-muted mb-4 max-w-xs">
                The PDF could not be embedded. You can still open it in a new tab.
              </p>
              <button
                onClick={() => window.open(resolvedUrl, '_blank')}
                className="flex items-center gap-2 mx-auto px-4 py-2 text-xs font-semibold bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                <ExternalLink className="size-3.5" />
                Open PDF in Browser
              </button>
            </div>
          </div>
        )}

        {resolvedUrl ? (
          <iframe
            src={`${resolvedUrl}#toolbar=1&navpanes=0&scrollbar=1&view=FitH`}
            className={cn("size-full border-none", isLoading || hasError ? "opacity-0" : "opacity-100")}
            title={title}
            onLoad={() => setIsLoading(false)}
            onError={() => { setIsLoading(false); setHasError(true); }}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#f8f9fb] gap-4">
            <div className="size-14 rounded-2xl bg-gray-100 border border-border flex items-center justify-center">
              <BookOpen className="size-6 text-text-muted" />
            </div>
            <p className="text-sm text-text-muted font-medium">No document attached to this lesson.</p>
          </div>
        )}
      </div>

      {/* Reading tip strip */}
      {!hasError && resolvedUrl && (
        <div className="flex items-center gap-2 mt-2.5 px-1">
          <ChevronRight className="size-3 text-text-muted shrink-0" />
          <p className="text-[11px] text-text-muted">
            Use your browser&apos;s built-in PDF controls to zoom, search, or print. Click{' '}
            <button onClick={() => window.open(resolvedUrl, '_blank')} className="text-primary hover:underline font-medium">
              Open
            </button>{' '}
            for the full-screen reading experience.
          </p>
        </div>
      )}
    </div>
  );
}
