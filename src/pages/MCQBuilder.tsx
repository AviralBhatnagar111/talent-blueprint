import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { useStore } from '@/store/useStore';
import { toast } from 'sonner';
import {
  Sparkles, Save, ArrowRight, ArrowLeft, ChevronDown, Pencil, Check, X,
  Upload, FilePlus2, Shield, CheckCircle2, Eye,
  Minus, Plus, ListChecks, Info, Brain, Plus as PlusIcon,
} from 'lucide-react';
import { ContextTopBar, NavyChip } from '@/components/shared/ContextTopBar';
import { Stepper } from '@/components/shared/Stepper';
import { GenerationLoader } from '@/components/shared/GenerationLoader';
import { DifficultyBar } from '@/components/shared/DifficultyBar';
import { SkillChip } from '@/components/shared/SkillChip';
import { AIBadge } from '@/components/shared/AIBadge';
import { IntelligencePanel, PanelSection } from '@/components/shared/IntelligencePanel';
import { cn } from '@/lib/utils';
import { defaultMCQBlueprint, mcqGenerationSteps } from '@/data/mockData';
import type { MCQBlueprint, MCQQuestion, MCQType } from '@/types/hirenowx';

const STEPS = [
  { number: 1, label: 'Confirm Context' },
  { number: 2, label: 'Question Pool' },
  { number: 3, label: 'Review & Finalize' },
];

type PoolTab = 'ai' | 'upload' | 'manual' | 'all' | 'selected';
type Source = 'ai' | 'upload' | 'manual';

function sourceOf(q: MCQQuestion): Source {
  if (q.id.startsWith('ai-')) return 'ai';
  if (q.id.startsWith('manual-')) return 'manual';
  return 'upload';
}

const sourceMeta: Record<Source, { label: string; tone: string }> = {
  ai: { label: 'AI Generated', tone: 'bg-teal-light text-teal-deep border-teal/30' },
  upload: { label: 'Bulk Uploaded', tone: 'bg-blue-light text-primary border-primary/20' },
  manual: { label: 'Manually Added', tone: 'bg-warning-light text-warning border-warning/20' },
};

const suggestedDuration = (qs: MCQQuestion[]) => {
  if (qs.length === 0) return 30;
  const sec = qs.reduce((a, q) => a + (q.difficulty === 'Hard' ? 90 : q.difficulty === 'Medium' ? 60 : 40), 0);
  return Math.max(10, Math.round(sec / 60));
};

export default function MCQBuilder() {
  const { jobId, roundId } = useParams<{ jobId: string; roundId: string }>();
  const navigate = useNavigate();
  const job = useStore(s => s.getJob(jobId!));
  const getSampleMCQ = useStore(s => s.getSampleMCQ);
  const saveMCQAssessment = useStore(s => s.saveMCQAssessment);

  const round = job?.rounds.find(r => r.id === roundId);

  const [step, setStep] = useState(1);
  const [context, setContext] = useState(job?.roleContext);
  const [blueprint, setBlueprint] = useState<MCQBlueprint>({ ...defaultMCQBlueprint });
  const [generateCount, setGenerateCount] = useState(60);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [questions, setQuestions] = useState<MCQQuestion[]>([]);
  const [showManualAdd, setShowManualAdd] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [showFinalQuestions, setShowFinalQuestions] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [poolTab, setPoolTab] = useState<PoolTab>('all');
  const [assessmentName, setAssessmentName] = useState('Technical MCQ — ' + (job?.title || ''));
  const [passThreshold, setPassThreshold] = useState(60);
  const [finalDuration, setFinalDuration] = useState<number | null>(null);
  const [roundSkills, setRoundSkills] = useState<string[]>(
    round?.assessedSkills && round.assessedSkills.length > 0
      ? round.assessedSkills
      : (job?.roleContext.primarySkills ?? []),
  );

  if (!job || !round || !context) {
    return <AppLayout bare><div className="p-8">Not found. <Link to="/jobs" className="text-primary">Back to Jobs</Link></div></AppLayout>;
  }

  const difficultyTotal = blueprint.difficultyMix.easy + blueprint.difficultyMix.medium + blueprint.difficultyMix.hard;
  const difficultyValid = difficultyTotal === 100;
  const blueprintValid = generateCount >= blueprint.questionsToSend && difficultyValid;

  const handleGenerate = () => {
    if (!blueprintValid) {
      if (!difficultyValid) toast.error('Difficulty mix must total 100%');
      else toast.error('Questions to Generate must be ≥ Questions to Send');
      return;
    }
    setGenerating(true);
    setStep(2);
  };
  const handleGenComplete = () => {
    setGenerating(false);
    const sample = getSampleMCQ();
    const seeded: MCQQuestion[] = Array.from({ length: generateCount }).map((_, i) => {
      const base = sample[i % sample.length];
      return { ...base, id: `ai-${Date.now()}-${i}`, status: 'pending' as const };
    });
    setQuestions(qs => [...seeded, ...qs]);
    setPoolTab('ai');
  };

  const updateQuestion = (id: string, patch: Partial<MCQQuestion>) =>
    setQuestions(qs => qs.map(q => q.id === id ? { ...q, ...patch } : q));

  const addManualQuestion = (q: MCQQuestion) => {
    setQuestions(qs => [q, ...qs]);
    setStep(2);
    setPoolTab('manual');
    toast.success('Question added to pool');
  };

  const importQuestions = (items: MCQQuestion[]) => {
    setQuestions(qs => [...items, ...qs]);
    setStep(2);
    setPoolTab('upload');
    setShowBulkImport(false);
    toast.success('Questions imported', { description: `${items.length} questions added to the pool` });
  };

  // counts
  const aiCount = questions.filter(q => sourceOf(q) === 'ai').length;
  const uploadCount = questions.filter(q => sourceOf(q) === 'upload').length;
  const manualCount = questions.filter(q => sourceOf(q) === 'manual').length;
  const selectedQs = questions.filter(q => q.status === 'approved');
  const selectedCount = selectedQs.length;
  const target = blueprint.questionsToSend;
  const selectionMet = selectedCount === target;

  const visibleQuestions = useMemo(() => {
    if (poolTab === 'all') return questions;
    if (poolTab === 'selected') return selectedQs;
    return questions.filter(q => sourceOf(q) === poolTab);
  }, [questions, poolTab, selectedQs]);

  const difficulty = {
    easy: questions.filter(q => q.difficulty === 'Easy').length,
    medium: questions.filter(q => q.difficulty === 'Medium').length,
    hard: questions.filter(q => q.difficulty === 'Hard').length,
  };

  const competencyCoverage = useMemo(() => {
    const m = new Map<string, number>();
    selectedQs.forEach(q => m.set(q.competencyName, (m.get(q.competencyName) ?? 0) + 1));
    return Array.from(m.entries()).map(([name, count]) => ({ name, count }));
  }, [selectedQs]);

  const computedSuggested = suggestedDuration(selectedQs);
  const effectiveDuration = finalDuration ?? computedSuggested;

  const save = () => {
    saveMCQAssessment(job.id, round.id, {
      id: `mcq-${Date.now()}`,
      roundId: round.id,
      name: assessmentName,
      questionsToSend: target,
      durationMin: effectiveDuration,
      passThreshold,
      questions: selectedQs,
      status: 'ready',
    });
    toast.success('MCQ Assessment saved & attached', { description: `${target} questions attached to ${round.label}` });
    navigate(`/jobs/${job.id}`);
  };

  const selectFirstNToTarget = () => {
    const need = target;
    let n = 0;
    setQuestions(qs => qs.map(q => {
      if (q.status === 'approved') { n++; return q; }
      if (n < need) { n++; return { ...q, status: 'approved' as const }; }
      return q;
    }));
    toast.success(`Selected ${target} questions`);
  };

  const approveAllVisible = () => {
    const ids = new Set(visibleQuestions.map(q => q.id));
    setQuestions(qs => qs.map(q => ids.has(q.id) ? { ...q, status: 'approved' } : q));
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

      <div className="grid grid-cols-[1fr_320px] gap-6 p-6 max-w-[1320px] mx-auto">
        <div className="min-w-0 space-y-5">
          {/* ===================== STEP 1 ===================== */}
          {step === 1 && (
            <div className="space-y-5 animate-fade-in">
              {/* AI prepared banner */}
              <div className="hnx-card p-5 gradient-ai-banner border-teal/30">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-teal flex items-center justify-center shrink-0 shadow-teal-glow">
                    <Sparkles className="w-4 h-4 text-primary-foreground" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-bold text-navy">AI has prepared this assessment</h2>
                    <p className="text-[12.5px] text-foreground/80 mt-1 leading-relaxed">
                      Review the role context below. HireNowX will use this information to generate role-relevant questions based on the job description, skills, seniority, and competency mapping.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                {/* LEFT — Role context */}
                <div className="hnx-card p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Brain className="w-4 h-4 text-primary" strokeWidth={2.5} />
                    <h2 className="text-[15px] font-bold text-navy">Role Context</h2>
                    <AIBadge />
                  </div>
                  <div className="space-y-3">
                    <EditableTile label="Role" value={context.roleTitle} onChange={(v) => setContext({ ...context, roleTitle: v })} />
                    <EditableTile label="Experience" value={`${context.experienceMin}–${context.experienceMax} years`} readOnly />
                    <EditableTile label="Domain" value={context.domain} onChange={(v) => setContext({ ...context, domain: v })} />
                    <EditableTile label="Sub-domain" value={context.subDomain} onChange={(v) => setContext({ ...context, subDomain: v })} />
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="hnx-label">Primary Skills</span>
                        <AIBadge />
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {context.primarySkills.map(s => <SkillChip key={s} label={s} variant="teal" size="sm" />)}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="hnx-label">Secondary Skills</span>
                        <AIBadge />
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {context.secondarySkills.map(s => <SkillChip key={s} label={s} variant="muted" size="sm" />)}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="hnx-label">Role Objective</span>
                        <AIBadge />
                      </div>
                      <p className="text-[12.5px] text-foreground/80 leading-relaxed">{context.roleObjective}</p>
                    </div>
                  </div>
                </div>

                {/* RIGHT — Blueprint */}
                <div className="hnx-card p-5">
                  <h2 className="text-[15px] font-bold text-navy mb-1">Assessment Blueprint</h2>
                  <p className="text-[12px] text-muted-foreground mb-5">AI will generate a larger pool — you'll select the final questions.</p>
                  <div className="space-y-4">
                    <NumberStepper label="Questions to Generate" value={generateCount} onChange={setGenerateCount} suffix="questions" step={5} min={5} />
                    <NumberStepper label="Questions to Send" value={blueprint.questionsToSend} onChange={(v) => setBlueprint({ ...blueprint, questionsToSend: v })} suffix="questions" step={1} min={1} />
                    {generateCount < blueprint.questionsToSend && (
                      <p className="text-[11px] text-destructive">Generate at least {blueprint.questionsToSend} questions.</p>
                    )}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="hnx-label">Difficulty Mix</span>
                        <span className={cn('text-[11px] font-semibold tabular-nums', difficultyValid ? 'text-hnxgreen-deep' : 'text-destructive')}>
                          Total {difficultyTotal}%
                        </span>
                      </div>
                      <DifficultyMixEditor value={blueprint.difficultyMix} onChange={(difficultyMix) => setBlueprint({ ...blueprint, difficultyMix })} />
                    </div>
                    <div>
                      <span className="hnx-label block mb-1.5">Question Types</span>
                      <div className="flex flex-wrap gap-1.5">
                        {(['MCQ', 'TrueFalse', 'Scenario', 'ShortAnswer'] as MCQType[]).map(t => {
                          const active = blueprint.questionTypes.includes(t);
                          return (
                            <button
                              key={t}
                              onClick={() => setBlueprint({ ...blueprint, questionTypes: active ? blueprint.questionTypes.filter(x => x !== t) : [...blueprint.questionTypes, t] })}
                              className={cn(
                                'px-2.5 py-1 rounded-md text-[11px] font-medium border transition-all',
                                active ? 'bg-teal-light text-teal-deep border-teal/40' : 'bg-card text-muted-foreground border-border hover:border-teal/30'
                              )}
                            >
                              {active && <Check className="w-3 h-3 inline mr-1" />}
                              {t === 'TrueFalse' ? 'True/False' : t === 'ShortAnswer' ? 'Short Answer' : t}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <span className="hnx-label block mb-1.5">Skills Mapped to Round</span>
                      <SkillsEditor
                        value={roundSkills}
                        suggestions={Array.from(new Set([
                          ...context.primarySkills,
                          ...context.secondarySkills,
                          ...job.competencies.map(c => c.name),
                        ]))}
                        onChange={setRoundSkills}
                      />
                    </div>
                  </div>

                  <button onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 mt-5 text-[12px] font-semibold text-muted-foreground hover:text-foreground">
                    <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', showAdvanced && 'rotate-180')} />
                    Advanced Settings
                  </button>
                  {showAdvanced && (
                    <div className="mt-3 pt-4 border-t space-y-3 animate-fade-in-fast">
                      <ToggleRow label="Anti-repeat engine" value={blueprint.antiRepeat} onChange={(v) => setBlueprint({ ...blueprint, antiRepeat: v })} />
                      <ToggleRow label="Randomize question order" value={blueprint.randomizeOrder} onChange={(v) => setBlueprint({ ...blueprint, randomizeOrder: v })} />
                      <ToggleRow label="Randomize option order" value={blueprint.randomizeOptions} onChange={(v) => setBlueprint({ ...blueprint, randomizeOptions: v })} />
                      <ToggleRow label="Strict experience alignment" value={blueprint.strictExperience} onChange={(v) => setBlueprint({ ...blueprint, strictExperience: v })} />
                    </div>
                  )}
                </div>
              </div>

              {/* Footer CTAs */}
              <div className="flex justify-between items-center pt-1">
                <Button size="lg" variant="outline" className="font-semibold" onClick={() => setShowBulkImport(true)}>
                  <Upload className="w-4 h-4 mr-2" />Upload Questions
                </Button>
                <Button size="lg" className="bg-hnxgreen hover:bg-hnxgreen-deep text-navy font-bold shadow-green-glow" onClick={handleGenerate} disabled={!blueprintValid}>
                  <Sparkles className="w-4 h-4 mr-2" />Generate Questions
                </Button>
              </div>
            </div>
          )}

          {/* ===================== STEP 2 ===================== */}
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
                        Selected <span className="font-bold text-navy tabular-nums">{selectedCount} / {target}</span>
                        {selectionMet ? ' · ready to finalize' : ` · select ${Math.max(0, target - selectedCount)} more`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Button size="sm" variant="outline" className="h-8 text-[12px]" onClick={selectFirstNToTarget} disabled={questions.length === 0}>
                      <Check className="w-3.5 h-3.5 mr-1" />Select {target}
                    </Button>
                    <Button size="sm" variant="outline" className="h-8 text-[12px]" onClick={approveAllVisible} disabled={visibleQuestions.length === 0}>
                      Approve All
                    </Button>
                    <Button size="sm" variant="outline" className="h-8 text-[12px]" onClick={() => setShowBulkImport(true)}>
                      <Upload className="w-3.5 h-3.5 mr-1" />Upload CSV
                    </Button>
                    <Button size="sm" className="h-8 text-[12px] bg-primary" onClick={() => setShowManualAdd(true)}>
                      <FilePlus2 className="w-3.5 h-3.5 mr-1" />Add Manually
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-2 border-t pt-3 flex-wrap">
                  <PoolTabButton active={poolTab === 'ai'} onClick={() => setPoolTab('ai')} label="AI Generated" count={aiCount} />
                  <PoolTabButton active={poolTab === 'upload'} onClick={() => setPoolTab('upload')} label="Bulk Upload" count={uploadCount} />
                  <PoolTabButton active={poolTab === 'manual'} onClick={() => setPoolTab('manual')} label="Manual" count={manualCount} />
                  <PoolTabButton active={poolTab === 'all'} onClick={() => setPoolTab('all')} label="Total Pool" count={questions.length} />
                  <PoolTabButton active={poolTab === 'selected'} onClick={() => setPoolTab('selected')} label="Selected" count={selectedCount} tone="green" />
                </div>
              </div>

              {/* Empty AI tab → Generate CTA */}
              {poolTab === 'ai' && aiCount === 0 ? (
                <div className="hnx-card p-10 text-center">
                  <Sparkles className="w-7 h-7 text-teal mx-auto mb-3" strokeWidth={2.5} />
                  <p className="text-[14px] font-bold text-navy">No AI-generated questions yet</p>
                  <p className="text-[12.5px] text-muted-foreground mt-1 mb-4">Generate {generateCount} questions from your role context.</p>
                  <Button className="bg-hnxgreen hover:bg-hnxgreen-deep text-navy font-semibold" onClick={handleGenerate}>
                    <Sparkles className="w-4 h-4 mr-2" />Generate with AI
                  </Button>
                </div>
              ) : visibleQuestions.length > 0 ? (
                visibleQuestions.map((q, i) => (
                  <QuestionCard key={q.id} question={q} index={i} onUpdate={(p) => updateQuestion(q.id, p)} />
                ))
              ) : (
                <div className="hnx-card p-8 text-center">
                  <p className="text-[14px] font-bold text-navy">Nothing in this tab yet</p>
                  <p className="text-[12px] text-muted-foreground mt-1">Generate, upload, or add questions manually.</p>
                </div>
              )}

              <div className="flex justify-between items-center pt-2">
                <Button variant="outline" onClick={() => setStep(1)}><ArrowLeft className="w-3.5 h-3.5 mr-1.5" />Back</Button>
                <Button
                  className="bg-hnxgreen hover:bg-hnxgreen-deep text-navy font-semibold"
                  onClick={() => setStep(3)}
                  disabled={!selectionMet}
                >
                  Continue to Finalize<ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </div>
            </div>
          )}

          {/* ===================== STEP 3 ===================== */}
          {step === 3 && (
            <div className="grid grid-cols-[1fr_320px] gap-5 animate-fade-in">
              {/* Candidate preview */}
              <div className="space-y-4">
                <div className="hnx-card p-6">
                  <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Candidate Preview</p>
                  <div className="border-2 border-dashed border-border rounded-lg p-5 bg-muted/20">
                    <h3 className="text-[18px] font-bold text-navy mb-1">{assessmentName}</h3>
                    <p className="text-[12px] text-muted-foreground mb-3">{target} questions · {effectiveDuration} minutes · Once submitted, cannot be edited</p>
                    <div className="bg-blue-light/40 border border-primary/15 rounded-md p-3 mb-4 text-[12px] text-foreground/80">
                      <span className="font-semibold text-navy">Instructions:</span> Read each question carefully. You may not return to a question once submitted. Do not switch tabs — the test is monitored.
                    </div>
                    <div className="bg-card rounded-lg p-4 border mb-3">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Question 1 of {target}</span>
                        <span className="text-[12px] font-mono text-muted-foreground">{String(effectiveDuration).padStart(2, '0')}:00</span>
                      </div>
                      <p className="text-[14px] text-navy font-semibold mb-3">{selectedQs[0]?.text || 'Sample question text appears here.'}</p>
                      <div className="space-y-2">
                        {(selectedQs[0]?.options || [{ id: 'a', text: 'Option A', isCorrect: false }, { id: 'b', text: 'Option B', isCorrect: true }, { id: 'c', text: 'Option C', isCorrect: false }, { id: 'd', text: 'Option D', isCorrect: false }]).map((o, i) => (
                          <label key={o.id} className="flex items-center gap-2.5 p-2.5 rounded-md border border-border hover:bg-muted/40 cursor-pointer text-[13px]">
                            <span className="w-5 h-5 rounded-full border-2 border-muted-foreground/30" />
                            <span className="font-semibold text-muted-foreground">{String.fromCharCode(65 + i)}.</span>
                            {o.text}
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1.5"><Shield className="w-3 h-3" />Proctoring enabled · Full-screen required · Tab switch monitored</span>
                      <Button size="sm" className="h-7 bg-primary">Submit →</Button>
                    </div>
                  </div>
                </div>

                {/* Source breakdown */}
                <div className="hnx-card p-5">
                  <p className="hnx-label mb-3">Source Breakdown</p>
                  <div className="grid grid-cols-3 gap-3">
                    <SourceTile label="AI Generated" count={selectedQs.filter(q => sourceOf(q) === 'ai').length} tone="teal" />
                    <SourceTile label="Bulk Uploaded" count={selectedQs.filter(q => sourceOf(q) === 'upload').length} tone="primary" />
                    <SourceTile label="Manually Added" count={selectedQs.filter(q => sourceOf(q) === 'manual').length} tone="warning" />
                  </div>
                </div>
              </div>

              {/* Summary card */}
              <div className="hnx-card p-5 h-fit">
                <h3 className="text-[14px] font-bold text-navy mb-4">Final Summary</h3>
                <div className="space-y-3">
                  <div>
                    <label className="hnx-label block mb-1">Assessment Name</label>
                    <input value={assessmentName} onChange={(e) => setAssessmentName(e.target.value)} className="hnx-input w-full" />
                  </div>
                  <SummaryRow label="Selected Questions" value={`${target}`} />
                  <div>
                    <label className="hnx-label block mb-1">Suggested Duration</label>
                    <div className="flex items-center gap-2">
                      <input type="number" min={5} value={effectiveDuration} onChange={(e) => setFinalDuration(+e.target.value)} className="hnx-input w-20 h-8 text-center" />
                      <span className="text-[12px] text-muted-foreground">minutes</span>
                      <button onClick={() => setFinalDuration(null)} className="text-[10.5px] text-primary font-semibold hover:underline ml-auto">Reset to {computedSuggested}m</button>
                    </div>
                    <p className="text-[10.5px] text-muted-foreground mt-1.5 leading-snug">
                      Calculated from selected count, difficulty, and estimated effort. Edit before saving.
                    </p>
                  </div>
                  <div>
                    <label className="hnx-label block mb-1">Pass Threshold</label>
                    <div className="flex items-center gap-1.5">
                      <input type="number" value={passThreshold} onChange={(e) => setPassThreshold(+e.target.value)} className="hnx-input w-16 h-8" />
                      <span className="text-[12px] text-muted-foreground">%</span>
                    </div>
                  </div>
                  <div>
                    <p className="hnx-label mb-1.5">Difficulty Mix</p>
                    <DifficultyBar
                      easy={Math.round((difficulty.easy / Math.max(1, questions.length)) * 100)}
                      medium={Math.round((difficulty.medium / Math.max(1, questions.length)) * 100)}
                      hard={Math.round((difficulty.hard / Math.max(1, questions.length)) * 100)}
                    />
                  </div>
                  <SummaryRow label="Competencies Covered" value={`${competencyCoverage.length}`} tone="green" />
                </div>
                <div className="mt-5 pt-4 border-t flex flex-col gap-2">
                  <Button variant="outline" className="w-full" onClick={() => setStep(2)}><ArrowLeft className="w-3.5 h-3.5 mr-1.5" />Back to Pool</Button>
                  <Button variant="outline" className="w-full" onClick={() => setShowFinalQuestions(true)}>
                    <Eye className="w-4 h-4 mr-1.5" />View Final Questions
                  </Button>
                  <Button className="w-full bg-hnxgreen hover:bg-hnxgreen-deep text-navy font-bold" onClick={() => setShowSaveConfirm(true)}>
                    <CheckCircle2 className="w-4 h-4 mr-1.5" />Save & Attach to Round
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ===================== RIGHT PANEL ===================== */}
        <IntelligencePanel>
          {step === 1 && (
            <>
              <div className="hnx-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-md bg-teal-light flex items-center justify-center">
                    <Info className="w-3.5 h-3.5 text-teal-deep" strokeWidth={2.5} />
                  </div>
                  <h3 className="hnx-section-title">Competency Coverage</h3>
                </div>
                <p className="text-[12px] text-foreground/70 leading-relaxed">
                  These competencies are mapped from the JD, role level, skills, domain, and experience range. AI will use this mapping to generate relevant questions for this assessment.
                </p>
              </div>
              <PanelSection title="Mapped Competencies" defaultOpen>
                <div className="space-y-1.5">
                  {job.competencies.map(c => (
                    <div key={c.id} className="flex items-center gap-2 text-[12px]">
                      <span className={cn('w-1 h-3 rounded-full',
                        c.category === 'Technical' ? 'bg-primary' : c.category === 'Domain' ? 'bg-teal' : 'bg-hnxgreen-deep')} />
                      <span className="flex-1 truncate">{c.name}</span>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wide">{c.category}</span>
                    </div>
                  ))}
                </div>
              </PanelSection>
            </>
          )}

          {step === 2 && (
            <>
              <PanelSection title="Pool Stats" defaultOpen>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <Stat label="AI" value={`${aiCount}`} />
                  <Stat label="Uploaded" value={`${uploadCount}`} />
                  <Stat label="Manual" value={`${manualCount}`} />
                  <Stat label="Total" value={`${questions.length}`} />
                  <Stat label="Selected" value={`${selectedCount}`} tone="green" />
                  <Stat label="Target" value={`${target}`} />
                </div>
              </PanelSection>
              <PanelSection title="Difficulty Distribution">
                <DifficultyBar
                  easy={Math.round((difficulty.easy / Math.max(1, questions.length)) * 100)}
                  medium={Math.round((difficulty.medium / Math.max(1, questions.length)) * 100)}
                  hard={Math.round((difficulty.hard / Math.max(1, questions.length)) * 100)}
                />
              </PanelSection>
              <PanelSection title="Competency Coverage" defaultOpen>
                <p className="text-[11px] text-muted-foreground mb-2 leading-relaxed">
                  Mapped from JD & assessment scope. Counts update live as you select questions.
                </p>
                <div className="space-y-1.5">
                  {job.competencies.map(c => {
                    const live = competencyCoverage.find(x => x.name === c.name)?.count ?? 0;
                    return (
                      <div key={c.id} className="flex items-center gap-2 text-[12px]">
                        <span className={cn('w-1 h-3 rounded-full',
                          c.category === 'Technical' ? 'bg-primary' : c.category === 'Domain' ? 'bg-teal' : 'bg-hnxgreen-deep')} />
                        <span className="flex-1 truncate">{c.name}</span>
                        <span className={cn('text-[10px] tabular-nums font-semibold px-1.5 py-0.5 rounded',
                          live > 0 ? 'bg-teal-light text-teal-deep' : 'bg-muted text-muted-foreground')}>{live}</span>
                      </div>
                    );
                  })}
                </div>
              </PanelSection>
            </>
          )}

          {step === 3 && (
            <PanelSection title="Final Snapshot" defaultOpen>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <Stat label="Selected" value={`${selectedCount}`} tone="green" />
                <Stat label="Duration" value={`${effectiveDuration}m`} />
                <Stat label="Pass" value={`${passThreshold}%`} />
                <Stat label="Sources" value={`${[aiCount && 'AI', uploadCount && 'Bulk', manualCount && 'Manual'].filter(Boolean).length}`} />
              </div>
            </PanelSection>
          )}
        </IntelligencePanel>
      </div>

      {showManualAdd && <ManualQuestionModal onClose={() => setShowManualAdd(false)} onAdd={addManualQuestion} competencyName={job.competencies[0]?.name || 'Role Fit'} skillTag={context.primarySkills[0] || 'Core Skill'} />}
      {showBulkImport && <BulkImportModal onClose={() => setShowBulkImport(false)} onImport={importQuestions} competencyName={job.competencies[0]?.name || 'Role Fit'} skillTag={context.primarySkills[0] || 'Core Skill'} />}
      {showFinalQuestions && <FinalQuestionsOverlay questions={selectedQs} onClose={() => setShowFinalQuestions(false)} />}
      {showSaveConfirm && <SaveConfirmOverlay onClose={() => setShowSaveConfirm(false)} onConfirm={save} />}
    </AppLayout>
  );
}

// ============== Reusable sub-components ==============

function EditableTile({ label, value, onChange, readOnly }: { label: string; value: string; onChange?: (v: string) => void; readOnly?: boolean }) {
  const [editing, setEditing] = useState(false);
  const [v, setV] = useState(value);
  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <span className="hnx-label">{label}</span>
        <AIBadge />
      </div>
      {editing && !readOnly ? (
        <div className="flex items-center gap-1.5">
          <input value={v} onChange={(e) => setV(e.target.value)} className="hnx-input flex-1 h-8" autoFocus />
          <button onClick={() => { onChange?.(v); setEditing(false); }} className="w-7 h-7 rounded-md bg-hnxgreen/20 text-hnxgreen-deep flex items-center justify-center"><Check className="w-3.5 h-3.5" /></button>
          <button onClick={() => { setV(value); setEditing(false); }} className="w-7 h-7 rounded-md bg-muted flex items-center justify-center"><X className="w-3.5 h-3.5" /></button>
        </div>
      ) : (
        <div className="group flex items-center justify-between">
          <p className="text-[13px] font-semibold text-navy">{value}</p>
          {!readOnly && (
            <button onClick={() => setEditing(true)} className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 rounded-md hover:bg-muted flex items-center justify-center">
              <Pencil className="w-3 h-3 text-muted-foreground" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function NumberStepper({ label, value, onChange, suffix, step = 5, min = 1 }: { label: string; value: number; onChange: (v: number) => void; suffix: string; step?: number; min?: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="hnx-label">{label}</span>
      <div className="flex items-center gap-1.5">
        <button onClick={() => onChange(Math.max(min, value - step))} className="hnx-stepper-btn"><Minus className="w-3 h-3" /></button>
        <span className="text-[14px] font-bold text-navy tabular-nums w-10 text-center">{value}</span>
        <button onClick={() => onChange(value + step)} className="hnx-stepper-btn"><Plus className="w-3 h-3" /></button>
        <span className="text-[11px] text-muted-foreground ml-1">{suffix}</span>
      </div>
    </div>
  );
}

function ToggleRow({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[12px] text-foreground">{label}</span>
      <button
        onClick={() => onChange(!value)}
        className={cn('w-9 h-5 rounded-full relative transition-colors', value ? 'bg-teal' : 'bg-muted')}
      >
        <span className={cn('absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform', value ? 'translate-x-[18px]' : 'translate-x-0.5')} />
      </button>
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

function PoolTabButton({ active, onClick, label, count, tone = 'default' }: { active: boolean; onClick: () => void; label: string; count: number; tone?: 'default' | 'green' }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'h-8 px-3 rounded-md text-[12px] font-semibold border transition-all inline-flex items-center gap-2',
        active ? (tone === 'green' ? 'bg-hnxgreen-deep text-navy-foreground border-hnxgreen-deep' : 'bg-primary text-primary-foreground border-primary shadow-sm')
               : 'bg-card text-muted-foreground border-border hover:text-foreground hover:border-primary/30',
      )}
    >
      {label}<span className={cn('text-[10px] rounded-full px-1.5 py-0.5', active ? 'bg-white/20' : 'bg-muted')}>{count}</span>
    </button>
  );
}

function QuestionCard({ question, index, onUpdate }: { question: MCQQuestion; index: number; onUpdate: (p: Partial<MCQQuestion>) => void }) {
  const [showExp, setShowExp] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const diffBar = question.difficulty === 'Easy' ? 'bg-hnxgreen-deep' : question.difficulty === 'Medium' ? 'bg-warning' : 'bg-destructive/80';
  const diffTone = question.difficulty === 'Easy' ? 'bg-green-light text-hnxgreen-deep' : question.difficulty === 'Medium' ? 'bg-warning-light text-warning' : 'bg-danger-light text-destructive';
  const isApproved = question.status === 'approved';
  const src = sourceOf(question);

  return (
    <div className={cn(
      'hnx-card relative overflow-hidden group transition-all',
      isApproved && 'bg-teal-light/30 border-teal/30',
    )}>
      <span className={cn('absolute left-0 top-0 bottom-0 w-1', diffBar)} />
      <div className="p-4 pl-5">
        <div className="flex items-start gap-3">
          <input type="checkbox" checked={isApproved} onChange={(e) => onUpdate({ status: e.target.checked ? 'approved' : 'pending' })} className="mt-1 accent-primary w-4 h-4" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-[11px] font-mono font-bold text-muted-foreground">Q{index + 1}</span>
              <span className={cn('hnx-badge', diffTone)}>{question.difficulty}</span>
              <span className={cn('hnx-badge border', sourceMeta[src].tone)}>{sourceMeta[src].label}</span>
              <SkillChip label={question.competencyName} variant="teal" size="xs" />
              <SkillChip label={question.type === 'TrueFalse' ? 'True/False' : question.type} variant="muted" size="xs" />
            </div>
            <p className="text-[14px] font-semibold text-navy leading-snug mb-3">{question.text}</p>
            <button onClick={() => setShowOptions(!showOptions)} className="inline-flex items-center gap-1 text-[11px] text-primary font-semibold hover:underline mr-4">
              <ChevronDown className={cn('w-3 h-3 transition-transform', showOptions && 'rotate-180')} />{showOptions ? 'Hide' : 'View'} options
            </button>
            <button onClick={() => setShowExp(!showExp)} className="text-[11px] text-primary font-semibold hover:underline">
              {showExp ? 'Hide' : 'View'} explanation
            </button>
            {showOptions && (
              <div className="space-y-1.5 mt-3 mb-2 animate-fade-in-fast">
                {question.options.map((o, i) => (
                  <div key={o.id} className={cn('flex items-center gap-2.5 p-2 rounded-md border text-[12.5px]', o.isCorrect ? 'bg-green-light/60 border-hnxgreen/30 text-hnxgreen-deep font-medium' : 'bg-card border-border text-foreground/80')}>
                    <span className={cn('w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0', o.isCorrect ? 'bg-hnxgreen text-navy' : 'bg-muted text-muted-foreground')}>
                      {o.isCorrect ? <Check className="w-3 h-3" strokeWidth={3} /> : String.fromCharCode(65 + i)}
                    </span>{o.text}
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

function ManualQuestionModal({ onClose, onAdd, competencyName, skillTag }: { onClose: () => void; onAdd: (q: MCQQuestion) => void; competencyName: string; skillTag: string }) {
  const [text, setText] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [answer, setAnswer] = useState(0);
  const [explanation, setExplanation] = useState('');
  const [difficulty, setDifficulty] = useState<MCQQuestion['difficulty']>('Medium');
  const submit = () => {
    if (!text.trim() || options.some(o => !o.trim())) return toast.error('Add the question and all four options');
    onAdd({
      id: `manual-${Date.now()}`,
      text,
      options: options.map((o, i) => ({ id: String.fromCharCode(97 + i), text: o, isCorrect: i === answer })),
      explanation: explanation || 'Manual explanation pending recruiter review.',
      competencyId: 'manual', competencyName, skillTag,
      difficulty, type: 'MCQ', estimatedTimeSec: 60, status: 'pending', freshness: 'new',
    });
    onClose();
  };
  return (
    <ModalShell title="Add Question Manually" onClose={onClose}>
      <div className="space-y-3">
        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Question text" className="hnx-input min-h-20 w-full py-2" />
        {options.map((o, i) => (
          <div key={i} className="flex gap-2 items-center">
            <input type="radio" checked={answer === i} onChange={() => setAnswer(i)} className="accent-primary" />
            <input value={o} onChange={(e) => setOptions(options.map((x, ix) => ix === i ? e.target.value : x))} placeholder={`Option ${i + 1}${i === answer ? ' (correct)' : ''}`} className="hnx-input flex-1" />
          </div>
        ))}
        <div className="grid grid-cols-2 gap-3">
          <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as MCQQuestion['difficulty'])} className="hnx-input">
            <option>Easy</option><option>Medium</option><option>Hard</option>
          </select>
          <input value={explanation} onChange={(e) => setExplanation(e.target.value)} placeholder="Explanation" className="hnx-input" />
        </div>
        <Button className="w-full bg-primary" onClick={submit}>Add to Pool</Button>
      </div>
    </ModalShell>
  );
}

function BulkImportModal({ onClose, onImport, competencyName, skillTag }: { onClose: () => void; onImport: (q: MCQQuestion[]) => void; competencyName: string; skillTag: string }) {
  const [bulk, setBulk] = useState('What is React used for?\nA. Styling only\nB. Building user interfaces*\nC. Database hosting\nD. Server monitoring\nExplanation: React is a UI library.');
  const [summary, setSummary] = useState<{ total: number; valid: number; invalid: number } | null>(null);

  const parseCsv = (text: string): MCQQuestion[] => {
    const rows = text.split(/\r?\n/).filter(Boolean);
    if (rows.length === 0) return [];
    const lines = rows.slice(1); // assume header row
    let invalid = 0;
    const out: MCQQuestion[] = [];
    lines.forEach((line, idx) => {
      const cols = line.match(/("[^"]*"|[^,]+)/g)?.map(c => c.replace(/^"|"$/g, '').trim()) || [];
      if (!cols[0] || !cols[1] || !cols[2]) { invalid++; return; }
      const correctRaw = (cols[5] || 'A').toUpperCase();
      const correct = Math.max(0, ['A', 'B', 'C', 'D'].indexOf(correctRaw));
      out.push({
        id: `upload-${Date.now()}-${idx}`,
        text: cols[0],
        options: [1, 2, 3, 4].map((n, i) => ({ id: String.fromCharCode(97 + i), text: cols[n] || `Option ${n}`, isCorrect: i === correct })),
        explanation: cols[6] || 'Imported question explanation.',
        competencyId: 'imported', competencyName: cols[8] || competencyName, skillTag: cols[8] || skillTag,
        difficulty: ((cols[7] as MCQQuestion['difficulty']) || 'Medium'),
        type: 'MCQ', estimatedTimeSec: 60, status: 'pending', freshness: 'new',
      });
    });
    setSummary({ total: lines.length, valid: out.length, invalid });
    return out;
  };

  const handleFile = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onImport(parseCsv(String(reader.result || '')));
    reader.readAsText(file);
  };

  const submit = () => {
    const blocks = bulk.split(/\n\s*\n/).filter(Boolean);
    const imported = blocks.map((block, idx) => {
      const lines = block.split('\n').filter(Boolean);
      const opts = lines.slice(1, 5).map((line, i) => ({ id: String.fromCharCode(97 + i), text: line.replace(/^[A-D]\.?\s*/i, '').replace('*', '').trim(), isCorrect: line.includes('*') }));
      const anyCorrect = opts.some(o => o.isCorrect) ? opts : opts.map((o, i) => ({ ...o, isCorrect: i === 0 }));
      return {
        id: `upload-${Date.now()}-${idx}`,
        text: lines[0],
        options: anyCorrect,
        explanation: lines.find(l => l.toLowerCase().startsWith('explanation'))?.replace(/explanation:\s*/i, '') || 'Imported question explanation.',
        competencyId: 'imported', competencyName, skillTag,
        difficulty: 'Medium' as const, type: 'MCQ' as const, estimatedTimeSec: 60, status: 'pending' as const, freshness: 'new' as const,
      };
    });
    onImport(imported);
  };

  return (
    <ModalShell title="Bulk Upload Questions" onClose={onClose}>
      <div className="space-y-3">
        <p className="text-[12px] text-muted-foreground">CSV columns: <span className="font-mono">question, option1, option2, option3, option4, correct(A-D), explanation, difficulty, competency</span></p>
        <label className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-primary/30 bg-primary/5 p-5 text-[13px] font-semibold text-primary cursor-pointer">
          <Upload className="w-4 h-4" />Upload CSV file
          <input type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
        </label>
        {summary && (
          <div className="rounded-md border bg-muted/30 p-3 text-[12px] grid grid-cols-3 gap-2">
            <div><p className="text-muted-foreground">Total</p><p className="font-bold text-navy tabular-nums">{summary.total}</p></div>
            <div><p className="text-muted-foreground">Valid</p><p className="font-bold text-hnxgreen-deep tabular-nums">{summary.valid}</p></div>
            <div><p className="text-muted-foreground">Invalid</p><p className="font-bold text-destructive tabular-nums">{summary.invalid}</p></div>
          </div>
        )}
        <div className="border-t pt-3">
          <p className="hnx-label mb-2">Or paste questions (mark correct option with *)</p>
          <textarea value={bulk} onChange={(e) => setBulk(e.target.value)} className="hnx-input min-h-44 w-full font-mono text-[12px] py-2" />
        </div>
        <Button className="w-full bg-primary" onClick={submit}><Upload className="w-4 h-4 mr-2" />Import Pasted Questions</Button>
      </div>
    </ModalShell>
  );
}

function FinalQuestionsOverlay({ questions, onClose }: { questions: MCQQuestion[]; onClose: () => void }) {
  return (
    <ModalShell title={`Final Questions (${questions.length})`} onClose={onClose} wide>
      <div className="space-y-3 max-h-[70vh] overflow-auto pr-2">
        {questions.map((q, i) => (
          <div key={q.id} className="hnx-card p-4">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-[11px] font-mono font-bold text-muted-foreground">Q{i + 1}</span>
              <span className="hnx-badge bg-muted text-foreground/80">{q.difficulty}</span>
              <span className={cn('hnx-badge border', sourceMeta[sourceOf(q)].tone)}>{sourceMeta[sourceOf(q)].label}</span>
              <SkillChip label={q.competencyName} variant="teal" size="xs" />
            </div>
            <p className="text-[14px] font-semibold text-navy mb-2">{q.text}</p>
            <div className="space-y-1 mb-2">
              {q.options.map((o, j) => (
                <div key={o.id} className={cn('flex items-center gap-2 p-2 rounded text-[12.5px] border', o.isCorrect ? 'bg-green-light/60 border-hnxgreen/30 text-hnxgreen-deep font-semibold' : 'bg-card border-border text-foreground/80')}>
                  <span className="font-mono w-5">{String.fromCharCode(65 + j)}.</span>{o.text}
                  {o.isCorrect && <Check className="w-3.5 h-3.5 ml-auto" strokeWidth={3} />}
                </div>
              ))}
            </div>
            <p className="text-[12px] text-muted-foreground italic">{q.explanation}</p>
          </div>
        ))}
      </div>
    </ModalShell>
  );
}

function SaveConfirmOverlay({ onClose, onConfirm }: { onClose: () => void; onConfirm: () => void }) {
  return (
    <ModalShell title="Save Final Assessment" onClose={onClose}>
      <div className="space-y-4">
        <div className="p-4 rounded-lg bg-warning-light border border-warning/30">
          <p className="text-[13px] font-semibold text-navy">Once saved, this assessment will be attached to the round.</p>
          <p className="text-[12px] text-foreground/70 mt-1 leading-relaxed">Final test setup cannot be reverted without creating a new version.</p>
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
      <div className={cn('hnx-card p-5 shadow-2xl animate-fade-in max-h-[88vh] overflow-hidden flex flex-col', wide ? 'w-full max-w-5xl' : 'w-full max-w-xl')}>
        <div className="flex items-center justify-between mb-4 shrink-0">
          <h3 className="text-[16px] font-bold text-navy">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-md hover:bg-muted flex items-center justify-center"><X className="w-4 h-4" /></button>
        </div>
        <div className="overflow-auto">{children}</div>
      </div>
    </div>
  );
}

function Stat({ label, value, tone = 'default' }: { label: string; value: string; tone?: 'default' | 'green' | 'warn' }) {
  const tones = { default: 'text-foreground', green: 'text-hnxgreen-deep', warn: 'text-warning' };
  return (
    <div className="p-2 rounded-md bg-muted/40">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">{label}</p>
      <p className={cn('text-[14px] font-bold tabular-nums', tones[tone])}>{value}</p>
    </div>
  );
}

function SourceTile({ label, count, tone }: { label: string; count: number; tone: 'teal' | 'primary' | 'warning' }) {
  const tones = {
    teal: 'bg-teal-light text-teal-deep border-teal/30',
    primary: 'bg-blue-light text-primary border-primary/20',
    warning: 'bg-warning-light text-warning border-warning/20',
  };
  return (
    <div className={cn('rounded-lg border p-3 text-center', tones[tone])}>
      <p className="text-[10px] uppercase tracking-wider font-semibold opacity-80">{label}</p>
      <p className="text-[20px] font-bold tabular-nums mt-1">{count}</p>
    </div>
  );
}

function SummaryRow({ label, value, tone }: { label: string; value: string; tone?: 'green' }) {
  return (
    <div className="flex justify-between items-center text-[12px]">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn('font-semibold', tone === 'green' ? 'text-hnxgreen-deep' : 'text-foreground')}>{value}</span>
    </div>
  );
}