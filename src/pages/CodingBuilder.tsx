import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { useStore } from '@/store/useStore';
import { toast } from 'sonner';
import {
  Sparkles, Save, ArrowRight, ArrowLeft, ChevronDown, Check, X,
  Shield, CheckCircle2, Minus, Plus, Code2, Terminal, FileCode, Play,
  Eye, FilePlus2, Info, Brain, Upload,
} from 'lucide-react';
import { ContextTopBar } from '@/components/shared/ContextTopBar';
import { Stepper } from '@/components/shared/Stepper';
import { GenerationLoader } from '@/components/shared/GenerationLoader';
import { DifficultyBar } from '@/components/shared/DifficultyBar';
import { SkillChip } from '@/components/shared/SkillChip';
import { AIBadge } from '@/components/shared/AIBadge';
import { IntelligencePanel, PanelSection } from '@/components/shared/IntelligencePanel';
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

type PoolTab = 'ai' | 'upload' | 'manual' | 'all' | 'selected';
type Source = 'ai' | 'upload' | 'manual';
const sourceOf = (p: CodingProblem): Source =>
  p.id.startsWith('manual-') ? 'manual' : p.id.startsWith('upload-') ? 'upload' : 'ai';
const sourceMeta: Record<Source, { label: string; tone: string }> = {
  ai: { label: 'AI Generated', tone: 'bg-teal-light text-teal-deep border-teal/30' },
  upload: { label: 'Bulk Uploaded', tone: 'bg-blue-light text-primary border-primary/20' },
  manual: { label: 'Manually Added', tone: 'bg-warning-light text-warning border-warning/20' },
};

const suggestedDuration = (ps: CodingProblem[]) =>
  ps.length === 0 ? 90 : Math.max(15, ps.reduce((a, p) => a + (p.difficulty === 'Hard' ? 30 : p.difficulty === 'Medium' ? 20 : 12), 0));

export default function CodingBuilder() {
  const { jobId, roundId } = useParams<{ jobId: string; roundId: string }>();
  const navigate = useNavigate();
  const job = useStore(s => s.getJob(jobId!));
  const getSampleCoding = useStore(s => s.getSampleCoding);
  const saveCodingAssessment = useStore(s => s.saveCodingAssessment);
  const round = job?.rounds.find(r => r.id === roundId);

  const [step, setStep] = useState(1);
  const [context] = useState(job?.roleContext);
  const [blueprint, setBlueprint] = useState<CodingBlueprint>({ ...defaultCodingBlueprint });
  const [generateCount, setGenerateCount] = useState(15);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [problems, setProblems] = useState<CodingProblem[]>([]);
  const [assessmentName, setAssessmentName] = useState('Coding Assessment — ' + (job?.title || ''));
  const [passThreshold, setPassThreshold] = useState(60);
  const [expandedProblem, setExpandedProblem] = useState<string | null>(null);
  const [showManualAdd, setShowManualAdd] = useState(false);
  const [showFinalProblems, setShowFinalProblems] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [poolTab, setPoolTab] = useState<PoolTab>('all');
  const [finalDuration, setFinalDuration] = useState<number | null>(null);
  const [showBulkImport, setShowBulkImport] = useState(false);
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
  const blueprintValid = difficultyValid;

  const handleGenerate = () => {
    if (!difficultyValid) { toast.error('Difficulty mix must total 100%'); return; }
    setGenerating(true); setStep(2);
  };
  const handleGenComplete = () => {
    setGenerating(false);
    const sample = getSampleCoding();
    const seeded: CodingProblem[] = Array.from({ length: generateCount }).map((_, i) => {
      const base = sample[i % sample.length];
      return { ...base, id: `ai-${Date.now()}-${i}`, status: 'pending' as const };
    });
    setProblems(ps => [...seeded, ...ps]);
    setPoolTab('ai');
  };

  const updateProblem = (id: string, patch: Partial<CodingProblem>) =>
    setProblems(ps => ps.map(p => p.id === id ? { ...p, ...patch } : p));

  const addManualProblem = (p: CodingProblem) => {
    setProblems(ps => [p, ...ps]); setStep(2); setPoolTab('manual'); toast.success('Problem added');
  };

  const aiCount = problems.filter(p => sourceOf(p) === 'ai').length;
  const uploadCount = problems.filter(p => sourceOf(p) === 'upload').length;
  const manualCount = problems.filter(p => sourceOf(p) === 'manual').length;
  const selectedPs = problems.filter(p => p.status === 'approved');
  const selectedCount = selectedPs.length;
  const target = selectedCount;
  const canContinue = selectedCount > 0;

  const visibleProblems = useMemo(() => {
    if (poolTab === 'all') return problems;
    if (poolTab === 'selected') return selectedPs;
    return problems.filter(p => sourceOf(p) === poolTab);
  }, [problems, poolTab, selectedPs]);

  const difficulty = {
    easy: problems.filter(p => p.difficulty === 'Easy').length,
    medium: problems.filter(p => p.difficulty === 'Medium').length,
    hard: problems.filter(p => p.difficulty === 'Hard').length,
  };

  const computedSuggested = suggestedDuration(selectedPs);
  const effectiveDuration = finalDuration ?? computedSuggested;

  const importProblems = (items: CodingProblem[]) => {
    setProblems(ps => [...items, ...ps]);
    setStep(2);
    setPoolTab('upload');
    setShowBulkImport(false);
    toast.success('Problems imported', { description: `${items.length} problems added to the pool` });
  };

  const competencyCoverage = useMemo(() => {
    const m = new Map<string, number>();
    selectedPs.forEach(p => m.set(p.competencyName, (m.get(p.competencyName) ?? 0) + 1));
    return Array.from(m.entries()).map(([name, count]) => ({ name, count }));
  }, [selectedPs]);

  const toggleLanguage = (l: CodingLanguage) =>
    setBlueprint({ ...blueprint, languages: blueprint.languages.includes(l) ? blueprint.languages.filter(x => x !== l) : [...blueprint.languages, l] });
  const toggleType = (t: CodingProblemType) =>
    setBlueprint({ ...blueprint, problemTypes: blueprint.problemTypes.includes(t) ? blueprint.problemTypes.filter(x => x !== t) : [...blueprint.problemTypes, t] });

  const save = () => {
    saveCodingAssessment(job.id, round.id, {
      id: `coding-${Date.now()}`, roundId: round.id, name: assessmentName,
      problemsToSend: selectedCount, durationMin: effectiveDuration, passThreshold,
      languages: blueprint.languages, problems: selectedPs, status: 'ready',
    });
    toast.success('Coding Assessment saved & attached', { description: `${selectedCount} problems attached to ${round.label}` });
    navigate(`/jobs/${job.id}`);
  };

  const autoSelect = (mode: 'clear' | 'all' | number) => {
    if (mode === 'clear') {
      setProblems(ps => ps.map(p => ({ ...p, status: 'pending' as const })));
      toast.success('Selection cleared'); return;
    }
    if (mode === 'all') {
      setProblems(ps => ps.map(p => ({ ...p, status: 'approved' as const })));
      toast.success(`Selected all ${problems.length} problems`); return;
    }
    const n = Math.min(mode, problems.length);
    const mix = blueprint.difficultyMix;
    const easyN = Math.round(n * mix.easy / 100);
    const medN = Math.round(n * mix.medium / 100);
    const hardN = n - easyN - medN;
    const want: Record<'Easy'|'Medium'|'Hard', number> = { Easy: easyN, Medium: medN, Hard: hardN };
    const picked = new Set<string>();
    (['Easy','Medium','Hard'] as const).forEach(d => {
      const pool = problems.filter(p => p.difficulty === d).map(p => p.id).sort(() => Math.random() - 0.5);
      pool.slice(0, want[d]).forEach(id => picked.add(id));
    });
    if (picked.size < n) {
      const rest = problems.filter(p => !picked.has(p.id)).map(p => p.id).sort(() => Math.random() - 0.5);
      rest.slice(0, n - picked.size).forEach(id => picked.add(id));
    }
    setProblems(ps => ps.map(p => picked.has(p.id) ? { ...p, status: 'approved' as const } : p));
    toast.success(`Selected ${picked.size} random problems`);
  };
  const approveAllVisible = () => {
    const ids = new Set(visibleProblems.map(p => p.id));
    setProblems(ps => ps.map(p => ids.has(p.id) ? { ...p, status: 'approved' } : p));
  };

  return (
    <AppLayout bare>
      <ContextTopBar
        backTo={`/jobs/${job.id}/template`}
        backLabel="Job Template"
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
            <Button size="sm" className="bg-hnxgreen hover:bg-hnxgreen-deep text-navy font-semibold h-8" onClick={() => setShowSaveConfirm(true)} disabled={step !== 3 || selectedCount === 0}>
              Save & Attach to Round
            </Button>
          </>
        }
      />

      {generating && <GenerationLoader steps={codingGenerationSteps} title="Building your Coding assessment" onComplete={handleGenComplete} />}

      <div className="grid grid-cols-[1fr_320px] gap-6 p-6 max-w-[1320px] mx-auto">
        <div className="min-w-0 space-y-5">
          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-5 animate-fade-in">
              <div className="hnx-card p-5 gradient-ai-banner border-teal/30">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-teal flex items-center justify-center shrink-0 shadow-teal-glow">
                    <Sparkles className="w-4 h-4 text-primary-foreground" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-bold text-navy">AI has prepared this coding assessment</h2>
                    <p className="text-[12.5px] text-foreground/80 mt-1 leading-relaxed">
                      Review the role context below. HireNowX will use this to generate role-relevant coding problems calibrated to your stack, seniority, and competency mapping.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                {/* LEFT */}
                <div className="hnx-card p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Brain className="w-4 h-4 text-primary" strokeWidth={2.5} />
                    <h2 className="text-[15px] font-bold text-navy">Role Context</h2>
                  </div>
                  <div className="space-y-3">
                    <Tile label="Role" value={context.roleTitle} />
                    <Tile label="Experience" value={`${context.experienceMin}–${context.experienceMax} years`} />
                    <Tile label="Domain" value={context.domain} />
                    <Tile label="Sub-domain" value={context.subDomain} />
                    <div>
                      <div className="flex items-center gap-2 mb-1.5"><span className="hnx-label">Must-test technologies</span></div>
                      <div className="flex flex-wrap gap-1.5">
                        {(context.mustTestTech || []).map(t => <SkillChip key={t} label={t} variant="teal" size="sm" />)}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1.5"><span className="hnx-label">Coding languages allowed</span></div>
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
                      <span className="hnx-label block mb-1.5">Skills Mapped to Round</span>
                      <SkillsEditor
                        value={roundSkills}
                        suggestions={Array.from(new Set([
                          ...context.primarySkills,
                          ...context.secondarySkills,
                          ...(context.mustTestTech ?? []),
                          ...job.competencies.map(c => c.name),
                        ]))}
                        onChange={setRoundSkills}
                      />
                    </div>
                  </div>
                </div>

                {/* RIGHT */}
                <div className="hnx-card p-5">
                  <h2 className="text-[15px] font-bold text-navy mb-1">Coding Blueprint</h2>
                  <p className="text-[12px] text-muted-foreground mb-5">AI generates a larger pool — you'll select the final problems.</p>
                  <div className="space-y-4">
                    <NumberStepper label="Problems to Generate" value={generateCount} step={1} onChange={setGenerateCount} suffix="problems" min={1} />
                    <p className="text-[11px] text-muted-foreground -mt-2">You'll pick the final problems to send in the next step.</p>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="hnx-label">Difficulty Mix</span>
                        <span className={cn('text-[11px] font-semibold tabular-nums', difficultyValid ? 'text-hnxgreen-deep' : 'text-destructive')}>Total {difficultyTotal}%</span>
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
                  </div>

                  <button onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 mt-5 text-[12px] font-semibold text-muted-foreground hover:text-foreground">
                    <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', showAdvanced && 'rotate-180')} />
                    Advanced Settings
                  </button>
                  {showAdvanced && (
                    <div className="mt-3 pt-4 border-t space-y-3 animate-fade-in-fast">
                      <div className="grid grid-cols-2 gap-3">
                        <NumberStepper label="Visible test cases" value={blueprint.testCases.visible} step={1} min={0} onChange={(v) => setBlueprint({ ...blueprint, testCases: { ...blueprint.testCases, visible: v } })} suffix="" />
                        <NumberStepper label="Hidden test cases" value={blueprint.testCases.hidden} step={1} min={0} onChange={(v) => setBlueprint({ ...blueprint, testCases: { ...blueprint.testCases, hidden: v } })} suffix="" />
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
                      <ToggleRow label="Strict experience alignment" value={blueprint.strictExperience} onChange={(v) => setBlueprint({ ...blueprint, strictExperience: v })} />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center pt-1">
                <Button size="lg" variant="outline" className="font-semibold" onClick={() => setShowBulkImport(true)}>
                  <Upload className="w-4 h-4 mr-2" />Upload Problems
                </Button>
                <Button size="lg" className="bg-hnxgreen hover:bg-hnxgreen-deep text-navy font-bold shadow-green-glow" onClick={handleGenerate} disabled={!blueprintValid}>
                  <Sparkles className="w-4 h-4 mr-2" />Generate Problems
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && !generating && (
            <div className="space-y-3 animate-fade-in">
              <div className="hnx-card p-4 space-y-4">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-3 mr-auto">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center"><Code2 className="w-4 h-4" strokeWidth={2.5} /></div>
                    <div>
                      <h2 className="text-[15px] font-bold text-navy">Problem Pool</h2>
                      <p className="text-[12px] text-muted-foreground">
                        Selected <span className="font-bold text-navy tabular-nums">{selectedCount}</span>
                        {selectedCount > 0 ? ' · ready to finalize' : ' · pick any number of problems to continue'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <select
                      className="h-8 text-[12px] rounded-md border border-border bg-card px-2 font-medium hover:border-teal/40 focus:outline-none focus:border-teal"
                      value=""
                      onChange={(e) => {
                        const v = e.target.value;
                        if (!v) return;
                        if (v === 'all') autoSelect('all');
                        else if (v === 'clear') autoSelect('clear');
                        else autoSelect(parseInt(v, 10));
                        e.target.value = '';
                      }}
                      disabled={problems.length === 0}
                    >
                      <option value="">Auto Select…</option>
                      <option value="5">Select Random 5</option>
                      <option value="10">Select Random 10</option>
                      <option value="20">Select Random 20</option>
                      <option value="all">Select All</option>
                      <option value="clear">Clear Selection</option>
                    </select>
                    <Button size="sm" variant="outline" className="h-8 text-[12px]" onClick={approveAllVisible} disabled={visibleProblems.length === 0}>
                      Approve All
                    </Button>
                    <Button size="sm" variant="outline" className="h-8 text-[12px]" onClick={() => setShowBulkImport(true)}>
                      <Upload className="w-3.5 h-3.5 mr-1" />Upload CSV
                    </Button>
                    <Button size="sm" className="h-8 text-[12px] bg-primary" onClick={() => setShowManualAdd(true)}>
                      <FilePlus2 className="w-3.5 h-3.5 mr-1" />Add Problem Manually
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-2 border-t pt-3 flex-wrap">
                  <PoolTabButton active={poolTab === 'ai'} onClick={() => setPoolTab('ai')} label="AI Generated" count={aiCount} />
                  <PoolTabButton active={poolTab === 'upload'} onClick={() => setPoolTab('upload')} label="Bulk Upload" count={uploadCount} />
                  <PoolTabButton active={poolTab === 'manual'} onClick={() => setPoolTab('manual')} label="Manual" count={manualCount} />
                  <PoolTabButton active={poolTab === 'all'} onClick={() => setPoolTab('all')} label="Total Pool" count={problems.length} />
                  <PoolTabButton active={poolTab === 'selected'} onClick={() => setPoolTab('selected')} label="Selected" count={selectedCount} tone="green" />
                </div>
              </div>

              {poolTab === 'ai' && aiCount === 0 ? (
                <div className="hnx-card p-10 text-center">
                  <Sparkles className="w-7 h-7 text-teal mx-auto mb-3" strokeWidth={2.5} />
                  <p className="text-[14px] font-bold text-navy">No AI-generated problems yet</p>
                  <p className="text-[12.5px] text-muted-foreground mt-1 mb-4">Generate {generateCount} problems from your role context.</p>
                  <Button className="bg-hnxgreen hover:bg-hnxgreen-deep text-navy font-semibold" onClick={handleGenerate}>
                    <Sparkles className="w-4 h-4 mr-2" />Generate with AI
                  </Button>
                </div>
              ) : visibleProblems.length > 0 ? (
                visibleProblems.map((p, i) => (
                  <CodingCard
                    key={p.id} problem={p} index={i}
                    expanded={expandedProblem === p.id}
                    onToggleExpand={() => setExpandedProblem(expandedProblem === p.id ? null : p.id)}
                    onUpdate={(patch) => updateProblem(p.id, patch)}
                  />
                ))
              ) : (
                <div className="hnx-card p-8 text-center">
                  <p className="text-[14px] font-bold text-navy">Nothing in this tab yet</p>
                  <p className="text-[12px] text-muted-foreground mt-1">Generate or add problems manually.</p>
                </div>
              )}

              <div className="flex justify-between items-center pt-2">
                <Button variant="outline" onClick={() => setStep(1)}><ArrowLeft className="w-3.5 h-3.5 mr-1.5" />Back</Button>
                <Button className="bg-hnxgreen hover:bg-hnxgreen-deep text-navy font-semibold" onClick={() => setStep(3)} disabled={!canContinue}>
                  Continue to Finalize<ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="grid grid-cols-[1fr_320px] gap-5 animate-fade-in">
              <div className="space-y-4">
                <div className="hnx-card p-6">
                  <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Candidate Preview</p>
                  <div className="border-2 border-dashed border-border rounded-lg overflow-hidden">
                    <div className="bg-navy text-navy-foreground px-4 py-2.5 flex items-center justify-between">
                      <p className="text-[13px] font-bold">{assessmentName}</p>
                      <div className="flex items-center gap-3 text-[11px]">
                        <span>{selectedCount} problems · {effectiveDuration} min</span>
                        <select className="bg-navy-soft text-navy-foreground text-[11px] rounded px-2 py-1 border border-white/20">
                          {blueprint.languages.map(l => <option key={l}>{l}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 min-h-[280px]">
                      <div className="p-4 border-r bg-card">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Problem 1 of {selectedCount}</p>
                        <h4 className="text-[14px] font-bold text-navy mb-2">{selectedPs[0]?.title || 'Sample Problem'}</h4>
                        <p className="text-[12px] text-foreground/80 leading-relaxed mb-3">{selectedPs[0]?.summary || 'Sample problem summary appears here.'}</p>
                        <div className="text-[11px] space-y-1 text-muted-foreground">
                          <p><span className="font-semibold text-foreground">Input:</span> {selectedPs[0]?.ioFormat.input || '—'}</p>
                          <p><span className="font-semibold text-foreground">Output:</span> {selectedPs[0]?.ioFormat.output || '—'}</p>
                        </div>
                      </div>
                      <div className="bg-[#0f172a] text-teal font-mono text-[11px] p-4">
                        <div className="text-muted-foreground mb-2 flex items-center gap-2">
                          <FileCode className="w-3 h-3" /> solution.{blueprint.languages[0]?.toLowerCase().slice(0, 2) || 'js'}
                        </div>
                        <pre className="text-[11px] leading-relaxed whitespace-pre-wrap">{`function solution(input) {\n  // Your code here\n  return output;\n}`}</pre>
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

              </div>

              <div className="hnx-card p-5 h-fit">
                <h3 className="text-[14px] font-bold text-navy mb-4">Final Summary</h3>
                <div className="space-y-3">
                  <div>
                    <label className="hnx-label block mb-1">Assessment Name</label>
                    <input value={assessmentName} onChange={(e) => setAssessmentName(e.target.value)} className="hnx-input w-full" />
                  </div>
                  <SummaryRow label="Final Selected Count" value={`${selectedCount}`} tone="green" />
                  <div>
                    <label className="hnx-label block mb-1">Suggested Duration</label>
                    <div className="flex items-center gap-2">
                      <input type="number" min={15} value={effectiveDuration} onChange={(e) => setFinalDuration(+e.target.value)} className="hnx-input w-20 h-8 text-center" />
                      <span className="text-[12px] text-muted-foreground">minutes</span>
                      <button onClick={() => setFinalDuration(null)} className="text-[10.5px] text-primary font-semibold hover:underline ml-auto">Reset to {computedSuggested}m</button>
                    </div>
                    <p className="text-[10.5px] text-muted-foreground mt-1.5 leading-snug">
                      Calculated from selected problems, difficulty, and estimated solve effort. Edit before saving.
                    </p>
                  </div>
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
                  <Button variant="outline" className="w-full" onClick={() => setStep(2)}><ArrowLeft className="w-3.5 h-3.5 mr-1.5" />Back to Pool</Button>
                  <Button variant="outline" className="w-full" onClick={() => setShowFinalProblems(true)}>
                    <Eye className="w-4 h-4 mr-1.5" />View Final Problems
                  </Button>
                  <Button className="w-full bg-hnxgreen hover:bg-hnxgreen-deep text-navy font-bold" onClick={() => setShowSaveConfirm(true)}>
                    <CheckCircle2 className="w-4 h-4 mr-1.5" />Save & Attach to Round
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT panel */}
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
                  These competencies are mapped from the JD, role level, skills, domain, and experience range. AI uses this mapping to generate role-relevant coding problems.
                </p>
              </div>
              <PanelSection title="Mapped Competencies" defaultOpen>
                <div className="space-y-1.5">
                  {job.competencies.map(c => (
                    <div key={c.id} className="flex items-center gap-2 text-[12px]">
                      <span className={cn('w-1 h-3 rounded-full', c.category === 'Technical' ? 'bg-primary' : c.category === 'Domain' ? 'bg-teal' : 'bg-hnxgreen-deep')} />
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
                  <Stat label="Total" value={`${problems.length}`} />
                  <Stat label="Selected" value={`${selectedCount}`} tone="green" />
                  <Stat label="Target" value={`${target}`} />
                </div>
              </PanelSection>
              <PanelSection title="Difficulty Distribution">
                <DifficultyBar
                  easy={Math.round((difficulty.easy / Math.max(1, problems.length)) * 100)}
                  medium={Math.round((difficulty.medium / Math.max(1, problems.length)) * 100)}
                  hard={Math.round((difficulty.hard / Math.max(1, problems.length)) * 100)}
                />
              </PanelSection>
              <PanelSection title="Competency Coverage" defaultOpen>
                <p className="text-[11px] text-muted-foreground mb-2 leading-relaxed">
                  Mapped from JD & assessment scope. Counts update live as you select problems.
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
              <PanelSection title="Language Coverage">
                <div className="space-y-1.5">
                  {blueprint.languages.map(l => (
                    <div key={l} className="flex items-center gap-2 text-[11.5px]">
                      <Code2 className="w-3 h-3 text-teal" />
                      <span className="flex-1">{l}</span>
                      <span className="text-muted-foreground tabular-nums">{problems.filter(p => p.languagesSupported.includes(l)).length}</span>
                    </div>
                  ))}
                </div>
              </PanelSection>
            </>
          )}

          {step === 3 && (
            <>
              <PanelSection title="Final Snapshot" defaultOpen>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <Stat label="Selected" value={`${selectedCount}`} tone="green" />
                  <Stat label="Duration" value={`${effectiveDuration}m`} />
                  <Stat label="Pass" value={`${passThreshold}%`} />
                  <Stat label="Langs" value={`${blueprint.languages.length}`} />
                </div>
              </PanelSection>
              <PanelSection title="Source Breakdown" defaultOpen>
                <div className="grid grid-cols-3 gap-2">
                  <SourceTile label="AI" count={selectedPs.filter(p => sourceOf(p) === 'ai').length} tone="teal" />
                  <SourceTile label="Bulk" count={selectedPs.filter(p => sourceOf(p) === 'upload').length} tone="primary" />
                  <SourceTile label="Manual" count={selectedPs.filter(p => sourceOf(p) === 'manual').length} tone="warning" />
                </div>
              </PanelSection>
            </>
          )}
        </IntelligencePanel>
      </div>

      {showManualAdd && <ManualCodingModal onClose={() => setShowManualAdd(false)} onAdd={addManualProblem} competencyName={job.competencies[0]?.name || 'Technical Fit'} skillTag={context.primarySkills[0] || 'Core Skill'} languages={blueprint.languages} />}
      {showBulkImport && <BulkImportProblemsModal onClose={() => setShowBulkImport(false)} onImport={importProblems} competencyName={job.competencies[0]?.name || 'Technical Fit'} skillTag={context.primarySkills[0] || 'Core Skill'} languages={blueprint.languages} />}
      {showFinalProblems && <FinalProblemsOverlay problems={selectedPs} onClose={() => setShowFinalProblems(false)} />}
      {showSaveConfirm && <SaveConfirmOverlay onClose={() => setShowSaveConfirm(false)} onConfirm={save} />}
    </AppLayout>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return <div><div className="flex items-center gap-2 mb-1"><span className="hnx-label">{label}</span><AIBadge /></div><p className="text-[13px] font-semibold text-navy">{value}</p></div>;
}

function NumberStepper({ label, value, step, onChange, suffix, min = 1 }: { label: string; value: number; step: number; onChange: (v: number) => void; suffix: string; min?: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="hnx-label">{label}</span>
      <div className="flex items-center gap-1.5">
        <button onClick={() => onChange(Math.max(min, value - step))} className="hnx-stepper-btn"><Minus className="w-3 h-3" /></button>
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

function PoolTabButton({ active, onClick, label, count, tone = 'default' }: { active: boolean; onClick: () => void; label: string; count: number; tone?: 'default' | 'green' }) {
  return (
    <button onClick={onClick} className={cn(
      'h-8 px-3 rounded-md text-[12px] font-semibold border transition-all inline-flex items-center gap-2',
      active ? (tone === 'green' ? 'bg-hnxgreen-deep text-navy-foreground border-hnxgreen-deep' : 'bg-primary text-primary-foreground border-primary shadow-sm')
             : 'bg-card text-muted-foreground border-border hover:text-foreground hover:border-primary/30',
    )}>
      {label}<span className={cn('text-[10px] rounded-full px-1.5 py-0.5', active ? 'bg-white/20' : 'bg-muted')}>{count}</span>
    </button>
  );
}

function CodingCard({ problem, index, expanded, onToggleExpand, onUpdate }: {
  problem: CodingProblem; index: number; expanded: boolean; onToggleExpand: () => void; onUpdate: (p: Partial<CodingProblem>) => void;
}) {
  const diffTone = problem.difficulty === 'Easy' ? 'bg-green-light text-hnxgreen-deep' : problem.difficulty === 'Medium' ? 'bg-warning-light text-warning' : 'bg-danger-light text-destructive';
  const diffBar = problem.difficulty === 'Easy' ? 'bg-hnxgreen-deep' : problem.difficulty === 'Medium' ? 'bg-warning' : 'bg-destructive/80';
  const isApproved = problem.status === 'approved';
  const src = sourceOf(problem);

  return (
    <div className={cn('hnx-card relative overflow-hidden group', isApproved && 'bg-teal-light/30 border-teal/30')}>
      <span className={cn('absolute left-0 top-0 bottom-0 w-1', diffBar)} />
      <div className="p-4 pl-5">
        <div className="flex items-start gap-3">
          <input type="checkbox" checked={isApproved} onChange={(e) => onUpdate({ status: e.target.checked ? 'approved' : 'pending' })} className="mt-1 accent-primary w-4 h-4" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-[11px] font-mono font-bold text-muted-foreground">P{index + 1}</span>
              <span className={cn('hnx-badge', diffTone)}>{problem.difficulty}</span>
              <span className={cn('hnx-badge border', sourceMeta[src].tone)}>{sourceMeta[src].label}</span>
              <SkillChip label={problem.competencyName} variant="teal" size="xs" />
              <SkillChip label={problem.problemType} variant="muted" size="xs" />
            </div>
            <h4 className="text-[15px] font-bold text-navy mb-1">{problem.title}</h4>
            <p className="text-[12.5px] text-foreground/70 leading-relaxed mb-2">{problem.summary}</p>
            <div className="flex items-center gap-1.5 mb-2 flex-wrap">
              {problem.languagesSupported.map(l => <SkillChip key={l} label={l} variant="navy" size="xs" />)}
              <span className="text-[10.5px] text-muted-foreground">· {problem.sampleCases.length} visible · {problem.hiddenCaseCount} hidden · est {problem.estimatedSolveTimeMin}m</span>
            </div>
            <button onClick={onToggleExpand} className="text-[11px] text-primary font-semibold hover:underline">
              {expanded ? 'Hide problem details' : 'View problem details & test cases'}
            </button>
            {expanded && (
              <div className="mt-3 space-y-3 animate-fade-in-fast">
                <DetailBlock title="Problem Statement"><p className="text-[12px] text-foreground/80 leading-relaxed">{problem.fullStatement}</p></DetailBlock>
                <DetailBlock title="Constraints"><ul className="text-[12px] text-foreground/80 space-y-1 list-disc pl-4">{problem.constraints.map((c, i) => <li key={i}>{c}</li>)}</ul></DetailBlock>
                <DetailBlock title={`Sample Test Cases (${problem.sampleCases.length} visible · ${problem.hiddenCaseCount} hidden)`}>
                  <div className="space-y-2">{problem.sampleCases.map((tc, i) => (
                    <div key={i} className="rounded-md border border-border bg-muted/30 p-2.5 text-[11px] font-mono">
                      <p><span className="text-muted-foreground">Input:</span> {tc.input}</p>
                      <p><span className="text-muted-foreground">Output:</span> {tc.output}</p>
                      <p className="font-sans text-muted-foreground mt-1">{tc.explanation}</p>
                    </div>
                  ))}</div>
                </DetailBlock>
                <DetailBlock title="Expected Complexity"><p className="text-[12px] font-mono">Time: {problem.expectedComplexity.time} · Space: {problem.expectedComplexity.space}</p></DetailBlock>
                <DetailBlock title="Scoring"><p className="text-[12px] text-foreground/80">Max {problem.scoring.maxPoints} pts · {problem.scoring.perTestCase} pts per test case</p></DetailBlock>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return <div><p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">{title}</p>{children}</div>;
}

function ManualCodingModal({ onClose, onAdd, competencyName, skillTag, languages }: { onClose: () => void; onAdd: (p: CodingProblem) => void; competencyName: string; skillTag: string; languages: CodingLanguage[] }) {
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [statement, setStatement] = useState('');
  const [input, setInput] = useState('Standard input');
  const [output, setOutput] = useState('Expected output');
  const [constraints, setConstraints] = useState('1 ≤ n ≤ 10^5');
  const [hiddenCount, setHiddenCount] = useState(8);
  const [difficulty, setDifficulty] = useState<CodingProblem['difficulty']>('Medium');
  const [problemType, setProblemType] = useState<CodingProblemType>('Implementation');
  const submit = () => {
    if (!title.trim() || !statement.trim()) return toast.error('Add problem title and statement');
    onAdd({
      id: `manual-${Date.now()}`, title, summary: summary || title, fullStatement: statement,
      ioFormat: { input, output },
      constraints: constraints.split('\n').filter(Boolean),
      sampleCases: [{ input: 'sample input', output: 'sample output', explanation: 'Validates the core behavior.' }],
      hiddenCaseCount: hiddenCount,
      expectedComplexity: { time: 'O(n)', space: 'O(1)' },
      scoring: { maxPoints: 100, perTestCase: 10 },
      competencyId: 'manual', competencyName, skillTag, difficulty, problemType,
      languagesSupported: languages, estimatedSolveTimeMin: 30,
      rationale: 'Manually added by recruiter.', status: 'pending', freshness: 'new', highRoleFit: true,
    });
    onClose();
  };
  return (
    <ModalShell title="Add Coding Problem Manually" onClose={onClose}>
      <div className="space-y-3">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Problem title" className="hnx-input w-full" />
        <input value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Short summary" className="hnx-input w-full" />
        <textarea value={statement} onChange={(e) => setStatement(e.target.value)} placeholder="Full problem statement" className="hnx-input min-h-32 w-full py-2" />
        <div className="grid grid-cols-2 gap-3">
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Input format" className="hnx-input" />
          <input value={output} onChange={(e) => setOutput(e.target.value)} placeholder="Output format" className="hnx-input" />
        </div>
        <textarea value={constraints} onChange={(e) => setConstraints(e.target.value)} placeholder="Constraints (one per line)" className="hnx-input min-h-16 w-full py-2" />
        <div className="grid grid-cols-3 gap-3">
          <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as CodingProblem['difficulty'])} className="hnx-input"><option>Easy</option><option>Medium</option><option>Hard</option></select>
          <select value={problemType} onChange={(e) => setProblemType(e.target.value as CodingProblemType)} className="hnx-input">
            {ALL_PROBLEM_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
          <input type="number" min={0} value={hiddenCount} onChange={(e) => setHiddenCount(+e.target.value)} placeholder="Hidden tests" className="hnx-input" />
        </div>
        <Button className="w-full bg-primary" onClick={submit}>Add to Pool</Button>
      </div>
    </ModalShell>
  );
}

function FinalProblemsOverlay({ problems, onClose }: { problems: CodingProblem[]; onClose: () => void }) {
  return (
    <ModalShell title={`Final Problems (${problems.length})`} onClose={onClose} wide>
      <div className="space-y-3 max-h-[70vh] overflow-auto pr-2">
        {problems.map((p, i) => (
          <CodingCard key={p.id} problem={p} index={i} expanded={true} onToggleExpand={() => undefined} onUpdate={() => undefined} />
        ))}
      </div>
    </ModalShell>
  );
}

function SaveConfirmOverlay({ onClose, onConfirm }: { onClose: () => void; onConfirm: () => void }) {
  return (
    <ModalShell title="Save Final Coding Assessment" onClose={onClose}>
      <div className="space-y-4">
        <div className="p-4 rounded-lg bg-warning-light border border-warning/30">
          <p className="text-[13px] font-semibold text-navy">Once saved, this coding assessment will be attached to the round.</p>
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
    <div className="flex justify-between items-start text-[12px] gap-2">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn('font-semibold text-right', tone === 'green' ? 'text-hnxgreen-deep' : 'text-foreground')}>{value}</span>
    </div>
  );
}

function SkillsEditor({ value, suggestions, onChange }: { value: string[]; suggestions: string[]; onChange: (v: string[]) => void }) {
  const [draft, setDraft] = useState('');
  const remove = (s: string) => onChange(value.filter(v => v !== s));
  const add = (s: string) => {
    const t = s.trim();
    if (!t || value.includes(t)) return;
    onChange([...value, t]);
  };
  const unselected = suggestions.filter(s => !value.includes(s));
  return (
    <div className="rounded-lg border border-border bg-card p-2.5 space-y-2">
      <div className="flex flex-wrap gap-1.5 min-h-7">
        {value.length === 0 && <span className="text-[11px] text-muted-foreground py-0.5">No skills selected yet.</span>}
        {value.map(s => (
          <SkillChip key={s} label={s} variant="navy" size="sm" removable onRemove={() => remove(s)} />
        ))}
      </div>
      <div className="flex items-center gap-1.5">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(draft); setDraft(''); } }}
          placeholder="Add custom skill…"
          className="hnx-input flex-1 h-8 text-[12px]"
        />
        <button
          type="button"
          onClick={() => { add(draft); setDraft(''); }}
          className="h-8 w-8 rounded-md bg-primary/10 text-primary hover:bg-primary/20 flex items-center justify-center"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
      {unselected.length > 0 && (
        <div className="pt-1.5 border-t border-border/60">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">Suggestions</p>
          <div className="flex flex-wrap gap-1">
            {unselected.map(s => (
              <button key={s} type="button" onClick={() => add(s)}
                className="text-[11px] px-2 py-0.5 rounded-md border border-dashed border-border text-muted-foreground hover:border-teal hover:text-teal-deep hover:bg-teal-light/40 transition-colors">
                + {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function BulkImportProblemsModal({ onClose, onImport, competencyName, skillTag, languages }: {
  onClose: () => void; onImport: (p: CodingProblem[]) => void;
  competencyName: string; skillTag: string; languages: CodingLanguage[];
}) {
  const [summary, setSummary] = useState<{ total: number; valid: number; invalid: number } | null>(null);

  const parseCsv = (text: string): CodingProblem[] => {
    const rows = text.split(/\r?\n/).filter(Boolean);
    if (rows.length === 0) return [];
    const lines = rows.slice(1); // assume header
    let invalid = 0;
    const out: CodingProblem[] = [];
    lines.forEach((line, idx) => {
      const cols = line.match(/("[^"]*"|[^,]+)/g)?.map(c => c.replace(/^"|"$/g, '').trim()) || [];
      // columns: title, summary, statement, input, output, constraints, difficulty, type, hiddenCount, skill
      if (!cols[0] || !cols[2]) { invalid++; return; }
      const diff = (cols[6] as CodingProblem['difficulty']) || 'Medium';
      out.push({
        id: `upload-${Date.now()}-${idx}`,
        title: cols[0],
        summary: cols[1] || cols[0],
        fullStatement: cols[2],
        ioFormat: { input: cols[3] || 'Standard input', output: cols[4] || 'Expected output' },
        constraints: (cols[5] || '').split('|').filter(Boolean),
        sampleCases: [{ input: 'sample input', output: 'sample output', explanation: 'Validates the core behavior.' }],
        hiddenCaseCount: Number(cols[8]) || 6,
        expectedComplexity: { time: 'O(n)', space: 'O(1)' },
        scoring: { maxPoints: 100, perTestCase: 10 },
        competencyId: 'imported', competencyName: cols[9] || competencyName, skillTag: cols[9] || skillTag,
        difficulty: diff,
        problemType: ((cols[7] as CodingProblemType) || 'Implementation'),
        languagesSupported: languages,
        estimatedSolveTimeMin: diff === 'Hard' ? 30 : diff === 'Medium' ? 20 : 12,
        rationale: 'Imported via CSV.', status: 'pending', freshness: 'new', highRoleFit: true,
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

  return (
    <ModalShell title="Bulk Upload Coding Problems" onClose={onClose}>
      <div className="space-y-3">
        <p className="text-[12px] text-muted-foreground">
          CSV columns: <span className="font-mono">title, summary, statement, input, output, constraints (use | to separate), difficulty, type, hiddenCount, skill</span>
        </p>
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
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Imported problems land in the <span className="font-semibold text-foreground">Bulk Upload</span> tab and can be reviewed alongside AI-generated and manual problems.
        </p>
      </div>
    </ModalShell>
  );
}