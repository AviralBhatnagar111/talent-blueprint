import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { useStore } from '@/store/useStore';
import { toast } from 'sonner';
import {
  Sparkles, Save, ArrowRight, ArrowLeft, ChevronDown, Pencil, Check, X,
  Upload, FilePlus2, AlertTriangle, Shield, CheckCircle2, Eye,
  Minus, Plus, Zap, ListChecks,
} from 'lucide-react';
import { ContextTopBar, NavyChip } from '@/components/shared/ContextTopBar';
import { Stepper } from '@/components/shared/Stepper';
import { GenerationLoader } from '@/components/shared/GenerationLoader';
import { DifficultyBar } from '@/components/shared/DifficultyBar';
import { SkillChip } from '@/components/shared/SkillChip';
import { AIBadge } from '@/components/shared/AIBadge';
import {
  IntelligencePanel, PanelSection, StatBar, ChecklistItem,
  CompetencySection, RoleContextSection,
} from '@/components/shared/IntelligencePanel';
import { cn } from '@/lib/utils';
import { defaultMCQBlueprint, mcqGenerationSteps } from '@/data/mockData';
import type { MCQBlueprint, MCQQuestion, MCQType } from '@/types/hirenowx';

const STEPS = [
  { number: 1, label: 'Confirm Context' },
  { number: 2, label: 'Generate Questions' },
  { number: 3, label: 'Review & Finalize' },
];

export default function MCQBuilder() {
  const { jobId, roundId } = useParams<{ jobId: string; roundId: string }>();
  const navigate = useNavigate();
  const job = useStore(s => s.getJob(jobId!));
  const getSampleMCQ = useStore(s => s.getSampleMCQ);
  const saveMCQAssessment = useStore(s => s.saveMCQAssessment);

  const round = job?.rounds.find(r => r.id === roundId);

  const [step, setStep] = useState(1);
  const [context, setContext] = useState(job?.roleContext);
  const [blueprint, setBlueprint] = useState<MCQBlueprint>(defaultMCQBlueprint);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [questions, setQuestions] = useState<MCQQuestion[]>([]);
  const [showManualAdd, setShowManualAdd] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [showFinalQuestions, setShowFinalQuestions] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [assessmentName, setAssessmentName] = useState('Technical MCQ — ' + (job?.title || ''));
  const [passThreshold, setPassThreshold] = useState(60);

  if (!job || !round || !context) {
    return <AppLayout bare><div className="p-8">Not found. <Link to="/jobs" className="text-primary">Back to Jobs</Link></div></AppLayout>;
  }

  const handleGenerate = () => {
    setGenerating(true);
    setStep(2);
  };
  const handleGenComplete = () => {
    setGenerating(false);
    setQuestions(getSampleMCQ());
  };

  const approved = questions.filter(q => q.status === 'approved').length;
  const pending = questions.filter(q => q.status === 'pending').length;
  const allApproved = questions.length > 0 && approved === questions.length;

  const updateQuestion = (id: string, patch: Partial<MCQQuestion>) =>
    setQuestions(qs => qs.map(q => q.id === id ? { ...q, ...patch } : q));

  const save = () => {
    saveMCQAssessment(job.id, round.id, {
      id: `mcq-${Date.now()}`,
      roundId: round.id,
      name: assessmentName,
      questionsToSend: blueprint.questionsToSend,
      durationMin: blueprint.durationMin,
      passThreshold,
      questions,
      status: 'ready',
    });
    toast.success('MCQ Assessment saved & attached', { description: `${blueprint.questionsToSend} questions attached to ${round.label}` });
    navigate(`/jobs/${job.id}`);
  };

  const addManualQuestion = (question: MCQQuestion) => {
    setQuestions(qs => [question, ...qs]);
    setStep(2);
    toast.success('Question added to pool');
  };

  const importQuestions = (items: MCQQuestion[]) => {
    setQuestions(qs => [...items, ...qs]);
    setStep(2);
    setShowBulkImport(false);
    toast.success('Questions imported', { description: `${items.length} questions added to the pool` });
  };

  const difficulty = {
    easy: questions.filter(q => q.difficulty === 'Easy').length,
    medium: questions.filter(q => q.difficulty === 'Medium').length,
    hard: questions.filter(q => q.difficulty === 'Hard').length,
  };
  const qualityConfidence = questions.length === 0 ? 0 : Math.round(85 + (approved / Math.max(1, questions.length)) * 10);

  return (
    <AppLayout bare>
      <ContextTopBar
        backTo={`/jobs/${job.id}/template`}
        backLabel="Hiring Plan"
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
              disabled={step !== 3 || !allApproved}
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
            <div className="grid grid-cols-2 gap-5 animate-fade-in">
              {/* LEFT — AI Context */}
              <div className="hnx-card p-5">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-teal" strokeWidth={2.5} />
                  <h2 className="text-[16px] font-bold text-navy">AI has prepared this assessment</h2>
                </div>
                <p className="text-[12px] text-muted-foreground mb-5">Review and confirm — we'll tailor questions to this context.</p>
                <div className="space-y-3">
                  <EditableTile label="Role" value={context.roleTitle} onChange={(v) => setContext({ ...context, roleTitle: v })} />
                  <EditableTile label="Experience" value={`${context.experienceMin}–${context.experienceMax} years`} readOnly />
                  <EditableTile label="Industry" value={context.industry} onChange={(v) => setContext({ ...context, industry: v })} />
                  <EditableTile label="Domain" value={context.domain} onChange={(v) => setContext({ ...context, domain: v })} />
                  <EditableTile label="Sub-domain" value={context.subDomain} onChange={(v) => setContext({ ...context, subDomain: v })} />
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="hnx-label">Primary Skills</span>
                      <AIBadge />
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {context.primarySkills.map(s => <SkillChip key={s} label={s} variant="teal" size="sm" removable onRemove={() => setContext({ ...context, primarySkills: context.primarySkills.filter(x => x !== s) })} />)}
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
                    <p className="text-[12px] text-foreground/80 leading-relaxed">{context.roleObjective}</p>
                  </div>
                </div>
              </div>

              {/* RIGHT — Blueprint defaults */}
              <div className="hnx-card p-5">
                <h2 className="text-[16px] font-bold text-navy mb-1">Assessment Blueprint</h2>
                <p className="text-[12px] text-muted-foreground mb-5">Smart defaults — tweak only if needed.</p>

                <div className="space-y-4">
                  <NumberStepper label="Questions to send" value={blueprint.questionsToSend} onChange={(v) => setBlueprint({ ...blueprint, questionsToSend: v })} suffix="questions" />
                  <NumberStepper label="Duration" value={blueprint.durationMin} onChange={(v) => setBlueprint({ ...blueprint, durationMin: v })} suffix="minutes" />
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="hnx-label">Difficulty Mix</span>
                      <span className="text-[11px] text-muted-foreground">Editable AI target</span>
                    </div>
                    <DifficultyMixEditor
                      value={blueprint.difficultyMix}
                      onChange={(difficultyMix) => setBlueprint({ ...blueprint, difficultyMix })}
                    />
                  </div>
                  <div>
                    <span className="hnx-label block mb-1.5">Competencies Covered</span>
                    <p className="text-[12px] text-foreground flex items-center gap-1.5">
                      <span className="font-bold text-navy">{job.competencies.length} competencies</span>
                      <span className="text-muted-foreground">tested invisibly by AI</span>
                    </p>
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
                </div>

                <button onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 mt-5 text-[12px] font-semibold text-muted-foreground hover:text-foreground">
                  <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', showAdvanced && 'rotate-180')} />
                  Advanced Settings
                </button>

                {showAdvanced && (
                  <div className="mt-3 pt-4 border-t space-y-3 animate-fade-in-fast">
                    <NumberStepper label="Pool size" value={blueprint.poolSize} onChange={(v) => setBlueprint({ ...blueprint, poolSize: v })} suffix="questions" />
                    <ToggleRow label="Anti-repeat engine" value={blueprint.antiRepeat} onChange={(v) => setBlueprint({ ...blueprint, antiRepeat: v })} />
                    <ToggleRow label="Randomize question order" value={blueprint.randomizeOrder} onChange={(v) => setBlueprint({ ...blueprint, randomizeOrder: v })} />
                    <ToggleRow label="Randomize option order" value={blueprint.randomizeOptions} onChange={(v) => setBlueprint({ ...blueprint, randomizeOptions: v })} />
                    <ToggleRow label="Strict experience alignment" value={blueprint.strictExperience} onChange={(v) => setBlueprint({ ...blueprint, strictExperience: v })} />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2 — Review workspace */}
          {step === 2 && !generating && questions.length > 0 && (
            <div className="space-y-4 animate-fade-in">
              <div className="hnx-card p-4 flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-3 mr-auto">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <ListChecks className="w-4 h-4" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-bold text-navy">Question Pool</h2>
                    <p className="text-[12px] text-muted-foreground">Pool target {blueprint.poolSize}; select {blueprint.questionsToSend} final questions for the test.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" className="h-8 text-[12px]" onClick={() => setShowBulkImport(true)}>
                    <Upload className="w-3.5 h-3.5 mr-1" />Bulk Import
                  </Button>
                  <Button size="sm" className="h-8 text-[12px] bg-primary" onClick={() => setShowManualAdd(true)}>
                    <FilePlus2 className="w-3.5 h-3.5 mr-1" />Add Question Manually
                  </Button>
                </div>
              </div>

              {questions.map((q, i) => <QuestionCard key={q.id} question={q} index={i} onUpdate={(p) => updateQuestion(q.id, p)} />)}

              <div className="flex justify-between items-center pt-2">
                <Button variant="outline" onClick={() => setStep(1)}><ArrowLeft className="w-3.5 h-3.5 mr-1.5" />Back</Button>
                <Button
                  className="bg-hnxgreen hover:bg-hnxgreen-deep text-navy font-semibold"
                  onClick={() => setStep(3)}
                  disabled={!allApproved}
                >
                  Continue to Finalize<ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3 — Finalize */}
          {step === 3 && (
            <div className="grid grid-cols-[1fr_320px] gap-5 animate-fade-in">
              <div className="hnx-card p-6">
                <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Candidate Preview</p>
                <div className="border-2 border-dashed border-border rounded-lg p-5 bg-muted/20">
                  <h3 className="text-[18px] font-bold text-navy mb-1">{assessmentName}</h3>
                  <p className="text-[12px] text-muted-foreground mb-4">{blueprint.questionsToSend} questions · {blueprint.durationMin} minutes · Once submitted, cannot be edited</p>
                  <div className="bg-card rounded-lg p-4 border mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Question 1 of {blueprint.questionsToSend}</span>
                      <span className="text-[12px] font-mono text-muted-foreground">29:45</span>
                    </div>
                    <p className="text-[14px] text-navy font-semibold mb-3">{questions[0]?.text}</p>
                    <div className="space-y-2">
                      {questions[0]?.options.map((o, i) => (
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
                    <Button size="sm" className="h-7 bg-primary">Next →</Button>
                  </div>
                </div>
              </div>

              <div className="hnx-card p-5 h-fit">
                <h3 className="text-[14px] font-bold text-navy mb-4">Final Summary</h3>
                <div className="space-y-3">
                  <div>
                    <label className="hnx-label block mb-1">Assessment Name</label>
                    <input value={assessmentName} onChange={(e) => setAssessmentName(e.target.value)} className="hnx-input w-full" />
                  </div>
                  <SummaryRow label="Questions" value={`${blueprint.questionsToSend} · from pool of ${blueprint.poolSize}`} />
                  <SummaryRow label="Duration" value={`${blueprint.durationMin} min`} />
                  <div>
                    <label className="hnx-label block mb-1">Pass Threshold</label>
                    <div className="flex items-center gap-1.5">
                      <input type="number" value={passThreshold} onChange={(e) => setPassThreshold(+e.target.value)} className="hnx-input w-16 h-8" />
                      <span className="text-[12px] text-muted-foreground">%</span>
                    </div>
                  </div>
                  <SummaryRow label="Attempts" value="1" />
                  <SummaryRow label="Validity" value="7 days" />
                  <SummaryRow label="Competencies" value={`${job.competencies.length} tested`} />
                  <SummaryRow label="Anti-repeat" value="Active" tone="green" />
                </div>
                <div className="mt-5 pt-4 border-t flex flex-col gap-2">
                  <Button variant="outline" className="w-full" onClick={() => setStep(2)}><ArrowLeft className="w-3.5 h-3.5 mr-1.5" />Back to Questions</Button>
                  <Button variant="outline" className="w-full" onClick={() => setShowFinalQuestions(true)}>
                    <Eye className="w-4 h-4 mr-1.5" />View Final Questions
                  </Button>
                  <Button className="w-full bg-hnxgreen hover:bg-hnxgreen-deep text-navy font-bold" onClick={() => setShowSaveConfirm(true)}>
                    <CheckCircle2 className="w-4 h-4 mr-1.5" />Save & Attach
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Step 1 footer */}
          {step === 1 && (
            <div className="flex justify-between items-center pt-2">
              <Button size="lg" variant="outline" className="font-semibold" onClick={() => setShowBulkImport(true)}>
                <Upload className="w-4 h-4 mr-2" />Upload Questions
              </Button>
              <Button size="lg" className="bg-hnxgreen hover:bg-hnxgreen-deep text-navy font-bold shadow-green-glow" onClick={handleGenerate}>
                <Sparkles className="w-4 h-4 mr-2" />Generate Questions
              </Button>
            </div>
          )}
        </div>

        {/* RIGHT panel */}
        <IntelligencePanel>
          <RoleContextSection context={context} />

          {step >= 2 && questions.length > 0 ? (
            <>
              <PanelSection title="Pool Intelligence">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-hnxgreen/20 flex items-center justify-center">
                    <Zap className="w-3.5 h-3.5 text-hnxgreen-deep" strokeWidth={2.5} />
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground">Quality Confidence</p>
                    <p className="text-[14px] font-bold text-hnxgreen-deep">High · {qualityConfidence}%</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <Stat label="Pool" value={`${blueprint.poolSize}`} />
                  <Stat label="Selected" value={`${questions.length}`} />
                  <Stat label="Approved" value={`${approved}/${questions.length}`} tone="green" />
                  <Stat label="Pending" value={`${pending}`} tone={pending > 0 ? 'warn' : 'default'} />
                </div>
              </PanelSection>

              <PanelSection title="Difficulty Spread">
                <DifficultyBar easy={Math.round((difficulty.easy/questions.length)*100)} medium={Math.round((difficulty.medium/questions.length)*100)} hard={Math.round((difficulty.hard/questions.length)*100)} />
              </PanelSection>

              <PanelSection title="Engine Status" defaultOpen>
                <ChecklistItem tone="ok">Anti-repeat: Active</ChecklistItem>
                <ChecklistItem tone="ok">Freshness: High</ChecklistItem>
                <ChecklistItem tone="ok">Role alignment: Strict</ChecklistItem>
                {pending > 0 && <ChecklistItem icon={AlertTriangle} tone="warn">{pending} question{pending > 1 ? 's' : ''} still unchecked</ChecklistItem>}
              </PanelSection>
            </>
          ) : (
            <>
              <PanelSection title="Blueprint Health">
                <StatBar label="Role-fit confidence" value={context.aiConfidence.roleFit} color="green" />
                <div className="h-3" />
                <StatBar label="Skill coverage" value={context.aiConfidence.skillExtraction} color="teal" />
                <div className="h-3" />
                <StatBar label="Seniority match" value={context.aiConfidence.seniority} color="primary" />
              </PanelSection>
              <CompetencySection competencies={job.competencies} />
            </>
          )}
        </IntelligencePanel>
      </div>

      {showManualAdd && <ManualQuestionModal onClose={() => setShowManualAdd(false)} onAdd={addManualQuestion} competencyName={job.competencies[0]?.name || 'Role Fit'} skillTag={context.primarySkills[0] || 'Core Skill'} />}
      {showBulkImport && <BulkImportModal onClose={() => setShowBulkImport(false)} onImport={importQuestions} competencyName={job.competencies[0]?.name || 'Role Fit'} skillTag={context.primarySkills[0] || 'Core Skill'} />}
      {showFinalQuestions && <FinalQuestionsOverlay questions={questions} onClose={() => setShowFinalQuestions(false)} />}
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

function NumberStepper({ label, value, onChange, suffix }: { label: string; value: number; onChange: (v: number) => void; suffix: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="hnx-label">{label}</span>
      <div className="flex items-center gap-1.5">
        <button onClick={() => onChange(Math.max(1, value - 5))} className="hnx-stepper-btn"><Minus className="w-3 h-3" /></button>
        <span className="text-[14px] font-bold text-navy tabular-nums w-10 text-center">{value}</span>
        <button onClick={() => onChange(value + 5)} className="hnx-stepper-btn"><Plus className="w-3 h-3" /></button>
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

function QuestionCard({ question, index, onUpdate }: { question: MCQQuestion; index: number; onUpdate: (p: Partial<MCQQuestion>) => void }) {
  const [showExp, setShowExp] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const diffBar = question.difficulty === 'Easy' ? 'bg-hnxgreen-deep' : question.difficulty === 'Medium' ? 'bg-warning' : 'bg-destructive/80';
  const diffTone = question.difficulty === 'Easy' ? 'bg-green-light text-hnxgreen-deep' : question.difficulty === 'Medium' ? 'bg-warning-light text-warning' : 'bg-danger-light text-destructive';
  const isApproved = question.status === 'approved';

  return (
    <div className={cn(
      'hnx-card relative overflow-hidden group transition-all',
      isApproved && 'bg-teal-light/30 border-teal/30',
    )}>
      <span className={cn('absolute left-0 top-0 bottom-0 w-1', diffBar)} />
      <div className="p-4 pl-5">
        <div className="flex items-start gap-3">
          <input type="checkbox" checked={isApproved} onChange={(e) => onUpdate({ status: e.target.checked ? 'approved' : 'pending' })} className="mt-1 accent-primary" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-mono font-bold text-muted-foreground">Q{index + 1}</span>
              <span className={cn('hnx-badge', diffTone)}>{question.difficulty}</span>
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
            {showOptions && <div className="space-y-1.5 mt-3 mb-2 animate-fade-in-fast">{question.options.map((o, i) => <div key={o.id} className={cn('flex items-center gap-2.5 p-2 rounded-md border text-[12.5px]', o.isCorrect ? 'bg-green-light/60 border-hnxgreen/30 text-hnxgreen-deep font-medium' : 'bg-card border-border text-foreground/80')}><span className={cn('w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0', o.isCorrect ? 'bg-hnxgreen text-navy' : 'bg-muted text-muted-foreground')}>{o.isCorrect ? <Check className="w-3 h-3" strokeWidth={3} /> : String.fromCharCode(65 + i)}</span>{o.text}</div>)}</div>}
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
    onAdd({ id: `manual-${Date.now()}`, text, options: options.map((o, i) => ({ id: String.fromCharCode(97 + i), text: o, isCorrect: i === answer })), explanation: explanation || 'Manual explanation pending recruiter review.', competencyId: 'manual', competencyName, skillTag, difficulty, type: 'MCQ', estimatedTimeSec: 60, status: 'pending', freshness: 'new' });
    onClose();
  };
  return <ModalShell title="Add Question Manually" onClose={onClose}><div className="space-y-3"><textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Question" className="hnx-input min-h-20 w-full" />{options.map((o, i) => <div key={i} className="flex gap-2"><input type="radio" checked={answer === i} onChange={() => setAnswer(i)} className="accent-primary" /><input value={o} onChange={(e) => setOptions(options.map((x, ix) => ix === i ? e.target.value : x))} placeholder={`Option ${i + 1}`} className="hnx-input flex-1" /></div>)}<div className="grid grid-cols-2 gap-3"><select value={difficulty} onChange={(e) => setDifficulty(e.target.value as MCQQuestion['difficulty'])} className="hnx-input"><option>Easy</option><option>Medium</option><option>Hard</option></select><input value={explanation} onChange={(e) => setExplanation(e.target.value)} placeholder="Explanation" className="hnx-input" /></div><Button className="w-full bg-primary" onClick={submit}>Add to Pool</Button></div></ModalShell>;
}

function BulkImportModal({ onClose, onImport, competencyName, skillTag }: { onClose: () => void; onImport: (q: MCQQuestion[]) => void; competencyName: string; skillTag: string }) {
  const [bulk, setBulk] = useState('What is React used for?\nA. Styling only\nB. Building user interfaces*\nC. Database hosting\nD. Server monitoring\nExplanation: React is a UI library.');
  const submit = () => {
    const blocks = bulk.split(/\n\s*\n/).filter(Boolean);
    const imported = blocks.map((block, idx) => {
      const lines = block.split('\n').filter(Boolean);
      const opts = lines.slice(1, 5).map((line, i) => ({ id: String.fromCharCode(97 + i), text: line.replace(/^[A-D]\.?\s*/i, '').replace('*', ''), isCorrect: line.includes('*') || i === 0 }));
      return { id: `import-${Date.now()}-${idx}`, text: lines[0], options: opts, explanation: lines.find(l => l.toLowerCase().startsWith('explanation'))?.replace(/explanation:\s*/i, '') || 'Imported question explanation.', competencyId: 'imported', competencyName, skillTag, difficulty: 'Medium' as const, type: 'MCQ' as const, estimatedTimeSec: 60, status: 'pending' as const, freshness: 'new' as const };
    });
    onImport(imported);
  };
  return <ModalShell title="Bulk Import Questions" onClose={onClose}><div className="space-y-3"><p className="text-[12px] text-muted-foreground">Paste blocks with one question, four options, mark correct option with *, and optional explanation.</p><textarea value={bulk} onChange={(e) => setBulk(e.target.value)} className="hnx-input min-h-64 w-full font-mono text-[12px]" /><Button className="w-full bg-primary" onClick={submit}><Upload className="w-4 h-4 mr-2" />Import Questions</Button></div></ModalShell>;
}

function FinalQuestionsOverlay({ questions, onClose }: { questions: MCQQuestion[]; onClose: () => void }) {
  return <ModalShell title="Final Questions" onClose={onClose} wide><div className="space-y-3 max-h-[70vh] overflow-auto pr-2">{questions.filter(q => q.status === 'approved').map((q, i) => <QuestionCard key={q.id} question={q} index={i} onUpdate={() => undefined} />)}</div></ModalShell>;
}

function SaveConfirmOverlay({ onClose, onConfirm }: { onClose: () => void; onConfirm: () => void }) {
  return <ModalShell title="Save Assessment" onClose={onClose}><div className="space-y-4"><div className="p-4 rounded-lg bg-danger-light border border-destructive/20"><p className="text-[13px] font-semibold text-navy">This action cannot be reverted.</p><p className="text-[12px] text-muted-foreground mt-1">Saving attaches the final MCQ test to this round for operational use.</p></div><div className="flex gap-2 justify-end"><Button variant="outline" onClick={onClose}>Cancel</Button><Button className="bg-hnxgreen hover:bg-hnxgreen-deep text-navy font-bold" onClick={onConfirm}>Confirm & Save</Button></div></div></ModalShell>;
}

function ModalShell({ title, onClose, children, wide }: { title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  return <div className="fixed inset-0 z-[80] bg-navy/40 backdrop-blur-sm flex items-center justify-center p-6"><div className={cn('hnx-card p-5 shadow-2xl animate-fade-in max-h-[88vh] overflow-hidden', wide ? 'w-full max-w-5xl' : 'w-full max-w-xl')}><div className="flex items-center justify-between mb-4"><h3 className="text-[16px] font-bold text-navy">{title}</h3><button onClick={onClose} className="w-8 h-8 rounded-md hover:bg-muted flex items-center justify-center"><X className="w-4 h-4" /></button></div>{children}</div></div>;
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

function SummaryRow({ label, value, tone }: { label: string; value: string; tone?: 'green' }) {
  return (
    <div className="flex justify-between items-center text-[12px]">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn('font-semibold', tone === 'green' ? 'text-hnxgreen-deep' : 'text-foreground')}>{value}</span>
    </div>
  );
}
