'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function AdminCourseRedirectPage() {
  const params = useParams<{ courseId: string }>();
  const router = useRouter();
  const { courseId } = params;
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAndRedirect = async () => {
      try {
        const res = await api.getCourse(courseId);
        const course = res.data;
        if (course) {
          router.replace(`/admin/courses/${courseId}/preview`);
        }
      } catch (err) {
        console.error('Failed to redirect admin preview', err);
        setError('Course not found or insufficient permissions.');
      }
    };

    fetchAndRedirect();
  }, [courseId, router]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[400px] text-center gap-6">
        <div className="size-16 bg-error/10 text-error rounded-full flex items-center justify-center">
          <AlertCircle className="size-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Unable to Start Preview</h2>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">{error}</p>
        </div>
        <Button variant="outline" onClick={() => router.push('/admin/courses')}>
          <ArrowLeft className="size-4 mr-2" />
          Back to Courses
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-12 min-h-[400px] gap-4">
      <Loader2 className="size-8 text-primary animate-spin" />
      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Initializing Preview Flow...</p>
    </div>
  );
}
