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
  RefreshCw
} from 'lucide-react';
import { ContentMetadataModal } from '@/components/admin/course-builder/ContentMetadataModal';
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

type Step = 1 | 2 | 3 | 4;

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

  const [modules, setModules] = useState<any[]>([]);
  const [uploads, setUploads] = useState<Record<string, any>>({});
  const [pendingModal, setPendingModal] = useState<any>(null);
  
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

  const steps = [
    { id: 1, label: 'Details', icon: FileText },
    { id: 2, label: 'Curriculum', icon: Layers },
    { id: 3, label: 'Content', icon: Video },
    { id: 4, label: 'Review', icon: Rocket },
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
    <div className="max-w-5xl mx-auto space-y-8 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Hidden file input for uploads */}
      <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelected} />

      {/* Metadata modal (non-blocking) */}
      {pendingModal && (
        <ContentMetadataModal
          lessonId={pendingModal.lessonId}
          lessonType={pendingModal.lessonType}
          initialTitle={pendingModal.initialTitle}
          onSave={(updated: any) => {
            const { moduleId, lessonId } = pendingModal;
            setModules((prev) =>
              prev.map((m) =>
                m.id === moduleId
                  ? { ...m, lessons: m.lessons.map((l: any) => (l.id === lessonId ? { ...l, title: updated.title ?? l.title } : l)) }
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
          <nav className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            <span>Editor</span>
            <ChevronRight className="size-3" />
            <span className="text-primary">{basicInfo.title || 'Course Details'}</span>
          </nav>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
            Modify <span className="text-primary">Curriculum</span>
          </h1>
          <p className="text-slate-500 mt-2 font-medium max-w-xl">
            Update your course structure, lessons, and multimedia assets. All changes are saved in real-time.
          </p>
        </div>
        <Link 
            href="/admin/courses" 
            className="group flex items-center gap-3 px-6 py-3 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-300 transition-all shadow-sm"
        >
            <ArrowLeft className="size-4" />
            <span className="text-sm font-bold">Back to List</span>
        </Link>
      </div>

      {/* Stepper Logic */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between relative px-12">
            <div className="absolute top-1/2 -translate-y-1/2 left-20 right-20 h-1 bg-slate-100 z-0" />
            <div 
                className="absolute top-1/2 -translate-y-1/2 left-20 h-1 bg-primary z-10 transition-all duration-500 ease-in-out" 
                style={{ width: `${((step - 1) / 3) * 75}%` }}
            />
            {steps.map((s) => (
            <div key={s.id} className="relative z-20 flex flex-col items-center gap-3 bg-white px-2">
                <div 
                  onClick={() => setStep(s.id as Step)}
                  className={`size-12 rounded-xl flex items-center justify-center transition-all duration-300 cursor-pointer ${
                  step >= s.id ? 'bg-primary shadow-lg shadow-primary/20 text-white' : 'bg-slate-50 border border-slate-200 text-slate-300'
                }`}>
                    {step > s.id ? (
                      <Check className="size-5" />
                    ) : (
                      <s.icon className="size-5" />
                    )}
                </div>
                <p className={`text-[11px] font-bold uppercase tracking-wider ${step >= s.id ? 'text-slate-900' : 'text-slate-400'}`}>
                    {s.label}
                </p>
            </div>
            ))}
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden min-h-[600px]">
        {/* Step 1: Basic Info */}
        {step === 1 && (
            <div className="p-12 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="mb-10 flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">General Information</h2>
                      <p className="text-slate-500 mt-2 font-medium">Provide the basic identity and description of your course.</p>
                    </div>
                    {updateMutation.isPending && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-primary/5 text-primary rounded-lg">
                        <div className="size-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Saving...</span>
                      </div>
                    )}
                </div>

                <form onSubmit={handleStep1Submit} className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Course Title</label>
                            <input 
                                required
                                type="text"
                                value={basicInfo.title}
                                onChange={(e) => setBasicInfo({...basicInfo, title: e.target.value})}
                                placeholder="e.g. Advanced Financial Management"
                                className="w-full h-14 bg-slate-50 border border-slate-200 rounded-xl px-6 text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Category Registry</label>
                            <Select 
                                value={basicInfo.category}
                                onValueChange={(val) => setBasicInfo({...basicInfo, category: val})}
                            >
                                <SelectTrigger className="w-full h-14 bg-slate-50 border-slate-200 rounded-xl px-6 font-semibold text-slate-900">
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

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Detailed Description</label>
                        <textarea 
                            rows={6}
                            value={basicInfo.description}
                            onChange={(e) => setBasicInfo({...basicInfo, description: e.target.value})}
                            placeholder="Describe what learners will achieve in this course..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Access Type</label>
                            <div className="flex items-center gap-3 p-1.5 bg-slate-100 rounded-xl border border-slate-200">
                                <button 
                                    type="button"
                                    onClick={() => setBasicInfo({...basicInfo, isFree: true, price: 0})}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${basicInfo.isFree ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                                >
                                    <ShieldCheck className="size-4" />
                                    Complimentary
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => setBasicInfo({...basicInfo, isFree: false})}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${!basicInfo.isFree ? 'bg-primary text-white shadow-md shadow-primary/20' : 'text-slate-500 hover:text-slate-900'}`}
                                >
                                    <BadgeCent className="size-4" />
                                    Premium
                                </button>
                            </div>
                        </div>
                        {!basicInfo.isFree && (
                            <div className="space-y-2 animate-in zoom-in-95 duration-300">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Tuition Fee (INR)</label>
                                <div className="relative">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-primary font-bold">₹</div>
                                    <input 
                                        type="number"
                                        value={basicInfo.price}
                                        onChange={(e) => setBasicInfo({...basicInfo, price: Number(e.target.value)})}
                                        className="w-full h-14 bg-slate-50 border border-slate-200 rounded-xl px-10 text-lg font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="pt-8 border-t border-slate-100">
                        <button 
                            type="submit"
                            className="w-full bg-primary text-white py-5 rounded-xl font-bold text-lg shadow-lg shadow-primary/20 hover:bg-primary/95 transition-all flex items-center justify-center gap-3 group"
                        >
                            Next: Curriculum Map
                            <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </form>
            </div>
        )}

        {/* Step 2: Curriculum Mapping */}
        {step === 2 && (
            <div className="p-12 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="mb-10 flex items-end justify-between gap-6">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Curriculum Structure</h2>
                        <p className="text-slate-500 mt-2 font-medium">Organize your course into modules and individual lessons.</p>
                    </div>
                    <button 
                        onClick={() => setIsAddModuleOpen(true)}
                        className="flex items-center gap-2 bg-slate-900 text-white px-6 py-4 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-slate-800 transition-all shadow-md shadow-slate-900/10"
                    >
                        <Plus className="size-4" />
                        Add New Module
                    </button>
                </div>

                <div className="space-y-6">
                    {modules.map((mod, mIdx) => (
                        <div key={mod.id} className="bg-slate-50 p-6 rounded-2xl border border-slate-200 group/module hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
                            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
                                <div className="flex items-center gap-4">
                                    <div className="size-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-400 group-hover/module:text-primary transition-colors">
                                        {mIdx + 1}
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900">{mod.title}</h3>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button 
                                      onClick={() => handleAddLesson(mod.id, 'video')}
                                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 text-[11px] font-bold text-slate-600 hover:text-primary hover:border-primary transition-all shadow-sm"
                                  >
                                      <Video className="size-4" />
                                      Video
                                  </button>
                                  <button 
                                      onClick={() => handleAddLesson(mod.id, 'pdf')}
                                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 text-[11px] font-bold text-slate-600 hover:text-primary hover:border-primary transition-all shadow-sm"
                                  >
                                      <FileText className="size-4" />
                                      PDF
                                  </button>
                                  <button 
                                      onClick={() => setModuleToDelete(mod.id)}
                                      className="size-9 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 transition-all shadow-sm"
                                  >
                                      <Trash2 className="size-4" />
                                  </button>
                                </div>
                            </div>
                            
                            <div className="space-y-3">
                                {mod.lessons.map((lesson: any, lIdx: number) => (
                                    <div key={lesson.id} className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between shadow-sm group/unit hover:border-primary/30 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="size-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-300 group-hover/unit:text-primary transition-colors">
                                                <Layers className="size-4" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-700">{lesson.title}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider px-2 py-0.5 bg-primary/5 rounded-md">{lesson.type}</span>
                                                    <div className="size-1 rounded-full bg-slate-300" />
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Lesson {lIdx + 1}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover/unit:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => setLessonToDelete({id: lesson.id, moduleIdx: mIdx})}
                                                className="size-8 rounded-lg text-slate-400 hover:text-red-500 transition-colors flex items-center justify-center"
                                            >
                                                <Trash2 className="size-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {mod.lessons.length === 0 && (
                                    <div className="py-8 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">No lessons added yet</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {modules.length === 0 && (
                        <div className="py-20 text-center flex flex-col items-center bg-slate-50 rounded-3xl border border-slate-200 border-dashed">
                            <BookOpen className="size-12 text-slate-200 mb-4" />
                            <h4 className="text-xl font-bold text-slate-900">Project Structure Empty</h4>
                            <p className="text-slate-500 mt-2 font-medium max-w-sm mx-auto">Create a module to begin organizing the academic flow.</p>
                        </div>
                    )}
                </div>

                <div className="mt-12 pt-8 border-t border-slate-100 flex items-center justify-between">
                    <button onClick={() => setStep(1)} className="group flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">
                        <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
                        Details
                    </button>
                    <button 
                        onClick={() => setStep(3)}
                        disabled={modules.length === 0}
                        className="bg-primary text-white px-8 py-4 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/95 transition-all disabled:opacity-50"
                    >
                        Multimedia Assets
                    </button>
                </div>
            </div>
        )}

        {/* Step 3: Multimedia Connectivity */}
        {step === 3 && (
            <div className="p-12 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="mb-10">
                    <h2 className="text-2xl font-bold text-slate-900">Educational Resources</h2>
                    <p className="text-slate-500 mt-2 font-medium">Upload video assets and PDF study materials to your prepared lessons.</p>
                </div>

                {/* Upload status banner */}
                {Object.values(uploads).some(u => !u.done && !u.error) && (
                  <div className="mb-6 flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <RefreshCw className="size-5 text-blue-500 shrink-0 animate-spin" />
                    <p className="text-sm font-semibold text-blue-700">Uploads in progress...</p>
                  </div>
                )}

                <div className="space-y-10">
                    {modules.map((mod) => (
                        <div key={mod.id} className="space-y-4">
                            <div className="flex items-center gap-3 px-2">
                                <p className="text-[11px] font-bold uppercase tracking-widest text-primary">Module:</p>
                                <h4 className="text-sm font-bold text-slate-900">{mod.title}</h4>
                                <div className="flex-1 h-px bg-slate-100" />
                            </div>
                            <div className="grid gap-4">
                                {mod.lessons.map((lesson: any) => {
                                  const upload = uploads[lesson.id];
                                  return (
                                    <div key={lesson.id} className="bg-slate-50 rounded-2xl border border-slate-200 p-6 flex flex-col md:flex-row md:items-center gap-6 group hover:bg-white transition-all">
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className="size-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors shadow-sm">
                                                {lesson.type === 'VIDEO' ? <Video className="size-5" /> : <FileText className="size-5" />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900 tracking-tight">{lesson.title}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                      Type: <span className="text-primary">{lesson.type}</span>
                                                  </span>
                                                  {lesson.status === 'uploading' && (
                                                    <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest flex items-center gap-1">
                                                      <RefreshCw className="size-2.5 animate-spin" /> Uploading
                                                    </span>
                                                  )}
                                                  {(lesson.status === 'ready' || lesson.videoUrl || lesson.resourceUrl) && (
                                                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                                                      <Check className="size-2.5" /> 
                                                      {lesson.videoUrl || lesson.resourceUrl ? 'File Linked' : 'Ready'}
                                                    </span>
                                                  )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="md:w-80">
                                            {upload && !upload.done && !upload.error ? (
                                              <div className="space-y-2">
                                                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                  <span>Progressing</span>
                                                  <span>{upload.progress}%</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                                                  <div 
                                                    className="h-full bg-primary transition-all duration-300"
                                                    style={{ width: `${upload.progress}%` }}
                                                  />
                                                </div>
                                              </div>
                                            ) : (
                                              <div className="flex items-center gap-4">
                                                <div className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-500 truncate">
                                                  {lesson.videoUrl || lesson.resourceUrl || lesson.videoId || 'No file attached'}
                                                </div>
                                                <button 
                                                  onClick={() => handleAddLesson(mod.id, lesson.type.toLowerCase() as 'video' | 'pdf', lesson.id)}
                                                  className="size-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary transition-all shadow-sm"
                                                >
                                                  <RefreshCw className="size-4" />
                                                </button>
                                              </div>
                                            )}
                                        </div>
                                    </div>
                                  );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-12 pt-8 border-t border-slate-100 flex items-center justify-between">
                    <button onClick={() => setStep(2)} className="group flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">
                        <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
                        Curriculum
                    </button>
                    <button 
                        onClick={() => setStep(4)}
                        disabled={Object.values(uploads).some(u => !u.done && !u.error)}
                        className="bg-primary text-white px-8 py-4 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/95 transition-all disabled:opacity-50"
                    >
                        Final Verification
                    </button>
                </div>
            </div>
        )}

        {/* Step 4: Final Verification */}
        {step === 4 && (
            <div className="p-12 animate-in fade-in slide-in-from-right-4 duration-500 text-center">
                <div className="max-w-xl mx-auto mb-10">
                    <div className="size-20 rounded-2xl bg-primary/5 flex items-center justify-center text-primary mx-auto mb-6 shadow-sm border border-primary/10">
                        <Check className="size-10" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-3">Review & Update</h2>
                    <p className="text-slate-500 font-medium">Verify your changes before publishing the updated curriculum to all enrolled students.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left max-w-3xl mx-auto bg-slate-50 p-8 rounded-3xl border border-slate-200 mb-10">
                    <div className="space-y-6">
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">Academic Title</p>
                            <h3 className="text-xl font-bold text-slate-900 leading-tight">{basicInfo.title}</h3>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <div className="px-3 py-1.5 bg-white rounded-lg border border-slate-100 shadow-sm flex items-center gap-2">
                                <div className="size-1.5 rounded-full bg-primary" />
                                <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">{basicInfo.category}</span>
                            </div>
                            <div className="px-3 py-1.5 bg-white rounded-lg border border-slate-100 shadow-sm flex items-center gap-2">
                                <div className="size-1.5 rounded-full bg-emerald-500" />
                                <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">{basicInfo.isFree ? 'Complimentary' : `₹${basicInfo.price}`}</span>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-6">
                        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Inventory Specs</p>
                        <div className="grid grid-cols-2 gap-4">
                             <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Modules</p>
                                <p className="text-2xl font-bold text-slate-900 mt-1">{modules.length}</p>
                             </div>
                             <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Lessons</p>
                                <p className="text-2xl font-bold text-slate-900 mt-1">{modules.reduce((acc: number, m: any) => acc + m.lessons.length, 0)}</p>
                             </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-4 max-w-md mx-auto">
                    <button 
                        onClick={() => publishMutation.mutate()}
                        disabled={publishMutation.isPending}
                        className="w-full bg-primary text-white py-5 rounded-xl font-bold text-lg shadow-xl shadow-primary/20 hover:bg-primary/95 transition-all flex items-center justify-center gap-3 group"
                    >
                        {publishMutation.isPending ? (
                            <>
                                <div className="size-5 border-3 border-white/20 border-t-white rounded-full animate-spin" />
                                Processing Update...
                            </>
                        ) : (
                            <>
                                <Save className="size-5" />
                                Apply All Changes
                            </>
                        )}
                    </button>
                    <Link href="/admin/courses" className="text-xs font-bold text-slate-400 uppercase tracking-wider hover:text-primary py-2 transition-colors">Return to Dashboard</Link>
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
