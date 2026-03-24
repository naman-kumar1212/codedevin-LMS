'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import Link from 'next/link';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import {
  SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, arrayMove,
} from '@dnd-kit/sortable';
import { SortableModule } from '@/components/admin/course-builder/SortableModule';
import { ContentMetadataModal } from '@/components/admin/course-builder/ContentMetadataModal';
import { QuizBuilder } from '@/components/admin/course-builder/QuizBuilder';
import type { Lesson, Module } from '@/components/admin/course-builder/types';
import {
  Rocket, BookOpen, Layers, ArrowRight, ArrowLeft, Plus, X,
  Check, ChevronRight, FileText, BadgeCent, ShieldCheck, Smartphone,
  Upload, Video, FileIcon, AlertCircle, HelpCircle, RefreshCw, Trash2,
  ImageIcon
} from 'lucide-react';
import { getThumbnailUrl } from '@/lib/image-utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";

// ──────────────────────────────────────────────────────────────────────────────
// Types (local only for this page)
// ──────────────────────────────────────────────────────────────────────────────

type Step = 1 | 2 | 3 | 4 | 5;

interface UploadState {
  lessonId: string;
  file: File;
  progress: number;
  type: 'video' | 'pdf';
  done: boolean;
  error?: string;
}

interface PendingModal {
  lessonId: string;
  lessonType: 'video' | 'pdf';
  initialTitle: string;
  initialDescription: string;
  initialLearningOutcome: string;
  initialThumbnail: string;
  moduleId: string;
}

// ──────────────────────────────────────────────────────────────────────────────
// Main Page
// ──────────────────────────────────────────────────────────────────────────────

export default function CreateCoursePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<Step>(1);
  const [courseId, setCourseId] = useState<string | null>(null);
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Form: Step 1 ─────────────────────────────────────────────────────────
  const [basicInfo, setBasicInfo] = useState({
    title: '',
    description: '',
    price: 0,
    isFree: true,
    thumbnailUrl: '',
    category: 'Development',
    level: 'Beginner',
  });
  const [thumbnailUploading, setThumbnailUploading] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');

  // ── Modules state ─────────────────────────────────────────────────────────
  const [modules, setModules] = useState<Module[]>([]);

  // ── Upload state ──────────────────────────────────────────────────────────
  const [uploads, setUploads] = useState<Record<string, UploadState>>({});
  const [pendingModal, setPendingModal] = useState<PendingModal | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeUploadTarget = useRef<{ moduleId: string; type: 'video' | 'pdf' } | null>(null);

  // ── Quiz tab state ────────────────────────────────────────────────────────
  const [activeQuizModuleId, setActiveQuizModuleId] = useState<string | null>(null);

  // ── Modal states for replacements ──────────────────────────────────────
  const [isAddModuleOpen, setIsAddModuleOpen] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [moduleToDelete, setModuleToDelete] = useState<string | null>(null);

  // ── Sensors for DnD ──────────────────────────────────────────────────────
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // ── Draft autosave ────────────────────────────────────────────────────────
  const triggerAutosave = useCallback(() => {
    if (!courseId) return;
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(async () => {
      try {
        await api.saveDraft(courseId, { basicInfo, modules, step } as any);
      } catch { /* non-fatal */ }
    }, 1500);
  }, [courseId, basicInfo, modules, step]);

  useEffect(() => {
    triggerAutosave();
  }, [basicInfo, modules, triggerAutosave]);

  // ── Mutations ─────────────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (data: any) => api.createCourse(data),
    onSuccess: (res: any) => {
      const id = res.data.id;
      setCourseId(id);
      setStep(2);
      
      // Upload thumbnail if available
      if (thumbnailFile) {
        api.uploadCourseThumbnail(id, thumbnailFile).then(thumbRes => {
          setBasicInfo(prev => ({ ...prev, thumbnailUrl: thumbRes.data.thumbnailUrl }));
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
    },
  });

  const publishMutation = useMutation({
    mutationFn: () => api.publishCourse(courseId!),
    onSuccess: async () => {
      if (courseId) await api.clearDraft(courseId);
      router.push('/admin/courses');
    },
  });

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
  };

  // ── Step 1 submit ─────────────────────────────────────────────────────────
  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(basicInfo);
  };

  // ── Module management ─────────────────────────────────────────────────────
  const handleAddModuleClick = () => {
    setNewModuleTitle('');
    setIsAddModuleOpen(true);
  };

  const confirmAddModule = async () => {
    if (!courseId || !newModuleTitle.trim()) return;
    try {
      const res = await api.createModule(courseId, {
        title: newModuleTitle.trim(),
        orderIndex: (modules.length + 1) * 10,
      });
      setModules((prev) => [...prev, { ...res.data, lessons: [] }]);
      setIsAddModuleOpen(false);
    } catch (err) {
      console.error('Failed to create module:', err);
    }
  };

  const confirmDeleteModule = async () => {
    if (!moduleToDelete) return;
    try {
      await api.deleteModule(moduleToDelete);
      setModules((prev) => prev.filter((m) => m.id !== moduleToDelete));
      setModuleToDelete(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleModuleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (!active || !over || active.id === over.id) return;
    const oldIdx = modules.findIndex((m) => m.id === active.id);
    const newIdx = modules.findIndex((m) => m.id === over.id);
    const reordered = arrayMove(modules, oldIdx, newIdx).map((m, i) => ({
      ...m,
      orderIndex: (i + 1) * 10,
    }));
    setModules(reordered);
    try {
      await api.reorderModules(
        courseId!,
        reordered.map((m) => ({ id: m.id, orderIndex: m.orderIndex })),
      );
    } catch (err) {
      console.error('Reorder failed:', err);
    }
  };

  const handleLessonsReorder = async (moduleId: string, lessons: Lesson[]) => {
    setModules((prev) =>
      prev.map((m) => (m.id === moduleId ? { ...m, lessons } : m)),
    );
    try {
      await api.reorderLessons(
        moduleId,
        lessons.map((l) => ({ id: l.id, orderIndex: l.orderIndex })),
      );
    } catch (err) {
      console.error('Lesson reorder failed:', err);
    }
  };

  // ── Content upload flow ───────────────────────────────────────────────────
  const handleAddLesson = (moduleId: string, type: 'video' | 'pdf') => {
    activeUploadTarget.current = { moduleId, type };
    if (fileInputRef.current) {
      fileInputRef.current.accept = type === 'video' ? 'video/*' : 'application/pdf';
      fileInputRef.current.click();
    }
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeUploadTarget.current || !courseId) return;
    const { moduleId, type } = activeUploadTarget.current;
    e.target.value = '';

    // First create a lesson placeholder
    let lessonRes: any;
    try {
      lessonRes = await api.createLesson(moduleId, {
        title: file.name.replace(/\.[^.]+$/, ''),
        type,
        status: 'uploading',
        orderIndex: (modules.find((m) => m.id === moduleId)?.lessons.length ?? 0 + 1) * 10,
      });
    } catch (err) {
      toast.error('Creation Failed', {
        description: 'Could not create lesson. Academic server communication failed.',
      });
      return;
    }

    const lessonId = lessonRes.data.id;
    const newLesson: Lesson = {
      id: lessonId,
      title: file.name.replace(/\.[^.]+$/, ''),
      type,
      status: 'uploading',
      orderIndex: (modules.find((m) => m.id === moduleId)?.lessons.length ?? 0 + 1) * 10,
    };

    // Add to state immediately
    setModules((prev) =>
      prev.map((m) =>
        m.id === moduleId ? { ...m, lessons: [...m.lessons, newLesson] } : m,
      ),
    );

    // Track upload progress
    setUploads((prev) => ({
      ...prev,
      [lessonId]: { lessonId, file, progress: 0, type, done: false },
    }));

    try {
      const uploader = type === 'video' ? api.uploadVideo : api.uploadPDF;
      await uploader(
        lessonId,
        file,
        { title: newLesson.title },
        (pct) => setUploads((prev) => ({ ...prev, [lessonId]: { ...prev[lessonId], progress: pct } })),
      );

      // Mark ready
      setUploads((prev) => ({ ...prev, [lessonId]: { ...prev[lessonId], done: true, progress: 100 } }));
      setModules((prev) =>
        prev.map((m) =>
          m.id === moduleId
            ? { ...m, lessons: m.lessons.map((l) => (l.id === lessonId ? { ...l, status: 'ready' } : l)) }
            : m,
        ),
      );

      // Open metadata modal
      setPendingModal({ 
        lessonId, 
        lessonType: type, 
        initialTitle: newLesson.title, 
        initialDescription: '',
        initialLearningOutcome: '',
        initialThumbnail: '',
        moduleId 
      });
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || 'Upload failed';
      setUploads((prev) => ({ ...prev, [lessonId]: { ...prev[lessonId], error: errMsg } }));
      setModules((prev) =>
        prev.map((m) =>
          m.id === moduleId
            ? { ...m, lessons: m.lessons.map((l) => (l.id === lessonId ? { ...l, status: 'failed' } : l)) }
            : m,
        ),
      );
    }
  };

  const handleMetadataSave = (updated: any) => {
    if (!pendingModal) return;
    const { moduleId, lessonId } = pendingModal;
    setModules((prev) =>
      prev.map((m) =>
        m.id === moduleId
          ? { 
              ...m, 
              lessons: m.lessons.map((l) => (l.id === lessonId ? { 
                ...l, 
                title: updated.title ?? l.title,
                learningOutcome: updated.learningOutcome ?? l.learningOutcome,
                thumbnail: updated.thumbnail ?? l.thumbnail
              } : l)) 
            }
          : m,
      ),
    );
    setPendingModal(null);
  };

  const deleteLesson = async (lessonId: string, moduleId: string) => {
    try {
      await api.deleteLesson(lessonId);
      setModules((prev) =>
        prev.map((m) =>
          m.id === moduleId ? { ...m, lessons: m.lessons.filter((l) => l.id !== lessonId) } : m,
        ),
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddQuiz = (moduleId: string) => {
    setActiveQuizModuleId(moduleId);
    setStep(4);
  };

  const handleQuizSaved = (moduleId: string, quiz: any) => {
    setModules((prev) =>
      prev.map((m) => (m.id === moduleId ? { ...m, quiz } : m)),
    );
  };

  // ── Upload status tracker ─────────────────────────────────────────────────
  const totalLessons = modules.reduce((a, m) => a + m.lessons.length, 0);
  const uploadingCount = Object.values(uploads).filter((u) => !u.done && !u.error).length;
  const failedCount = Object.values(uploads).filter((u) => !!u.error).length;

  // ── Steps config ──────────────────────────────────────────────────────────
  const steps = [
    { id: 1, label: 'Details', icon: FileText },
    { id: 2, label: 'Modules', icon: Layers },
    { id: 3, label: 'Content', icon: Upload },
    { id: 4, label: 'Quizzes', icon: HelpCircle },
    { id: 5, label: 'Publish', icon: Rocket },
  ];

  // ──────────────────────────────────────────────────────────────────────────
  // Render
  // ──────────────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Hidden file input for uploads */}
      <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelected} />

      {/* Metadata modal (non-blocking) */}
      {pendingModal && (
        <ContentMetadataModal
          lessonId={pendingModal.lessonId}
          lessonType={pendingModal.lessonType}
          initialTitle={pendingModal.initialTitle}
          initialDescription={pendingModal.initialDescription}
          initialLearningOutcome={pendingModal.initialLearningOutcome}
          initialThumbnail={pendingModal.initialThumbnail}
          onSave={handleMetadataSave}
          onClose={() => setPendingModal(null)}
        />
      )}

      {/* Add Module Dialog */}
      <Dialog open={isAddModuleOpen} onOpenChange={setIsAddModuleOpen}>
        <DialogContent className="sm:max-w-md bg-white">
          <div className="p-6">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-xl font-bold text-slate-900">Add New Module</DialogTitle>
              <DialogDescription className="text-slate-500 text-sm">
                Create a new section for your course curriculum.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 ml-1 block">Module Title</label>
                <Input
                  placeholder="e.g. Introduction to React"
                  value={newModuleTitle}
                  onChange={(e) => setNewModuleTitle(e.target.value)}
                  className="h-10 text-sm bg-white border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <Button type="button" variant="outline" onClick={() => setIsAddModuleOpen(false)} className="h-10 px-4 rounded-md">
                Cancel
              </Button>
              <Button type="button" onClick={confirmAddModule} disabled={!newModuleTitle.trim()} className="h-10 px-4 rounded-md bg-primary hover:bg-primary/90 text-white">
                Create Module
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!moduleToDelete} onOpenChange={(open) => !open && setModuleToDelete(null)}>
        <DialogContent className="sm:max-w-md bg-white">
          <div className="p-6">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-xl font-bold text-slate-900">Delete Module?</DialogTitle>
              <DialogDescription className="text-slate-500 text-sm mt-2">
                This action cannot be undone. All lessons within this module will be permanently removed from the curriculum.
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-3 justify-end mt-6">
              <Button variant="outline" onClick={() => setModuleToDelete(null)} className="h-10 px-4 rounded-md">
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDeleteModule} className="h-10 px-4 rounded-md">
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <nav className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-2">
            <span>Curriculum</span>
            <ChevronRight className="size-3" />
            <span className="text-primary">Create Course</span>
          </nav>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Create Course
          </h1>
          <p className="text-slate-500 mt-2 text-sm max-w-xl">
            Design a high-quality learning experience with modules, media content, quizzes, and more.
          </p>
        </div>
        <Link
          href="/admin/courses"
          className="group flex items-center gap-3 px-6 py-3 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-red-500 hover:border-red-200 transition-all shadow-sm"
        >
          <X className="size-4" />
          <span className="text-sm font-bold">Discard Draft</span>
        </Link>
      </div>

      {/* ── Stepper ──────────────────────────────────────────────────────── */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between relative px-8">
          <div className="absolute top-1/2 -translate-y-1/2 left-16 right-16 h-1 bg-slate-100 z-0" />
          <div
            className="absolute top-1/2 -translate-y-1/2 left-16 h-1 bg-primary z-10 transition-all duration-500 ease-in-out"
            style={{ width: `${((step - 1) / (steps.length - 1)) * (100 - 12)}%` }}
          />
          {steps.map((s) => (
            <div key={s.id} className="relative z-20 flex flex-col items-center gap-3 bg-white px-2">
              <div className={`size-11 rounded-xl flex items-center justify-center transition-all duration-300 ${
                step >= s.id ? 'bg-primary shadow-lg shadow-primary/20 text-white' : 'bg-slate-50 border border-slate-200 text-slate-300'
              }`}>
                {step > s.id ? <Check className="size-5" /> : <s.icon className="size-5" />}
              </div>
              <p className={`text-[10px] font-bold uppercase tracking-wider ${step >= s.id ? 'text-slate-900' : 'text-slate-400'}`}>
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Content Area ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden min-h-[600px]">

        {/* ── Step 1: Basic Info ────────────────────────────────────────── */}
        {step === 1 && (
          <div className="p-8">
            <div className="mb-8">
              <h2 className="text-xl font-bold text-slate-900">General Information</h2>
              <p className="text-slate-500 mt-1 text-sm">Provide the basic identity and description of your new course.</p>
            </div>

            <form onSubmit={handleStep1Submit} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-1.5 flex flex-col">
                  <label className="text-sm font-medium text-slate-700">Course Title</label>
                  <input
                    required
                    type="text"
                    value={basicInfo.title}
                    onChange={(e) => setBasicInfo({ ...basicInfo, title: e.target.value })}
                    placeholder="e.g. Advanced Financial Management"
                    className="w-full h-10 bg-white border border-slate-200 rounded-md px-3 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
                  />
                </div>
                <div className="space-y-1.5 flex flex-col">
                  <label className="text-sm font-medium text-slate-700">Category</label>
                  <Select
                    value={basicInfo.category}
                    onValueChange={(val) => setBasicInfo({ ...basicInfo, category: val })}
                  >
                    <SelectTrigger className="w-full h-10 bg-white border-slate-200 rounded-md px-3 text-sm text-slate-900 focus:ring-1 focus:ring-primary focus:border-primary">
                      <SelectValue placeholder="Select Sector" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Development">Development</SelectItem>
                      <SelectItem value="Design">Design</SelectItem>
                      <SelectItem value="Business">Business</SelectItem>
                      <SelectItem value="AI & Data Science">AI & Data Science</SelectItem>
                      <SelectItem value="Healthcare">Healthcare</SelectItem>
                      <SelectItem value="Professional Development">Professional Development</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5 flex flex-col">
                <label className="text-sm font-medium text-slate-700">Detailed Description</label>
                <textarea
                  rows={5}
                  value={basicInfo.description}
                  onChange={(e) => setBasicInfo({ ...basicInfo, description: e.target.value })}
                  placeholder="Describe what learners will achieve in this course..."
                  className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors resize-none"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-1.5 flex flex-col">
                  <label className="text-sm font-medium text-slate-700">Difficulty Level</label>
                  <Select
                    value={basicInfo.level}
                    onValueChange={(val) => setBasicInfo({ ...basicInfo, level: val })}
                  >
                    <SelectTrigger className="w-full h-10 bg-white border-slate-200 rounded-md px-3 text-sm text-slate-900 focus:ring-1 focus:ring-primary focus:border-primary">
                      <SelectValue placeholder="Select State" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5 flex flex-col">
                  <label className="text-sm font-medium text-slate-700">Access Type</label>
                  <div className="flex items-center gap-3 p-1 bg-slate-100 rounded-md border border-slate-200 h-10">
                    <button
                      type="button"
                      onClick={() => setBasicInfo({ ...basicInfo, isFree: true, price: 0 })}
                      className={`flex-1 flex items-center justify-center gap-2 h-full rounded text-sm font-medium transition-colors ${basicInfo.isFree ? 'bg-white text-primary shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                      <ShieldCheck className="size-4" />
                      Free
                    </button>
                    <button
                      type="button"
                      onClick={() => setBasicInfo({ ...basicInfo, isFree: false })}
                      className={`flex-1 flex items-center justify-center gap-2 h-full rounded text-sm font-medium transition-colors ${!basicInfo.isFree ? 'bg-primary text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                      <BadgeCent className="size-4" />
                      Premium
                    </button>
                  </div>
                </div>
              </div>

              {!basicInfo.isFree && (
                <div className="space-y-1.5 flex flex-col">
                  <label className="text-sm font-medium text-slate-700">Tuition Fee (INR)</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium pb-0.5">₹</div>
                    <input
                      type="number"
                      value={basicInfo.price}
                      onChange={(e) => setBasicInfo({ ...basicInfo, price: Number(e.target.value) })}
                      className="w-full h-10 bg-white border border-slate-200 rounded-md pl-7 pr-3 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
                    />
                  </div>
                </div>
              )}

              {/* Course Preview Image */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Course Preview Image</label>
                <div className="flex items-start gap-4">
                  <div className="size-24 rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center shrink-0 overflow-hidden">
                    {thumbnailPreview || basicInfo.thumbnailUrl ? (
                      <img
                        src={thumbnailPreview || getThumbnailUrl(basicInfo.thumbnailUrl)}
                        alt="Course preview"
                        className="size-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="size-8 text-slate-300" />
                    )}
                  </div>
                  <label className="flex-1 cursor-pointer">
                    <div className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 hover:border-primary/50 hover:bg-primary/5 transition-colors">
                      {thumbnailUploading ? (
                        <div className="flex items-center gap-2 text-primary text-sm font-medium">
                          <div className="size-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                          Uploading...
                        </div>
                      ) : (
                        <>
                          <Upload className="size-5 text-slate-400" />
                          <span className="text-xs font-medium text-slate-600">Click to upload preview image</span>
                          <span className="text-xs text-slate-400">PNG, JPG, WEBP up to 5 MB</span>
                        </>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleThumbnailUpload}
                      disabled={thumbnailUploading}
                    />
                  </label>
                </div>
              </div>

              {createMutation.isError && (
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <AlertCircle className="size-5 text-red-500 shrink-0" />
                  <p className="text-sm font-semibold text-red-700">Failed to create course. Please try again.</p>
                </div>
              )}

              <div className="pt-6 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="w-full bg-primary text-white py-2.5 rounded-md font-medium text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {createMutation.isPending ? (
                    <><RefreshCw className="size-4 animate-spin" /> Creating Course...</>
                  ) : (
                    <>Next: Build Curriculum <ArrowRight className="size-4" /></>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── Step 2: Module Builder ────────────────────────────────────── */}
        {step === 2 && (
          <div className="p-12 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="mb-10 flex items-end justify-between gap-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Curriculum Structure</h2>
                <p className="text-slate-500 mt-2 font-medium">Create modules and drag to reorder them. Add content in the next step.</p>
              </div>
              <button
                onClick={handleAddModuleClick}
                disabled={modules.length >= 10}
                className="flex items-center gap-2 bg-slate-900 text-white px-6 py-4 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-slate-800 transition-all shadow-md shadow-slate-900/10 disabled:opacity-50"
              >
                <Plus className="size-4" />
                Add Module
              </button>
            </div>

            {modules.length >= 10 && (
              <div className="mb-6 flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <AlertCircle className="size-5 text-amber-500 shrink-0" />
                <p className="text-sm font-semibold text-amber-700">Maximum 10 modules per course reached.</p>
              </div>
            )}

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleModuleDragEnd}>
              <SortableContext items={modules.map((m) => m.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-4">
                  {modules.map((mod, mIdx) => (
                    <SortableModule
                      key={mod.id}
                      module={mod}
                      index={mIdx}
                      onDelete={setModuleToDelete}
                      onAddLesson={handleAddLesson}
                      onDeleteLesson={deleteLesson}
                      onLessonsReorder={handleLessonsReorder}
                      onAddQuiz={handleAddQuiz}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            {modules.length === 0 && (
              <div className="py-20 text-center flex flex-col items-center bg-slate-50 rounded-3xl border border-slate-200 border-dashed">
                <BookOpen className="size-12 text-slate-200 mb-4" />
                <h4 className="text-xl font-bold text-slate-900">Start Course Structure</h4>
                <p className="text-slate-500 mt-2 font-medium max-w-sm mx-auto">Create your first module to begin architecting the course journey.</p>
              </div>
            )}

            <div className="mt-12 pt-8 border-t border-slate-100 flex items-center justify-between">
              <button onClick={() => setStep(1)} className="group flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">
                <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
                Go Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={modules.length === 0}
                className="bg-primary text-white px-8 py-4 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/95 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                Next: Add Content <ArrowRight className="size-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Content Upload ────────────────────────────────────── */}
        {step === 3 && (
          <div className="p-12 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900">Upload Content</h2>
              <p className="text-slate-500 mt-2 font-medium">
                Click "Add Content" on any module to upload a video or PDF. After upload, a metadata form will open automatically.
              </p>
            </div>

            {/* Upload status banner */}
            {uploadingCount > 0 && (
              <div className="mb-6 flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <RefreshCw className="size-5 text-blue-500 shrink-0 animate-spin" />
                <p className="text-sm font-semibold text-blue-700">{uploadingCount} upload(s) in progress...</p>
              </div>
            )}
            {failedCount > 0 && (
              <div className="mb-6 flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                <AlertCircle className="size-5 text-red-500 shrink-0" />
                <p className="text-sm font-semibold text-red-700">{failedCount} upload(s) failed. Check your files and retry.</p>
              </div>
            )}

            {/* Upload progress list */}
            {Object.values(uploads).filter((u) => !u.done || u.error).length > 0 && (
              <div className="mb-8 space-y-3">
                {Object.values(uploads).map((u) => (
                  !u.done || u.error ? (
                    <div key={u.lessonId} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="size-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
                        {u.type === 'video' ? (
                          <Video className="size-4 text-primary" />
                        ) : (
                          <FileIcon className="size-4 text-amber-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{u.file.name}</p>
                        {u.error ? (
                          <p className="text-xs font-semibold text-red-500 mt-0.5">{u.error}</p>
                        ) : (
                          <div className="flex items-center gap-2 mt-1.5">
                            <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full transition-all duration-300"
                                style={{ width: `${u.progress}%` }}
                              />
                            </div>
                            <span className="text-[11px] font-bold text-primary w-10 text-right">{u.progress}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : null
                ))}
              </div>
            )}

            {/* Modules with add content buttons */}
            <div className="space-y-4">
              {modules.map((mod, mIdx) => (
                <SortableModule
                  key={mod.id}
                  module={mod}
                  index={mIdx}
                  onDelete={setModuleToDelete}
                  onAddLesson={handleAddLesson}
                  onDeleteLesson={deleteLesson}
                  onLessonsReorder={handleLessonsReorder}
                  onAddQuiz={handleAddQuiz}
                />
              ))}
            </div>

            <div className="mt-12 pt-8 border-t border-slate-100 flex items-center justify-between">
              <button onClick={() => setStep(2)} className="group flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors">
                <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
                Back to Modules
              </button>
              <button
                onClick={() => setStep(4)}
                disabled={totalLessons === 0 || uploadingCount > 0}
                className="bg-primary text-white px-6 py-2.5 rounded-md font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                Next: Quizzes <ArrowRight className="size-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── Step 4: Quiz Builder ──────────────────────────────────────── */}
        {step === 4 && (
          <div className="p-8">
            <div className="mb-8">
              <h2 className="text-xl font-bold text-slate-900">Quiz Builder</h2>
              <p className="text-slate-500 mt-1 text-sm">
                Add MCQ quizzes to modules. Quizzes are optional — skip to publish if not needed.
              </p>
            </div>

            {/* Module selector */}
            <div className="flex flex-wrap gap-2 mb-8">
              {modules.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setActiveQuizModuleId(m.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors border ${
                    activeQuizModuleId === m.id
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <HelpCircle className="size-4" />
                  {m.title}
                  {m.quiz && <Check className="size-3.5" />}
                </button>
              ))}
            </div>

            {activeQuizModuleId ? (
              (() => {
                const mod = modules.find((m) => m.id === activeQuizModuleId);
                if (!mod) return null;
                return (
                  <QuizBuilder
                    moduleId={mod.id}
                    moduleTitle={mod.title}
                    quiz={mod.quiz ?? null}
                    onQuizSaved={(quiz) => handleQuizSaved(mod.id, quiz)}
                  />
                );
              })()
            ) : (
              <div className="py-16 text-center flex flex-col items-center bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
                <HelpCircle className="size-10 text-slate-300 mb-3" />
                <h4 className="text-lg font-medium text-slate-900">Select a Module</h4>
                <p className="text-slate-500 mt-1 text-sm max-w-sm mx-auto">Click a module above to open its quiz editor.</p>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
              <button onClick={() => setStep(3)} className="group flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                <ArrowLeft className="size-4" />
                Back to Content
              </button>
              <button
                onClick={() => setStep(5)}
                className="bg-primary text-white px-5 py-2.5 rounded-md font-medium text-sm hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                Review & Publish <ArrowRight className="size-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── Step 5: Review & Publish ──────────────────────────────────── */}
        {step === 5 && (
          <div className="p-8 text-center pt-12">
            <div className="max-w-xl mx-auto mb-8">
              <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4">
                <Rocket className="size-8" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Ready to Publish</h2>
              <p className="text-slate-500 text-sm">Your course curriculum is complete and ready for students to enroll.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left max-w-3xl mx-auto bg-slate-50/50 p-6 rounded-xl border border-slate-100 mb-8">
              <div className="space-y-6">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">Course Title</p>
                  <h3 className="text-xl font-bold text-slate-900 leading-tight">{basicInfo.title}</h3>
                </div>
                <div className="flex flex-wrap gap-3">
                  <div className="px-3 py-1.5 bg-white rounded-lg border border-slate-100 shadow-sm flex items-center gap-2">
                    <div className="size-1.5 rounded-full bg-primary" />
                    <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">{basicInfo.category}</span>
                  </div>
                  <div className="px-3 py-1.5 bg-white rounded-lg border border-slate-100 shadow-sm flex items-center gap-2">
                    <div className="size-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">{basicInfo.isFree ? 'Free' : `₹${basicInfo.price}`}</span>
                  </div>
                  <div className="px-3 py-1.5 bg-white rounded-lg border border-slate-100 shadow-sm flex items-center gap-2">
                    <div className="size-1.5 rounded-full bg-amber-500" />
                    <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">{basicInfo.level}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Summary</p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Modules</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{modules.length}</p>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Lessons</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{totalLessons}</p>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quizzes</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{modules.filter((m) => m.quiz).length}</p>
                  </div>
                </div>
              </div>
            </div>

            {publishMutation.isError && (
              <div className="flex items-center justify-center gap-2 p-3 bg-red-50 border border-red-100 rounded-md mb-6 max-w-sm mx-auto">
                <AlertCircle className="size-4 text-red-500 shrink-0" />
                <p className="text-sm font-medium text-red-800">
                  {(publishMutation.error as any)?.response?.data?.message || 'Failed to publish. Check that all modules have content.'}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-3 max-w-xs mx-auto">
              <button
                onClick={() => publishMutation.mutate()}
                disabled={publishMutation.isPending}
                className="w-full bg-primary text-white py-2.5 rounded-md font-medium text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {publishMutation.isPending ? (
                  <><RefreshCw className="size-4 animate-spin" /> Publishing Now...</>
                ) : (
                  <><Rocket className="size-4" /> Release to Learners</>
                )}
              </button>
              <Link href="/admin/courses" className="text-sm font-medium text-slate-500 hover:text-slate-900 py-2 transition-colors">
                Keep as Private Draft & Exit
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-center gap-6 text-slate-400 mt-8">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="size-3.5" />
          <p className="text-xs font-medium">Secure Transmission</p>
        </div>
        <div className="hidden md:flex items-center gap-1.5">
          <Smartphone className="size-3.5" />
          <p className="text-xs font-medium">Responsive Ready</p>
        </div>
      </div>
    </div>
  );
}
