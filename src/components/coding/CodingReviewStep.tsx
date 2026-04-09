import { useState } from 'react';
import type { CodingProblem, Difficulty } from '@/types/hirenowx';
import { cn } from '@/lib/utils';
import {
  CheckCircle2, RefreshCw, Eye, Lock, Trash2,
  CheckCheck, AlertTriangle, Code2, Clock, Target, FileCode
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SkillChip } from '@/components/shared/SkillChip';

interface Props { problems: CodingProblem[]; onChange: (p: CodingProblem[]) => void; }

const diffColors: Record<Difficulty, string> = {
  easy: 'bg-green-light text-hnxgreen',
  medium: 'bg-warning-light text-warning',
  hard: 'bg-danger-light text-destructive',
};

export function CodingReviewStep({ problems, onChange }: Props) {
  const [filter, setFilter] = useState<'all' | Difficulty>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = filter === 'all' ? problems : problems.filter(p => p.difficulty === filter);
  const approvedCount = problems.filter(p => p.approved).length;

  const updateProblem = (id: string, p: Partial<CodingProblem>) => {
    onChange(problems.map(prob => prob.id === id ? { ...prob, ...p } : prob));
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{problems.length} Problems Generated</span>
          <span className="hnx-badge bg-green-light text-hnxgreen">{approvedCount} Approved</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border overflow-hidden text-xs">
            {(['all', 'easy', 'medium', 'hard'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={cn('px-3 py-1.5 capitalize transition-colors', filter === f ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}
              >{f}</button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={() => onChange(problems.map(p => ({ ...p, approved: true })))}>
            <CheckCheck className="w-3.5 h-3.5 mr-1" />Approve All
          </Button>
        </div>
      </div>

      {/* Problems */}
      {filtered.map((problem) => {
        const expanded = expandedId === problem.id;
        return (
          <div key={problem.id} className={cn('hnx-card overflow-hidden', problem.approved && 'ring-1 ring-hnxgreen/30')}>
            <div className="p-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Code2 className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="text-sm font-semibold">{problem.title}</h3>
                    <span className={cn('hnx-badge capitalize', diffColors[problem.difficulty])}>{problem.difficulty}</span>
                    <span className="hnx-badge bg-muted text-muted-foreground capitalize">{problem.type.replace('-', ' ')}</span>
                    {problem.locked && <span className="hnx-badge bg-muted text-muted-foreground"><Lock className="w-3 h-3" />Locked</span>}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{problem.summary}</p>

                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <SkillChip label={problem.competency} variant="teal" size="sm" />
                    <SkillChip label={problem.skill} variant="primary" size="sm" />
                    {problem.languages.map(l => <SkillChip key={l} label={l} variant="muted" size="sm" />)}
                    <span className="flex items-center gap-1 text-muted-foreground ml-2">
                      <Clock className="w-3 h-3" />~{problem.estimatedTime} min
                    </span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Target className="w-3 h-3" />{problem.scoreWeight} pts
                    </span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <FileCode className="w-3 h-3" />{problem.testCases.visible}+{problem.testCases.hidden} tests
                    </span>
                    <span className={cn('hnx-badge text-[10px]',
                      problem.freshness === 'fresh' ? 'bg-green-light text-hnxgreen' :
                      problem.freshness === 'recent' ? 'bg-warning-light text-warning' : 'bg-muted text-muted-foreground'
                    )}>{problem.freshness}</span>
                  </div>

                  {/* Expanded details */}
                  {expanded && (
                    <div className="mt-4 space-y-3 animate-fade-in">
                      <div className="p-4 rounded-lg bg-muted/30 border">
                        <p className="text-xs font-semibold mb-2">Problem Statement</p>
                        <p className="text-sm">{problem.prompt}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-lg bg-muted/20">
                          <p className="text-xs font-semibold mb-1">Constraints</p>
                          <ul className="text-xs text-muted-foreground space-y-0.5">
                            {problem.constraints.map((c, i) => <li key={i}>• {c}</li>)}
                          </ul>
                        </div>
                        <div className="p-3 rounded-lg bg-muted/20">
                          <p className="text-xs font-semibold mb-1">Expected Complexity</p>
                          <p className="text-xs text-muted-foreground">{problem.expectedComplexity}</p>
                          <p className="text-xs font-semibold mt-2 mb-1">Evaluation</p>
                          <p className="text-xs text-muted-foreground">{problem.evaluationType}</p>
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/20">
                        <p className="text-xs font-semibold mb-1">Scoring Logic</p>
                        <p className="text-xs text-muted-foreground">{problem.scoringLogic}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-blue-light border border-primary/10">
                        <p className="text-xs font-semibold text-primary mb-1">Sample Test Case</p>
                        {problem.sampleCases.map((sc, i) => (
                          <div key={i} className="text-xs font-mono mt-1">
                            <span className="text-muted-foreground">Input:</span> {sc.input}<br />
                            <span className="text-muted-foreground">Output:</span> {sc.output}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 mt-4 ml-14">
                <Button size="sm" variant={problem.approved ? 'default' : 'outline'} className="h-7 text-xs" onClick={() => updateProblem(problem.id, { approved: !problem.approved })}>
                  <CheckCircle2 className="w-3 h-3 mr-1" />{problem.approved ? 'Approved' : 'Approve'}
                </Button>
                <Button size="sm" variant="outline" className="h-7 text-xs"><RefreshCw className="w-3 h-3 mr-1" />Regenerate</Button>
                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setExpandedId(expanded ? null : problem.id)}>
                  <Eye className="w-3 h-3 mr-1" />{expanded ? 'Collapse' : 'Details'}
                </Button>
                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => updateProblem(problem.id, { locked: !problem.locked })}>
                  <Lock className="w-3 h-3 mr-1" />{problem.locked ? 'Unlock' : 'Lock'}
                </Button>
                <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive" onClick={() => onChange(problems.filter(x => x.id !== problem.id))}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        );
      })}

      {/* Bottom actions */}
      {problems.length > 0 && (
        <div className="flex items-center justify-between p-4 hnx-card">
          <div className="text-sm text-muted-foreground">{approvedCount} of {problems.length} approved</div>
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
