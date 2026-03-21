'use client';

import { useState, useRef } from 'react';
import { X, Upload, Video, FileText, Save, Loader2 } from 'lucide-react';
import { api } from '@/lib/api-client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Props {
  lessonId: string;
  lessonType: 'video' | 'pdf';
  initialTitle?: string;
  onSave: (updatedLesson: any) => void;
  onClose: () => void;
}

export function ContentMetadataModal({ lessonId, lessonType, initialTitle, onSave, onClose }: Props) {
  const isVideo = lessonType === 'video';

  const [form, setForm] = useState({
    title: initialTitle || '',
    description: '',
    learningOutcome: '',
  });
  const [saving, setSaving] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const thumbnailRef = useRef<HTMLInputElement>(null);

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setThumbnailFile(f);
    setThumbnailPreview(URL.createObjectURL(f));
  };

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const payload: Record<string, string> = { title: form.title };
      if (isVideo) payload.description = form.description;
      else payload.learningOutcome = form.learningOutcome;

      const res = await api.updateLessonMeta(lessonId, payload);
      onSave(res.data);
    } catch (err) {
      console.error('Failed to save metadata:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="p-0 border bg-white max-w-xl rounded-xl shadow-xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden font-sans">
        {/* Header Section */}
        <div className="relative p-6 border-b border-slate-100 bg-slate-50/50">
          <DialogHeader className="flex flex-row items-center gap-4 space-y-0">
            <div className={cn(
              "size-12 rounded-lg flex items-center justify-center shrink-0",
              isVideo ? "bg-primary/10 text-primary" : "bg-amber-50 text-amber-600"
            )}>
              {isVideo ? <Video className="size-5" /> : <FileText className="size-5" />}
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl font-bold text-slate-900 tracking-tight leading-none mb-2">
                {isVideo ? 'Video Details' : 'PDF Details'}
              </DialogTitle>
              <DialogDescription className="sr-only">Configure the metadata and specific settings for this lesson unit.</DialogDescription>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs font-semibold uppercase tracking-wider py-0.5 px-2 border-slate-200 text-slate-500 bg-white">
                  Lesson Meta
                </Badge>
                <div className="size-1 rounded-full bg-slate-300" />
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide leading-none">
                  {isVideo ? 'Description & Cover' : 'Outcome registry'}
                </span>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Form Body */}
        <div className="px-6 py-5 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 ml-1">
              {isVideo ? 'Video Title' : 'PDF Title'} <span className="text-rose-500 font-bold">*</span>
            </label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder={isVideo ? 'e.g. Introduction to Variables' : 'e.g. Chapter 1 Reference Guide'}
              className="h-11 font-medium text-base bg-white border-slate-200 rounded-lg focus:ring-primary/10 transition-colors"
            />
          </div>

          {isVideo ? (
            <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 ml-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={4}
                  placeholder="Tell learners what this video is about..."
                  className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-colors resize-none shadow-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 ml-1">Thumbnail Cover</label>
                <div
                  onClick={() => thumbnailRef.current?.click()}
                  className="group relative h-40 bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-colors overflow-hidden"
                >
                  <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors" />

                  {thumbnailPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={thumbnailPreview} alt="Preview" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-400 group-hover:text-primary transition-colors">
                      <div className="size-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                        <Upload className="size-4" />
                      </div>
                      <p className="text-xs font-medium uppercase tracking-wider">Click to upload cover</p>
                    </div>
                  )}
                </div>
                <input
                  ref={thumbnailRef}
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  className="hidden"
                />
                {thumbnailFile && (
                  <p className="text-xs text-emerald-600 font-medium ml-1 animate-in fade-in">
                    ✓ {thumbnailFile.name}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-2 animate-in slide-in-from-bottom-2 duration-300">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 ml-1">Learning Outcomes</label>
              <textarea
                value={form.learningOutcome}
                onChange={(e) => setForm({ ...form, learningOutcome: e.target.value })}
                rows={6}
                placeholder="What will students learn? e.g. Master the core principles of..."
                className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-colors resize-none shadow-sm"
              />
            </div>
          )}
        </div>

        {/* Footer actions */}
        <DialogFooter className="px-6 py-4 bg-slate-50/50 border-t border-slate-200 sm:justify-end gap-2">
          <Button
            variant="ghost"
            onClick={onClose}
            className="h-10 px-5 rounded-md font-medium text-slate-600 hover:bg-slate-200/50 transition-colors"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!form.title.trim() || saving}
            className="h-10 px-6 rounded-md font-semibold bg-primary hover:bg-primary/90 text-white transition-colors hover:shadow-md disabled:opacity-50"
          >
            {saving ? (
              <span className="flex items-center gap-2"><Loader2 className="size-4 animate-spin" /> Saving...</span>
            ) : (
              <span className="flex items-center gap-2"><Save size={16} /> Save Changes</span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
