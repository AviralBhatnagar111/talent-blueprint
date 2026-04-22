import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { useStore } from '@/store/useStore';
import { toast } from 'sonner';
import {
  Sparkles, Save, ArrowRight, ArrowLeft, ChevronDown, Check, X, RefreshCw, Lock,
  Unlock, Trash2, AlertTriangle, Shield, CheckCircle2, Clock, Minus, Plus, Zap,
  Code2, Terminal, FileCode, Play, Pencil, Eye, FilePlus2,
} from 'lucide-react';
import { ContextTopBar } from '@/components/shared/ContextTopBar';
import { Stepper } from '@/components/shared/Stepper';
import { GenerationLoader } from '@/components/shared/GenerationLoader';
import { DifficultyBar } from '@/components/shared/DifficultyBar';
import { SkillChip } from '@/components/shared/SkillChip';
import { AIBadge } from '@/components/shared/AIBadge';
import {
  IntelligencePanel, PanelSection, StatBar, ChecklistItem,
  RoleContextSection,
} from '@/components/shared/IntelligencePanel';
import { cn } from '@/lib/utils';
import { defaultCodingBlueprint, codingGenerationSteps } from '@/data/mockData';
import type { CodingBlueprint, CodingLanguage, CodingProblem, CodingProblemType } from '@/types/hirenowx';

const STEPS = [
  { number: 1, label: 'Confirm Context' },
  { number: 2, label: 'Problem Pool' },
  { number: 3, label: 'Review & Finalize' },
];

const ALL_LANGUAGES: CodingLanguage[] = ['JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'Go', 'SQL'];
const ALL_PROBLEM_TYPES: CodingProblemType[] = ['Algorithmic', 'Implementation', 'Debugging', 'OutputPrediction', 'Refactoring', 'APILogic', 'FrontendUI', 'SQL', 'SystemDesignLite', 'RealWorld'];

export default function CodingBuilder() {
  const { jobId, roundId } = useParams<{ jobId: string; roundId: string }>();
  const navigate = useNavigate();
  const job = useStore(s => s.getJob(jobId!));
  const getSampleCoding = useStore(s => s.getSampleCoding);
  const saveCodingAssessment = useStore(s => s.saveCodingAssessment);
  const round = job?.rounds.find(r => r.id === roundId);

  const [step, setStep] = useState(1);
  const [context, setContext] = useState(job?.roleContext);
  const [blueprint, setBlueprint] = useState<CodingBlueprint>(defaultCodingBlueprint);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [problems, setProblems] = useState<CodingProblem[]>([]);
  const [assessmentName, setAssessmentName] = useState('Coding Assessment — ' + (job?.title || ''));
  const [passThreshold, setPassThreshold] = useState(60);
  const [expandedProblem, setExpandedProblem] = useState<string | null>(null);
  const [showManualAdd, setShowManualAdd] = useState(false);
  const [showFinalProblems, setShowFinalProblems] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);

  if (!job || !round || !context) {
    return <AppLayout bare><div className="p-8">Not found. <Link to="/jobs" className="text-primary">Back to Jobs</Link></div></AppLayout>;
  }

  const handleGenerate = () => { setGenerating(true); setStep(2); };
  const handleGenComplete = () => { setGenerating(false); setProblems(getSampleCoding()); };

  const approved = problems.filter(p => p.status === 'approved').length;
  const flagged = problems.filter(p => p.reviewFlag).length;
  const allApproved = problems.length > 0 && approved === problems.length;

  const updateProblem = (id: string, patch: Partial<CodingProblem>) =>
    setProblems(ps => ps.map(p => p.id === id ? { ...p, ...patch } : p));

  const save = () => {
    saveCodingAssessment(job.id, round.id, {
      id: `coding-${Date.now()}`,
      roundId: round.id,
      name: assessmentName,
      problemsToSend: blueprint.problemsToSend,
      durationMin: blueprint.durationMin,
      passThreshold,
      languages: blueprint.languages,
      problems,
      status: 'ready',
    });
    toast.success('Coding Assessment saved & attached', { description: `${blueprint.problemsToSend} problems attached to ${round.label}` });
    navigate(`/jobs/${job.id}`);
  };

  const addManualProblem = (problem: CodingProblem) => {
    setProblems(ps => [problem, ...ps]);
    setStep(2);
    toast.success('Problem added to pool');
  };

  const toggleLanguage = (l: CodingLanguage) =>
    setBlueprint({ ...blueprint, languages: blueprint.languages.includes(l) ? blueprint.languages.filter(x => x !== l) : [...blueprint.languages, l] });
  const toggleType = (t: CodingProblemType) =>
    setBlueprint({ ...blueprint, problemTypes: blueprint.problemTypes.includes(t) ? blueprint.problemTypes.filter(x => x !== t) : [...blueprint.problemTypes, t] });

  const qualityConfidence = problems.length === 0 ? 0 : Math.round(82 + (approved / Math.max(1, problems.length)) * 10);

  return (
    <AppLayout bare>
      <ContextTopBar
        backTo={`/jobs/${job.id}/template`}
        backLabel="Hiring Plan"
        breadcrumbs={[
          { label: job.title, to: `/jobs/${job.id}` },
          { label: 'Template', to: `/jobs/${job.id}/template` },
          { label: `Coding · ${round.label}` },
        ]}
        chips={<div className="flex-1"><Stepper steps={STEPS} currentStep={step} onStepClick={setStep} /></div>}
        actions={
          <>
            <Button size="sm" variant="ghost" className="text-navy-foreground/90 hover:bg-white/10 hover:text-navy-foreground h-8" onClick={() => toast('Draft saved')}>
              <Save className="w-3.5 h-3.5 mr-1.5" />Save Draft
            </Button>
            <Button size="sm" className="bg-hnxgreen hover:bg-hnxgreen-deep text-navy font-semibold h-8" onClick={save} disabled={step !== 3 || !allApproved}>
              Save & Attach
            </Button>
          </>
        }
      />

      {generating && <GenerationLoader steps={codingGenerationSteps} title="Building your Coding assessment" onComplete={handleGenComplete} />}

      <div className="grid grid-cols-[1fr_340px] gap-6 p-6 max-w-[1440px] mx-auto">
        <div className="min-w-0 space-y-5">
          {/* STEP 1 */}
          {step === 1 && (
            <div className="grid grid-cols-2 gap-5 animate-fade-in">
              {/* LEFT */}
              <div className="hnx-card p-5">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-teal" strokeWidth={2.5} />
                  <h2 className="text-[16px] font-bold text-navy">AI has prepared this coding test</h2>
                </div>
                <p className="text-[12px] text-muted-foreground mb-5">Confirm the role context — we'll calibrate problems to it.</p>

                <div className="space-y-3">
                  <Tile label="Role" value={context.roleTitle} />
                  <Tile label="Experience" value={`${context.experienceMin}–${context.experienceMax} years`} />
                  <Tile label="Domain" value={context.domain} />
                  <Tile label="Sub-domain" value={context.subDomain} />
                  <div>
                    <div className="flex items-center gap-2 mb-1.5"><span className="hnx-label">Must-test technologies</span><AIBadge /></div>
                    <div className="flex flex-wrap gap-1.5">
                      {(context.mustTestTech || []).map(t => <SkillChip key={t} label={t} variant="teal" size="sm" />)}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1.5"><span className="hnx-label">Coding languages allowed</span><AIBadge /></div>
                    <div className="flex flex-wrap gap-1.5">
                      {ALL_LANGUAGES.map(l => {
                        const on = blueprint.languages.includes(l);
                        return (
                          <button key={l} onClick={() => toggleLanguage(l)} className={cn(
                            'px-2.5 py-1 rounded-md text-[11px] font-medium border transition-all inline-flex items-center gap-1',
                            on ? 'bg-teal-light text-teal-deep border-teal/40' : 'bg-card text-muted-foreground border-border hover:border-teal/30'
                          )}>
                            <span className={cn('w-1.5 h-1.5 rounded-full', on ? 'bg-teal' : 'bg-muted-foreground/30')} />
                            {l}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <span className="hnx-label block mb-1.5">Role Objective</span>
                    <p className="text-[12px] text-foreground/80 leading-relaxed">{context.roleObjective}</p>
                  </div>
                </div>
              </div>

              {/* RIGHT — blueprint */}
              <div className="hnx-card p-5">
                <h2 className="text-[16px] font-bold text-navy mb-1">Coding Blueprint</h2>
                <p className="text-[12px] text-muted-foreground mb-5">Smart defaults for a senior-level test.</p>

                <div className="space-y-4">
                  <NumberStepper label="Problems to send" value={blueprint.problemsToSend} step={1} onChange={(v) => setBlueprint({ ...blueprint, problemsToSend: v })} suffix="problems" />
                  <NumberStepper label="Duration" value={blueprint.durationMin} step={15} onChange={(v) => setBlueprint({ ...blueprint, durationMin: v })} suffix="minutes" />
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="hnx-label">Difficulty Mix</span>
                      <span className="text-[11px] text-muted-foreground">Editable AI target</span>
                    </div>
                    <DifficultyMixEditor value={blueprint.difficultyMix} onChange={(difficultyMix) => setBlueprint({ ...blueprint, difficultyMix })} />
                  </div>
                  <div>
                    <span className="hnx-label block mb-1.5">Problem Types</span>
                    <div className="flex flex-wrap gap-1.5">
                      {ALL_PROBLEM_TYPES.slice(0, 6).map(t => {
                        const on = blueprint.problemTypes.includes(t);
                        return (
                          <button key={t} onClick={() => toggleType(t)} className={cn(
                            'px-2.5 py-1 rounded-md text-[11px] font-medium border transition-all',
                            on ? 'bg-teal-light text-teal-deep border-teal/40' : 'bg-card text-muted-foreground border-border hover:border-teal/30'
                          )}>
                            {on && <Check className="w-3 h-3 inline mr-1" />}{t}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <span className="hnx-label block mb-1.5">Competencies Covered</span>
                    <p className="text-[12px] flex items-center gap-1.5">
                      <span className="font-bold text-navy">{job.competencies.length}</span>
                      <span className="text-muted-foreground">competencies · tested invisibly</span>
                    </p>
                  </div>
                </div>

                <button onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 mt-5 text-[12px] font-semibold text-muted-foreground hover:text-foreground">
                  <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', showAdvanced && 'rotate-180')} />
                  Advanced Settings
                </button>

                {showAdvanced && (
                  <div className="mt-3 pt-4 border-t space-y-3 animate-fade-in-fast">
                    <NumberStepper label="Pool size" value={blueprint.poolSize} step={5} onChange={(v) => setBlueprint({ ...blueprint, poolSize: v })} suffix="problems" />
                    <div className="grid grid-cols-2 gap-3">
                      <NumberStepper label="Visible test cases" value={blueprint.testCases.visible} step={1} onChange={(v) => setBlueprint({ ...blueprint, testCases: { ...blueprint.testCases, visible: v } })} suffix="" />
                      <NumberStepper label="Hidden test cases" value={blueprint.testCases.hidden} step={1} onChange={(v) => setBlueprint({ ...blueprint, testCases: { ...blueprint.testCases, hidden: v } })} suffix="" />
                    </div>
                    <div className="pt-2 border-t">
                      <p className="hnx-label mb-2">Integrity</p>
                      <div className="space-y-2">
                        <ToggleRow label="Plagiarism check" value={blueprint.integrity.plagiarism} onChange={(v) => setBlueprint({ ...blueprint, integrity: { ...blueprint.integrity, plagiarism: v } })} />
                        <ToggleRow label="Tab switch monitoring" value={blueprint.integrity.tabSwitch} onChange={(v) => setBlueprint({ ...blueprint, integrity: { ...blueprint.integrity, tabSwitch: v } })} />
                        <ToggleRow label="Copy-paste block" value={blueprint.integrity.copyPasteBlock} onChange={(v) => setBlueprint({ ...blueprint, integrity: { ...blueprint.integrity, copyPasteBlock: v } })} />
                        <ToggleRow label="AI-generated code detection" value={blueprint.integrity.aiDetection} onChange={(v) => setBlueprint({ ...blueprint, integrity: { ...blueprint.integrity, aiDetection: v } })} />
                      </div>
                    </div>
                    <ToggleRow label="Partial scoring" value={blueprint.scoring.partial} onChange={(v) => setBlueprint({ ...blueprint, scoring: { ...blueprint.scoring, partial: v } })} />
                    <ToggleRow label="Benchmark mode" value={blueprint.benchmarkMode} onChange={(v) => setBlueprint({ ...blueprint, benchmarkMode: v })} />
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="flex justify-end pt-2">
              <Button size="lg" className="bg-hnxgreen hover:bg-hnxgreen-deep text-navy font-bold shadow-green-glow" onClick={handleGenerate}>
                <Sparkles className="w-4 h-4 mr-2" />Generate Problems
              </Button>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && !generating && problems.length > 0 && (
            <div className="space-y-3 animate-fade-in">
              <div className="hnx-card p-4 flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-3 mr-auto">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center"><Code2 className="w-4 h-4" strokeWidth={2.5} /></div>
                  <div>
                    <h2 className="text-[15px] font-bold text-navy">Problem Pool</h2>
                    <p className="text-[12px] text-muted-foreground">Pool target {blueprint.poolSize}; approve {blueprint.problemsToSend} final coding problems.</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="h-8 text-[12px]" onClick={() => setProblems(ps => ps.map(p => ({ ...p, status: 'approved' })))}>
                  <Check className="w-3.5 h-3.5 mr-1" />Approve All
                </Button>
                <Button size="sm" className="h-8 text-[12px] bg-primary" onClick={() => setShowManualAdd(true)}>
                  <FilePlus2 className="w-3.5 h-3.5 mr-1" />Add Problem Manually
                </Button>
              </div>

              {problems.map((p, i) => (
                <CodingCard
                  key={p.id}
                  problem={p}
                  index={i}
                  expanded={expandedProblem === p.id}
                  onToggleExpand={() => setExpandedProblem(expandedProblem === p.id ? null : p.id)}
                  onUpdate={(patch) => updateProblem(p.id, patch)}
                />
              ))}

              <div className="flex justify-between items-center pt-2">
                <Button variant="outline" onClick={() => setStep(1)}><ArrowLeft className="w-3.5 h-3.5 mr-1.5" />Back</Button>
                  <Button className="bg-hnxgreen hover:bg-hnxgreen-deep text-navy font-semibold" onClick={() => setStep(3)} disabled={!allApproved}>
                  Continue to Finalize<ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="grid grid-cols-[1fr_320px] gap-5 animate-fade-in">
              {/* Candidate preview */}
              <div className="hnx-card p-6">
                <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Candidate Preview</p>
                <div className="border-2 border-dashed border-border rounded-lg overflow-hidden">
                  <div className="bg-navy text-navy-foreground px-4 py-2.5 flex items-center justify-between">
                    <p className="text-[13px] font-bold">{assessmentName}</p>
                    <div className="flex items-center gap-3 text-[11px]">
                      <span>{blueprint.problemsToSend} problems · {blueprint.durationMin} min</span>
                      <select className="bg-navy-soft text-navy-foreground text-[11px] rounded px-2 py-1 border border-white/20">
                        {blueprint.languages.map(l => <option key={l}>{l}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 min-h-[320px]">
                    <div className="p-4 border-r bg-card">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Problem 1 of {blueprint.problemsToSend}</p>
                      <h4 className="text-[14px] font-bold text-navy mb-2">{problems[0]?.title}</h4>
                      <p className="text-[12px] text-foreground/80 leading-relaxed mb-3">{problems[0]?.summary}</p>
                      <div className="text-[11px] space-y-1 text-muted-foreground">
                        <p><span className="font-semibold text-foreground">Input:</span> {problems[0]?.ioFormat.input}</p>
                        <p><span className="font-semibold text-foreground">Output:</span> {problems[0]?.ioFormat.output}</p>
                      </div>
                    </div>
                    <div className="bg-[#0f172a] text-teal font-mono text-[11px] p-4 relative">
                      <div className="text-muted-foreground mb-2 flex items-center gap-2">
                        <FileCode className="w-3 h-3" /> solution.{blueprint.languages[0]?.toLowerCase().slice(0, 2) || 'js'}
                      </div>
                      <pre className="text-[11px] leading-relaxed whitespace-pre-wrap">
{`function solution(input) {
  // Your code here
  return output;
}

module.exports = solution;`}
                      </pre>
                    </div>
                  </div>
                  <div className="bg-muted/30 border-t px-4 py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1"><Terminal className="w-3 h-3" />{blueprint.testCases.visible} visible · {blueprint.testCases.hidden} hidden</span>
                      <span className="flex items-center gap-1"><Shield className="w-3 h-3" />Proctoring: {blueprint.proctoringLevel}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Button size="sm" variant="outline" className="h-7 text-[11px]"><Play className="w-3 h-3 mr-1" />Run Tests</Button>
                      <Button size="sm" className="h-7 text-[11px] bg-primary">Submit</Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="hnx-card p-5 h-fit">
                <h3 className="text-[14px] font-bold text-navy mb-4">Final Summary</h3>
                <div className="space-y-3">
                  <div>
                    <label className="hnx-label block mb-1">Assessment Name</label>
                    <input value={assessmentName} onChange={(e) => setAssessmentName(e.target.value)} className="hnx-input w-full" />
                  </div>
                  <SummaryRow label="Problems" value={`${blueprint.problemsToSend} · from pool of ${blueprint.poolSize}`} />
                  <SummaryRow label="Duration" value={`${blueprint.durationMin} min`} />
                  <div>
                    <label className="hnx-label block mb-1">Pass Threshold</label>
                    <div className="flex items-center gap-1.5">
                      <input type="number" value={passThreshold} onChange={(e) => setPassThreshold(+e.target.value)} className="hnx-input w-16 h-8" />
                      <span className="text-[12px] text-muted-foreground">%</span>
                    </div>
                  </div>
                  <SummaryRow label="Languages" value={blueprint.languages.join(', ')} />
                  <SummaryRow label="Proctoring" value={blueprint.proctoringLevel} tone="green" />
                  <SummaryRow label="Plagiarism" value={blueprint.integrity.plagiarism ? 'On' : 'Off'} tone="green" />
                  <SummaryRow label="AI Detection" value={blueprint.integrity.aiDetection ? 'On' : 'Off'} tone="green" />
                </div>
                <div className="mt-5 pt-4 border-t flex flex-col gap-2">
                  <Button variant="outline" className="w-full" onClick={() => setStep(2)}><ArrowLeft className="w-3.5 h-3.5 mr-1.5" />Back</Button>
                  <Button variant="outline" className="w-full" onClick={() => setShowFinalProblems(true)}>
                    <Eye className="w-4 h-4 mr-1.5" />View Final Problems
                  </Button>
                  <Button className="w-full bg-hnxgreen hover:bg-hnxgreen-deep text-navy font-bold" onClick={() => setShowSaveConfirm(true)}>
                    <CheckCircle2 className="w-4 h-4 mr-1.5" />Save & Attach
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT panel */}
        <IntelligencePanel>
          <RoleContextSection context={context} />
          {step >= 2 && problems.length > 0 ? (
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
                  <Stat label="Selected" value={`${problems.length}`} />
                  <Stat label="Approved" value={`${approved}/${problems.length}`} tone="green" />
                  <Stat label="Review" value={`${flagged}`} tone={flagged > 0 ? 'warn' : 'default'} />
                </div>
              </PanelSection>
              <PanelSection title="Language Coverage">
                <div className="space-y-1.5">
                  {blueprint.languages.map(l => (
                    <div key={l} className="flex items-center gap-2 text-[11px]">
                      <Code2 className="w-3 h-3 text-teal" />
                      <span className="flex-1">{l}</span>
                      <span className="text-muted-foreground">{problems.filter(p => p.languagesSupported.includes(l)).length} problems</span>
                    </div>
                  ))}
                </div>
              </PanelSection>
              <PanelSection title="Engine Status" defaultOpen>
                <ChecklistItem tone="ok">Anti-repeat: Active</ChecklistItem>
                <ChecklistItem tone="ok">Plagiarism: Armed</ChecklistItem>
                <ChecklistItem tone="ok">AI-code detection: Armed</ChecklistItem>
                <ChecklistItem tone="ok">Freshness: 90-day clean</ChecklistItem>
                {flagged > 0 && <ChecklistItem icon={AlertTriangle} tone="warn">{flagged} problem{flagged > 1 ? 's' : ''} resembles known sources</ChecklistItem>}
              </PanelSection>
            </>
          ) : (
            <PanelSection title="Blueprint Health">
              <StatBar label="Role-fit confidence" value={context.aiConfidence.roleFit} color="green" />
              <div className="h-3" />
              <StatBar label="Language relevance" value={context.aiConfidence.languageRelevance || 85} color="teal" />
              <div className="h-3" />
              <StatBar label="Seniority match" value={context.aiConfidence.seniority} color="primary" />
            </PanelSection>
          )}
        </IntelligencePanel>
      </div>

      {showManualAdd && <ManualCodingModal onClose={() => setShowManualAdd(false)} onAdd={addManualProblem} competencyName={job.competencies[0]?.name || 'Technical Fit'} skillTag={context.primarySkills[0] || 'Core Skill'} languages={blueprint.languages} />}
      {showFinalProblems && <FinalProblemsOverlay problems={problems} onClose={() => setShowFinalProblems(false)} />}
      {showSaveConfirm && <SaveConfirmOverlay onClose={() => setShowSaveConfirm(false)} onConfirm={save} />}
    </AppLayout>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1"><span className="hnx-label">{label}</span><AIBadge /></div>
      <p className="text-[13px] font-semibold text-navy">{value}</p>
    </div>
  );
}

function NumberStepper({ label, value, step, onChange, suffix }: { label: string; value: number; step: number; onChange: (v: number) => void; suffix: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="hnx-label">{label}</span>
      <div className="flex items-center gap-1.5">
        <button onClick={() => onChange(Math.max(1, value - step))} className="hnx-stepper-btn"><Minus className="w-3 h-3" /></button>
        <span className="text-[14px] font-bold text-navy tabular-nums w-10 text-center">{value}</span>
        <button onClick={() => onChange(value + step)} className="hnx-stepper-btn"><Plus className="w-3 h-3" /></button>
        {suffix && <span className="text-[11px] text-muted-foreground ml-1">{suffix}</span>}
      </div>
    </div>
  );
}

function ToggleRow({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[12px] text-foreground">{label}</span>
      <button onClick={() => onChange(!value)} className={cn('w-9 h-5 rounded-full relative transition-colors', value ? 'bg-teal' : 'bg-muted')}>
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

function CodingCard({ problem, index, expanded, onToggleExpand, onUpdate }: {
  problem: CodingProblem; index: number; expanded: boolean; onToggleExpand: () => void; onUpdate: (p: Partial<CodingProblem>) => void;
}) {
  const diffTone = problem.difficulty === 'Easy' ? 'bg-green-light text-hnxgreen-deep' : problem.difficulty === 'Medium' ? 'bg-warning-light text-warning' : 'bg-danger-light text-destructive';
  const diffBar = problem.difficulty === 'Easy' ? 'bg-hnxgreen-deep' : problem.difficulty === 'Medium' ? 'bg-warning' : 'bg-destructive/80';
  const isApproved = problem.status === 'approved';

  return (
    <div className={cn('hnx-card relative overflow-hidden group', isApproved && 'bg-teal-light/30 border-teal/30', problem.reviewFlag && 'border-warning/40')}>
      <span className={cn('absolute left-0 top-0 bottom-0 w-1', diffBar)} />
      <div className="p-4 pl-5">
        <div className="flex items-start gap-3">
          <input type="checkbox" checked={isApproved} onChange={(e) => onUpdate({ status: e.target.checked ? 'approved' : 'pending' })} className="mt-1 accent-primary" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-[11px] font-mono font-bold text-muted-foreground">P{index + 1}</span>
              <span className={cn('hnx-badge', diffTone)}>{problem.difficulty}</span>
              <SkillChip label={problem.competencyName} variant="teal" size="xs" />
              <SkillChip label={problem.problemType} variant="muted" size="xs" />
              <span className="text-[10px] text-muted-foreground">· {problem.scoring.maxPoints} pts</span>
              {problem.highRoleFit && <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-teal-deep"><Sparkles className="w-3 h-3" strokeWidth={2.5} />High role-fit</span>}
              {problem.freshness === 'new' && <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-hnxgreen-deep">Fresh</span>}
              {problem.reviewFlag === 'leetcode_similar' && <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-warning"><AlertTriangle className="w-3 h-3" />LeetCode-similar</span>}
            </div>
            <h4 className="text-[15px] font-bold text-navy mb-1">{problem.title}</h4>
            <p className="text-[12.5px] text-foreground/70 leading-relaxed mb-2">{problem.summary}</p>
            <div className="flex items-center gap-1.5 mb-2">
              {problem.languagesSupported.map(l => <SkillChip key={l} label={l} variant="navy" size="xs" />)}
            </div>

            <button onClick={onToggleExpand} className="text-[11px] text-primary font-semibold hover:underline">
              {expanded ? 'Hide details' : 'View problem details & test cases'}
            </button>

            {expanded && (
              <div className="mt-3 space-y-3 animate-fade-in-fast">
                <DetailBlock title="Problem Statement">
                  <p className="text-[12px] text-foreground/80 leading-relaxed">{problem.fullStatement}</p>
                </DetailBlock>
                <DetailBlock title="Constraints">
                  <ul className="text-[12px] text-foreground/80 space-y-1 list-disc pl-4">
                    {problem.constraints.map((c, i) => <li key={i}>{c}</li>)}
                  </ul>
                </DetailBlock>
                <DetailBlock title={`Sample Test Cases (${problem.sampleCases.length} visible · ${problem.hiddenCaseCount} hidden)`}>
                  <div className="space-y-2">
                    {problem.sampleCases.map((tc, i) => (
                      <div key={i} className="rounded-md border border-border bg-muted/30 p-2.5 text-[11px] font-mono">
                        <p><span className="text-muted-foreground">Input:</span> {tc.input}</p>
                        <p><span className="text-muted-foreground">Output:</span> {tc.output}</p>
                        <p className="font-sans text-muted-foreground mt-1">{tc.explanation}</p>
                      </div>
                    ))}
                  </div>
                </DetailBlock>
                <DetailBlock title="Expected Complexity">
                  <p className="text-[12px] font-mono">Time: {problem.expectedComplexity.time} · Space: {problem.expectedComplexity.space}</p>
                </DetailBlock>
                <DetailBlock title="Scoring Logic">
                  <p className="text-[12px] text-foreground/80">Max {problem.scoring.maxPoints} pts · {problem.scoring.perTestCase} pts per test case · partial scoring enabled</p>
                </DetailBlock>
                <DetailBlock title="Why this problem">
                  <p className="text-[12px] text-foreground/80 italic leading-relaxed">{problem.rationale}</p>
                </DetailBlock>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">{title}</p>
      {children}
    </div>
  );
}

function ManualCodingModal({ onClose, onAdd, competencyName, skillTag, languages }: { onClose: () => void; onAdd: (p: CodingProblem) => void; competencyName: string; skillTag: string; languages: CodingLanguage[] }) {
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [statement, setStatement] = useState('');
  const [difficulty, setDifficulty] = useState<CodingProblem['difficulty']>('Medium');
  const submit = () => {
    if (!title.trim() || !statement.trim()) return toast.error('Add problem title and statement');
    onAdd({ id: `manual-coding-${Date.now()}`, title, summary: summary || title, fullStatement: statement, ioFormat: { input: 'Standard input', output: 'Expected output' }, constraints: ['Input size follows role-appropriate limits'], sampleCases: [{ input: 'sample input', output: 'sample output', explanation: 'Validates the core behavior.' }], hiddenCaseCount: 8, expectedComplexity: { time: 'O(n)', space: 'O(1)' }, scoring: { maxPoints: 100, perTestCase: 10 }, competencyId: 'manual', competencyName, skillTag, difficulty, problemType: 'Implementation', languagesSupported: languages, estimatedSolveTimeMin: 45, rationale: 'Manually added by recruiter for this coding round.', status: 'pending', freshness: 'new', highRoleFit: true });
    onClose();
  };
  return <ModalShell title="Add Coding Problem Manually" onClose={onClose}><div className="space-y-3"><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Problem title" className="hnx-input w-full" /><input value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Short summary" className="hnx-input w-full" /><textarea value={statement} onChange={(e) => setStatement(e.target.value)} placeholder="Problem statement, input/output expectations, constraints" className="hnx-input min-h-40 w-full" /><select value={difficulty} onChange={(e) => setDifficulty(e.target.value as CodingProblem['difficulty'])} className="hnx-input w-full"><option>Easy</option><option>Medium</option><option>Hard</option></select><Button className="w-full bg-primary" onClick={submit}>Add to Pool</Button></div></ModalShell>;
}

function FinalProblemsOverlay({ problems, onClose }: { problems: CodingProblem[]; onClose: () => void }) {
  return <ModalShell title="Final Coding Problems" onClose={onClose} wide><div className="space-y-3 max-h-[70vh] overflow-auto pr-2">{problems.filter(p => p.status === 'approved').map((p, i) => <CodingCard key={p.id} problem={p} index={i} expanded={false} onToggleExpand={() => undefined} onUpdate={() => undefined} />)}</div></ModalShell>;
}

function SaveConfirmOverlay({ onClose, onConfirm }: { onClose: () => void; onConfirm: () => void }) {
  return <ModalShell title="Save Coding Assessment" onClose={onClose}><div className="space-y-4"><div className="p-4 rounded-lg bg-danger-light border border-destructive/20"><p className="text-[13px] font-semibold text-navy">This action cannot be reverted.</p><p className="text-[12px] text-muted-foreground mt-1">Saving attaches the final coding test to this round for operational use.</p></div><div className="flex gap-2 justify-end"><Button variant="outline" onClick={onClose}>Cancel</Button><Button className="bg-hnxgreen hover:bg-hnxgreen-deep text-navy font-bold" onClick={onConfirm}>Confirm & Save</Button></div></div></ModalShell>;
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
    <div className="flex justify-between items-start text-[12px] gap-2">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn('font-semibold text-right', tone === 'green' ? 'text-hnxgreen-deep' : 'text-foreground')}>{value}</span>
    </div>
  );
}
