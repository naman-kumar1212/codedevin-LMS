import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mail, Linkedin, Globe, Users, BookOpen } from 'lucide-react';

interface InstructorBioProps {
  name: string;
  title: string;
  bio: string;
  avatarUrl?: string;
  email?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
  totalStudents?: number;
  totalCourses?: number;
  className?: string;
}

export function InstructorBio({
  name,
  title,
  bio,
  avatarUrl,
  email,
  linkedinUrl,
  websiteUrl,
  totalStudents,
  totalCourses,
  className,
}: InstructorBioProps) {
  return (
    <div className={cn('bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm', className)}>
      <div className="flex flex-col md:flex-row gap-10">
        <div className="flex flex-col items-center gap-6 md:w-1/3">
          <Avatar className="size-32 rounded-[32px] border-4 border-slate-50 shadow-xl shadow-slate-200/60 ring-1 ring-slate-100">
            <AvatarImage src={avatarUrl} className="object-cover" />
            <AvatarFallback className="text-4xl font-black bg-primary/10 text-primary">
              {name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex items-center gap-3">
            {email && (
              <a href={`mailto:${email}`} className="size-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-primary transition-all hover:bg-primary/5 active:scale-90">
                <Mail size={18} />
              </a>
            )}
            {linkedinUrl && (
              <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className="size-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-primary transition-all hover:bg-primary/5 active:scale-90">
                <Linkedin size={18} />
              </a>
            )}
            {websiteUrl && (
              <a href={websiteUrl} target="_blank" rel="noopener noreferrer" className="size-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-primary transition-all hover:bg-primary/5 active:scale-90">
                <Globe size={18} />
              </a>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4 w-full">
            <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-50 text-center">
              <div className="flex items-center justify-center gap-1.5 text-primary mb-1">
                <Users size={14} />
                <span className="text-xs font-black tracking-tight">{totalStudents?.toLocaleString() || 0}</span>
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Learners</p>
            </div>
            <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-50 text-center">
              <div className="flex items-center justify-center gap-1.5 text-slate-900 mb-1">
                <BookOpen size={14} />
                <span className="text-xs font-black tracking-tight">{totalCourses || 0}</span>
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Units</p>
            </div>
          </div>
        </div>
        
        <div className="flex-1 space-y-6 text-center md:text-left">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary bg-primary/10 px-3 py-1.5 rounded-xl inline-block mb-3">
              Lead Instructor
            </span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">{name}</h2>
            <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">{title}</p>
          </div>
          
          <p className="text-base text-slate-600 leading-relaxed font-medium italic">
            "{bio}"
          </p>
          
          <div className="pt-4">
             <button className="text-[11px] font-black uppercase tracking-widest text-primary border-b-2 border-primary/20 pb-1 hover:border-primary transition-all">
                View Instructor Portfolio
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
