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
      <DialogContent className="p-0 border-none bg-white max-w-xl rounded-[2.5rem] shadow-2xl animate-in fade-in zoom-in-95 duration-500 overflow-hidden font-sans">
        {/* Header Section */}
        <div className="relative p-10 pb-6">
          <DialogHeader className="flex flex-row items-center gap-5 space-y-0">
            <div className={cn(
              "size-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-500 hover:scale-110",
              isVideo ? "bg-primary/10 text-primary" : "bg-amber-50 text-amber-600"
            )}>
              {isVideo ? <Video className="size-6" /> : <FileText className="size-6" />}
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-2">
                {isVideo ? 'Video Details' : 'PDF Details'}
              </DialogTitle>
              <DialogDescription className="sr-only">Configure the metadata and specific settings for this lesson unit.</DialogDescription>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] font-black uppercase tracking-[0.2em] py-0.5 px-2 border-slate-200 text-slate-400 bg-slate-50/50">
                  Lesson Meta
                </Badge>
                <div className="size-1 rounded-full bg-slate-200" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                  {isVideo ? 'Description & Cover' : 'Outcome registry'}
                </span>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Form Body */}
        <div className="px-10 pb-6 space-y-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
              {isVideo ? 'Video Title' : 'PDF Title'} <span className="text-rose-500 font-black">*</span>
            </label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder={isVideo ? 'e.g. Introduction to Variables' : 'e.g. Chapter 1 Reference Guide'}
              className="h-14 font-bold text-lg bg-slate-50/50 border-slate-200 rounded-2xl focus:bg-white focus:ring-primary/10 transition-all"
            />
          </div>

          {isVideo ? (
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={4}
                  placeholder="Tell learners what this video is about..."
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all resize-none shadow-sm"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Thumbnail Cover</label>
                <div
                  onClick={() => thumbnailRef.current?.click()}
                  className="group relative h-44 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] flex items-center justify-center cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all overflow-hidden"
                >
                  <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/2 transition-colors" />

                  {thumbnailPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={thumbnailPreview} alt="Preview" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  ) : (
                    <div className="flex flex-col items-center gap-3 text-slate-400 group-hover:text-primary transition-colors">
                      <div className="size-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                        <Upload className="size-5" />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em]">Click to upload cover</p>
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
                  <p className="text-[11px] text-emerald-600 font-bold ml-2 animate-in fade-in translate-x-1">
                    ✓ {thumbnailFile.name}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3 animate-in slide-in-from-bottom-4 duration-500">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Learning Outcomes</label>
              <textarea
                value={form.learningOutcome}
                onChange={(e) => setForm({ ...form, learningOutcome: e.target.value })}
                rows={6}
                placeholder="What will students learn? e.g. Master the core principles of..."
                className="w-full bg-slate-50/50 border border-slate-200 rounded-[2rem] px-6 py-5 text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all resize-none shadow-sm"
              />
            </div>
          )}
        </div>

        {/* Footer actions */}
        <DialogFooter className="px-10 py-8 bg-slate-50/50 border-t border-slate-100/50 sm:justify-start gap-3">
          <Button
            onClick={handleSave}
            disabled={!form.title.trim() || saving}
            className="flex-1 h-14 rounded-2xl font-black bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50"
          >
            {saving ? (
              <span className="flex items-center gap-2"><Loader2 className="size-4 animate-spin" /> Saving...</span>
            ) : (
              <span className="flex items-center gap-2"><Save size={18} /> Save Changes</span>
            )}
          </Button>
          <Button
            variant="ghost"
            onClick={onClose}
            className="h-14 px-8 rounded-2xl font-bold text-slate-500 hover:bg-slate-200/50 transition-all"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
