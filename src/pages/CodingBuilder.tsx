import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { useStore } from '@/store/useStore';
import { toast } from 'sonner';
import {
  Sparkles, Save, ArrowRight, ArrowLeft, ChevronDown, Check, X,
  AlertTriangle, CheckCircle2, Minus, Plus, Code2, FilePlus2, Eye,
} from 'lucide-react';
import { ContextTopBar } from '@/components/shared/ContextTopBar';
import { Stepper } from '@/components/shared/Stepper';
import { GenerationLoader } from '@/components/shared/GenerationLoader';
import { DifficultyBar } from '@/components/shared/DifficultyBar';
import { SkillChip } from '@/components/shared/SkillChip';
import { AIBadge } from '@/components/shared/AIBadge';
import {
  IntelligencePanel, PanelSection, ChecklistItem,
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

type PoolTab = 'ai' | 'manual' | 'all' | 'selected';

export default function CodingBuilder() {
  const { jobId, roundId } = useParams<{ jobId: string; roundId: string }>();
  const navigate = useNavigate();
  const job = useStore(s => s.getJob(jobId!));
  const getSampleCoding = useStore(s => s.getSampleCoding);
  const saveCodingAssessment = useStore(s => s.saveCodingAssessment);
  const round = job?.rounds.find(r => r.id === roundId);

  const [step, setStep] = useState(1);
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
  const [poolTab, setPoolTab] = useState<PoolTab>('all');

  if (!job || !round) {
    return <AppLayout bare><div className="p-8">Not found. <Link to="/jobs" className="text-primary">Back to Jobs</Link></div></AppLayout>;
  }
  const context = job.roleContext;

  const diffTotal = blueprint.difficultyMix.easy + blueprint.difficultyMix.medium + blueprint.difficultyMix.hard;
  const blueprintValid =
    blueprint.problemsToGenerate >= blueprint.problemsToSend &&
    blueprint.problemsToSend > 0 &&
    blueprint.durationMin > 0 &&
    diffTotal === 100 &&
    blueprint.languages.length > 0;

  const handleGenerate = () => {
    if (!blueprintValid) return toast.error('Fix the blueprint', { description: 'Generate ≥ Send, ≥1 language, difficulty totals 100%, duration required.' });
    setGenerating(true);
    setStep(2);
  };
  const handleGenComplete = () => {
    setGenerating(false);
    const sample = getSampleCoding();
    const target = blueprint.problemsToGenerate;
    const generated = Array.from({ length: target }, (_, i) => {
      const base = sample[i % sample.length];
      return { ...base, id: `ai-${Date.now()}-${i}`, status: 'pending' as const, source: 'ai' as const };
    });
    setProblems(ps => [...generated, ...ps.filter(p => p.source !== 'ai')]);
    setPoolTab('ai');
    toast.success(`${target} problems generated`);
  };
  const generateMore = () => {
    if (!blueprintValid) return toast.error('Fix the blueprint first');
    setGenerating(true);
  };

  const updateProblem = (id: string, patch: Partial<CodingProblem>) =>
    setProblems(ps => ps.map(p => p.id === id ? { ...p, ...patch } : p));

  const addManualProblem = (problem: CodingProblem) => {
    setProblems(ps => [problem, ...ps]);
    setPoolTab('all');
    toast.success('Problem added to pool');
  };

  const toggleLanguage = (l: CodingLanguage) =>
    setBlueprint({ ...blueprint, languages: blueprint.languages.includes(l) ? blueprint.languages.filter(x => x !== l) : [...blueprint.languages, l] });
  const toggleType = (t: CodingProblemType) =>
    setBlueprint({ ...blueprint, problemTypes: blueprint.problemTypes.includes(t) ? blueprint.problemTypes.filter(x => x !== t) : [...blueprint.problemTypes, t] });

  const selectedCount = problems.filter(p => p.status === 'approved').length;
  const selectionMet = selectedCount === blueprint.problemsToSend;
  const selectionRemaining = blueprint.problemsToSend - selectedCount;

  const aiCount = problems.filter(p => (p.source ? p.source === 'ai' : p.id.startsWith('ai-'))).length;
  const manualCount = problems.filter(p => (p.source ? p.source === 'manual' : p.id.startsWith('manual-'))).length;

  const visibleProblems = useMemo(() => {
    return problems.filter(p => {
      if (poolTab === 'all') return true;
      if (poolTab === 'selected') return p.status === 'approved';
      const src = p.source || (p.id.startsWith('ai-') ? 'ai' : 'manual');
      return src === poolTab;
    });
  }, [problems, poolTab]);

  const approveTopUpToSend = () => {
    let remaining = blueprint.problemsToSend - selectedCount;
    if (remaining <= 0) return toast('Selection target already met');
    setProblems(ps => ps.map(p => {
      if (remaining > 0 && p.status !== 'approved' && (poolTab === 'all' || visibleProblems.includes(p))) {
        remaining--;
        return { ...p, status: 'approved' };
      }
      return p;
    }));
  };

  const competencyCoverage = useMemo(() => {
    const map: Record<string, number> = {};
    problems.filter(p => p.status === 'approved').forEach(p => { map[p.competencyName] = (map[p.competencyName] || 0) + 1; });
    return map;
  }, [problems]);

  const difficulty = {
    easy: problems.filter(p => p.difficulty === 'Easy').length,
    medium: problems.filter(p => p.difficulty === 'Medium').length,
    hard: problems.filter(p => p.difficulty === 'Hard').length,
  };

  const save = () => {
    saveCodingAssessment(job.id, round.id, {
      id: `coding-${Date.now()}`,
      roundId: round.id,
      name: assessmentName,
      problemsToSend: blueprint.problemsToSend,
      durationMin: blueprint.durationMin,
      passThreshold,
      languages: blueprint.languages,
      problems: problems.filter(p => p.status === 'approved'),
      status: 'ready',
    });
    toast.success('Coding Assessment saved & attached', { description: `${blueprint.problemsToSend} problems attached to ${round.label}` });
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
          { label: `Coding · ${round.label}` },
        ]}
        chips={<div className="flex-1"><Stepper steps={STEPS} currentStep={step} onStepClick={setStep} /></div>}
        actions={
          <>
            <Button size="sm" variant="ghost" className="text-navy-foreground/90 hover:bg-white/10 hover:text-navy-foreground h-8" onClick={() => toast('Draft saved')}>
              <Save className="w-3.5 h-3.5 mr-1.5" />Save Draft
            </Button>
            <Button size="sm" className="bg-hnxgreen hover:bg-hnxgreen-deep text-navy font-semibold h-8" onClick={() => setShowSaveConfirm(true)} disabled={step !== 3 || !selectionMet}>
              Save & Attach to Round
            </Button>
          </>
        }
      />

      {generating && <GenerationLoader steps={codingGenerationSteps} title="Building your Coding assessment" onComplete={handleGenComplete} />}

      <div className="grid grid-cols-[1fr_340px] gap-6 p-6 max-w-[1440px] mx-auto">
        <div className="min-w-0 space-y-5">
          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-5 animate-fade-in">
              <div className="hnx-card p-5">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-teal" strokeWidth={2.5} />
                  <h2 className="text-[16px] font-bold text-navy">Confirm coding context</h2>
                </div>
                <p className="text-[12px] text-muted-foreground mb-4">AI calibrates problems to this role context.</p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                  <Tile label="Role" value={context.roleTitle} />
                  <Tile label="Experience" value={`${context.experienceMin}–${context.experienceMax} years`} />
                  <Tile label="Domain" value={context.domain} />
                  <Tile label="Sub-domain" value={context.subDomain} />
                  <div className="col-span-2">
                    <div className="flex items-center gap-2 mb-1.5"><span className="hnx-label">Skills mapped to this round</span><AIBadge /></div>
                    <div className="flex flex-wrap gap-1.5">
                      {(round.skillsToAssess && round.skillsToAssess.length > 0
                        ? round.skillsToAssess
                        : (context.mustTestTech || context.primarySkills)
                      ).map(t => <SkillChip key={t} label={t} variant="teal" size="sm" />)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="hnx-card p-5">
                <h2 className="text-[16px] font-bold text-navy mb-1">Coding Blueprint</h2>
                <p className="text-[12px] text-muted-foreground mb-5">Set pool size, final test size, and duration.</p>

                <div className="grid grid-cols-3 gap-4">
                  <NumberStepper label="Problems to Generate" value={blueprint.problemsToGenerate} onChange={(v) => setBlueprint({ ...blueprint, problemsToGenerate: v, poolSize: v })} suffix="in pool" step={1} min={1} />
                  <NumberStepper label="Problems to Send" value={blueprint.problemsToSend} onChange={(v) => setBlueprint({ ...blueprint, problemsToSend: v })} suffix="final" step={1} min={1} />
                  <NumberStepper label="Duration" value={blueprint.durationMin} step={15} onChange={(v) => setBlueprint({ ...blueprint, durationMin: v })} suffix="min" min={15} />
                </div>

                {!blueprintValid && (
                  <div className="mt-3 p-2.5 rounded-md bg-warning-light border border-warning/30 text-[11.5px] text-warning flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Generate ≥ Send · pick a language · difficulty mix totals 100% · duration required.
                  </div>
                )}

                <div className="mt-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="hnx-label">Difficulty Mix</span>
                    <span className={cn('text-[11px] font-semibold tabular-nums', diffTotal === 100 ? 'text-hnxgreen-deep' : 'text-warning')}>{diffTotal}%</span>
                  </div>
                  <DifficultyMixEditor value={blueprint.difficultyMix} onChange={(difficultyMix) => setBlueprint({ ...blueprint, difficultyMix })} />
                </div>

                <div className="mt-5 grid grid-cols-2 gap-5">
                  <div>
                    <span className="hnx-label block mb-1.5">Languages allowed</span>
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
                    <ToggleRow label="Strict role/experience fit" value={blueprint.strictExperience} onChange={(v) => setBlueprint({ ...blueprint, strictExperience: v })} />
                    <ToggleRow label="Partial scoring" value={blueprint.scoring.partial} onChange={(v) => setBlueprint({ ...blueprint, scoring: { ...blueprint.scoring, partial: v } })} />
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-2">
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
                      <p className="text-[12px] text-muted-foreground">Pool {problems.length} · Select <span className="font-semibold text-navy">{blueprint.problemsToSend}</span> for the final test.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn('hnx-badge border', selectionMet ? 'bg-hnxgreen/15 text-hnxgreen-deep border-hnxgreen/30' : 'bg-muted text-foreground border-border')}>
                      Selected {selectedCount} / {blueprint.problemsToSend}
                    </span>
                    <Button size="sm" variant="outline" className="h-8 text-[12px]" onClick={approveTopUpToSend} disabled={selectionMet}>
                      <Check className="w-3.5 h-3.5 mr-1" />Select Required
                    </Button>
                    <Button size="sm" className="h-8 text-[12px] bg-primary" onClick={() => setShowManualAdd(true)}>
                      <FilePlus2 className="w-3.5 h-3.5 mr-1" />Add Manually
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-2 border-t pt-3">
                  <PoolTabButton active={poolTab === 'ai'} onClick={() => setPoolTab('ai')} label="AI Generated" count={aiCount} />
                  <PoolTabButton active={poolTab === 'manual'} onClick={() => setPoolTab('manual')} label="Manual" count={manualCount} />
                  <PoolTabButton active={poolTab === 'all'} onClick={() => setPoolTab('all')} label="Total Pool" count={problems.length} />
                  <PoolTabButton active={poolTab === 'selected'} onClick={() => setPoolTab('selected')} label="Selected" count={selectedCount} tone="green" />
                </div>
              </div>

              {poolTab === 'ai' && aiCount === 0 && (
                <div className="hnx-card p-8 text-center">
                  <p className="text-[14px] font-bold text-navy">No AI-generated problems yet</p>
                  <p className="text-[12px] text-muted-foreground mt-1 mb-4">Generate a fresh batch sized to your blueprint.</p>
                  <Button onClick={generateMore} className="bg-hnxgreen hover:bg-hnxgreen-deep text-navy font-semibold">
                    <Sparkles className="w-4 h-4 mr-2" />Generate with AI
                  </Button>
                </div>
              )}

              {visibleProblems.length > 0 ? (
                visibleProblems.map((p, i) => (
                  <CodingCard
                    key={p.id}
                    problem={p}
                    index={i}
                    expanded={expandedProblem === p.id}
                    onToggleExpand={() => setExpandedProblem(expandedProblem === p.id ? null : p.id)}
                    onUpdate={(patch) => updateProblem(p.id, patch)}
                  />
                ))
              ) : poolTab !== 'ai' && (
                <div className="hnx-card p-8 text-center">
                  <p className="text-[14px] font-bold text-navy">Nothing in this tab yet</p>
                  <p className="text-[12px] text-muted-foreground mt-1">Add problems manually or generate with AI to populate the pool.</p>
                </div>
              )}

              <div className="flex justify-between items-center pt-2">
                <Button variant="outline" onClick={() => setStep(1)}><ArrowLeft className="w-3.5 h-3.5 mr-1.5" />Back</Button>
                <Button className="bg-hnxgreen hover:bg-hnxgreen-deep text-navy font-semibold" onClick={() => setStep(3)} disabled={!selectionMet}>
                  Continue to Finalize<ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3 */}
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
                <SummaryRow label="Total selected problems" value={`${selectedCount} / ${blueprint.problemsToSend}`} tone={selectionMet ? 'green' : undefined} />
                <SummaryRow label="Duration" value={`${blueprint.durationMin} min`} />
                <div className="flex items-center gap-2">
                  <span className="text-[12px] text-muted-foreground">Pass threshold</span>
                  <input type="number" value={passThreshold} onChange={(e) => setPassThreshold(+e.target.value)} className="hnx-input w-16 h-8" />
                  <span className="text-[12px] text-muted-foreground">%</span>
                </div>
                <SummaryRow label="Difficulty mix" value={`${blueprint.difficultyMix.easy}/${blueprint.difficultyMix.medium}/${blueprint.difficultyMix.hard}`} />
                <SummaryRow label="Languages" value={blueprint.languages.join(', ')} />
                <SummaryRow label="Sources" value={`AI ${aiCount} · Manual ${manualCount}`} />
                <SummaryRow label="Competency coverage" value={`${Object.keys(competencyCoverage).length} competencies`} />
              </div>
              <div className="border-t pt-4 flex flex-wrap gap-2 justify-between">
                <Button variant="outline" onClick={() => setStep(2)}><ArrowLeft className="w-3.5 h-3.5 mr-1.5" />Back</Button>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => toast('Draft saved')}>Save Draft</Button>
                  <Button variant="outline" onClick={() => setShowFinalProblems(true)}>
                    <Eye className="w-4 h-4 mr-1.5" />View Final Problems
                  </Button>
                  <Button className="bg-hnxgreen hover:bg-hnxgreen-deep text-navy font-bold" onClick={() => setShowSaveConfirm(true)} disabled={!selectionMet}>
                    <CheckCircle2 className="w-4 h-4 mr-1.5" />Save & Attach to Round
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT panel */}
        <IntelligencePanel>
          <PanelSection title="Pool Stats" defaultOpen>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <Stat label="AI Generated" value={`${aiCount}`} />
              <Stat label="Manual" value={`${manualCount}`} />
              <Stat label="Total Pool" value={`${problems.length}`} />
              <Stat label="Selected" value={`${selectedCount}/${blueprint.problemsToSend}`} tone={selectionMet ? 'green' : 'warn'} />
              <Stat label="To Send" value={`${blueprint.problemsToSend}`} />
              <Stat label="Hidden cases" value={`${blueprint.testCases.hidden}`} />
            </div>
          </PanelSection>

          {problems.length > 0 && (
            <PanelSection title="Difficulty Distribution">
              <DifficultyBar
                easy={Math.round((difficulty.easy / problems.length) * 100)}
                medium={Math.round((difficulty.medium / problems.length) * 100)}
                hard={Math.round((difficulty.hard / problems.length) * 100)}
              />
            </PanelSection>
          )}

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

          <PanelSection title="Competency Coverage">
            {Object.keys(competencyCoverage).length === 0 ? (
              <p className="text-[11.5px] text-muted-foreground">Approve problems to see coverage build up.</p>
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

          {!selectionMet && problems.length > 0 && (
            <PanelSection title="To finalize" defaultOpen>
              <ChecklistItem icon={AlertTriangle} tone="warn">
                {selectionRemaining > 0 ? `Select ${selectionRemaining} more problem${selectionRemaining > 1 ? 's' : ''}` : `Deselect ${-selectionRemaining}`}
              </ChecklistItem>
            </PanelSection>
          )}
        </IntelligencePanel>
      </div>

      {showManualAdd && <ManualCodingModal onClose={() => setShowManualAdd(false)} onAdd={addManualProblem} skills={(round.skillsToAssess && round.skillsToAssess.length) ? round.skillsToAssess : (context.mustTestTech || context.primarySkills)} languages={blueprint.languages} />}
      {showFinalProblems && <FinalProblemsOverlay problems={problems.filter(p => p.status === 'approved')} onClose={() => setShowFinalProblems(false)} />}
      {showSaveConfirm && <SaveConfirmOverlay count={selectedCount} onClose={() => setShowSaveConfirm(false)} onConfirm={save} />}
    </AppLayout>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (<div><p className="hnx-label mb-1">{label}</p><p className="text-[13px] font-semibold text-navy">{value}</p></div>);
}

function NumberStepper({ label, value, onChange, suffix, step = 1, min = 1 }: { label: string; value: number; onChange: (v: number) => void; suffix: string; step?: number; min?: number }) {
  return (
    <div>
      <span className="hnx-label block mb-1.5">{label}</span>
      <div className="flex items-center gap-1.5">
        <button onClick={() => onChange(Math.max(min, value - step))} className="hnx-stepper-btn"><Minus className="w-3 h-3" /></button>
        <input type="number" value={value} onChange={(e) => onChange(Math.max(min, +e.target.value))} className="hnx-input h-8 w-16 text-center font-bold text-navy" />
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

function PoolTabButton({ active, onClick, label, count, tone }: { active: boolean; onClick: () => void; label: string; count: number; tone?: 'green' }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'h-8 px-3 rounded-md text-[12px] font-semibold border transition-all inline-flex items-center gap-2',
        active
          ? tone === 'green' ? 'bg-hnxgreen-deep text-navy border-hnxgreen-deep shadow-sm' : 'bg-primary text-primary-foreground border-primary shadow-sm'
          : 'bg-card text-muted-foreground border-border hover:text-foreground hover:border-primary/30',
      )}
    >
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
  const src = problem.source || (problem.id.startsWith('ai-') ? 'ai' : 'manual');
  const srcLabel = src === 'ai' ? 'AI Generated' : 'Manually Added';
  const srcTone = src === 'ai' ? 'bg-teal-light text-teal-deep' : 'bg-muted text-foreground/70';

  return (
    <div className={cn('hnx-card relative overflow-hidden transition-all', isApproved && 'bg-teal-light/30 border-teal/40')}>
      <span className={cn('absolute left-0 top-0 bottom-0 w-1', diffBar)} />
      <div className="p-4 pl-5">
        <div className="flex items-start gap-3">
          <input type="checkbox" checked={isApproved} onChange={(e) => onUpdate({ status: e.target.checked ? 'approved' : 'pending' })} className="mt-1 accent-primary w-4 h-4" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-[11px] font-mono font-bold text-muted-foreground">P{index + 1}</span>
              <span className={cn('hnx-badge', diffTone)}>{problem.difficulty}</span>
              <span className={cn('hnx-badge', srcTone)}>{srcLabel}</span>
              <SkillChip label={problem.competencyName} variant="muted" size="xs" />
              <SkillChip label={problem.problemType} variant="navy" size="xs" />
              <span className="text-[10px] text-muted-foreground">~{problem.estimatedSolveTimeMin} min</span>
            </div>
            <h4 className="text-[15px] font-bold text-navy mb-1">{problem.title}</h4>
            <p className="text-[12.5px] text-foreground/70 leading-relaxed mb-2">{problem.summary}</p>
            <div className="flex items-center gap-1.5 mb-2 flex-wrap">
              {problem.languagesSupported.map(l => <SkillChip key={l} label={l} variant="teal" size="xs" />)}
              <span className="text-[11px] text-muted-foreground">· {problem.sampleCases.length} visible / {problem.hiddenCaseCount} hidden test cases</span>
            </div>

            <button onClick={onToggleExpand} className="inline-flex items-center gap-1 text-[11px] text-primary font-semibold hover:underline">
              <ChevronDown className={cn('w-3 h-3 transition-transform', expanded && 'rotate-180')} />
              {expanded ? 'Hide' : 'View'} problem details
            </button>

            {expanded && (
              <div className="mt-3 space-y-3 animate-fade-in-fast">
                <DetailBlock title="Problem Statement"><p className="text-[12px] text-foreground/80 leading-relaxed">{problem.fullStatement}</p></DetailBlock>
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
  return (<div><p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">{title}</p>{children}</div>);
}

function ManualCodingModal({ onClose, onAdd, skills, languages }: { onClose: () => void; onAdd: (p: CodingProblem) => void; skills: string[]; languages: CodingLanguage[] }) {
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [statement, setStatement] = useState('');
  const [problemType, setProblemType] = useState<CodingProblemType>('Implementation');
  const [difficulty, setDifficulty] = useState<CodingProblem['difficulty']>('Medium');
  const [skill, setSkill] = useState(skills[0] || 'Core Skill');
  const [inputFmt, setInputFmt] = useState('Standard input');
  const [outputFmt, setOutputFmt] = useState('Expected output');
  const [constraints, setConstraints] = useState('Input size follows role-appropriate limits');
  const [sampleIn, setSampleIn] = useState('');
  const [sampleOut, setSampleOut] = useState('');
  const [hiddenCount, setHiddenCount] = useState(8);
  const [complexity, setComplexity] = useState('O(n)');
  const [maxPoints, setMaxPoints] = useState(100);
  const [pickedLangs, setPickedLangs] = useState<CodingLanguage[]>(languages);

  const submit = () => {
    if (!title.trim() || !statement.trim()) return toast.error('Add problem title and statement');
    onAdd({
      id: `manual-${Date.now()}`, title, summary: summary || title, fullStatement: statement,
      ioFormat: { input: inputFmt, output: outputFmt },
      constraints: constraints.split('\n').filter(Boolean),
      sampleCases: sampleIn ? [{ input: sampleIn, output: sampleOut, explanation: 'Validates the core behavior.' }] : [],
      hiddenCaseCount: hiddenCount,
      expectedComplexity: { time: complexity, space: 'O(1)' },
      scoring: { maxPoints, perTestCase: Math.max(1, Math.round(maxPoints / Math.max(1, hiddenCount))) },
      competencyId: 'manual', competencyName: skill, skillTag: skill,
      difficulty, problemType,
      languagesSupported: pickedLangs,
      estimatedSolveTimeMin: 45,
      rationale: 'Manually added by recruiter.',
      status: 'pending', freshness: 'new', highRoleFit: true, source: 'manual',
    });
    onClose();
  };

  const toggleLang = (l: CodingLanguage) =>
    setPickedLangs(p => p.includes(l) ? p.filter(x => x !== l) : [...p, l]);

  return (
    <ModalShell title="Add Coding Problem Manually" onClose={onClose} wide>
      <div className="space-y-3">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Problem title" className="hnx-input w-full" />
        <input value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Short summary" className="hnx-input w-full" />
        <textarea value={statement} onChange={(e) => setStatement(e.target.value)} placeholder="Problem statement" className="hnx-input min-h-32 w-full" />
        <div className="grid grid-cols-3 gap-3">
          <select value={problemType} onChange={(e) => setProblemType(e.target.value as CodingProblemType)} className="hnx-input">
            {ALL_PROBLEM_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
          <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as CodingProblem['difficulty'])} className="hnx-input">
            <option>Easy</option><option>Medium</option><option>Hard</option>
          </select>
          <select value={skill} onChange={(e) => setSkill(e.target.value)} className="hnx-input">
            {skills.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input value={inputFmt} onChange={(e) => setInputFmt(e.target.value)} placeholder="Input format" className="hnx-input" />
          <input value={outputFmt} onChange={(e) => setOutputFmt(e.target.value)} placeholder="Output format" className="hnx-input" />
        </div>
        <textarea value={constraints} onChange={(e) => setConstraints(e.target.value)} placeholder="Constraints (one per line)" className="hnx-input min-h-16 w-full" />
        <div className="grid grid-cols-2 gap-3">
          <input value={sampleIn} onChange={(e) => setSampleIn(e.target.value)} placeholder="Sample input" className="hnx-input font-mono text-[12px]" />
          <input value={sampleOut} onChange={(e) => setSampleOut(e.target.value)} placeholder="Sample output" className="hnx-input font-mono text-[12px]" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="hnx-label block mb-1">Hidden test cases</label>
            <input type="number" value={hiddenCount} onChange={(e) => setHiddenCount(+e.target.value)} className="hnx-input w-full" />
          </div>
          <div>
            <label className="hnx-label block mb-1">Expected complexity</label>
            <input value={complexity} onChange={(e) => setComplexity(e.target.value)} className="hnx-input w-full font-mono" />
          </div>
          <div>
            <label className="hnx-label block mb-1">Max points</label>
            <input type="number" value={maxPoints} onChange={(e) => setMaxPoints(+e.target.value)} className="hnx-input w-full" />
          </div>
        </div>
        <div>
          <label className="hnx-label block mb-1.5">Supported languages</label>
          <div className="flex flex-wrap gap-1.5">
            {ALL_LANGUAGES.map(l => {
              const on = pickedLangs.includes(l);
              return (
                <button key={l} type="button" onClick={() => toggleLang(l)} className={cn(
                  'px-2.5 py-1 rounded-md text-[11px] font-medium border transition-all',
                  on ? 'bg-teal-light text-teal-deep border-teal/40' : 'bg-card text-muted-foreground border-border hover:border-teal/30',
                )}>{l}</button>
              );
            })}
          </div>
        </div>
        <Button className="w-full bg-primary" onClick={submit}>Add to Pool</Button>
      </div>
    </ModalShell>
  );
}

function FinalProblemsOverlay({ problems, onClose }: { problems: CodingProblem[]; onClose: () => void }) {
  return (
    <ModalShell title={`Final Coding Problems (${problems.length})`} onClose={onClose} wide>
      <div className="space-y-3 max-h-[75vh] overflow-auto pr-2">
        {problems.map((p, i) => <CodingCard key={p.id} problem={p} index={i} expanded={false} onToggleExpand={() => undefined} onUpdate={() => undefined} />)}
      </div>
    </ModalShell>
  );
}

function SaveConfirmOverlay({ count, onClose, onConfirm }: { count: number; onClose: () => void; onConfirm: () => void }) {
  return (
    <ModalShell title="Save Coding Assessment" onClose={onClose}>
      <div className="space-y-4">
        <div className="p-4 rounded-lg bg-warning-light border border-warning/30">
          <p className="text-[13px] font-semibold text-navy">This action cannot be reverted.</p>
          <p className="text-[12px] text-muted-foreground mt-1">
            Once saved, this coding assessment will be attached to the round. Final test setup cannot be reverted without creating a new version.
            You're attaching <span className="font-semibold text-navy">{count}</span> problem{count > 1 ? 's' : ''}.
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
      <div className={cn('hnx-card p-5 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto', wide ? 'w-full max-w-3xl' : 'w-full max-w-xl')}>
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
    <div className="flex justify-between items-start text-[12.5px] gap-2">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn('font-semibold text-right', tone === 'green' ? 'text-hnxgreen-deep' : 'text-foreground')}>{value}</span>
    </div>
  );
}