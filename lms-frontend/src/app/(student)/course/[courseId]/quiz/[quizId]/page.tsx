'use client';

import { useParams } from 'next/navigation';
import QuizPlayer from '@/components/course/QuizPlayer';
import { Button } from '@/components/ui/Button';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function StudentQuizPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const quizId = params.quizId as string;

  return (
    <div className="min-h-screen bg-slate-50/50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <Link href={`/course/${courseId}`}>
            <Button variant="ghost" className="gap-2 text-slate-500 hover:text-slate-900 font-bold">
              <ChevronLeft className="size-4" />
              Back to Course
            </Button>
          </Link>
          <div className="text-right">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Interactive Assessment</h1>
            <p className="text-xs font-bold text-slate-400 italic">Test your knowledge and track your progress</p>
          </div>
        </div>

        <QuizPlayer 
          quizId={quizId} 
          isAdmin={false} 
        />
      </div>
    </div>
  );
}
