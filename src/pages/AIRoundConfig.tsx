import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { ContextTopBar, NavyChip } from '@/components/shared/ContextTopBar';
import {
  IntelligencePanel, PanelSection, CompetencySection,
} from '@/components/shared/IntelligencePanel';
import { useStore } from '@/store/useStore';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  Sparkles, Save, Check, Plus, Brain, Code2, Info, Shield, Clock, Mic,
} from 'lucide-react';
import type { AIRoundConfig, Difficulty } from '@/types/hirenowx';

export default function AIRoundConfigPage() {
  const { jobId, roundId } = useParams<{ jobId: string; roundId: string }>();
  const navigate = useNavigate();
  const job = useStore(s => s.getJob(jobId!));
  const saveCfg = useStore(s => s.saveAIRoundConfig);

  const round = useMemo(() => job?.rounds.find(r => r.id === roundId), [job, roundId]);

  if (!job || !round) {
    return <AppLayout bare><div className="p-8">Round not found.</div></AppLayout>;
  }

  const kind: AIRoundConfig['kind'] = round.type === 'AIInterview' ? 'AIInterview' : 'AICoding';
  const isInterview = kind === 'AIInterview';

  const baseSkills = Array.from(new Set([
    ...(round.assessedSkills ?? []),
    ...job.roleContext.primarySkills,
    ...job.roleContext.secondarySkills,
  ]));

  const existing = round.aiConfig;
  const [name, setName] = useState(existing?.name || round.label);
  const [skills, setSkills] = useState<string[]>(existing?.skills || (round.assessedSkills ?? job.roleContext.primarySkills.slice(0, 4)));
  const [skillDraft, setSkillDraft] = useState('');
  const [experienceLevel, setExperienceLevel] = useState(existing?.experienceLevel || job.experienceBand);
  const [duration, setDuration] = useState(existing?.durationMin || round.durationMin || (isInterview ? 30 : 45));
  const [questionStyle, setQuestionStyle] = useState<AIRoundConfig['questionStyle']>(existing?.questionStyle || 'Mixed');
  const [problemStyle, setProblemStyle] = useState<AIRoundConfig['problemStyle']>(existing?.problemStyle || 'Implementation');
  const [difficulty, setDifficulty] = useState<Difficulty>(existing?.difficulty || 'Medium');
  const [language, setLanguage] = useState(existing?.language || 'English');
  const [codingLanguage, setCodingLanguage] = useState(existing?.codingLanguage || (job.roleContext.codingLanguages?.[0] || 'JavaScript'));
  const [proctoring, setProctoring] = useState<AIRoundConfig['proctoring']>(existing?.proctoring || 'Standard');
  const [threshold, setThreshold] = useState(existing?.threshold || round.passThreshold || 70);
  const [instructions, setInstructions] = useState(existing?.candidateInstructions || (isInterview
    ? 'You will speak with our AI interviewer. Answer clearly. Tab switching and external help are monitored.'
    : 'You will solve a problem with AI guidance. Think out loud. Code execution and copy-paste are monitored.'));
  const [rubric, setRubric] = useState(existing?.rubric || 'Score on correctness, communication, and reasoning depth (0-10 each).');

  const addSkill = (s: string) => {
    const t = s.trim(); if (!t) return;
    setSkills(prev => Array.from(new Set([...prev, t])));
    setSkillDraft('');
  };
  const removeSkill = (s: string) => setSkills(prev => prev.filter(x => x !== s));
  const suggestable = baseSkills.filter(s => !skills.includes(s));

  const save = () => {
    const cfg: AIRoundConfig = {
      kind,
      name,
      skills,
      experienceLevel,
      durationMin: duration,
      questionStyle: isInterview ? questionStyle : undefined,
      problemStyle: !isInterview ? problemStyle : undefined,
      difficulty,
      language,
      codingLanguage: !isInterview ? codingLanguage : undefined,
      proctoring,
      threshold,
      candidateInstructions: instructions,
      rubric,
    };
    saveCfg(job.id, round.id, cfg);
    toast.success(`${isInterview ? 'AI Interview' : 'AI Coding'} configured`, {
      description: `${name} • ${duration} min • ${skills.length} skills`,
    });
    navigate(`/jobs/${job.id}`);
  };

  const Icon = isInterview ? Brain : Code2;

  return (
    <AppLayout bare>
      <ContextTopBar
        backTo={`/jobs/${job.id}`}
        backLabel="Job Details"
        breadcrumbs={[
          { label: job.title, to: `/jobs/${job.id}` },
          { label: 'Job Template', to: `/jobs/${job.id}/template` },
          { label: isInterview ? 'AI Interview Config' : 'AI Coding Config' },
        ]}
        chips={
          <>
            <NavyChip>{round.label}</NavyChip>
            <NavyChip tone="teal">{duration} min</NavyChip>
            <NavyChip>{skills.length} skills</NavyChip>
          </>
        }
        actions={
          <Button size="sm" className="bg-hnxgreen hover:bg-hnxgreen-deep text-navy font-semibold h-8" onClick={save}>
            <Save className="w-3.5 h-3.5 mr-1.5" />Save Configuration
          </Button>
        }
      />

      <div className="grid grid-cols-[1fr_320px] gap-6 p-6 max-w-[1320px] mx-auto">
        <div className="min-w-0 space-y-5">
          {/* Header */}
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-lg bg-teal-light border border-teal/30 flex items-center justify-center shrink-0">
              <Icon className="w-5 h-5 text-teal-deep" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-[22px] font-bold tracking-tight text-navy">
                {isInterview ? 'AI Interview Configuration' : 'AI Coding Configuration'}
              </h1>
              <p className="text-[13px] text-muted-foreground mt-0.5">
                Lightweight setup — no question bank needed. AI runs the round live based on these settings.
              </p>
            </div>
          </div>

          {/* AI banner */}
          <div className="hnx-card overflow-hidden gradient-ai-banner border-teal/30">
            <div className="p-4 flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-teal flex items-center justify-center shrink-0 shadow-teal-glow">
                <Sparkles className="w-4 h-4 text-primary-foreground" strokeWidth={2.5} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-navy mb-0.5">AI-prepared from JD</p>
                <p className="text-[12px] text-foreground/80">
                  Skills, experience level, and competency mapping pre-filled from <span className="font-semibold">{job.title}</span>. Adjust anything — AI will adapt the {isInterview ? 'questions' : 'problem'} live.
                </p>
              </div>
            </div>
          </div>

          {/* Basics */}
          <Section title="Basics" icon={Info}>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Round Name">
                <input value={name} onChange={(e) => setName(e.target.value)} className="hnx-input w-full" />
              </Field>
              <Field label="Experience Level">
                <input value={experienceLevel} onChange={(e) => setExperienceLevel(e.target.value)} className="hnx-input w-full" />
              </Field>
              <Field label="Duration (minutes)">
                <input type="number" min={5} value={duration} onChange={(e) => setDuration(+e.target.value)} className="hnx-input w-full" />
              </Field>
              <Field label="Difficulty">
                <Pills options={['Easy', 'Medium', 'Hard'] as const} value={difficulty} onChange={(v) => setDifficulty(v)} />
              </Field>
            </div>
          </Section>

          {/* Skills */}
          <Section title="Skills to Assess" icon={Sparkles}>
            <div className="rounded-lg border border-border bg-card p-3 space-y-3">
              <div className="flex flex-wrap gap-2">
                {skills.length === 0 && <span className="text-[12px] text-muted-foreground">No skills selected</span>}
                {skills.map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => removeSkill(s)}
                    className="inline-flex items-center gap-1 rounded-md border border-teal bg-teal-light text-teal-deep px-2.5 py-1.5 text-[12px] font-semibold"
                  >
                    <Check className="w-3 h-3" strokeWidth={3} />{s}
                    <span className="ml-1 opacity-50">×</span>
                  </button>
                ))}
              </div>
              {suggestable.length > 0 && (
                <div className="pt-2 border-t border-border/60">
                  <p className="text-[10.5px] uppercase tracking-wider font-semibold text-muted-foreground mb-1.5">Suggestions from JD</p>
                  <div className="flex flex-wrap gap-1.5">
                    {suggestable.map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => addSkill(s)}
                        className="inline-flex items-center gap-1 rounded-md border border-border bg-background text-muted-foreground hover:border-teal/50 hover:text-foreground px-2 py-1 text-[11.5px] font-medium"
                      >
                        <Plus className="w-3 h-3" />{s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex items-center gap-1.5 pt-2 border-t border-border/60">
                <input
                  value={skillDraft}
                  onChange={(e) => setSkillDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(skillDraft); } }}
                  placeholder="Add a custom skill…"
                  className="hnx-input flex-1 h-8 text-[12px]"
                />
                <button
                  type="button"
                  onClick={() => addSkill(skillDraft)}
                  className="h-8 px-3 rounded-md bg-primary/10 text-primary hover:bg-primary/20 text-[12px] font-semibold inline-flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />Add
                </button>
              </div>
            </div>
          </Section>

          {/* Style */}
          <Section title={isInterview ? 'Interview Style' : 'Problem Style'} icon={isInterview ? Mic : Code2}>
            <div className="grid grid-cols-2 gap-4">
              {isInterview ? (
                <Field label="Question Style">
                  <Pills
                    options={['Technical', 'Behavioral', 'Scenario', 'Mixed'] as const}
                    value={questionStyle ?? 'Mixed'}
                    onChange={(v) => setQuestionStyle(v)}
                  />
                </Field>
              ) : (
                <Field label="Problem Style">
                  <Pills
                    options={['Debugging', 'Implementation', 'LiveReasoning', 'CodeExplanation', 'Mixed'] as const}
                    value={problemStyle ?? 'Implementation'}
                    onChange={(v) => setProblemStyle(v)}
                  />
                </Field>
              )}
              <Field label="Language">
                <input value={language} onChange={(e) => setLanguage(e.target.value)} className="hnx-input w-full" />
              </Field>
              {!isInterview && (
                <Field label="Coding Language">
                  <input value={codingLanguage} onChange={(e) => setCodingLanguage(e.target.value)} className="hnx-input w-full" />
                </Field>
              )}
            </div>
          </Section>

          {/* Integrity */}
          <Section title="Integrity & Scoring" icon={Shield}>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Proctoring">
                <Pills options={['Off', 'Standard', 'Strict'] as const} value={proctoring ?? 'Standard'} onChange={(v) => setProctoring(v)} />
              </Field>
              <Field label="Pass Threshold (%)">
                <input type="number" min={0} max={100} value={threshold} onChange={(e) => setThreshold(+e.target.value)} className="hnx-input w-full" />
              </Field>
            </div>
          </Section>

          {/* Instructions & rubric */}
          <Section title="Candidate Instructions" icon={Info}>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={3}
              className="hnx-input w-full resize-y leading-relaxed text-[13px]"
            />
          </Section>
          <Section title="AI Rubric" icon={Sparkles}>
            <textarea
              value={rubric}
              onChange={(e) => setRubric(e.target.value)}
              rows={3}
              className="hnx-input w-full resize-y leading-relaxed text-[13px]"
            />
          </Section>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => navigate(`/jobs/${job.id}`)}>Cancel</Button>
            <Button className="bg-hnxgreen hover:bg-hnxgreen-deep text-navy font-bold" onClick={save}>
              <Save className="w-4 h-4 mr-1.5" />Save Configuration
            </Button>
          </div>
        </div>

        {/* RIGHT — intelligence panel */}
        <IntelligencePanel>
          <PanelSection title="Round Snapshot" icon={<Clock className="w-3.5 h-3.5" />}>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <Stat label="Duration" value={`${duration}m`} />
              <Stat label="Skills" value={`${skills.length}`} tone="green" />
              <Stat label="Difficulty" value={difficulty} />
              <Stat label="Pass" value={`${threshold}%`} />
            </div>
          </PanelSection>
          <CompetencySection competencies={job.competencies} title="Competency Mapping" />
        </IntelligencePanel>
      </div>
    </AppLayout>
  );
}

// ===== helpers =====
function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="hnx-card p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-md bg-teal-light flex items-center justify-center">
          <Icon className="w-3.5 h-3.5 text-teal-deep" strokeWidth={2.5} />
        </div>
        <h3 className="hnx-section-title">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="hnx-label block mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function Pills<T extends string>({ options, value, onChange }: { options: readonly T[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map(o => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          className={cn(
            'h-8 px-3 rounded-md text-[12px] font-semibold border transition-all',
            value === o
              ? 'bg-primary text-primary-foreground border-primary shadow-sm'
              : 'bg-card text-muted-foreground border-border hover:text-foreground hover:border-primary/30',
          )}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: 'green' }) {
  return (
    <div className="rounded-md border border-border bg-card p-2">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</p>
      <p className={cn('text-[14px] font-bold tabular-nums leading-tight mt-0.5', tone === 'green' ? 'text-hnxgreen-deep' : 'text-navy')}>{value}</p>
    </div>
  );
}