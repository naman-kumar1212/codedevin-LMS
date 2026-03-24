'use client';

import { useParams } from 'next/navigation';
import QuizPlayer from '@/components/course/QuizPlayer';
import { Button } from '@/components/ui/Button';
import { ChevronLeft, Info } from 'lucide-react';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function AdminQuizPreviewPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const quizId = params.quizId as string;

  return (
    <div className="min-h-screen bg-slate-50/50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <Link href={`/admin/courses/${courseId}/preview`}>
            <Button variant="ghost" className="gap-2 text-slate-500 hover:text-slate-900 font-bold">
              <ChevronLeft className="size-4" />
              Back to Preview
            </Button>
          </Link>
          <div className="text-right">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Quiz Preview</h1>
            <p className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-md inline-block mt-1">
              Admin Mode
            </p>
          </div>
        </div>

        <Alert className="mb-8 border-primary/20 bg-primary/5 rounded-[24px] p-6 shadow-sm">
          <Info className="size-5 text-primary" />
          <AlertTitle className="text-sm font-black text-primary uppercase tracking-wider mb-1">Preview Notice</AlertTitle>
          <AlertDescription className="text-slate-600 font-medium">
            You are viewing this quiz as an administrator. There are no attempt limits, and your score will not be tracked in user performance metrics.
          </AlertDescription>
        </Alert>

        <QuizPlayer 
          quizId={quizId} 
          isAdmin={true} 
        />
      </div>
    </div>
  );
}
