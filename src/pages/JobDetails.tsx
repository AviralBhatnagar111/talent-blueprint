import { Link, useParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { useStore } from '@/store/useStore';
import {
  ArrowLeft, MapPin, Briefcase, Clock, Users, Target,
  Layers, CheckCircle2, AlertCircle, ArrowRight, Sparkles,
} from 'lucide-react';
import { SkillChip } from '@/components/shared/SkillChip';
import { RoundTypeIcon, ROUND_META } from '@/components/shared/RoundIcon';
import { cn } from '@/lib/utils';

export default function JobDetails() {
  const { jobId } = useParams<{ jobId: string }>();
  const job = useStore(s => s.getJob(jobId!));

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

  return (
    <AppLayout>
      <div className="max-w-[1280px] mx-auto p-8">
        {/* Back */}
        <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2 h-8">
          <Link to="/jobs"><ArrowLeft className="w-3.5 h-3.5 mr-1.5" />Jobs</Link>
        </Button>

        {/* Hero */}
        <div className="hnx-card-elevated overflow-hidden mb-6">
          <div className="gradient-navy p-6 text-navy-foreground">
            <div className="flex items-start justify-between gap-6">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-hnxgreen/20 text-hnxgreen border border-hnxgreen/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-hnxgreen animate-pulse" />
                    {job.status}
                  </span>
                  <span className="text-[11px] text-navy-foreground/60">JOB-{job.id.toUpperCase()}</span>
                </div>
                <h1 className="text-[28px] font-bold tracking-tight">{job.title}</h1>
                <div className="flex flex-wrap items-center gap-4 mt-3 text-[13px] text-navy-foreground/80">
                  <span className="flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5" />{job.department}</span>
                  <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{job.location} · {job.workMode}</span>
                  <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{job.experienceBand}</span>
                  <span className="flex items-center gap-1.5"><Target className="w-3.5 h-3.5" />{job.openings} opening{job.openings > 1 ? 's' : ''}</span>
                </div>
              </div>
              <Button asChild size="lg" className="bg-hnxgreen hover:bg-hnxgreen-deep text-navy font-bold shadow-green-glow">
                <Link to={`/jobs/${job.id}/template`}>
                  {tpl === 'not_built' ? 'Create Template' : 'Edit Template'}
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-4 divide-x border-t">
            {[
              { label: 'Applicants', value: job.applicants },
              { label: 'In Pipeline', value: job.inPipeline },
              { label: 'Rounds', value: job.rounds.length },
              { label: 'Assessments Ready', value: `${readyCount}/${job.rounds.length}` },
            ].map(s => (
              <div key={s.label} className="p-4">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">{s.label}</p>
                <p className="text-[22px] font-bold tabular-nums text-navy mt-1 leading-none">{s.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Left — role details */}
          <div className="col-span-2 space-y-5">
            {/* Role Context */}
            <div className="hnx-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-md bg-teal-light flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-teal-deep" strokeWidth={2.5} />
                </div>
                <h2 className="hnx-section-title">Role Context</h2>
                <span className="ml-auto inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-teal-light text-teal-deep border border-teal/20">
                  <Sparkles className="w-2.5 h-2.5" strokeWidth={2.5} />AI Parsed
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <Field label="Level" value={job.roleContext.roleLevel} />
                <Field label="Industry" value={job.roleContext.industry} />
                <Field label="Domain" value={job.roleContext.domain} />
                <Field label="Sub-domain" value={job.roleContext.subDomain} />
                <Field label="Hiring Manager" value={job.roleContext.hiringManager} />
                <Field label="Employment" value={job.employmentType} />
              </div>
              <div className="mb-4">
                <p className="hnx-label mb-2">Primary Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {job.roleContext.primarySkills.map(s => <SkillChip key={s} label={s} variant="teal" size="sm" />)}
                </div>
              </div>
              <div className="mb-4">
                <p className="hnx-label mb-2">Secondary Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {job.roleContext.secondarySkills.map(s => <SkillChip key={s} label={s} variant="muted" size="sm" />)}
                </div>
              </div>
              <div>
                <p className="hnx-label mb-1.5">Role Objective</p>
                <p className="text-[13px] text-foreground/80 leading-relaxed">{job.roleContext.roleObjective}</p>
              </div>
            </div>

            {/* Rounds summary */}
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
                  return (
                    <div key={round.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
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
                          {isReady ? 'Assessment Ready' : 'Not built'}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right — sidebar */}
          <div className="space-y-4">
            <div className="hnx-card p-5">
              <h3 className="hnx-section-title mb-3">Pipeline Overview</h3>
              <div className="space-y-3">
                {[
                  { label: 'Applied', value: job.applicants, color: 'bg-muted' },
                  { label: 'Screening', value: Math.round(job.inPipeline * 0.6), color: 'bg-primary/40' },
                  { label: 'Assessment', value: Math.round(job.inPipeline * 0.3), color: 'bg-teal/60' },
                  { label: 'Interview', value: Math.round(job.inPipeline * 0.1), color: 'bg-hnxgreen-deep' },
                ].map(stage => (
                  <div key={stage.label}>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-muted-foreground font-medium">{stage.label}</span>
                      <span className="font-semibold tabular-nums">{stage.value}</span>
                    </div>
                    <div className="hnx-progress-bar">
                      <div className={cn('h-full rounded-full', stage.color)} style={{ width: `${(stage.value / job.applicants) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="hnx-card p-5 gradient-ai-banner border-teal/30">
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-teal-deep shrink-0 mt-0.5" strokeWidth={2.5} />
                <div>
                  <p className="text-[12px] font-semibold text-navy mb-1">AI Suggestion</p>
                  <p className="text-[11px] text-foreground/80 leading-relaxed">
                    {tpl === 'not_built'
                      ? 'No template yet. Create one to start evaluating candidates with AI-powered screening.'
                      : tpl === 'draft'
                      ? 'Template has unbuilt assessments. Finish them to auto-trigger candidate evaluations.'
                      : 'Template is ready. Candidates will flow through the evaluation journey automatically.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="hnx-label mb-0.5">{label}</p>
      <p className="text-[13px] font-semibold text-foreground">{value}</p>
    </div>
  );
}
