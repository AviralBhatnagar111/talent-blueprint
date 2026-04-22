import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { useStore } from '@/store/useStore';
import { toast } from 'sonner';
import {
  GripVertical, Plus, Trash2, Copy, Sparkles, X, ChevronDown, ChevronRight,
  AlertCircle, Save, Clock,
} from 'lucide-react';
import { ContextTopBar, NavyChip } from '@/components/shared/ContextTopBar';
import { ROUND_META, RoundTypeIcon } from '@/components/shared/RoundIcon';
import {
  IntelligencePanel, PanelSection, StatBar, ChecklistItem,
  CompetencySection, Recommendation, RoleContextSection,
} from '@/components/shared/IntelligencePanel';
import { SkillChip } from '@/components/shared/SkillChip';
import { cn } from '@/lib/utils';
import type { Round, RoundType } from '@/types/hirenowx';

const ADDABLE_ROUND_TYPES: RoundType[] = ['Screening', 'MCQ', 'Coding', 'AIInterview', 'ManualInterview', 'HR', 'TakeHome', 'FinalApproval'];

export default function TemplateBuilder() {
  const { jobId } = useParams<{ jobId: string }>();
  const job = useStore(s => s.getJob(jobId!));
  const updateRounds = useStore(s => s.updateJobRounds);

  const [dismissedBanner, setDismissedBanner] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [dragId, setDragId] = useState<string | null>(null);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<Record<string, string[]>>({});

  if (!job) {
    return <AppLayout bare><div className="p-8">Job not found.</div></AppLayout>;
  }

  const rounds = job.rounds;
  const totalDuration = rounds.reduce((a, r) => a + r.durationMin, 0);
  const readyCount = rounds.filter(r => r.assessmentStatus === 'ready').length;
  const assessmentRounds = rounds.filter(r => r.type === 'MCQ' || r.type === 'Coding');
  const notBuiltAssessments = assessmentRounds.filter(r => r.assessmentStatus === 'not_built');
  const assessableSkills = Array.from(new Set([
    ...job.roleContext.primarySkills,
    ...job.roleContext.secondarySkills,
    ...job.competencies.map(c => c.name),
  ]));

  const readiness = Math.round(
    (rounds.length >= 3 ? 30 : 10) +
    (readyCount / Math.max(1, assessmentRounds.length)) * 40 +
    (rounds.some(r => r.type === 'HR' || r.type === 'FinalApproval') ? 15 : 0) +
    (totalDuration < 180 ? 15 : 5)
  );

  const toggleExpand = (id: string) => {
    const next = new Set(expanded);
    if (next.has(id)) next.delete(id); else next.add(id);
    setExpanded(next);
  };

  const handleDragStart = (id: string) => setDragId(id);
  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!dragId || dragId === targetId) return;
    const dragIdx = rounds.findIndex(r => r.id === dragId);
    const targetIdx = rounds.findIndex(r => r.id === targetId);
    const next = [...rounds];
    const [moved] = next.splice(dragIdx, 1);
    next.splice(targetIdx, 0, moved);
    updateRounds(job.id, next);
  };

  const updateRound = (id: string, patch: Partial<Round>) => {
    updateRounds(job.id, rounds.map(r => r.id === id ? { ...r, ...patch } : r));
  };
  const deleteRound = (id: string) => {
    updateRounds(job.id, rounds.filter(r => r.id !== id));
    toast('Round removed');
  };
  const duplicateRound = (id: string) => {
    const src = rounds.find(r => r.id === id);
    if (!src) return;
    const copy: Round = { ...src, id: `r-${Date.now()}`, label: src.label + ' (copy)', assessmentStatus: 'not_built', assessmentId: undefined };
    const idx = rounds.findIndex(r => r.id === id);
    const next = [...rounds];
    next.splice(idx + 1, 0, copy);
    updateRounds(job.id, next);
    toast('Round duplicated');
  };
  const addRound = (type: RoundType) => {
    const meta = ROUND_META[type];
    const newRound: Round = {
      id: `r-${Date.now()}`,
      orderIndex: rounds.length,
      type,
      label: meta.name,
      durationMin: type === 'Coding' ? 90 : type === 'MCQ' ? 30 : 45,
      mandatory: true,
      autoTrigger: type === 'Screening' || type === 'MCQ' || type === 'Coding',
      passThreshold: 65,
      assessmentStatus: (type === 'MCQ' || type === 'Coding') ? 'not_built' : 'ready',
    };
    updateRounds(job.id, [...rounds, newRound]);
    setShowAddMenu(false);
    toast.success(`${meta.name} added`);
  };

  const saveTemplate = () => {
    toast.success('Template saved', { description: 'Your hiring plan is ready to use.' });
  };

  const updateRoundSkills = (roundId: string, skills: string[]) => {
    setSelectedSkills(prev => ({ ...prev, [roundId]: skills }));
  };

  return (
    <AppLayout bare>
      <ContextTopBar
        backTo={`/jobs/${job.id}`}
        backLabel="Job Details"
        breadcrumbs={[
          { label: job.title, to: `/jobs/${job.id}` },
          { label: 'Job Template' },
        ]}
        chips={
          <>
            <NavyChip>{job.department}</NavyChip>
            <NavyChip>{job.experienceBand}</NavyChip>
            <NavyChip>{job.workMode}</NavyChip>
            <NavyChip tone="teal">{rounds.length} rounds · ~{totalDuration} min</NavyChip>
            {notBuiltAssessments.length > 0 && (
              <NavyChip tone="default">
                <AlertCircle className="w-3 h-3" />{notBuiltAssessments.length} assessment{notBuiltAssessments.length > 1 ? 's' : ''} to build
              </NavyChip>
            )}
          </>
        }
        actions={
          <>
            <Button size="sm" variant="ghost" className="text-navy-foreground/90 hover:bg-white/10 hover:text-navy-foreground h-8" onClick={() => toast('Draft saved')}>
              <Save className="w-3.5 h-3.5 mr-1.5" />Save Draft
            </Button>
            <Button size="sm" className="bg-hnxgreen hover:bg-hnxgreen-deep text-navy font-semibold h-8" onClick={saveTemplate}>
              Save Template
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-[1fr_340px] gap-6 p-6 max-w-[1440px] mx-auto">
        {/* LEFT — round planner */}
        <div className="min-w-0 space-y-5">
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-[22px] font-bold tracking-tight text-navy">Job Template</h1>
              <p className="text-[13px] text-muted-foreground mt-0.5">Design the candidate evaluation journey for this role</p>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              <span>~{totalDuration} min candidate effort</span>
            </div>
          </div>

          {/* AI banner */}
          {!dismissedBanner && (
            <div className="hnx-card overflow-hidden gradient-ai-banner border-teal/30 animate-slide-up">
              <div className="p-4 flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-teal flex items-center justify-center shrink-0 shadow-teal-glow">
                  <Sparkles className="w-4 h-4 text-primary-foreground" strokeWidth={2.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-navy mb-0.5">AI Recommendation</p>
                  <p className="text-[12px] text-foreground/80 mb-3">
                    Based on <span className="font-semibold">{job.title}</span>, we recommend: <span className="text-navy font-semibold">{rounds.map(r => ROUND_META[r.type].name.split(' ')[0]).join(' → ')}</span>
                  </p>
                  <div className="flex items-center gap-2">
                    <Button size="sm" className="h-7 text-[12px] bg-teal hover:bg-teal-deep">
                      <Sparkles className="w-3 h-3 mr-1" />Apply Recommended
                    </Button>
                    <button className="text-[12px] text-muted-foreground hover:text-foreground font-medium">Start from scratch</button>
                  </div>
                </div>
                <button onClick={() => setDismissedBanner(true)} className="w-7 h-7 rounded-md hover:bg-white/50 flex items-center justify-center shrink-0">
                  <X className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </div>
            </div>
          )}

          {/* Round cards */}
          <div className="space-y-2">
            {rounds.map((round, i) => (
              <RoundCard
                key={round.id}
                round={round}
                index={i}
                expanded={expanded.has(round.id)}
                onToggleExpand={() => toggleExpand(round.id)}
                onUpdate={(patch) => updateRound(round.id, patch)}
                onDelete={() => deleteRound(round.id)}
                onDuplicate={() => duplicateRound(round.id)}
                onDragStart={() => handleDragStart(round.id)}
                onDragOver={(e) => handleDragOver(e, round.id)}
                onDragEnd={() => setDragId(null)}
                isDragging={dragId === round.id}
                skills={assessableSkills}
                selectedSkills={selectedSkills[round.id] || []}
                onSkillsChange={(skills) => updateRoundSkills(round.id, skills)}
              />
            ))}
          </div>

          {/* Add round */}
          <div className="relative">
            {!showAddMenu ? (
              <button
                onClick={() => setShowAddMenu(true)}
                className="w-full py-5 rounded-xl border-2 border-dashed border-teal/40 bg-teal-light/20 hover:bg-teal-light/40 hover:border-teal transition-all group"
              >
                <span className="inline-flex items-center gap-2 text-[13px] font-semibold text-teal-deep">
                  <Plus className="w-4 h-4" strokeWidth={2.5} />
                  Add Round
                </span>
              </button>
            ) : (
              <div className="hnx-card-elevated p-4 animate-slide-up">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[13px] font-bold text-navy">Choose a round type</p>
                  <button onClick={() => setShowAddMenu(false)} className="w-6 h-6 hover:bg-muted rounded-md flex items-center justify-center">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {ADDABLE_ROUND_TYPES.map(t => {
                    const meta = ROUND_META[t];
                    return (
                      <button
                        key={t}
                        onClick={() => addRound(t)}
                        className="flex items-center gap-2.5 p-2.5 rounded-lg border border-border hover:border-teal hover:bg-teal-light/30 transition-all text-left group"
                      >
                        <RoundTypeIcon type={t} size="sm" />
                        <div className="min-w-0">
                          <p className="text-[12px] font-semibold text-navy">{meta.name}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{meta.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT — intelligence panel */}
        <IntelligencePanel>
          <RoleContextSection context={job.roleContext} />

          <PanelSection title="Plan Health" defaultOpen>
            <StatBar label="Plan Readiness" value={readiness} color={readiness >= 80 ? 'green' : readiness >= 60 ? 'teal' : 'warning'} />
            <div className="mt-4 space-y-0.5">
              <ChecklistItem tone="ok">{rounds.length} rounds configured</ChecklistItem>
              <ChecklistItem tone="ok">Competency coverage: High</ChecklistItem>
              <ChecklistItem tone={totalDuration < 180 ? 'ok' : 'warn'}>
                Candidate effort: ~{totalDuration} min {totalDuration < 180 ? '(healthy)' : '(long)'}
              </ChecklistItem>
              {notBuiltAssessments.map(r => (
                <ChecklistItem key={r.id} icon={AlertCircle} tone="warn">
                  {r.label} assessment not ready
                </ChecklistItem>
              ))}
              <ChecklistItem tone="info" icon={Clock}>
                {rounds.filter(r => r.autoTrigger).length} rounds auto-triggered
              </ChecklistItem>
            </div>
          </PanelSection>

          <CompetencySection competencies={job.competencies} />

          <PanelSection title="Recommendations" defaultOpen={false}>
            <div className="space-y-2">
              {notBuiltAssessments.length > 0 && (
                <Recommendation>Complete the {notBuiltAssessments[0].label} to activate auto-triggers.</Recommendation>
              )}
              {totalDuration > 180 && (
                <Recommendation>Total duration is {totalDuration} min — consider shortening to keep candidate drop-off low.</Recommendation>
              )}
              {!rounds.some(r => r.type === 'HR') && (
                <Recommendation>Add an HR round for culture-fit and offer alignment.</Recommendation>
              )}
            </div>
          </PanelSection>

        </IntelligencePanel>
      </div>
    </AppLayout>
  );
}

// ============== Round Card ==============

function RoundCard({
  round, index, expanded, onToggleExpand, onUpdate, onDelete, onDuplicate,
  onDragStart, onDragOver, onDragEnd, isDragging, skills, selectedSkills, onSkillsChange,
}: {
  round: Round;
  index: number;
  expanded: boolean;
  onToggleExpand: () => void;
  onUpdate: (patch: Partial<Round>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  isDragging: boolean;
  skills: string[];
  selectedSkills: string[];
  onSkillsChange: (skills: string[]) => void;
}) {
  const meta = ROUND_META[round.type];
  const isAssessment = round.type === 'MCQ' || round.type === 'Coding';
  const isReady = round.assessmentStatus === 'ready';
  const toggleSkill = (skill: string) => {
    onSkillsChange(selectedSkills.includes(skill)
      ? selectedSkills.filter(s => s !== skill)
      : [...selectedSkills, skill]
    );
  };

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      className={cn(
        'hnx-card-interactive transition-all',
        isDragging && 'opacity-40 scale-[0.98]',
      )}
    >
      <div className="flex items-center gap-3 p-4">
        {/* Drag handle */}
        <button className="text-muted-foreground/40 hover:text-foreground cursor-grab active:cursor-grabbing shrink-0" aria-label="Drag to reorder">
          <GripVertical className="w-4 h-4" />
        </button>

        {/* Order badge */}
        <div className="w-7 h-7 rounded-full bg-navy text-navy-foreground text-[12px] font-bold flex items-center justify-center shrink-0">
          {index + 1}
        </div>

        {/* Icon */}
        <RoundTypeIcon type={round.type} size="md" />

        {/* Label + meta */}
        <div className="flex-1 min-w-0">
          <input
            value={round.label}
            onChange={(e) => onUpdate({ label: e.target.value })}
            className="text-[14px] font-bold text-navy bg-transparent border-0 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded px-1 -mx-1 w-full max-w-md"
          />
          <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground">
            {isAssessment && (
              <span className={cn('inline-flex items-center gap-1 font-semibold', isReady ? 'text-hnxgreen-deep' : 'text-warning')}>
                <AlertCircle className="w-3 h-3" strokeWidth={2.5} />
                {isReady ? 'Assessment Ready' : 'Not built'}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button onClick={onDelete} className="h-8 w-8 rounded-md hover:bg-destructive/10 hover:text-destructive flex items-center justify-center text-muted-foreground" aria-label="Delete">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={onToggleExpand} className="h-8 w-8 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground" aria-label="Expand">
            {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="px-4 pb-4 pt-2 border-t border-border/50 bg-muted/20 grid grid-cols-2 gap-4 animate-fade-in-fast">
          <div>
            <label className="hnx-label block mb-1">Purpose</label>
            <textarea
              value={round.purpose || ''}
              onChange={(e) => onUpdate({ purpose: e.target.value })}
              placeholder="What does this round evaluate?"
              className="w-full min-h-[60px] rounded-md border border-input bg-card p-2 text-[12px] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </div>
          <div>
            <label className="hnx-label block mb-1">Notes</label>
            <textarea
              value={round.notes || ''}
              onChange={(e) => onUpdate({ notes: e.target.value })}
              placeholder="Internal notes for evaluators"
              className="w-full min-h-[60px] rounded-md border border-input bg-card p-2 text-[12px] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="hnx-label block mb-1">Duration</label>
              <div className="flex items-center gap-1.5">
                <input type="number" value={round.durationMin} onChange={(e) => onUpdate({ durationMin: +e.target.value })} className="hnx-input w-16 h-8" />
                <span className="text-[11px] text-muted-foreground">min</span>
              </div>
            </div>
            <div>
              <label className="hnx-label block mb-1">Pass %</label>
              <input type="number" value={round.passThreshold || 60} onChange={(e) => onUpdate({ passThreshold: +e.target.value })} className="hnx-input w-16 h-8" />
            </div>
          </div>
          <div className="flex items-end gap-4">
            <label className="flex items-center gap-1.5 text-[12px] cursor-pointer">
              <input type="checkbox" checked={round.mandatory} onChange={(e) => onUpdate({ mandatory: e.target.checked })} className="accent-primary" />
              Mandatory
            </label>
            <label className="flex items-center gap-1.5 text-[12px] cursor-pointer">
              <input type="checkbox" checked={round.autoTrigger} onChange={(e) => onUpdate({ autoTrigger: e.target.checked })} className="accent-primary" />
              Auto-trigger
            </label>
          </div>
        </div>
      )}
    </div>
  );
}

// ============== Candidate Journey Preview ==============

function CandidateJourneyPreview({ job, onClose }: { job: ReturnType<typeof useStore.getState>['jobs'][0]; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-navy/60 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in-fast" onClick={onClose}>
      <div className="bg-card rounded-xl shadow-premium max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 border-b flex items-center justify-between">
          <div>
            <h3 className="text-[16px] font-bold text-navy">Candidate Journey Preview</h3>
            <p className="text-[12px] text-muted-foreground mt-0.5">What candidates see when applying to {job.title}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-md hover:bg-muted flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-muted/30">
          {job.rounds.map((round, i) => {
            const meta = ROUND_META[round.type];
            return (
              <div key={round.id} className="hnx-card p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-navy text-navy-foreground text-[12px] font-bold flex items-center justify-center">{i + 1}</div>
                  <RoundTypeIcon type={round.type} size="sm" />
                  <div className="flex-1">
                    <p className="text-[14px] font-bold text-navy">{round.label}</p>
                    <p className="text-[11px] text-muted-foreground">{round.durationMin} min · {round.autoTrigger ? 'Starts automatically' : 'Triggered by recruiter'}</p>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-muted text-muted-foreground uppercase tracking-wider">Step {i + 1}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
