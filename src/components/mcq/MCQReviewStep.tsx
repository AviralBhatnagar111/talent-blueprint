import { useState } from 'react';
import type { MCQQuestion, Difficulty, QuestionType } from '@/types/hirenowx';
import { cn } from '@/lib/utils';
import {
  CheckCircle2, RefreshCw, Pencil, Eye, Lock, Trash2,
  Filter, CheckCheck, AlertTriangle, ChevronDown, ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SkillChip } from '@/components/shared/SkillChip';

interface Props { questions: MCQQuestion[]; onChange: (q: MCQQuestion[]) => void; }

const diffColors: Record<Difficulty, string> = {
  easy: 'bg-green-light text-hnxgreen',
  medium: 'bg-warning-light text-warning',
  hard: 'bg-danger-light text-destructive',
};

const typeLabels: Record<QuestionType, string> = {
  mcq: 'MCQ', 'true-false': 'True/False', scenario: 'Scenario', 'short-answer': 'Short Answer',
};

export function MCQReviewStep({ questions, onChange }: Props) {
  const [filter, setFilter] = useState<'all' | Difficulty>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = filter === 'all' ? questions : questions.filter(q => q.difficulty === filter);
  const approvedCount = questions.filter(q => q.approved).length;

  const updateQuestion = (id: string, p: Partial<MCQQuestion>) => {
    onChange(questions.map(q => q.id === id ? { ...q, ...p } : q));
  };

  const bulkApprove = () => onChange(questions.map(q => ({ ...q, approved: true })));

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{questions.length} Questions Generated</span>
          <span className="hnx-badge bg-green-light text-hnxgreen">{approvedCount} Approved</span>
          {questions.some(q => q.flagged) && (
            <span className="hnx-badge bg-warning-light text-warning">
              <AlertTriangle className="w-3 h-3" />{questions.filter(q => q.flagged).length} Review Suggested
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border overflow-hidden text-xs">
            {(['all', 'easy', 'medium', 'hard'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={cn('px-3 py-1.5 capitalize transition-colors', filter === f ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}
              >{f}</button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={bulkApprove}>
            <CheckCheck className="w-3.5 h-3.5 mr-1" />Approve All
          </Button>
        </div>
      </div>

      {/* Questions */}
      {filtered.map((q, i) => {
        const expanded = expandedId === q.id;
        return (
          <div key={q.id} className={cn('hnx-card overflow-hidden transition-all', q.approved && 'ring-1 ring-hnxgreen/30', q.flagged && 'ring-1 ring-warning/30')}>
            <div className="p-4">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={cn('hnx-badge capitalize', diffColors[q.difficulty])}>{q.difficulty}</span>
                    <span className="hnx-badge bg-muted text-muted-foreground">{typeLabels[q.type]}</span>
                    <SkillChip label={q.skill} variant="primary" size="sm" />
                    <SkillChip label={q.competency} variant="teal" size="sm" />
                    {q.flagged && <span className="hnx-badge bg-warning-light text-warning"><AlertTriangle className="w-3 h-3" />Review</span>}
                    {q.locked && <span className="hnx-badge bg-muted text-muted-foreground"><Lock className="w-3 h-3" />Locked</span>}
                    <span className="text-[10px] text-muted-foreground ml-auto">~{q.estimatedTime} min</span>
                  </div>
                  <p className="text-sm font-medium">{q.text}</p>

                  {/* Options */}
                  <div className="mt-3 space-y-1.5">
                    {q.options.map(opt => (
                      <div key={opt.id} className={cn(
                        'flex items-center gap-2 px-3 py-2 rounded-md text-sm border',
                        opt.correct ? 'bg-green-light border-hnxgreen/30 font-medium' : 'bg-muted/30 border-transparent'
                      )}>
                        {opt.correct && <CheckCircle2 className="w-3.5 h-3.5 text-hnxgreen shrink-0" />}
                        {opt.text}
                      </div>
                    ))}
                  </div>

                  {/* Expanded explanation */}
                  {expanded && (
                    <div className="mt-3 p-3 rounded-lg bg-blue-light border border-primary/10 text-sm animate-fade-in">
                      <p className="text-xs font-semibold text-primary mb-1">Explanation</p>
                      <p className="text-xs text-muted-foreground">{q.explanation}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 mt-3 ml-9">
                <Button size="sm" variant={q.approved ? 'default' : 'outline'} className="h-7 text-xs" onClick={() => updateQuestion(q.id, { approved: !q.approved })}>
                  <CheckCircle2 className="w-3 h-3 mr-1" />{q.approved ? 'Approved' : 'Approve'}
                </Button>
                <Button size="sm" variant="outline" className="h-7 text-xs"><RefreshCw className="w-3 h-3 mr-1" />Regenerate</Button>
                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setExpandedId(expanded ? null : q.id)}>
                  <Eye className="w-3 h-3 mr-1" />{expanded ? 'Hide' : 'Explain'}
                </Button>
                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => updateQuestion(q.id, { locked: !q.locked })}>
                  <Lock className="w-3 h-3 mr-1" />{q.locked ? 'Unlock' : 'Lock'}
                </Button>
                <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive" onClick={() => onChange(questions.filter(x => x.id !== q.id))}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        );
      })}

      {/* Bottom actions */}
      {questions.length > 0 && (
        <div className="flex items-center justify-between p-4 hnx-card">
          <div className="text-sm text-muted-foreground">
            {approvedCount} of {questions.length} approved
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">Save Draft</Button>
            <Button variant="outline" size="sm">Save as Variant</Button>
            <Button size="sm" disabled={approvedCount === 0}>Save Final Assessment</Button>
          </div>
        </div>
      )}
    </div>
  );
}
