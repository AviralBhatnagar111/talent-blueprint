import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { useStore } from '@/store/useStore';
import {
  ArrowLeft, MapPin, Briefcase, Clock, Users, Target,
  Layers, CheckCircle2, AlertCircle, ArrowRight, Sparkles,
  Brain, Code2, FileText, UserPlus, Share2, Edit3, Download,
  Building2, Mail, Calendar, DollarSign, CircleDot, Activity,
} from 'lucide-react';
import { SkillChip } from '@/components/shared/SkillChip';
import { RoundTypeIcon, ROUND_META } from '@/components/shared/RoundIcon';
import { cn } from '@/lib/utils';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

type MissingRoundKind = 'MCQ' | 'Coding' | null;

export default function JobDetails() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const job = useStore(s => s.getJob(jobId!));
  const [missingRound, setMissingRound] = useState<MissingRoundKind>(null);

  const mcqRound = useMemo(() => job?.rounds.find(r => r.type === 'MCQ'), [job]);
  const codingRound = useMemo(() => job?.rounds.find(r => r.type === 'Coding'), [job]);

  if (!job) {
    return (
      <AppLayout>
        <div className="p-8 text-center">
          <p className="text-muted-foreground">Job not found.</p>
          <Button asChild className="mt-4"><Link to="/jobs">Back to Jobs</Link></Button>
        </div>
      </AppLayout>
    );
  }

  const tpl = job.templateStatus;
  const totalDuration = job.rounds.reduce((a, r) => a + r.durationMin, 0);
  const readyCount = job.rounds.filter(r => r.assessmentStatus === 'ready').length;

  // Operational handlers
  const handleMCQ = () => {
    if (!mcqRound) { setMissingRound('MCQ'); return; }
    navigate(`/jobs/${job.id}/template/rounds/${mcqRound.id}/mcq-builder`);
  };
  const handleCoding = () => {
    if (!codingRound) { setMissingRound('Coding'); return; }
    navigate(`/jobs/${job.id}/template/rounds/${codingRound.id}/coding-builder`);
  };

  const mcqStatus = mcqRound?.assessmentStatus ?? 'missing';
  const codingStatus = codingRound?.assessmentStatus ?? 'missing';
  const aiInterviewRound = job.rounds.find(r => r.type === 'AIInterview');

  // Readiness scoring
  const readinessItems = [
    { key: 'tpl', label: 'Job Template', status: tpl === 'ready' ? 'ready' : tpl === 'draft' ? 'draft' : 'missing' },
    { key: 'mcq', label: 'MCQ Assessment', status: mcqStatus, optional: !mcqRound },
    { key: 'cod', label: 'Coding Assessment', status: codingStatus, optional: !codingRound },
    { key: 'ai', label: 'AI Interview', status: aiInterviewRound ? 'ready' : 'missing', optional: !aiInterviewRound },
  ];
  const requiredItems = readinessItems.filter(i => !i.optional || i.status === 'ready' || i.status === 'draft');
  const readyItems = requiredItems.filter(i => i.status === 'ready').length;
  const overallReadiness = Math.round((readyItems / Math.max(requiredItems.length, 1)) * 100);

  return (
    <AppLayout>
      <div className="max-w-[1320px] mx-auto p-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground mb-3">
          <Link to="/jobs" className="hover:text-navy transition-colors">Jobs</Link>
          <span>/</span>
          <span className="text-navy font-medium">{job.title}</span>
        </div>

        {/* Header bar */}
        <div className="flex items-start justify-between gap-6 mb-5">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 mb-2">
              <h1 className="text-[26px] font-bold tracking-tight text-navy leading-tight">{job.title}</h1>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-hnxgreen/15 text-hnxgreen-deep border border-hnxgreen/30">
                <span className="w-1.5 h-1.5 rounded-full bg-hnxgreen animate-pulse" />
                {job.status}
              </span>
              <span className="text-[11px] text-muted-foreground font-mono">JOB-{job.id.toUpperCase()}</span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12.5px] text-muted-foreground">
              <span className="flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5" />{job.department}</span>
              <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{job.location} · {job.workMode}</span>
              <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{job.experienceBand}</span>
              <span className="flex items-center gap-1.5"><Target className="w-3.5 h-3.5" />{job.openings} opening{job.openings > 1 ? 's' : ''}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="ghost" size="sm" className="h-9 text-[12.5px]" onClick={() => toast.success('Job exported')}>
              <Download className="w-3.5 h-3.5 mr-1.5" />Export
            </Button>
            <Button variant="ghost" size="sm" className="h-9 text-[12.5px]" onClick={() => toast.info('Edit job (coming soon)')}>
              <Edit3 className="w-3.5 h-3.5 mr-1.5" />Edit Job
            </Button>
            <Button variant="ghost" size="sm" className="h-9 text-[12.5px]" onClick={() => { navigator.clipboard?.writeText(window.location.href); toast.success('Job link copied'); }}>
              <Share2 className="w-3.5 h-3.5 mr-1.5" />Share
            </Button>
            <Button size="sm" className="h-9 bg-navy hover:bg-navy/90 text-navy-foreground text-[12.5px]">
              <Users className="w-3.5 h-3.5 mr-1.5" />Candidates ({job.inPipeline})
            </Button>
          </div>
        </div>

        {/* Operational action row */}
        <div className="hnx-card p-3 mb-5 flex items-center gap-2 flex-wrap">
          <ActionButton
            icon={Layers}
            label={tpl === 'not_built' ? 'Create Template' : 'Job Template'}
            sub={tpl === 'ready' ? 'Ready' : tpl === 'draft' ? 'Draft' : 'Not built'}
            tone={tpl === 'ready' ? 'green' : tpl === 'draft' ? 'amber' : 'navy'}
            onClick={() => navigate(`/jobs/${job.id}/template`)}
            primary
          />
          <ActionButton
            icon={Brain}
            label={mcqStatus === 'ready' ? 'Edit MCQ Assessment' : 'Create MCQ Assessment'}
            sub={mcqStatus === 'ready' ? 'Attached' : mcqStatus === 'draft' ? 'Draft' : mcqRound ? 'Not built' : 'No MCQ round'}
            tone={mcqStatus === 'ready' ? 'green' : mcqStatus === 'draft' ? 'amber' : 'teal'}
            onClick={handleMCQ}
            disabled={!mcqRound && tpl !== 'ready'}
          />
          <ActionButton
            icon={Code2}
            label={codingStatus === 'ready' ? 'Edit Coding Assessment' : 'Create Coding Assessment'}
            sub={codingStatus === 'ready' ? 'Attached' : codingStatus === 'draft' ? 'Draft' : codingRound ? 'Not built' : 'No Coding round'}
            tone={codingStatus === 'ready' ? 'green' : codingStatus === 'draft' ? 'amber' : 'teal'}
            onClick={handleCoding}
            disabled={!codingRound && tpl !== 'ready'}
          />
          <div className="flex-1" />
          <ActionButton
            icon={UserPlus}
            label="Add Resumes"
            sub="Bulk upload"
            tone="muted"
            onClick={() => toast.info('Resume upload (coming soon)')}
          />
        </div>

        {/* Job summary strip */}
        <div className="hnx-card-elevated mb-5 grid grid-cols-7 divide-x">
          {[
            { label: 'Job Type', value: job.employmentType },
            { label: 'Work Mode', value: job.workMode },
            { label: 'Openings', value: job.openings },
            { label: 'Experience', value: job.experienceBand },
            { label: 'Applicants', value: job.applicants },
            { label: 'In Pipeline', value: job.inPipeline },
            { label: 'Posted', value: new Date(job.postedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) },
          ].map(s => (
            <div key={s.label} className="p-3.5">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">{s.label}</p>
              <p className="text-[15px] font-bold tabular-nums text-navy mt-0.5 leading-tight">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-3 gap-5">
          {/* LEFT — Content (2 cols) */}
          <div className="col-span-2 space-y-5">
            {/* Pipeline Overview */}
            <div className="hnx-card p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center">
                    <Activity className="w-3.5 h-3.5 text-primary" strokeWidth={2.5} />
                  </div>
                  <h2 className="hnx-section-title">Pipeline Overview</h2>
                </div>
                <span className="text-[11px] text-muted-foreground">{job.applicants} total applicants</span>
              </div>
              <div className="flex items-stretch gap-1.5">
                {job.rounds.map((r, i) => {
                  const meta = ROUND_META[r.type];
                  const count = Math.max(0, Math.round(job.applicants * Math.pow(0.55, i)));
                  const isReady = r.assessmentStatus === 'ready' || (r.type !== 'MCQ' && r.type !== 'Coding');
                  return (
                    <div key={r.id} className="flex-1 min-w-0">
                      <div className={cn(
                        'rounded-lg border p-3 h-full transition-all',
                        isReady ? 'bg-card border-border/60' : 'bg-warning/5 border-warning/30',
                      )}>
                        <div className="flex items-center gap-1.5 mb-2">
                          <RoundTypeIcon type={r.type} size="xs" />
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground truncate">{meta.shortName ?? meta.name}</span>
                        </div>
                        <p className="text-[18px] font-bold text-navy tabular-nums leading-none">{count}</p>
                        <p className="text-[10px] text-muted-foreground mt-1 truncate">{r.label}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* JD Content */}
            <div className="hnx-card p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md bg-teal-light flex items-center justify-center">
                    <FileText className="w-3.5 h-3.5 text-teal-deep" strokeWidth={2.5} />
                  </div>
                  <h2 className="hnx-section-title">Job Description</h2>
                </div>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-teal-light text-teal-deep border border-teal/20">
                  <Sparkles className="w-2.5 h-2.5" strokeWidth={2.5} />AI Parsed
                </span>
              </div>

              {/* Ribbon */}
              <div className="grid grid-cols-3 gap-3 mb-5 p-3 rounded-lg bg-muted/40 border border-border/40">
                <Ribbon icon={DollarSign} label="Salary" value="Competitive" />
                <Ribbon icon={MapPin} label="Location" value={`${job.location} · ${job.workMode}`} />
                <Ribbon icon={Clock} label="Experience" value={job.experienceBand} />
              </div>

              {/* Role Objective */}
              <Section label="About the Role">
                <p className="text-[13px] text-foreground/80 leading-relaxed">{job.roleContext.roleObjective}</p>
              </Section>

              <Section label="Key Responsibilities">
                <ul className="space-y-1.5 text-[13px] text-foreground/80 leading-relaxed">
                  {[
                    `Lead ${job.roleContext.domain.toLowerCase()} initiatives and drive strategic outcomes.`,
                    `Collaborate with cross-functional teams to deliver high-quality work.`,
                    `Mentor team members and uphold engineering/operational excellence.`,
                    `Own end-to-end execution from planning through delivery.`,
                  ].map((t, i) => (
                    <li key={i} className="flex gap-2"><span className="text-teal-deep mt-1.5 w-1 h-1 rounded-full bg-teal-deep shrink-0" />{t}</li>
                  ))}
                </ul>
              </Section>

              <Section label="Requirements">
                <ul className="space-y-1.5 text-[13px] text-foreground/80 leading-relaxed">
                  <li className="flex gap-2"><span className="text-teal-deep mt-1.5 w-1 h-1 rounded-full bg-teal-deep shrink-0" />{job.experienceBand} of relevant experience.</li>
                  <li className="flex gap-2"><span className="text-teal-deep mt-1.5 w-1 h-1 rounded-full bg-teal-deep shrink-0" />Strong foundation in {job.roleContext.primarySkills.slice(0, 3).join(', ')}.</li>
                  <li className="flex gap-2"><span className="text-teal-deep mt-1.5 w-1 h-1 rounded-full bg-teal-deep shrink-0" />Excellent communication and stakeholder management.</li>
                </ul>
              </Section>

              <Section label="Primary Skills">
                <div className="flex flex-wrap gap-1.5">
                  {job.roleContext.primarySkills.map(s => <SkillChip key={s} label={s} variant="teal" size="sm" />)}
                </div>
              </Section>
              <Section label="Secondary Skills">
                <div className="flex flex-wrap gap-1.5">
                  {job.roleContext.secondarySkills.map(s => <SkillChip key={s} label={s} variant="muted" size="sm" />)}
                </div>
              </Section>
              <Section label="Skills to Assess" last>
                <div className="flex flex-wrap gap-1.5">
                  {[...job.roleContext.primarySkills.slice(0, 3), ...(job.roleContext.mustTestTech ?? []).slice(0, 2)].map(s => (
                    <SkillChip key={s} label={s} variant="navy" size="sm" />
                  ))}
                </div>
              </Section>
            </div>

            {/* Evaluation Journey */}
            <div className="hnx-card p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center">
                    <Layers className="w-3.5 h-3.5 text-primary" strokeWidth={2.5} />
                  </div>
                  <h2 className="hnx-section-title">Evaluation Journey</h2>
                </div>
                <span className="text-[11px] text-muted-foreground">{job.rounds.length} rounds · ~{totalDuration} min</span>
              </div>
              <div className="space-y-2">
                {job.rounds.map((round, i) => {
                  const meta = ROUND_META[round.type];
                  const isReady = round.assessmentStatus === 'ready';
                  const needsBuild = (round.type === 'MCQ' || round.type === 'Coding') && !isReady;
                  return (
                    <div key={round.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50 hover:border-border transition-colors">
                      <span className="w-6 h-6 rounded-full bg-navy text-navy-foreground text-[11px] font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                      <RoundTypeIcon type={round.type} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-navy truncate">{round.label}</p>
                        <p className="text-[11px] text-muted-foreground">{meta.name} · {round.durationMin} min</p>
                      </div>
                      {(round.type === 'MCQ' || round.type === 'Coding') && (
                        <span className={cn('inline-flex items-center gap-1 text-[11px] font-semibold',
                          isReady ? 'text-hnxgreen-deep' : 'text-warning')}>
                          {isReady ? <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2.5} /> : <AlertCircle className="w-3.5 h-3.5" strokeWidth={2.5} />}
                          {isReady ? 'Ready' : 'Not built'}
                        </span>
                      )}
                      {needsBuild && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-[11px] px-2.5"
                          onClick={() => navigate(`/jobs/${job.id}/template/rounds/${round.id}/${round.type === 'MCQ' ? 'mcq-builder' : 'coding-builder'}`)}
                        >
                          Build
                          <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT — Sidebar */}
          <div className="space-y-4">
            {/* Assessment Readiness */}
            <div className="hnx-card p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="hnx-section-title">Assessment Readiness</h3>
                <span className={cn('text-[18px] font-bold tabular-nums',
                  overallReadiness === 100 ? 'text-hnxgreen-deep' : overallReadiness >= 60 ? 'text-warning' : 'text-destructive')}>
                  {overallReadiness}%
                </span>
              </div>
              <div className="hnx-progress-bar mb-4">
                <div
                  className={cn('h-full rounded-full transition-all',
                    overallReadiness === 100 ? 'bg-hnxgreen-deep' : 'bg-teal-deep')}
                  style={{ width: `${overallReadiness}%` }}
                />
              </div>
              <div className="space-y-2">
                {readinessItems.map(item => (
                  <ReadinessRow key={item.key} label={item.label} status={item.status} />
                ))}
              </div>
              {overallReadiness < 100 && (
                <Button
                  size="sm"
                  className="w-full mt-4 h-8 text-[12px] bg-navy hover:bg-navy/90"
                  onClick={() => {
                    if (tpl !== 'ready') navigate(`/jobs/${job.id}/template`);
                    else if (mcqRound && mcqStatus !== 'ready') handleMCQ();
                    else if (codingRound && codingStatus !== 'ready') handleCoding();
                  }}
                >
                  Complete missing setup
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              )}
            </div>

            {/* Quick Actions */}
            <div className="hnx-card p-5">
              <h3 className="hnx-section-title mb-3">Quick Actions</h3>
              <div className="space-y-1.5">
                <QuickAction icon={Layers} label="Job Template" onClick={() => navigate(`/jobs/${job.id}/template`)} />
                <QuickAction icon={Brain} label="Create MCQ" onClick={handleMCQ} />
                <QuickAction icon={Code2} label="Coding Assessment" onClick={handleCoding} />
                <QuickAction icon={Share2} label="Share Job Link" onClick={() => { navigator.clipboard?.writeText(window.location.href); toast.success('Link copied'); }} />
                <QuickAction icon={Users} label="View All Candidates" onClick={() => toast.info('Candidates list (coming soon)')} />
              </div>
            </div>

            {/* Job Stats */}
            <div className="hnx-card p-5">
              <h3 className="hnx-section-title mb-3">Job Stats</h3>
              <div className="space-y-2.5">
                <StatRow label="Total Applications" value={job.applicants} />
                <StatRow label="In Screening" value={Math.round(job.inPipeline * 0.5)} />
                <StatRow label="In Interview" value={Math.round(job.inPipeline * 0.2)} />
                <StatRow label="Rejected" value={Math.round(job.applicants * 0.4)} muted />
                <StatRow label="Hired" value={0} />
                <StatRow label="Days Active" value={Math.max(1, Math.round((Date.now() - new Date(job.postedAt).getTime()) / 86400000))} />
              </div>
            </div>

            {/* Job Details */}
            <div className="hnx-card p-5">
              <h3 className="hnx-section-title mb-3">Job Details</h3>
              <div className="space-y-2.5 text-[12.5px]">
                <DetailRow icon={Building2} label="Company" value="HireNowX" />
                <DetailRow icon={Mail} label="Recruiter" value={`${job.roleContext.hiringManager.toLowerCase().replace(' ', '.')}@hirenowx.com`} />
                <DetailRow icon={Briefcase} label="Job Type" value={job.employmentType} />
                <DetailRow icon={MapPin} label="Work Mode" value={job.workMode} />
                <DetailRow icon={DollarSign} label="Salary" value="Competitive" />
                <DetailRow icon={CircleDot} label="Status" value={job.status} />
                <DetailRow icon={Calendar} label="Posted" value={new Date(job.postedAt).toLocaleDateString()} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Missing round modal */}
      <Dialog open={!!missingRound} onOpenChange={open => !open && setMissingRound(null)}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <div className="w-10 h-10 rounded-lg bg-warning/15 flex items-center justify-center mb-2">
              <AlertCircle className="w-5 h-5 text-warning" strokeWidth={2.5} />
            </div>
            <DialogTitle className="text-[18px]">No {missingRound} round in template</DialogTitle>
            <DialogDescription className="text-[13px] leading-relaxed">
              This job's template doesn't include a {missingRound} round yet. Add one to the template, then return here to build the assessment.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setMissingRound(null)}>Cancel</Button>
            <Button
              className="bg-navy hover:bg-navy/90"
              onClick={() => { setMissingRound(null); navigate(`/jobs/${job.id}/template`); }}
            >
              Open Job Template
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

// ───────────────────────── Subcomponents ─────────────────────────

function ActionButton({
  icon: Icon, label, sub, tone, onClick, disabled, primary,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string; sub: string;
  tone: 'green' | 'teal' | 'navy' | 'amber' | 'muted';
  onClick: () => void; disabled?: boolean; primary?: boolean;
}) {
  const toneMap = {
    green: 'bg-hnxgreen/10 text-hnxgreen-deep border-hnxgreen/30',
    teal: 'bg-teal-light text-teal-deep border-teal/30',
    navy: 'bg-navy/5 text-navy border-navy/20',
    amber: 'bg-warning/10 text-warning border-warning/30',
    muted: 'bg-muted text-muted-foreground border-border',
  } as const;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'group flex items-center gap-2.5 px-3.5 py-2 rounded-lg border transition-all text-left',
        'hover:shadow-md hover:-translate-y-px disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none disabled:cursor-not-allowed',
        primary ? 'bg-navy text-navy-foreground border-navy hover:bg-navy/90' : 'bg-card border-border hover:border-navy/40',
      )}
    >
      <div className={cn('w-8 h-8 rounded-md flex items-center justify-center border', primary ? 'bg-navy-foreground/10 border-navy-foreground/20 text-navy-foreground' : toneMap[tone])}>
        <Icon className="w-4 h-4" strokeWidth={2.25} />
      </div>
      <div className="min-w-0">
        <p className={cn('text-[12.5px] font-semibold leading-tight', primary ? 'text-navy-foreground' : 'text-navy')}>{label}</p>
        <p className={cn('text-[10.5px] leading-tight mt-0.5', primary ? 'text-navy-foreground/70' : 'text-muted-foreground')}>{sub}</p>
      </div>
    </button>
  );
}

function Ribbon({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-md bg-card border border-border/60 flex items-center justify-center shrink-0">
        <Icon className="w-3.5 h-3.5 text-teal-deep" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</p>
        <p className="text-[12.5px] font-semibold text-navy truncate">{value}</p>
      </div>
    </div>
  );
}

function Section({ label, children, last }: { label: string; children: React.ReactNode; last?: boolean }) {
  return (
    <div className={cn(!last && 'mb-4 pb-4 border-b border-border/50')}>
      <p className="hnx-label mb-2">{label}</p>
      {children}
    </div>
  );
}

function ReadinessRow({ label, status }: { label: string; status: string }) {
  const cfg = {
    ready: { icon: CheckCircle2, color: 'text-hnxgreen-deep', text: 'Ready' },
    draft: { icon: AlertCircle, color: 'text-warning', text: 'Draft' },
    not_built: { icon: AlertCircle, color: 'text-warning', text: 'Not built' },
    missing: { icon: AlertCircle, color: 'text-muted-foreground', text: 'Not added' },
  }[status] ?? { icon: AlertCircle, color: 'text-muted-foreground', text: status };
  const Icon = cfg.icon;
  return (
    <div className="flex items-center justify-between text-[12px]">
      <div className="flex items-center gap-2">
        <Icon className={cn('w-3.5 h-3.5', cfg.color)} strokeWidth={2.5} />
        <span className="text-foreground/80">{label}</span>
      </div>
      <span className={cn('font-semibold', cfg.color)}>{cfg.text}</span>
    </div>
  );
}

function QuickAction({ icon: Icon, label, onClick }: { icon: React.ComponentType<{ className?: string }>; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[12.5px] text-foreground/80 hover:bg-muted/60 hover:text-navy transition-colors text-left group"
    >
      <Icon className="w-3.5 h-3.5 text-muted-foreground group-hover:text-teal-deep transition-colors" />
      <span className="font-medium">{label}</span>
      <ArrowRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 text-muted-foreground transition-opacity" />
    </button>
  );
}

function StatRow({ label, value, muted }: { label: string; value: number; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between text-[12.5px]">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn('font-bold tabular-nums', muted ? 'text-muted-foreground' : 'text-navy')}>{value}</span>
    </div>
  );
}

function DetailRow({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-[10.5px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</p>
        <p className="text-[12.5px] text-navy font-medium truncate">{value}</p>
      </div>
    </div>
  );
}
