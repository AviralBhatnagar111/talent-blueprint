import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Briefcase, Users, TrendingUp, Clock, ArrowUpRight, Plus, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';

export default function Index() {
  const jobs = useStore(s => s.jobs);

  const stats = [
    { label: 'Open Jobs', value: jobs.filter(j => j.status === 'Open').length, icon: Briefcase, tone: 'text-primary bg-primary/10' },
    { label: 'Total Applicants', value: jobs.reduce((a, j) => a + j.applicants, 0), icon: Users, tone: 'text-teal bg-teal-light' },
    { label: 'In Pipeline', value: jobs.reduce((a, j) => a + j.inPipeline, 0), icon: TrendingUp, tone: 'text-hnxgreen-deep bg-green-light' },
    { label: 'Avg. Time-to-Hire', value: '18d', icon: Clock, tone: 'text-navy bg-navy/10' },
  ];

  return (
    <AppLayout>
      <div className="p-8 max-w-[1280px] mx-auto">
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-[26px] font-bold tracking-tight text-navy">Welcome back, Sarah</h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-teal-light text-teal-deep border border-teal/20">
                <Sparkles className="w-2.5 h-2.5" strokeWidth={2.5} /> AI On
              </span>
            </div>
            <p className="text-[14px] text-muted-foreground">Your hiring intelligence — at a glance.</p>
          </div>
          <Button asChild size="sm" className="bg-navy hover:bg-navy-soft text-navy-foreground">
            <Link to="/jobs"><Plus className="w-3.5 h-3.5 mr-1.5" />New Job</Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {stats.map(s => (
            <div key={s.label} className="hnx-card p-5">
              <div className="flex items-start justify-between mb-3">
                <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center', s.tone)}>
                  <s.icon className="w-4 h-4" strokeWidth={2.2} />
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground/40" />
              </div>
              <p className="text-[26px] font-bold tabular-nums text-navy leading-none">{s.value}</p>
              <p className="text-[12px] text-muted-foreground mt-1.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Active jobs */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[15px] font-bold text-navy tracking-tight">Active Jobs</h2>
          <Link to="/jobs" className="text-[12px] text-primary font-semibold hover:underline">View all →</Link>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {jobs.map(job => {
            const tpl = job.templateStatus;
            const statusTone = tpl === 'ready' ? 'text-hnxgreen-deep bg-green-light border-hnxgreen/20'
              : tpl === 'draft' ? 'text-warning bg-warning-light border-warning/20'
              : 'text-muted-foreground bg-muted border-border';
            const statusLabel = tpl === 'ready' ? 'Template Ready' : tpl === 'draft' ? 'Template Draft' : 'Setup Needed';
            const StatusIcon = tpl === 'ready' ? CheckCircle2 : AlertCircle;
            return (
              <Link
                key={job.id}
                to={`/jobs/${job.id}`}
                className="hnx-card-interactive p-5 block group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="min-w-0">
                    <h3 className="font-bold text-navy text-[15px] tracking-tight truncate">{job.title}</h3>
                    <p className="text-[12px] text-muted-foreground mt-0.5">{job.department} · {job.location} · {job.experienceBand}</p>
                  </div>
                  <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border', statusTone)}>
                    <StatusIcon className="w-2.5 h-2.5" strokeWidth={2.5} />
                    {statusLabel}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border/50">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Applicants</p>
                    <p className="text-[18px] font-bold tabular-nums text-foreground mt-0.5">{job.applicants}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">In Pipeline</p>
                    <p className="text-[18px] font-bold tabular-nums text-foreground mt-0.5">{job.inPipeline}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Openings</p>
                    <p className="text-[18px] font-bold tabular-nums text-foreground mt-0.5">{job.openings}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
