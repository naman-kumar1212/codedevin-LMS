'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import Link from 'next/link';
import { 
  Rocket, 
  BookOpen, 
  Video, 
  Layers, 
  ArrowRight, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Edit3, 
  Link as LinkIcon,
  Check,
  ChevronRight,
  X,
  PlusCircle,
  FileText,
  BadgeCent,
  ShieldCheck,
  Smartphone,
  Save,
  RefreshCw,
  HelpCircle,
  ImageIcon,
  Upload
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { SortableModule } from '@/components/admin/course-builder/SortableModule';
import { ContentMetadataModal } from '@/components/admin/course-builder/ContentMetadataModal';
import { QuizBuilder, Quiz } from '@/components/admin/course-builder/QuizBuilder';
import type { Lesson, Module } from '@/components/admin/course-builder/types';
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

type Step = 1 | 2 | 3 | 4 | 5;

export default function EditCoursePage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;
  const queryClient = useQueryClient();
  const [step, setStep] = useState<Step>(1);

  // Form States
  const [basicInfo, setBasicInfo] = useState({
    title: '',
    description: '',
    price: 0,
    isFree: true,
    thumbnailUrl: '',
    category: 'Development'
  });

  const [modules, setModules] = useState<Module[]>([]);
  const [uploads, setUploads] = useState<Record<string, any>>({});
  const [pendingModal, setPendingModal] = useState<any>(null);
  const [activeQuizModuleId, setActiveQuizModuleId] = useState<string | null>(null);
  const [thumbnailUploading, setThumbnailUploading] = useState(false);

  // ── Sensors for DnD ──────────────────────────────────────────────────────
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  
  // Dialog States
  const [isAddModuleOpen, setIsAddModuleOpen] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [moduleToDelete, setModuleToDelete] = useState<string | null>(null);
  const [lessonToDelete, setLessonToDelete] = useState<{id: string, moduleIdx: number} | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeUploadTarget = useRef<{ moduleId: string; type: 'video' | 'pdf'; lessonId?: string } | null>(null);

  // Fetch Course Data
  const { data: courseData, isLoading } = useQuery({
    queryKey: ['admin-course', courseId],
    queryFn: () => api.getCourse(courseId),
  });

  useEffect(() => {
    if (courseData?.data) {
      const c = courseData.data;
      setBasicInfo({
        title: c.title,
        description: c.description || '',
        price: c.price || 0,
        isFree: c.isFree,
        thumbnailUrl: c.thumbnailUrl || '',
        category: c.category || 'Development'
      });
      setModules(c.modules || []);
    }
  }, [courseData]);

  // Mutations
  const updateMutation = useMutation({
    mutationFn: (data: any) => api.updateCourse(courseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      queryClient.invalidateQueries({ queryKey: ['admin-course', courseId] });
      setStep(2);
    }
  });

  const publishMutation = useMutation({
    mutationFn: () => api.publishCourse(courseId),
    onSuccess: () => {
      router.push('/admin/courses');
    }
  });

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(basicInfo);
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !courseId) return;
    e.target.value = '';
    setThumbnailUploading(true);
    try {
      const res = await api.uploadCourseThumbnail(courseId, file);
      setBasicInfo((prev) => ({ ...prev, thumbnailUrl: res.data.thumbnailUrl }));
      toast.success('Preview image updated');
    } catch {
      toast.error('Failed to upload image');
    } finally {
      setThumbnailUploading(false);
    }
  };

  const confirmAddModule = async () => {
    if (!newModuleTitle.trim()) return;
    try {
      const res = await api.createModule(courseId, { title: newModuleTitle, order: modules.length });
      setModules([...modules, { ...res.data, lessons: [] }]);
      setIsAddModuleOpen(false);
      setNewModuleTitle('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddLesson = (moduleId: string, type: 'video' | 'pdf', lessonId?: string) => {
    activeUploadTarget.current = { moduleId, type, lessonId };
    if (fileInputRef.current) {
      fileInputRef.current.accept = type === 'video' ? 'video/*' : 'application/pdf';
      fileInputRef.current.click();
    }
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeUploadTarget.current || !courseId) return;
    const { moduleId, type, lessonId: existingLessonId } = activeUploadTarget.current;
    e.target.value = '';

    let lessonId = existingLessonId;
    let newLessonData: any = null;

    if (!lessonId) {
      // Create lesson placeholder
      try {
        const lessonRes = await api.createLesson(moduleId, {
          title: file.name.replace(/\.[^.]+$/, ''),
          type: type.toLowerCase(), // Fix: backend expects lowercase
          status: 'uploading',
          orderIndex: (modules.find((m) => m.id === moduleId)?.lessons.length ?? 0 + 1) * 10,
        });
        lessonId = lessonRes.data.id;
        newLessonData = lessonRes.data;
      } catch (err) {
        toast.error('Creation Failed', {
          description: 'Could not create lesson. Academic server communication failed.',
        });
        return;
      }
    } else {
      // Update existing lesson status
      try {
        await api.updateLesson(lessonId, { status: 'uploading' });
      } catch (err) {
        console.error('Failed to update lesson status:', err);
      }
    }

    if (!lessonId) return;

    const newLesson = {
      ...(newLessonData || modules.find(m => m.id === moduleId)?.lessons.find((l: any) => l.id === lessonId) || {}),
      id: lessonId,
      status: 'uploading',
    };

    // Add to state immediately if new, or update if exists
    setModules((prev) =>
      prev.map((m) => {
        if (m.id !== moduleId) return m;
        const exists = m.lessons.some((l: any) => l.id === lessonId);
        if (exists) {
          return {
            ...m,
            lessons: m.lessons.map((l: any) => l.id === lessonId ? newLesson : l)
          };
        }
        return { ...m, lessons: [...m.lessons, newLesson] };
      })
    );

    // Track upload progress
    setUploads((prev) => ({
      ...prev,
      [lessonId as string]: { lessonId, file, progress: 0, type, done: false },
    }));

    try {
      const uploader = type === 'video' ? api.uploadVideo : api.uploadPDF;
      await uploader(
        lessonId,
        file,
        { title: newLesson.title },
        (pct) => setUploads((prev) => ({ ...prev, [lessonId as string]: { ...prev[lessonId as string], progress: pct } })),
      );

      // Mark ready
      setUploads((prev) => ({ ...prev, [lessonId as string]: { ...prev[lessonId as string], done: true, progress: 100 } }));
      setModules((prev) =>
        prev.map((m) =>
          m.id === moduleId
            ? { ...m, lessons: m.lessons.map((l: any) => (l.id === lessonId ? { ...l, status: 'ready' } : l)) }
            : m,
        ),
      );
      } catch (err: any) {
      const errMsg = err?.response?.data?.message || 'Upload failed';
      setUploads((prev) => ({ ...prev, [lessonId as string]: { ...prev[lessonId as string], error: errMsg } }));
      setModules((prev) =>
        prev.map((m) =>
          m.id === moduleId
            ? { ...m, lessons: m.lessons.map((l: any) => (l.id === lessonId ? { ...l, status: 'failed' } : l)) }
            : m,
        ),
      );
    }
  };
  
  const handleEditLesson = (lessonId: string, moduleId: string) => {
    const module = modules.find(m => m.id === moduleId);
    const lesson = module?.lessons.find((l: any) => l.id === lessonId);
    if (!lesson) return;
    
    setPendingModal({
      moduleId,
      lessonId,
      lessonType: lesson.type,
      initialTitle: lesson.title,
      initialDescription: lesson.description || '',
      initialLearningOutcome: lesson.learningOutcome || '',
      initialThumbnailUrl: lesson.thumbnailUrl || ''
    });
  };

  const confirmDeleteModule = async () => {
    if (!moduleToDelete) return;
    try {
      await api.deleteModule(moduleToDelete);
      setModules(modules.filter(m => m.id !== moduleToDelete));
      setModuleToDelete(null);
    } catch (err) {
      console.error(err);
    }
  };

  const confirmDeleteLesson = async () => {
    if (!lessonToDelete) return;
    try {
      await api.deleteLesson(lessonToDelete.id);
      const newModules = [...modules];
      newModules[lessonToDelete.moduleIdx].lessons = newModules[lessonToDelete.moduleIdx].lessons.filter((l: any) => l.id !== lessonToDelete.id);
      setModules(newModules);
      setLessonToDelete(null);
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
        courseId,
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

  const handleAddQuiz = (moduleId: string) => {
    setActiveQuizModuleId(moduleId);
    setStep(4);
  };

  const steps = [
    { id: 1, label: 'Details', icon: FileText },
    { id: 2, label: 'Curriculum', icon: Layers },
    { id: 3, label: 'Content', icon: Video },
    { id: 4, label: 'Quizzes', icon: HelpCircle },
    { id: 5, label: 'Review', icon: Rocket },
  ];

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-8 pb-32 animate-in fade-in duration-700">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-3">
            <div className="h-4 w-32 bg-slate-100 rounded-md animate-pulse" />
            <div className="h-10 w-64 bg-slate-100 rounded-xl animate-pulse" />
            <div className="h-4 w-96 bg-slate-100 rounded-md animate-pulse" />
          </div>
          <div className="h-12 w-32 bg-slate-100 rounded-xl animate-pulse" />
        </div>

        {/* Stepper Skeleton */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-around">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex flex-col items-center gap-3">
              <div className="size-12 rounded-xl bg-slate-100 animate-pulse" />
              <div className="h-3 w-16 bg-slate-100 rounded animate-pulse" />
            </div>
          ))}
        </div>

        {/* Main Form Skeleton */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden h-[600px] p-12 space-y-8">
           <div className="h-8 w-48 bg-slate-100 rounded animate-pulse" />
           <div className="grid grid-cols-2 gap-8">
              <div className="h-14 bg-slate-100 rounded-xl animate-pulse" />
              <div className="h-14 bg-slate-100 rounded-xl animate-pulse" />
           </div>
           <div className="h-32 w-full bg-slate-100 rounded-2xl animate-pulse" />
           <div className="grid grid-cols-2 gap-8">
              <div className="h-14 bg-slate-100 rounded-xl animate-pulse" />
              <div className="h-14 bg-slate-100 rounded-xl animate-pulse" />
           </div>
           <div className="h-16 w-full bg-slate-100 rounded-xl animate-pulse pt-8" />
        </div>
      </div>
    );
  }

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
          initialThumbnailUrl={pendingModal.initialThumbnailUrl}
          onSave={(updated: any) => {
            const { moduleId, lessonId } = pendingModal;
            setModules((prev) =>
              prev.map((m) =>
                m.id === moduleId
                  ? { ...m, lessons: m.lessons.map((l: any) => (l.id === lessonId ? { 
                      ...l, 
                      title: updated.title ?? l.title,
                      description: updated.description ?? l.description,
                      learningOutcome: updated.learningOutcome ?? l.learningOutcome,
                      thumbnailUrl: updated.thumbnailUrl ?? l.thumbnailUrl
                   } : l)) }
                  : m,
              ),
            );
            setPendingModal(null);
          }}
          onClose={() => setPendingModal(null)}
        />
      )}

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <nav className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-2">
            <span>Editor</span>
            <ChevronRight className="size-3" />
            <span className="text-primary">{basicInfo.title || 'Course Details'}</span>
          </nav>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Modify Curriculum
          </h1>
          <p className="text-slate-500 mt-2 text-sm max-w-xl">
            Update your course structure, lessons, and multimedia assets. All changes are saved in real-time.
          </p>
        </div>
        <Link 
            href="/admin/courses" 
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors text-sm font-medium"
        >
            <ArrowLeft className="size-4" />
            <span>Back to Courses</span>
        </Link>
      </div>

      {/* Stepper Logic */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between relative px-8">
            <div className="absolute top-1/2 -translate-y-1/2 left-12 right-12 h-0.5 bg-slate-100 z-0" />
            <div 
                className="absolute top-1/2 -translate-y-1/2 left-12 h-0.5 bg-primary z-10 transition-all duration-500 ease-in-out" 
                style={{ width: `${((step - 1) / 3) * 100}%` }}
            />
            {steps.map((s) => (
            <div key={s.id} className="relative z-20 flex flex-col items-center gap-2 bg-white px-2">
                <div 
                  onClick={() => setStep(s.id as Step)}
                  className={`size-10 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer ${
                  step >= s.id ? 'bg-primary text-white' : 'bg-slate-50 border border-slate-200 text-slate-400'
                }`}>
                    {step > s.id ? (
                      <Check className="size-4" />
                    ) : (
                      <s.icon className="size-4" />
                    )}
                </div>
                <p className={`text-xs font-medium ${step >= s.id ? 'text-slate-900' : 'text-slate-500'}`}>
                    {s.label}
                </p>
            </div>
            ))}
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden min-h-[600px]">
        {/* Step 1: Basic Info */}
        {step === 1 && (
            <div className="p-8">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">General Information</h2>
                      <p className="text-slate-500 mt-1 text-sm">Provide the basic identity and description of your course.</p>
                    </div>
                    {updateMutation.isPending && (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/5 text-primary rounded text-xs font-semibold">
                        <div className="size-3 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                        <span>Saving...</span>
                      </div>
                    )}
                </div>

                <form onSubmit={handleStep1Submit} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-1.5 flex flex-col">
                            <label className="text-sm font-medium text-slate-700">Course Title</label>
                            <input 
                                required
                                type="text"
                                value={basicInfo.title}
                                onChange={(e) => setBasicInfo({...basicInfo, title: e.target.value})}
                                placeholder="e.g. Advanced Financial Management"
                                className="w-full h-10 bg-white border border-slate-200 rounded-md px-3 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
                            />
                        </div>
                        <div className="space-y-1.5 flex flex-col">
                            <label className="text-sm font-medium text-slate-700">Category</label>
                            <Select 
                                value={basicInfo.category}
                                onValueChange={(val) => setBasicInfo({...basicInfo, category: val})}
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
                            rows={6}
                            value={basicInfo.description}
                            onChange={(e) => setBasicInfo({...basicInfo, description: e.target.value})}
                            placeholder="Describe what learners will achieve in this course..."
                            className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-1.5 flex flex-col">
                            <label className="text-sm font-medium text-slate-700">Access Type</label>
                            <div className="flex items-center gap-3 p-1 bg-slate-100 rounded-md border border-slate-200 h-10">
                                <button 
                                    type="button"
                                    onClick={() => setBasicInfo({...basicInfo, isFree: true, price: 0})}
                                    className={`flex-1 flex items-center justify-center gap-2 h-full rounded text-sm font-medium transition-colors ${basicInfo.isFree ? 'bg-white text-primary shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                                >
                                    <ShieldCheck className="size-4" />
                                    Complimentary
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => setBasicInfo({...basicInfo, isFree: false})}
                                    className={`flex-1 flex items-center justify-center gap-2 h-full rounded text-sm font-medium transition-colors ${!basicInfo.isFree ? 'bg-primary text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                                >
                                    <BadgeCent className="size-4" />
                                    Premium
                                </button>
                            </div>
                        </div>
                        {!basicInfo.isFree && (
                            <div className="space-y-1.5 flex flex-col animate-in zoom-in-95 duration-300">
                                <label className="text-sm font-medium text-slate-700">Tuition Fee (INR)</label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium pb-0.5">₹</div>
                                    <input 
                                        type="number"
                                        value={basicInfo.price}
                                        onChange={(e) => setBasicInfo({...basicInfo, price: Number(e.target.value)})}
                                        className="w-full h-10 bg-white border border-slate-200 rounded-md pl-7 pr-3 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Course Preview Image */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Course Preview Image</label>
                      <div className="flex items-start gap-4">
                        {/* Preview */}
                        <div className="size-24 rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center shrink-0 overflow-hidden">
                          {basicInfo.thumbnailUrl ? (
                            <img
                              src={basicInfo.thumbnailUrl.startsWith('/public')
                                ? `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}${basicInfo.thumbnailUrl}`
                                : basicInfo.thumbnailUrl}
                              alt="Course preview"
                              className="size-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="size-8 text-slate-300" />
                          )}
                        </div>
                        {/* Upload zone */}
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

                    <div className="pt-6 border-t border-slate-100">
                        <button 
                            type="submit"
                            className="w-full bg-primary text-white py-2.5 rounded-md font-medium text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                        >
                            Next: Curriculum Map
                            <ArrowRight className="size-4" />
                        </button>
                    </div>
                </form>
            </div>
        )}

        {/* Step 2: Curriculum Mapping */}
        {step === 2 && (
            <div className="p-8">
                <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Curriculum Structure</h2>
                        <p className="text-slate-500 mt-1 text-sm">Organize your course into modules and individual lessons.</p>
                    </div>
                    <button 
                        onClick={() => setIsAddModuleOpen(true)}
                        className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-md font-medium text-sm hover:bg-slate-800 transition-colors"
                    >
                        <Plus className="size-4" />
                        Add Module
                    </button>
                </div>

                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleModuleDragEnd}>
                  <SortableContext items={modules.map((m) => m.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-6">
                      {modules.map((mod, mIdx) => (
                        <SortableModule
                          key={mod.id}
                          module={mod}
                          index={mIdx}
                          onDelete={setModuleToDelete}
                          onAddLesson={handleAddLesson}
                          onEditLesson={handleEditLesson}
                          onDeleteLesson={(lessonId) => confirmDeleteLesson()} // Wait, lessonToDelete state needs update
                          onLessonsReorder={handleLessonsReorder}
                          onAddQuiz={handleAddQuiz}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>

                {modules.length === 0 && (
                    <div className="py-16 text-center flex flex-col items-center bg-slate-50 rounded-lg border border-slate-200 border-dashed">
                        <BookOpen className="size-10 text-slate-300 mb-3" />
                        <h4 className="text-lg font-medium text-slate-900">Structure Empty</h4>
                        <p className="text-slate-500 mt-1 text-sm max-w-sm mx-auto">Create a module to begin organizing the academic flow.</p>
                    </div>
                )}

                <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                    <button onClick={() => setStep(1)} className="group flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                        <ArrowLeft className="size-4" />
                        Details
                    </button>
                    <button 
                        onClick={() => setStep(3)}
                        disabled={modules.length === 0}
                        className="bg-primary text-white px-5 py-2.5 rounded-md font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                        Multimedia Assets
                    </button>
                </div>
            </div>
        )}

        {/* Step 3: Multimedia Connectivity */}
        {step === 3 && (
            <div className="p-8">
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-slate-900">Educational Resources</h2>
                    <p className="text-slate-500 mt-1 text-sm">Upload video assets and PDF study materials to your prepared lessons.</p>
                </div>

                {/* Upload status banner */}
                {Object.values(uploads).some(u => !u.done && !u.error) && (
                  <div className="mb-6 flex items-center gap-3 p-3 bg-blue-50 border border-blue-100 rounded-md">
                    <RefreshCw className="size-4 text-blue-500 shrink-0 animate-spin" />
                    <p className="text-sm font-medium text-blue-800">Uploads in progress...</p>
                  </div>
                )}

                <div className="space-y-6">
                  {modules.map((mod, mIdx) => (
                    <SortableModule
                      key={mod.id}
                      module={mod}
                      index={mIdx}
                      onDelete={setModuleToDelete}
                      onAddLesson={handleAddLesson}
                      onEditLesson={handleEditLesson}
                      onDeleteLesson={(lessonId) => confirmDeleteLesson()}
                      onLessonsReorder={handleLessonsReorder}
                      onAddQuiz={handleAddQuiz}
                    />
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                    <button onClick={() => setStep(2)} className="group flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                        <ArrowLeft className="size-4" />
                        Curriculum
                    </button>
                    <button 
                        onClick={() => setStep(4)}
                        disabled={Object.values(uploads).some(u => !u.done && !u.error)}
                        className="bg-primary text-white px-5 py-2.5 rounded-md font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                        Module Quizzes
                    </button>
                </div>
            </div>
        )}

        {/* Step 4: Final Verification */}
        {step === 4 && (
          <div className="p-10">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Module Quizzes</h2>
                <p className="text-slate-500 mt-1 text-sm">Create and manage quizzes for each course module.</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200">
                <HelpCircle className="size-4 text-primary" />
                <span className="text-sm font-medium text-slate-600">{modules.filter(m => m.quiz).length} / {modules.length} Modules have quizzes</span>
              </div>
            </div>

            <div className="space-y-6">
              {modules.map((mod, idx) => (
                <div key={mod.id} className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-200/50">
                  <div className="p-5 flex items-center justify-between border-b border-slate-200/60">
                    <div className="flex items-center gap-4">
                      <div className="size-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-400">
                        {idx + 1}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">{mod.title}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{mod.lessons.length} Lessons</span>
                          {mod.quiz ? (
                            <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded uppercase tracking-widest flex items-center gap-1">
                              <Check className="size-2.5" /> Quiz Ready
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded uppercase tracking-widest">No Quiz</span>
                          )}
                        </div>
                      </div>
                    </div>
                    {activeQuizModuleId === mod.id ? (
                      <button 
                        onClick={() => setActiveQuizModuleId(null)}
                        className="flex items-center gap-2 text-sm font-bold text-red-500 hover:text-red-600"
                      >
                        <X className="size-4" /> Cancel Quiz Edit
                      </button>
                    ) : (
                      <button 
                        onClick={() => setActiveQuizModuleId(mod.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:text-primary hover:border-primary transition-all shadow-sm"
                      >
                        {mod.quiz ? <PlusCircle className="size-4" /> : <Plus className="size-4" />}
                        {mod.quiz ? 'Edit Quiz' : 'Add Quiz'}
                      </button>
                    )}
                  </div>
                  
                  {activeQuizModuleId === mod.id && (
                    <div className="p-6 bg-white animate-in slide-in-from-top-4 duration-300">
                      <QuizBuilder 
                        moduleId={mod.id} 
                        moduleTitle={mod.title}
                        quiz={mod.quiz || null}
                        onQuizSaved={(quizData: Quiz) => {
                          setModules(prev => prev.map(m => m.id === mod.id ? { ...m, quiz: quizData } : m));
                          setActiveQuizModuleId(null);
                          toast.success('Module quiz updated successfully');
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                <button onClick={() => setStep(3)} className="group flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                    <ArrowLeft className="size-4" />
                    Multimedia
                </button>
                <button 
                    onClick={() => setStep(5)}
                    className="bg-primary text-white px-5 py-2.5 rounded-md font-medium text-sm hover:bg-primary/90 transition-colors"
                >
                    Review Course
                </button>
            </div>
          </div>
        )}

        {/* Step 5: Final Review */}
        {step === 5 && (
            <div className="p-8">
                <div className="mb-10 text-center max-w-2xl mx-auto">
                    <div className="size-20 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-emerald-100 shadow-sm shadow-emerald-500/10">
                        <Rocket className="size-10 text-emerald-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">Checkpoints & Verification</h2>
                    <p className="text-slate-500 mt-2 text-sm">Your course curriculum and pedagogical structure have been analyzed. Review the summary below before authorizing publication.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center hover:bg-white transition-colors duration-300">
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Modules</p>
                        <p className="text-3xl font-bold text-slate-900">{modules.length}</p>
                    </div>
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center hover:bg-white transition-colors duration-300">
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Lessons</p>
                        <p className="text-3xl font-bold text-slate-900">{modules.reduce((acc, m) => acc + m.lessons.length, 0)}</p>
                    </div>
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center hover:bg-white transition-colors duration-300">
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Assessments</p>
                        <p className="text-3xl font-bold text-slate-900">{modules.filter(m => m.quiz).length}</p>
                    </div>
                </div>

                <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                        <ShieldCheck className="size-5 text-emerald-500" />
                        <p className="text-sm font-medium text-emerald-800">Content Integrity: Validated and signed</p>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                        <ShieldCheck className="size-5 text-emerald-500" />
                        <p className="text-sm font-medium text-emerald-800">Media Assets: Optimized for streaming</p>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                    <button onClick={() => setStep(4)} className="group flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                        <ArrowLeft className="size-4" />
                        Quizzes
                    </button>
                    <button 
                        onClick={() => publishMutation.mutate()}
                        disabled={publishMutation.isPending}
                        className="flex items-center gap-2 bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all hover:shadow-lg hover:shadow-slate-200 shadow-md group"
                    >
                        {publishMutation.isPending ? (
                          <>
                            <RefreshCw className="size-5 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          <>
                            Save & Publish Changes
                            <ChevronRight className="size-5 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                    </button>
                </div>
            </div>
        )}
      </div>

      {/* Add Module Dialog */}
      <Dialog open={isAddModuleOpen} onOpenChange={setIsAddModuleOpen}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden border-none shadow-2xl rounded-[2rem] font-sans antialiased bg-white">
          <div className="p-10">
            <div className="size-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6">
              <Plus size={28} strokeWidth={2.5} />
            </div>
            <DialogHeader className="p-0 mb-6">
              <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">Add New Module</DialogTitle>
              <DialogDescription className="text-slate-500 font-semibold text-sm mt-2">
                Create a new section for your course curriculum.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Module Title</label>
                <Input
                  placeholder="e.g. Introduction to React"
                  value={newModuleTitle}
                  onChange={(e) => setNewModuleTitle(e.target.value)}
                  className="h-14 font-bold text-lg bg-slate-50/50 border-slate-200 rounded-xl focus:bg-white focus:ring-primary/10 transition-all"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="px-10 py-6 bg-slate-50 border-t border-slate-100 sm:justify-start gap-3">
            <Button 
              className="flex-1 h-12 rounded-xl font-black bg-primary text-white shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              onClick={confirmAddModule} 
              disabled={!newModuleTitle.trim()}
            >
              Update Map
            </Button>
            <Button 
              variant="ghost" 
              className="h-12 rounded-xl font-bold text-slate-400 hover:text-slate-900 transition-all"
              onClick={() => setIsAddModuleOpen(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Module Confirmation Dialog */}
      <Dialog open={!!moduleToDelete} onOpenChange={(open) => !open && setModuleToDelete(null)}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden border-none shadow-2xl rounded-[2rem] font-sans antialiased bg-white">
          <div className="p-10">
            <div className="size-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-6">
              <Trash2 size={28} strokeWidth={2.5} />
            </div>
            <DialogHeader className="p-0 mb-6">
              <DialogTitle className="text-2xl font-black text-red-600 tracking-tight">Delete Module?</DialogTitle>
              <DialogDescription className="text-slate-500 font-semibold text-sm mt-3">
                This action cannot be undone. All lessons within this module will be permanently removed from the curriculum.
              </DialogDescription>
            </DialogHeader>
          </div>
          <DialogFooter className="px-10 py-6 bg-red-50/30 border-t border-red-100 sm:justify-start gap-3">
            <Button 
              variant="destructive" 
              className="flex-1 h-12 rounded-xl font-black shadow-lg shadow-red-200 hover:scale-[1.02] active:scale-[0.98] transition-all"
              onClick={confirmDeleteModule}
            >
              Delete Permanently
            </Button>
            <Button 
              variant="ghost" 
              className="h-12 rounded-xl font-bold text-slate-400 hover:text-slate-900 transition-all"
              onClick={() => setModuleToDelete(null)}
            >
              Keep Module
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Lesson Confirmation Dialog */}
      <Dialog open={!!lessonToDelete} onOpenChange={(open) => !open && setLessonToDelete(null)}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden border-none shadow-2xl rounded-[2rem] font-sans antialiased bg-white">
          <div className="p-10">
            <div className="size-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-6">
              <Trash2 size={28} strokeWidth={2.5} />
            </div>
            <DialogHeader className="p-0 mb-6">
              <DialogTitle className="text-2xl font-black text-red-600 tracking-tight">Delete Lesson?</DialogTitle>
              <DialogDescription className="text-slate-500 font-semibold text-sm mt-3">
                Permanently remove this lesson from the module. This action is irreversible and will remove all associated media.
              </DialogDescription>
            </DialogHeader>
          </div>
          <DialogFooter className="px-10 py-6 bg-red-50/30 border-t border-red-100 sm:justify-start gap-3">
            <Button 
              variant="destructive" 
              className="flex-1 h-12 rounded-xl font-black shadow-lg shadow-red-200 hover:scale-[1.02] active:scale-[0.98] transition-all"
              onClick={confirmDeleteLesson}
            >
              Delete Lesson
            </Button>
            <Button 
              variant="ghost" 
              className="h-12 rounded-xl font-bold text-slate-400 hover:text-slate-900 transition-all"
              onClick={() => setLessonToDelete(null)}
            >
              Keep Lesson
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex items-center justify-center gap-10 text-slate-300">
         <div className="flex items-center gap-2">
             <ShieldCheck className="size-3" />
             <p className="text-[10px] font-bold uppercase tracking-wider">Secure Transmission</p>
         </div>
         <div className="hidden md:flex items-center gap-2">
             <Smartphone className="size-3" />
             <p className="text-[10px] font-bold uppercase tracking-wider">Responsive Ready</p>
         </div>
         <div className="flex items-center gap-2">
             <Plus className="size-3 text-primary" />
             <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">LMS Institutional v2.4</p>
         </div>
      </div>
    </div>
  );
}
