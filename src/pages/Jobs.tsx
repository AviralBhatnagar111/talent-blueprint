import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Plus, Search, MapPin, Briefcase, CheckCircle2, Circle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';

export default function Jobs() {
  const jobs = useStore(s => s.jobs);

  return (
    <AppLayout>
      <div className="p-8 max-w-[1280px] mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[24px] font-bold tracking-tight text-navy">Jobs</h1>
            <p className="text-[13px] text-muted-foreground mt-0.5">{jobs.length} active roles</p>
          </div>
          <Button size="sm" className="bg-navy hover:bg-navy-soft text-navy-foreground">
            <Plus className="w-3.5 h-3.5 mr-1.5" />Create Job
          </Button>
        </div>

        <div className="hnx-card mb-4">
          <div className="flex items-center gap-2 p-3 border-b">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                placeholder="Search jobs…"
                className="h-8 w-full rounded-md border border-input bg-muted/30 pl-8 pr-3 text-[13px] focus:outline-none focus:border-primary focus:bg-card"
              />
            </div>
            {['All', 'Open', 'Draft', 'Closed'].map((f, i) => (
              <button key={f} className={cn(
                'px-3 h-8 rounded-md text-[12px] font-medium transition-colors',
                i === 0 ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
              )}>{f}</button>
            ))}
          </div>
          <table className="w-full">
            <thead>
              <tr className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                <th className="px-4 py-2.5">Role</th>
                <th className="px-4 py-2.5">Template</th>
                <th className="px-4 py-2.5">Applicants</th>
                <th className="px-4 py-2.5">Pipeline</th>
                <th className="px-4 py-2.5">Posted</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {jobs.map(job => {
                const tpl = job.templateStatus;
                const Icon = tpl === 'ready' ? CheckCircle2 : tpl === 'draft' ? Clock : Circle;
                const tone = tpl === 'ready' ? 'text-hnxgreen-deep' : tpl === 'draft' ? 'text-warning' : 'text-muted-foreground';
                return (
                  <tr key={job.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <Link to={`/jobs/${job.id}`} className="block">
                        <p className="font-semibold text-navy text-[13px] group-hover:underline">{job.title}</p>
                        <p className="text-[11px] text-muted-foreground flex items-center gap-2 mt-0.5">
                          <Briefcase className="w-3 h-3" />{job.department}
                          <span>·</span>
                          <MapPin className="w-3 h-3" />{job.location}
                        </p>
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('inline-flex items-center gap-1.5 text-[12px] font-medium', tone)}>
                        <Icon className="w-3.5 h-3.5" strokeWidth={2.5} />
                        {tpl === 'ready' ? 'Ready' : tpl === 'draft' ? 'Draft' : 'Not built'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[13px] tabular-nums font-semibold">{job.applicants}</td>
                    <td className="px-4 py-3 text-[13px] tabular-nums font-semibold">{job.inPipeline}</td>
                    <td className="px-4 py-3 text-[12px] text-muted-foreground">{job.postedAt}</td>
                    <td className="px-4 py-3 text-right">
                      <Button asChild size="sm" variant="ghost" className="h-7 text-[12px]">
                        <Link to={`/jobs/${job.id}`}>Open →</Link>
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
