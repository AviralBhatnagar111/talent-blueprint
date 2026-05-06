import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { useStore } from '@/store/useStore';
import { toast } from 'sonner';
import {
  Sparkles, Save, ArrowRight, ArrowLeft, ChevronDown, Check, X,
  Upload, FilePlus2, AlertTriangle, Eye, Minus, Plus, ListChecks, CheckCircle2,
} from 'lucide-react';
import { ContextTopBar, NavyChip } from '@/components/shared/ContextTopBar';
import { Stepper } from '@/components/shared/Stepper';
import { GenerationLoader } from '@/components/shared/GenerationLoader';
import { DifficultyBar } from '@/components/shared/DifficultyBar';
import { SkillChip } from '@/components/shared/SkillChip';
import {
  IntelligencePanel, PanelSection, ChecklistItem,
} from '@/components/shared/IntelligencePanel';
import { cn } from '@/lib/utils';
import { defaultMCQBlueprint, mcqGenerationSteps } from '@/data/mockData';
import type { MCQBlueprint, MCQQuestion } from '@/types/hirenowx';

const STEPS = [
  { number: 1, label: 'Confirm Context' },
  { number: 2, label: 'Question Pool' },
  { number: 3, label: 'Review & Finalize' },
];

type PoolTab = 'ai' | 'upload' | 'all' | 'selected';
type Source = 'ai' | 'upload' | 'manual';

export default function MCQBuilder() {
  const { jobId, roundId } = useParams<{ jobId: string; roundId: string }>();
  const navigate = useNavigate();
  const job = useStore(s => s.getJob(jobId!));
  const getSampleMCQ = useStore(s => s.getSampleMCQ);
  const saveMCQAssessment = useStore(s => s.saveMCQAssessment);

  const round = job?.rounds.find(r => r.id === roundId);

  const [step, setStep] = useState(1);
  const [blueprint, setBlueprint] = useState<MCQBlueprint>(defaultMCQBlueprint);
  const [generating, setGenerating] = useState(false);
  const [questions, setQuestions] = useState<MCQQuestion[]>([]);
  const [showManualAdd, setShowManualAdd] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [showFinalQuestions, setShowFinalQuestions] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [poolTab, setPoolTab] = useState<PoolTab>('all');
  const [assessmentName, setAssessmentName] = useState('Technical MCQ — ' + (job?.title || ''));
  const [passThreshold, setPassThreshold] = useState(60);

  if (!job || !round) {
    return <AppLayout bare><div className="p-8">Not found. <Link to="/jobs" className="text-primary">Back to Jobs</Link></div></AppLayout>;
  }
  const context = job.roleContext;

  // ===== validation =====
  const diffTotal = blueprint.difficultyMix.easy + blueprint.difficultyMix.medium + blueprint.difficultyMix.hard;
  const blueprintValid =
    blueprint.questionsToGenerate >= blueprint.questionsToSend &&
    blueprint.questionsToSend > 0 &&
    blueprint.durationMin > 0 &&
    diffTotal === 100;

  // ===== generation =====
  const handleGenerate = () => {
    if (!blueprintValid) {
      toast.error('Fix the blueprint', { description: 'Generate ≥ Send, duration required, and difficulty mix must total 100%.' });
      return;
    }
    setGenerating(true);
    setStep(2);
  };
  const handleGenComplete = () => {
    setGenerating(false);
    const sample = getSampleMCQ();
    const targetCount = blueprint.questionsToGenerate;
    const generated: MCQQuestion[] = Array.from({ length: targetCount }, (_, i) => {
      const base = sample[i % sample.length];
      return { ...base, id: `ai-${Date.now()}-${i}`, status: 'pending', source: 'ai' };
    });
    setQuestions(qs => [...generated, ...qs.filter(q => q.source !== 'ai')]);
    setPoolTab('ai');
    toast.success(`${targetCount} questions generated`);
  };
  const generateMore = () => {
    if (!blueprintValid) return toast.error('Fix the blueprint first');
    setGenerating(true);
  };

  const updateQuestion = (id: string, patch: Partial<MCQQuestion>) =>
    setQuestions(qs => qs.map(q => q.id === id ? { ...q, ...patch } : q));

  // ===== add =====
  const addManualQuestion = (q: MCQQuestion) => {
    setQuestions(qs => [q, ...qs]);
    setPoolTab('all');
    toast.success('Question added to pool');
  };
  const importQuestions = (items: MCQQuestion[]) => {
    if (items.length === 0) return toast.error('No valid rows found');
    setQuestions(qs => [...items, ...qs]);
    setPoolTab('upload');
    setShowBulkUpload(false);
    toast.success(`${items.length} questions imported`);
  };

  // ===== selection =====
  const selectedCount = questions.filter(q => q.status === 'approved').length;
  const selectionMet = selectedCount === blueprint.questionsToSend;
  const selectionRemaining = blueprint.questionsToSend - selectedCount;

  const visibleQuestions = useMemo(() => {
    return questions.filter(q => {
      if (poolTab === 'all') return true;
      if (poolTab === 'selected') return q.status === 'approved';
      const src: Source = (q.source as Source) || (q.id.startsWith('ai-') ? 'ai' : q.id.startsWith('upload-') ? 'upload' : 'manual');
      return src === poolTab;
    });
  }, [questions, poolTab]);

  const sourceCount = (s: Source) =>
    questions.filter(q => (q.source ? q.source === s : (s === 'ai' ? q.id.startsWith('ai-') : s === 'upload' ? q.id.startsWith('upload-') : q.id.startsWith('manual-')))).length;
  const aiCount = sourceCount('ai');
  const uploadCount = sourceCount('upload');
  const manualCount = sourceCount('manual');

  const approveTopUpToSend = () => {
    let remaining = blueprint.questionsToSend - selectedCount;
    if (remaining <= 0) return toast('Selection target already met');
    setQuestions(qs => qs.map(q => {
      if (remaining > 0 && q.status !== 'approved' && (poolTab === 'all' || visibleQuestions.includes(q))) {
        remaining--;
        return { ...q, status: 'approved' };
      }
      return q;
    }));
  };

  const difficulty = {
    easy: questions.filter(q => q.difficulty === 'Easy').length,
    medium: questions.filter(q => q.difficulty === 'Medium').length,
    hard: questions.filter(q => q.difficulty === 'Hard').length,
  };

  const competencyCoverage = useMemo(() => {
    const map: Record<string, number> = {};
    questions.filter(q => q.status === 'approved').forEach(q => { map[q.competencyName] = (map[q.competencyName] || 0) + 1; });
    return map;
  }, [questions]);

  const save = () => {
    saveMCQAssessment(job.id, round.id, {
      id: `mcq-${Date.now()}`,
      roundId: round.id,
      name: assessmentName,
      questionsToSend: blueprint.questionsToSend,
      durationMin: blueprint.durationMin,
      passThreshold,
      questions: questions.filter(q => q.status === 'approved'),
      status: 'ready',
    });
    toast.success('MCQ Assessment saved & attached', { description: `${blueprint.questionsToSend} questions attached to ${round.label}` });
    navigate(`/jobs/${job.id}`);
  };

  return (
    <AppLayout bare>
      <ContextTopBar
        backTo={`/jobs/${job.id}/template`}
        backLabel="Job Template"
        breadcrumbs={[
          { label: job.title, to: `/jobs/${job.id}` },
          { label: 'Template', to: `/jobs/${job.id}/template` },
          { label: `MCQ · ${round.label}` },
        ]}
        chips={<div className="flex-1"><Stepper steps={STEPS} currentStep={step} onStepClick={setStep} /></div>}
        actions={
          <>
            <Button size="sm" variant="ghost" className="text-navy-foreground/90 hover:bg-white/10 hover:text-navy-foreground h-8" onClick={() => toast('Draft saved')}>
              <Save className="w-3.5 h-3.5 mr-1.5" />Save Draft
            </Button>
            <Button
              size="sm"
              className="bg-hnxgreen hover:bg-hnxgreen-deep text-navy font-semibold h-8"
              onClick={() => setShowSaveConfirm(true)}
              disabled={step !== 3 || !selectionMet}
            >
              Save & Attach to Round
            </Button>
          </>
        }
      />

      {generating && <GenerationLoader steps={mcqGenerationSteps} title="Building your MCQ assessment" onComplete={handleGenComplete} />}

      <div className="grid grid-cols-[1fr_340px] gap-6 p-6 max-w-[1440px] mx-auto">
        <div className="min-w-0 space-y-5">
          {/* Step 1 */}
          {step === 1 && (
            <div className="space-y-5 animate-fade-in">
              <div className="hnx-card p-5">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-teal" strokeWidth={2.5} />
                  <h2 className="text-[16px] font-bold text-navy">Confirm assessment context</h2>
                </div>
                <p className="text-[12px] text-muted-foreground mb-4">AI-parsed from the JD — used to generate role-relevant questions.</p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                  <Tile label="Role" value={context.roleTitle} />
                  <Tile label="Experience" value={`${context.experienceMin}–${context.experienceMax} years`} />
                  <Tile label="Industry" value={context.industry} />
                  <Tile label="Domain" value={`${context.domain} · ${context.subDomain}`} />
                  <div className="col-span-2">
                    <p className="hnx-label mb-1.5">Skills mapped to this round</p>
                    <div className="flex flex-wrap gap-1.5">
                      {(round.skillsToAssess && round.skillsToAssess.length > 0
                        ? round.skillsToAssess
                        : context.primarySkills).map(s => <SkillChip key={s} label={s} variant="teal" size="sm" />)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="hnx-card p-5">
                <h2 className="text-[16px] font-bold text-navy mb-1">Assessment Blueprint</h2>
                <p className="text-[12px] text-muted-foreground mb-5">Set the pool size, the final test size, and the duration.</p>

                <div className="grid grid-cols-3 gap-4">
                  <NumberStepper label="Questions to Generate" value={blueprint.questionsToGenerate} onChange={(v) => setBlueprint({ ...blueprint, questionsToGenerate: v, poolSize: v })} suffix="in pool" step={5} min={1} />
                  <NumberStepper label="Questions to Send" value={blueprint.questionsToSend} onChange={(v) => setBlueprint({ ...blueprint, questionsToSend: v })} suffix="final" step={1} min={1} />
                  <NumberStepper label="Duration" value={blueprint.durationMin} onChange={(v) => setBlueprint({ ...blueprint, durationMin: v })} suffix="min" step={5} min={5} />
                </div>

                {!blueprintValid && (
                  <div className="mt-3 p-2.5 rounded-md bg-warning-light border border-warning/30 text-[11.5px] text-warning flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Generate must be ≥ Send · Difficulty mix must total 100% · Duration is required.
                  </div>
                )}

                <div className="mt-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="hnx-label">Difficulty Mix</span>
                    <span className={cn('text-[11px] font-semibold tabular-nums', diffTotal === 100 ? 'text-hnxgreen-deep' : 'text-warning')}>{diffTotal}%</span>
                  </div>
                  <DifficultyMixEditor value={blueprint.difficultyMix} onChange={(difficultyMix) => setBlueprint({ ...blueprint, difficultyMix })} />
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 gap-3">
                <Button size="lg" variant="outline" className="font-semibold" onClick={() => setShowBulkUpload(true)}>
                  <Upload className="w-4 h-4 mr-2" />Upload Questions (CSV)
                </Button>
                <Button size="lg" className="bg-hnxgreen hover:bg-hnxgreen-deep text-navy font-bold shadow-green-glow" onClick={handleGenerate} disabled={!blueprintValid}>
                  <Sparkles className="w-4 h-4 mr-2" />Generate Questions
                </Button>
              </div>
            </div>
          )}

          {/* Step 2 — Pool */}
          {step === 2 && !generating && (
            <div className="space-y-4 animate-fade-in">
              <div className="hnx-card p-4 space-y-4">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-3 mr-auto">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <ListChecks className="w-4 h-4" strokeWidth={2.5} />
                    </div>
                    <div>
                      <h2 className="text-[15px] font-bold text-navy">Question Pool</h2>
                      <p className="text-[12px] text-muted-foreground">
                        Pool {questions.length} · Select <span className="font-semibold text-navy">{blueprint.questionsToSend}</span> for the final test.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn('hnx-badge border', selectionMet ? 'bg-hnxgreen/15 text-hnxgreen-deep border-hnxgreen/30' : 'bg-muted text-foreground border-border')}>
                      Selected {selectedCount} / {blueprint.questionsToSend}
                    </span>
                    <Button size="sm" variant="outline" className="h-8 text-[12px]" onClick={approveTopUpToSend} disabled={selectionMet}>
                      <Check className="w-3.5 h-3.5 mr-1" />Select Required
                    </Button>
                    <Button size="sm" variant="outline" className="h-8 text-[12px]" onClick={() => setShowBulkUpload(true)}>
                      <Upload className="w-3.5 h-3.5 mr-1" />Upload CSV
                    </Button>
                    <Button size="sm" className="h-8 text-[12px] bg-primary" onClick={() => setShowManualAdd(true)}>
                      <FilePlus2 className="w-3.5 h-3.5 mr-1" />Add Manually
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-2 border-t pt-3">
                  <PoolTabButton active={poolTab === 'ai'} onClick={() => setPoolTab('ai')} label="AI Generated" count={aiCount} />
                  <PoolTabButton active={poolTab === 'upload'} onClick={() => setPoolTab('upload')} label="Bulk Upload" count={uploadCount} />
                  <PoolTabButton active={poolTab === 'all'} onClick={() => setPoolTab('all')} label="Total Pool" count={questions.length} />
                  <PoolTabButton active={poolTab === 'selected'} onClick={() => setPoolTab('selected')} label="Selected" count={selectedCount} tone="green" />
                </div>
              </div>

              {poolTab === 'ai' && aiCount === 0 && (
                <div className="hnx-card p-8 text-center">
                  <p className="text-[14px] font-bold text-navy">No AI-generated questions yet</p>
                  <p className="text-[12px] text-muted-foreground mt-1 mb-4">Generate a fresh batch sized to your blueprint.</p>
                  <Button onClick={generateMore} className="bg-hnxgreen hover:bg-hnxgreen-deep text-navy font-semibold">
                    <Sparkles className="w-4 h-4 mr-2" />Generate with AI
                  </Button>
                </div>
              )}

              {visibleQuestions.length > 0 ? (
                visibleQuestions.map((q, i) => (
                  <QuestionCard key={q.id} question={q} index={i} onUpdate={(p) => updateQuestion(q.id, p)} />
                ))
              ) : poolTab !== 'ai' && (
                <div className="hnx-card p-8 text-center">
                  <p className="text-[14px] font-bold text-navy">Nothing in this tab yet</p>
                  <p className="text-[12px] text-muted-foreground mt-1">Upload a CSV or add a question manually to populate the pool.</p>
                </div>
              )}

              <div className="flex justify-between items-center pt-2">
                <Button variant="outline" onClick={() => setStep(1)}><ArrowLeft className="w-3.5 h-3.5 mr-1.5" />Back</Button>
                <Button
                  className="bg-hnxgreen hover:bg-hnxgreen-deep text-navy font-semibold"
                  onClick={() => setStep(3)}
                  disabled={!selectionMet}
                  title={selectionMet ? '' : `Select ${selectionRemaining} more`}
                >
                  Continue to Finalize<ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div className="hnx-card p-6 animate-fade-in">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-4 h-4 text-hnxgreen-deep" strokeWidth={2.5} />
                <h2 className="text-[16px] font-bold text-navy">Review & Finalize</h2>
              </div>

              <div className="grid grid-cols-2 gap-x-6 gap-y-3 mb-5">
                <div className="col-span-2">
                  <label className="hnx-label block mb-1">Assessment Name</label>
                  <input value={assessmentName} onChange={(e) => setAssessmentName(e.target.value)} className="hnx-input w-full" />
                </div>
                <SummaryRow label="Total selected questions" value={`${selectedCount} / ${blueprint.questionsToSend}`} tone={selectionMet ? 'green' : undefined} />
                <SummaryRow label="Duration" value={`${blueprint.durationMin} min`} />
                <div className="flex items-center gap-2">
                  <span className="text-[12px] text-muted-foreground">Pass threshold</span>
                  <input type="number" value={passThreshold} onChange={(e) => setPassThreshold(+e.target.value)} className="hnx-input w-16 h-8" />
                  <span className="text-[12px] text-muted-foreground">%</span>
                </div>
                <SummaryRow label="Difficulty mix (target)" value={`${blueprint.difficultyMix.easy}/${blueprint.difficultyMix.medium}/${blueprint.difficultyMix.hard}`} />
                <SummaryRow label="Sources" value={`AI ${aiCount} · Bulk ${uploadCount} · Manual ${manualCount}`} />
                <SummaryRow label="Competency coverage" value={`${Object.keys(competencyCoverage).length} competencies`} />
              </div>

              <div className="border-t pt-4 flex flex-wrap gap-2 justify-between">
                <Button variant="outline" onClick={() => setStep(2)}><ArrowLeft className="w-3.5 h-3.5 mr-1.5" />Back</Button>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => toast('Draft saved')}>Save Draft</Button>
                  <Button variant="outline" onClick={() => setShowFinalQuestions(true)}>
                    <Eye className="w-4 h-4 mr-1.5" />View Final Questions
                  </Button>
                  <Button className="bg-hnxgreen hover:bg-hnxgreen-deep text-navy font-bold" onClick={() => setShowSaveConfirm(true)} disabled={!selectionMet}>
                    <CheckCircle2 className="w-4 h-4 mr-1.5" />Save & Attach to Round
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT panel — pool stats only */}
        <IntelligencePanel>
          <PanelSection title="Pool Stats" defaultOpen>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <Stat label="AI Generated" value={`${aiCount}`} />
              <Stat label="Bulk Uploaded" value={`${uploadCount}`} />
              <Stat label="Manual" value={`${manualCount}`} />
              <Stat label="Total Pool" value={`${questions.length}`} />
              <Stat label="Selected" value={`${selectedCount}/${blueprint.questionsToSend}`} tone={selectionMet ? 'green' : 'warn'} />
              <Stat label="To Send" value={`${blueprint.questionsToSend}`} />
            </div>
          </PanelSection>

          {questions.length > 0 && (
            <PanelSection title="Difficulty Distribution">
              <DifficultyBar
                easy={Math.round((difficulty.easy / questions.length) * 100)}
                medium={Math.round((difficulty.medium / questions.length) * 100)}
                hard={Math.round((difficulty.hard / questions.length) * 100)}
              />
            </PanelSection>
          )}

          <PanelSection title="Competency Coverage">
            {Object.keys(competencyCoverage).length === 0 ? (
              <p className="text-[11.5px] text-muted-foreground">Approve questions to see coverage build up.</p>
            ) : (
              <div className="space-y-1.5">
                {Object.entries(competencyCoverage).map(([name, n]) => (
                  <div key={name} className="flex items-center gap-2 text-[11.5px]">
                    <span className="flex-1 truncate text-foreground/80">{name}</span>
                    <span className="text-muted-foreground tabular-nums">{n}</span>
                  </div>
                ))}
              </div>
            )}
          </PanelSection>

          {!selectionMet && questions.length > 0 && (
            <PanelSection title="To finalize" defaultOpen>
              <ChecklistItem icon={AlertTriangle} tone="warn">
                {selectionRemaining > 0 ? `Select ${selectionRemaining} more question${selectionRemaining > 1 ? 's' : ''}` : `Deselect ${-selectionRemaining}`}
              </ChecklistItem>
            </PanelSection>
          )}
        </IntelligencePanel>
      </div>

      {showManualAdd && <ManualQuestionModal onClose={() => setShowManualAdd(false)} onAdd={addManualQuestion} skills={(round.skillsToAssess && round.skillsToAssess.length) ? round.skillsToAssess : context.primarySkills} />}
      {showBulkUpload && <BulkUploadModal onClose={() => setShowBulkUpload(false)} onImport={importQuestions} skills={(round.skillsToAssess && round.skillsToAssess.length) ? round.skillsToAssess : context.primarySkills} />}
      {showFinalQuestions && <FinalQuestionsOverlay questions={questions.filter(q => q.status === 'approved')} onClose={() => setShowFinalQuestions(false)} />}
      {showSaveConfirm && <SaveConfirmOverlay count={selectedCount} onClose={() => setShowSaveConfirm(false)} onConfirm={save} />}
    </AppLayout>
  );
}

// ============== Sub-components ==============

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="hnx-label mb-1">{label}</p>
      <p className="text-[13px] font-semibold text-navy">{value}</p>
    </div>
  );
}

function NumberStepper({ label, value, onChange, suffix, step = 1, min = 1 }: { label: string; value: number; onChange: (v: number) => void; suffix: string; step?: number; min?: number }) {
  return (
    <div>
      <span className="hnx-label block mb-1.5">{label}</span>
      <div className="flex items-center gap-1.5">
        <button onClick={() => onChange(Math.max(min, value - step))} className="hnx-stepper-btn"><Minus className="w-3 h-3" /></button>
        <input type="number" value={value} onChange={(e) => onChange(Math.max(min, +e.target.value))} className="hnx-input h-8 w-16 text-center font-bold text-navy" />
        <button onClick={() => onChange(value + step)} className="hnx-stepper-btn"><Plus className="w-3 h-3" /></button>
        <span className="text-[11px] text-muted-foreground ml-1">{suffix}</span>
      </div>
    </div>
  );
}

function DifficultyMixEditor({ value, onChange }: { value: { easy: number; medium: number; hard: number }; onChange: (v: { easy: number; medium: number; hard: number }) => void }) {
  const setPart = (key: 'easy' | 'medium' | 'hard', next: number) => onChange({ ...value, [key]: Math.max(0, Math.min(100, next)) });
  return (
    <div className="space-y-3">
      <DifficultyBar easy={value.easy} medium={value.medium} hard={value.hard} />
      {(['easy', 'medium', 'hard'] as const).map((key) => (
        <div key={key} className="flex items-center gap-3">
          <span className="w-14 text-[11px] font-semibold text-muted-foreground capitalize">{key}</span>
          <input type="range" min={0} max={100} value={value[key]} onChange={(e) => setPart(key, +e.target.value)} className="flex-1 accent-primary" />
          <input type="number" min={0} max={100} value={value[key]} onChange={(e) => setPart(key, +e.target.value)} className="hnx-input h-8 w-16 text-center" />
        </div>
      ))}
    </div>
  );
}

function PoolTabButton({ active, onClick, label, count, tone }: { active: boolean; onClick: () => void; label: string; count: number; tone?: 'green' }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'h-8 px-3 rounded-md text-[12px] font-semibold border transition-all inline-flex items-center gap-2',
        active
          ? tone === 'green'
            ? 'bg-hnxgreen-deep text-navy border-hnxgreen-deep shadow-sm'
            : 'bg-primary text-primary-foreground border-primary shadow-sm'
          : 'bg-card text-muted-foreground border-border hover:text-foreground hover:border-primary/30',
      )}
    >
      {label}
      <span className={cn('text-[10px] rounded-full px-1.5 py-0.5', active ? 'bg-white/20' : 'bg-muted')}>{count}</span>
    </button>
  );
}

function QuestionCard({ question, index, onUpdate }: { question: MCQQuestion; index: number; onUpdate: (p: Partial<MCQQuestion>) => void }) {
  const [showExp, setShowExp] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const diffBar = question.difficulty === 'Easy' ? 'bg-hnxgreen-deep' : question.difficulty === 'Medium' ? 'bg-warning' : 'bg-destructive/80';
  const diffTone = question.difficulty === 'Easy' ? 'bg-green-light text-hnxgreen-deep' : question.difficulty === 'Medium' ? 'bg-warning-light text-warning' : 'bg-danger-light text-destructive';
  const isApproved = question.status === 'approved';
  const src: Source = (question.source as Source) || (question.id.startsWith('ai-') ? 'ai' : question.id.startsWith('upload-') ? 'upload' : 'manual');
  const srcLabel = src === 'ai' ? 'AI Generated' : src === 'upload' ? 'Bulk Uploaded' : 'Manually Added';
  const srcTone = src === 'ai' ? 'bg-teal-light text-teal-deep' : src === 'upload' ? 'bg-blue-light text-primary' : 'bg-muted text-foreground/70';

  return (
    <div className={cn('hnx-card relative overflow-hidden transition-all', isApproved && 'bg-teal-light/30 border-teal/40')}>
      <span className={cn('absolute left-0 top-0 bottom-0 w-1', diffBar)} />
      <div className="p-4 pl-5">
        <div className="flex items-start gap-3">
          <input type="checkbox" checked={isApproved} onChange={(e) => onUpdate({ status: e.target.checked ? 'approved' : 'pending' })} className="mt-1 accent-primary w-4 h-4" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-[11px] font-mono font-bold text-muted-foreground">Q{index + 1}</span>
              <span className={cn('hnx-badge', diffTone)}>{question.difficulty}</span>
              <span className={cn('hnx-badge', srcTone)}>{srcLabel}</span>
              <SkillChip label={question.competencyName} variant="muted" size="xs" />
              {question.skillTag && <SkillChip label={question.skillTag} variant="navy" size="xs" />}
            </div>
            <p className="text-[14px] font-semibold text-navy leading-snug mb-3">{question.text}</p>
            <div className="flex items-center gap-4">
              <button onClick={() => setShowOptions(!showOptions)} className="inline-flex items-center gap-1 text-[11px] text-primary font-semibold hover:underline">
                <ChevronDown className={cn('w-3 h-3 transition-transform', showOptions && 'rotate-180')} />{showOptions ? 'Hide' : 'View'} options
              </button>
              <button onClick={() => setShowExp(!showExp)} className="inline-flex items-center gap-1 text-[11px] text-primary font-semibold hover:underline">
                <ChevronDown className={cn('w-3 h-3 transition-transform', showExp && 'rotate-180')} />{showExp ? 'Hide' : 'View'} explanation
              </button>
            </div>
            {showOptions && (
              <div className="space-y-1.5 mt-3 animate-fade-in-fast">
                {question.options.map((o, i) => (
                  <div key={o.id} className={cn('flex items-center gap-2.5 p-2 rounded-md border text-[12.5px]',
                    o.isCorrect ? 'bg-green-light/60 border-hnxgreen/30 text-hnxgreen-deep font-medium' : 'bg-card border-border text-foreground/80')}>
                    <span className={cn('w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0',
                      o.isCorrect ? 'bg-hnxgreen text-navy' : 'bg-muted text-muted-foreground')}>
                      {o.isCorrect ? <Check className="w-3 h-3" strokeWidth={3} /> : String.fromCharCode(65 + i)}
                    </span>
                    {o.text}
                  </div>
                ))}
              </div>
            )}
            {showExp && (
              <p className="mt-2 p-2.5 rounded-md bg-muted/40 text-[12px] text-foreground/80 leading-relaxed animate-fade-in-fast">{question.explanation}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ManualQuestionModal({ onClose, onAdd, skills }: { onClose: () => void; onAdd: (q: MCQQuestion) => void; skills: string[] }) {
  const [text, setText] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [answer, setAnswer] = useState(0);
  const [explanation, setExplanation] = useState('');
  const [difficulty, setDifficulty] = useState<MCQQuestion['difficulty']>('Medium');
  const [skill, setSkill] = useState(skills[0] || 'Core Skill');
  const submit = () => {
    if (!text.trim() || options.some(o => !o.trim())) return toast.error('Fill the question and all four options');
    onAdd({
      id: `manual-${Date.now()}`,
      text,
      options: options.map((o, i) => ({ id: String.fromCharCode(97 + i), text: o, isCorrect: i === answer })),
      explanation: explanation || 'Manual question added by recruiter.',
      competencyId: 'manual',
      competencyName: skill,
      skillTag: skill,
      difficulty,
      type: 'MCQ',
      estimatedTimeSec: 60,
      status: 'pending',
      freshness: 'new',
      source: 'manual',
    });
    onClose();
  };
  return (
    <ModalShell title="Add Question Manually" onClose={onClose}>
      <div className="space-y-3">
        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Question" className="hnx-input min-h-20 w-full" />
        {options.map((o, i) => (
          <div key={i} className="flex items-center gap-2">
            <input type="radio" checked={answer === i} onChange={() => setAnswer(i)} className="accent-primary" />
            <input value={o} onChange={(e) => setOptions(options.map((x, ix) => ix === i ? e.target.value : x))} placeholder={`Option ${i + 1}${i === answer ? ' (correct)' : ''}`} className="hnx-input flex-1" />
          </div>
        ))}
        <div className="grid grid-cols-2 gap-3">
          <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as MCQQuestion['difficulty'])} className="hnx-input">
            <option>Easy</option><option>Medium</option><option>Hard</option>
          </select>
          <select value={skill} onChange={(e) => setSkill(e.target.value)} className="hnx-input">
            {skills.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <input value={explanation} onChange={(e) => setExplanation(e.target.value)} placeholder="Explanation (optional)" className="hnx-input w-full" />
        <Button className="w-full bg-primary" onClick={submit}>Add to Pool</Button>
      </div>
    </ModalShell>
  );
}

function BulkUploadModal({ onClose, onImport, skills }: { onClose: () => void; onImport: (q: MCQQuestion[]) => void; skills: string[] }) {
  const [summary, setSummary] = useState<{ total: number; valid: number; invalid: number } | null>(null);
  const fallbackSkill = skills[0] || 'Core Skill';

  const parseCsv = (text: string): { items: MCQQuestion[]; valid: number; invalid: number; total: number } => {
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (lines.length < 2) return { items: [], valid: 0, invalid: 0, total: 0 };
    const splitRow = (line: string) => (line.match(/("[^"]*"|[^,]+)/g) || []).map(c => c.replace(/^"|"$/g, '').trim());
    const header = splitRow(lines[0]).map(h => h.toLowerCase());
    const idx = (k: string) => header.findIndex(h => h.includes(k));
    const qIdx = idx('question');
    const o1 = idx('option 1') >= 0 ? idx('option 1') : idx('option1');
    const o2 = idx('option 2') >= 0 ? idx('option 2') : idx('option2');
    const o3 = idx('option 3') >= 0 ? idx('option 3') : idx('option3');
    const o4 = idx('option 4') >= 0 ? idx('option 4') : idx('option4');
    const cIdx = idx('correct');
    const dIdx = idx('difficult');
    const sIdx = idx('skill') >= 0 ? idx('skill') : idx('competency');
    const eIdx = idx('explanation');

    let valid = 0, invalid = 0;
    const items: MCQQuestion[] = [];
    lines.slice(1).forEach((line, i) => {
      const c = splitRow(line);
      const q = qIdx >= 0 ? c[qIdx] : c[0];
      const opts = [o1, o2, o3, o4].map((ix, n) => ix >= 0 ? c[ix] : c[n + 1]);
      const correctRaw = cIdx >= 0 ? (c[cIdx] || 'A') : (c[5] || 'A');
      const correctIdx = ['A', 'B', 'C', 'D'].indexOf(correctRaw.toUpperCase().trim()[0] || 'A');
      if (!q || opts.some(o => !o) || correctIdx < 0) { invalid++; return; }
      const diffRaw = (dIdx >= 0 ? c[dIdx] : c[7]) || 'Medium';
      const diff = (['Easy', 'Medium', 'Hard'].find(d => d.toLowerCase() === diffRaw.toLowerCase()) || 'Medium') as MCQQuestion['difficulty'];
      const skill = (sIdx >= 0 ? c[sIdx] : c[8]) || fallbackSkill;
      const explanation = (eIdx >= 0 ? c[eIdx] : c[6]) || 'Imported question.';
      items.push({
        id: `upload-${Date.now()}-${i}`,
        text: q,
        options: opts.map((o, n) => ({ id: String.fromCharCode(97 + n), text: o, isCorrect: n === correctIdx })),
        explanation,
        competencyId: 'imported',
        competencyName: skill,
        skillTag: skill,
        difficulty: diff,
        type: 'MCQ',
        estimatedTimeSec: 60,
        status: 'pending',
        freshness: 'new',
        source: 'upload',
      });
      valid++;
    });
    return { items, valid, invalid, total: lines.length - 1 };
  };

  const handleFile = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = parseCsv(String(reader.result || ''));
      setSummary({ total: result.total, valid: result.valid, invalid: result.invalid });
      if (result.valid > 0) onImport(result.items);
    };
    reader.readAsText(file);
  };

  return (
    <ModalShell title="Bulk Upload Questions" onClose={onClose}>
      <div className="space-y-3">
        <p className="text-[12px] text-muted-foreground">
          CSV columns: <span className="font-mono text-foreground">question, option 1, option 2, option 3, option 4, correct answer (A–D), difficulty, competency/skill, explanation</span>
        </p>
        <label className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-primary/30 bg-primary/5 p-8 text-[13px] font-semibold text-primary cursor-pointer hover:bg-primary/10 transition-colors">
          <Upload className="w-5 h-5" />
          Upload CSV file
          <span className="text-[11px] font-normal text-muted-foreground">Click to browse</span>
          <input type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
        </label>
        {summary && (
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 rounded-md bg-muted/40">
              <p className="text-[10px] hnx-label">Total</p>
              <p className="text-[14px] font-bold text-navy">{summary.total}</p>
            </div>
            <div className="p-2.5 rounded-md bg-green-light">
              <p className="text-[10px] hnx-label">Valid</p>
              <p className="text-[14px] font-bold text-hnxgreen-deep">{summary.valid}</p>
            </div>
            <div className="p-2.5 rounded-md bg-warning-light">
              <p className="text-[10px] hnx-label">Invalid</p>
              <p className="text-[14px] font-bold text-warning">{summary.invalid}</p>
            </div>
          </div>
        )}
      </div>
    </ModalShell>
  );
}

function FinalQuestionsOverlay({ questions, onClose }: { questions: MCQQuestion[]; onClose: () => void }) {
  return (
    <ModalShell title={`Final Questions (${questions.length})`} onClose={onClose} wide>
      <div className="space-y-3 max-h-[75vh] overflow-auto pr-2">
        {questions.map((q, i) => <QuestionCard key={q.id} question={q} index={i} onUpdate={() => undefined} />)}
      </div>
    </ModalShell>
  );
}

function SaveConfirmOverlay({ count, onClose, onConfirm }: { count: number; onClose: () => void; onConfirm: () => void }) {
  return (
    <ModalShell title="Save Final Assessment" onClose={onClose}>
      <div className="space-y-4">
        <div className="p-4 rounded-lg bg-warning-light border border-warning/30">
          <p className="text-[13px] font-semibold text-navy">This action cannot be reverted.</p>
          <p className="text-[12px] text-muted-foreground mt-1">
            Once saved, this assessment will be attached to the round. Final test setup cannot be reverted without creating a new version.
            You're attaching <span className="font-semibold text-navy">{count}</span> question{count > 1 ? 's' : ''}.
          </p>
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button className="bg-hnxgreen hover:bg-hnxgreen-deep text-navy font-bold" onClick={onConfirm}>Confirm & Save</Button>
        </div>
      </div>
    </ModalShell>
  );
}

function ModalShell({ title, onClose, children, wide }: { title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-[80] bg-navy/40 backdrop-blur-sm flex items-center justify-center p-6">
      <div className={cn('hnx-card p-5 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto', wide ? 'w-full max-w-5xl' : 'w-full max-w-xl')}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[16px] font-bold text-navy">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-md hover:bg-muted flex items-center justify-center"><X className="w-4 h-4" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Stat({ label, value, tone = 'default' }: { label: string; value: string; tone?: 'default' | 'green' | 'warn' }) {
  const tones = { default: 'text-foreground', green: 'text-hnxgreen-deep', warn: 'text-warning' } as const;
  return (
    <div className="p-2 rounded-md bg-muted/40">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">{label}</p>
      <p className={cn('text-[14px] font-bold tabular-nums', tones[tone])}>{value}</p>
    </div>
  );
}

function SummaryRow({ label, value, tone }: { label: string; value: string; tone?: 'green' }) {
  return (
    <div className="flex justify-between items-center text-[12.5px]">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn('font-semibold', tone === 'green' ? 'text-hnxgreen-deep' : 'text-foreground')}>{value}</span>
    </div>
  );
}