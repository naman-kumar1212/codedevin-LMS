import { useState } from 'react';
import {
  Plus, Trash2, CheckCircle2, Circle, ChevronDown, ChevronUp,
  HelpCircle, Percent, Save
} from 'lucide-react';
import { api } from '@/lib/api-client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface QuizOption {
  id?: string;
  optionText: string;
  isCorrect: boolean;
  orderIndex: number;
}

interface Question {
  id?: string;
  questionText: string;
  orderIndex: number;
  options: QuizOption[];
}

interface Quiz {
  id?: string;
  title: string;
  passingScore: number;
  questions: Question[];
}

interface Props {
  moduleId: string;
  moduleTitle: string;
  quiz: Quiz | null;
  onQuizSaved: (quiz: Quiz) => void;
}

function makeDefaultQuestion(orderIndex: number): Question {
  return {
    questionText: '',
    orderIndex,
    options: [
      { optionText: '', isCorrect: true, orderIndex: 0 },
      { optionText: '', isCorrect: false, orderIndex: 1 },
      { optionText: '', isCorrect: false, orderIndex: 2 },
      { optionText: '', isCorrect: false, orderIndex: 3 },
    ],
  };
}

export function QuizBuilder({ moduleId, moduleTitle, quiz: initialQuiz, onQuizSaved }: Props) {
  const [quiz, setQuiz] = useState<Quiz>(
    initialQuiz ?? { title: `${moduleTitle} Quiz`, passingScore: 70, questions: [] },
  );
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  const addQuestion = () => {
    const newQ = makeDefaultQuestion((quiz.questions.length + 1) * 10);
    setQuiz((q) => ({ ...q, questions: [...q.questions, newQ] }));
    setExpanded((e) => ({ ...e, [quiz.questions.length]: true }));
  };

  const updateQuestion = (qi: number, text: string) => {
    setQuiz((q) => {
      const questions = [...q.questions];
      questions[qi] = { ...questions[qi], questionText: text };
      return { ...q, questions };
    });
  };

  const updateOption = (qi: number, oi: number, text: string) => {
    setQuiz((q) => {
      const questions = [...q.questions];
      const options = [...questions[qi].options];
      options[oi] = { ...options[oi], optionText: text };
      questions[qi] = { ...questions[qi], options };
      return { ...q, questions };
    });
  };

  const setCorrectOption = (qi: number, correctOi: number) => {
    setQuiz((q) => {
      const questions = [...q.questions];
      const options = questions[qi].options.map((o, oi) => ({
        ...o,
        isCorrect: oi === correctOi,
      }));
      questions[qi] = { ...questions[qi], options };
      return { ...q, questions };
    });
  };

  const deleteQuestion = (qi: number) => {
    setQuiz((q) => {
      const questions = q.questions.filter((_, i) => i !== qi);
      return { ...q, questions };
    });
  };

  const saveQuiz = async () => {
    setSaving(true);
    try {
      let savedQuiz = quiz;
      if (!quiz.id) {
        const res = await api.createModuleQuiz(moduleId, {
          title: quiz.title,
          passingScore: quiz.passingScore,
        });
        savedQuiz = { ...quiz, id: res.data.id };
      } else {
        await api.updateModuleQuiz(quiz.id, {
          title: quiz.title,
          passingScore: quiz.passingScore,
        });
      }
      onQuizSaved(savedQuiz);
    } catch (err) {
      console.error('Failed to save quiz:', err);
    } finally {
      setSaving(false);
    }
  };

  const letters = ['A', 'B', 'C', 'D'];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Quiz Config Header */}
      <Card className="bg-slate-50 border-slate-200/60 rounded-[2.5rem] overflow-hidden">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row md:items-end gap-8">
            <div className="flex-1 space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                Quiz Title
              </label>
              <Input
                value={quiz.title}
                onChange={(e) => setQuiz((q) => ({ ...q, title: e.target.value }))}
                placeholder="Enter quiz title..."
                className="h-14 text-lg font-bold bg-white rounded-2xl border-slate-200/80 focus:ring-primary/10 transition-all"
              />
            </div>
            <div className="md:w-64 space-y-3">
              <div className="flex items-center justify-between ml-1">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-1">
                  <Percent className="size-3" /> Passing Score
                </label>
                <Badge variant="secondary" className="bg-primary/10 text-primary font-black px-3 py-1 rounded-full border-none">
                  {quiz.passingScore}%
                </Badge>
              </div>
              <input
                type="range"
                min={10}
                max={100}
                step={5}
                value={quiz.passingScore}
                onChange={(e) => setQuiz((q) => ({ ...q, passingScore: Number(e.target.value) }))}
                className="w-full accent-primary h-2 rounded-full cursor-pointer bg-slate-200 appearance-none"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions */}
      <div className="space-y-6">
        {quiz.questions.map((q, qi) => (
          <Card 
            key={qi} 
            className={cn(
              "rounded-[2rem] border-slate-200/60 shadow-sm transition-all duration-500 overflow-hidden",
              expanded[qi] ? "shadow-2xl shadow-slate-200/50 -translate-y-1" : "hover:shadow-md"
            )}
          >
            <div 
              className={cn(
                "flex items-center gap-4 px-8 py-5 cursor-pointer transition-colors",
                expanded[qi] ? "bg-slate-50/50" : "hover:bg-slate-50/30"
              )} 
              onClick={() => setExpanded((e) => ({ ...e, [qi]: !e[qi] }))}
            >
              <div className="size-10 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 group">
                <HelpCircle className="size-5 text-primary group-hover:scale-110 transition-transform" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Question {qi + 1}</span>
                  {q.options.some(o => o.isCorrect && o.optionText) && (
                    <Badge variant="outline" className="text-[8px] font-black uppercase py-0 border-emerald-200 text-emerald-600 bg-emerald-50/50">Valid</Badge>
                  )}
                </div>
                <p className="text-sm font-bold text-slate-900 truncate tracking-tight">
                  {q.questionText || <span className="text-slate-300 font-medium italic">Type your question...</span>}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="size-8 rounded-xl text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all"
                  onClick={(e) => { e.stopPropagation(); deleteQuestion(qi); }}
                >
                  <Trash2 size={16} />
                </Button>
                {expanded[qi] ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
              </div>
            </div>

            {(expanded[qi] || !q.questionText) && (
              <CardContent className="p-8 pt-2 space-y-8 animate-in slide-in-from-top-4 duration-500">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">The Question</label>
                  <Input
                    value={q.questionText}
                    onChange={(e) => updateQuestion(qi, e.target.value)}
                    placeholder="Enter the question here..."
                    className="h-12 font-semibold bg-slate-50/50 rounded-xl border-slate-200 focus:bg-white transition-all"
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Options & Correct Answer</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {q.options.map((opt, oi) => (
                      <div 
                        key={oi} 
                        className={cn(
                          "flex items-center gap-4 p-3 rounded-2xl border transition-all duration-300",
                          opt.isCorrect 
                            ? "bg-emerald-50/50 border-emerald-200/60 ring-1 ring-emerald-100" 
                            : "bg-slate-50/30 border-slate-100 hover:border-slate-200"
                        )}
                      >
                        <button
                          onClick={() => setCorrectOption(qi, oi)}
                          className={cn(
                            "group size-10 rounded-xl flex items-center justify-center transition-all",
                            opt.isCorrect 
                              ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200" 
                              : "bg-white border border-slate-200 text-slate-300 hover:text-slate-500 hover:border-slate-300"
                          )}
                        >
                          {opt.isCorrect ? (
                            <CheckCircle2 size={20} className="animate-in zoom-in duration-300" />
                          ) : (
                            <span className="text-[11px] font-black tracking-widest ml-1">{letters[oi]}</span>
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <input
                            type="text"
                            value={opt.optionText}
                            onChange={(e) => updateOption(qi, oi, e.target.value)}
                            placeholder={`Option ${letters[oi]}`}
                            className={cn(
                              "w-full bg-transparent border-none p-0 text-sm font-bold focus:outline-none transition-colors",
                              opt.isCorrect ? "text-emerald-900 placeholder:text-emerald-300" : "text-slate-700 placeholder:text-slate-300"
                            )}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
        <Button
          onClick={addQuestion}
          variant="outline"
          className="h-14 px-8 gap-3 rounded-2xl border-slate-200 font-bold bg-white hover:bg-slate-50 transition-all hover:-translate-y-1"
        >
          <Plus size={18} strokeWidth={3} />
          Add Question
        </Button>

        {quiz.questions.length > 0 && (
          <Button
            onClick={saveQuiz}
            disabled={saving}
            className="h-14 px-10 gap-3 rounded-2xl font-black bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50"
          >
            {saving ? (
              <span className="flex items-center gap-2"><div className="size-4 rounded-full border-2 border-white/20 border-t-white animate-spin" /> Saving...</span>
            ) : (
              <span className="flex items-center gap-2"><Save size={18} strokeWidth={3} /> Save Quiz</span>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
