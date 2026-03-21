import { useState } from 'react';
import {
  Plus, Trash2, CheckCircle2, ChevronDown, ChevronUp,
  HelpCircle, Percent, Save, Loader2
} from 'lucide-react';
import { api } from '@/lib/api-client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface QuizOption {
  id?: string;
  optionText: string;
  isCorrect: boolean;
  orderIndex: number;
}

export interface Question {
  id?: string;
  questionText: string;
  orderIndex: number;
  options: QuizOption[];
}

export interface Quiz {
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
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Quiz Config Header */}
      <Card className="bg-white border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-end gap-6">
            <div className="flex-1 space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1">
                Quiz Title
              </label>
              <Input
                value={quiz.title}
                onChange={(e) => setQuiz((q) => ({ ...q, title: e.target.value }))}
                placeholder="Enter quiz title..."
                className="h-11 text-base font-medium bg-white rounded-lg border-slate-200 focus:ring-primary/10 transition-colors"
              />
            </div>
            <div className="md:w-64 space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Percent className="size-3" /> Passing Score
                </label>
                <Badge variant="secondary" className="bg-primary/5 text-primary font-semibold px-2.5 py-0.5 rounded-md border text-xs">
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
                className="w-full accent-primary h-1.5 rounded-full cursor-pointer bg-slate-200 appearance-none"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions */}
      <div className="space-y-4">
        {quiz.questions.map((q, qi) => (
          <Card 
            key={qi} 
            className={cn(
              "rounded-xl border-slate-200 shadow-sm transition-all duration-300 overflow-hidden",
              expanded[qi] ? "shadow-md ring-1 ring-slate-100" : "hover:border-slate-300"
            )}
          >
            <div 
              className={cn(
                "flex items-center gap-4 px-5 py-4 cursor-pointer transition-colors",
                expanded[qi] ? "bg-slate-50/50 border-b border-slate-100" : "hover:bg-slate-50/30"
              )} 
              onClick={() => setExpanded((e) => ({ ...e, [qi]: !e[qi] }))}
            >
              <div className="size-9 rounded-lg bg-primary/5 flex items-center justify-center shrink-0 group">
                <HelpCircle className="size-4.5 text-primary" strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Question {qi + 1}</span>
                  {q.options.some(o => o.isCorrect && o.optionText) && (
                    <Badge variant="outline" className="text-[10px] font-semibold uppercase py-0 border-emerald-200 text-emerald-600 bg-emerald-50/50">Valid</Badge>
                  )}
                </div>
                <p className="text-sm font-semibold text-slate-900 truncate tracking-tight">
                  {q.questionText || <span className="text-slate-400 font-medium italic">Type your question...</span>}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="size-8 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  onClick={(e) => { e.stopPropagation(); deleteQuestion(qi); }}
                >
                  <Trash2 size={16} />
                </Button>
                {expanded[qi] ? <ChevronUp size={18} className="text-slate-500" /> : <ChevronDown size={18} className="text-slate-500" />}
              </div>
            </div>

            {(expanded[qi] || !q.questionText) && (
              <CardContent className="p-5 pt-4 space-y-6 animate-in slide-in-from-top-2 duration-300">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1">The Question</label>
                  <Input
                    value={q.questionText}
                    onChange={(e) => updateQuestion(qi, e.target.value)}
                    placeholder="Enter the question here..."
                    className="h-11 font-medium bg-white rounded-lg border-slate-200 focus:ring-primary/10 transition-colors shadow-sm"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1">Options & Correct Answer</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {q.options.map((opt, oi) => (
                      <div 
                        key={oi} 
                        className={cn(
                          "flex items-center gap-3 p-2.5 rounded-lg border transition-all duration-200",
                          opt.isCorrect 
                            ? "bg-emerald-50/30 border-emerald-200 ring-1 ring-emerald-100" 
                            : "bg-slate-50/50 border-slate-200 hover:border-slate-300"
                        )}
                      >
                        <button
                          onClick={() => setCorrectOption(qi, oi)}
                          className={cn(
                            "group size-8 rounded-md flex items-center justify-center transition-colors shrink-0",
                            opt.isCorrect 
                              ? "bg-emerald-500 text-white" 
                              : "bg-white border border-slate-300 text-slate-400 hover:text-slate-600"
                          )}
                        >
                          {opt.isCorrect ? (
                            <CheckCircle2 size={16} strokeWidth={2.5} className="animate-in zoom-in duration-200" />
                          ) : (
                            <span className="text-xs font-semibold tracking-wider">{letters[oi]}</span>
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <input
                            type="text"
                            value={opt.optionText}
                            onChange={(e) => updateOption(qi, oi, e.target.value)}
                            placeholder={`Option ${letters[oi]}`}
                            className={cn(
                              "w-full bg-transparent border-none p-0 text-sm font-medium focus:outline-none transition-colors",
                              opt.isCorrect ? "text-emerald-900 placeholder:text-emerald-400" : "text-slate-900 placeholder:text-slate-400"
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
      <div className="flex items-center gap-3 pt-3">
        <Button
          onClick={addQuestion}
          variant="outline"
          className="h-10 px-5 gap-2 rounded-md border-slate-200 font-medium bg-white hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm"
        >
          <Plus size={16} strokeWidth={2} />
          Add Question
        </Button>

        {quiz.questions.length > 0 && (
          <Button
            onClick={saveQuiz}
            disabled={saving}
            className="h-10 px-6 gap-2 rounded-md font-semibold bg-primary hover:bg-primary/90 text-white transition-colors hover:shadow-md disabled:opacity-50"
          >
            {saving ? (
              <span className="flex items-center gap-2"><Loader2 size={16} className="animate-spin" /> Saving...</span>
            ) : (
              <span className="flex items-center gap-2"><Save size={16} strokeWidth={2} /> Save Quiz</span>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
