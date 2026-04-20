import { ReactNode, useState } from 'react';
import {
  ChevronDown, AlertTriangle, CheckCircle2, Sparkles, Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Competency, RoleContext } from '@/types/hirenowx';
import { SkillChip } from './SkillChip';

// ============== Primitives ==============

export function PanelSection({
  title, icon, defaultOpen = true, children, action,
}: {
  title: string;
  icon?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
  action?: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="hnx-card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full px-4 py-3 flex items-center gap-2 hover:bg-muted/40 transition-colors"
      >
        {icon && <span className="text-muted-foreground shrink-0">{icon}</span>}
        <span className="hnx-section-title flex-1 text-left">{title}</span>
        {action}
        <ChevronDown className={cn('w-4 h-4 text-muted-foreground transition-transform', open && 'rotate-180')} />
      </button>
      {open && <div className="px-4 pb-4 pt-1 animate-fade-in-fast">{children}</div>}
    </div>
  );
}

export function StatBar({ label, value, color = 'teal' }: { label: string; value: number; color?: 'teal' | 'green' | 'warning' | 'primary' }) {
  const clamped = Math.max(0, Math.min(100, value));
  const colors = {
    teal: 'bg-teal',
    green: 'bg-hnxgreen-deep',
    warning: 'bg-warning',
    primary: 'bg-primary',
  };
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[11px]">
        <span className="text-muted-foreground font-medium">{label}</span>
        <span className="text-foreground font-semibold tabular-nums">{clamped}%</span>
      </div>
      <div className="hnx-progress-bar">
        <div className={cn('h-full rounded-full transition-all duration-500', colors[color])} style={{ width: `${clamped}%` }} />
      </div>
    </div>
  );
}

export function ChecklistItem({ icon: Icon = CheckCircle2, tone = 'ok', children }: { icon?: any; tone?: 'ok' | 'warn' | 'info'; children: ReactNode }) {
  const tones = {
    ok: 'text-hnxgreen-deep',
    warn: 'text-warning',
    info: 'text-muted-foreground',
  };
  return (
    <div className="flex items-start gap-2 py-1 text-[12px]">
      <Icon className={cn('w-3.5 h-3.5 shrink-0 mt-0.5', tones[tone])} strokeWidth={2.5} />
      <span className="text-foreground/80 flex-1">{children}</span>
    </div>
  );
}

// ============== Shared section blocks ==============

export function RoleContextSection({ context }: { context: RoleContext }) {
  return (
    <PanelSection title="Role Context" icon={<Sparkles className="w-3.5 h-3.5 text-teal" strokeWidth={2.5} />} defaultOpen={false}>
      <div className="space-y-2.5 text-[12px]">
        <Row label="Role" value={context.roleTitle} />
        <Row label="Level" value={context.roleLevel} />
        <Row label="Experience" value={`${context.experienceMin}–${context.experienceMax} yrs`} />
        <Row label="Industry" value={context.industry} />
        <Row label="Domain" value={context.domain} />
        <div>
          <p className="text-muted-foreground text-[11px] font-medium mb-1.5">Primary Skills</p>
          <div className="flex flex-wrap gap-1">
            {context.primarySkills.slice(0, 5).map(s => <SkillChip key={s} label={s} variant="teal" size="xs" />)}
            {context.primarySkills.length > 5 && <span className="text-[10px] text-muted-foreground self-center">+{context.primarySkills.length - 5}</span>}
          </div>
        </div>
      </div>
    </PanelSection>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center gap-2">
      <span className="text-muted-foreground text-[11px]">{label}</span>
      <span className="text-foreground font-medium text-right truncate">{value}</span>
    </div>
  );
}

export function CompetencySection({ competencies, title = 'Competency Coverage' }: { competencies: Competency[]; title?: string }) {
  const byCat = {
    Technical: competencies.filter(c => c.category === 'Technical'),
    Domain: competencies.filter(c => c.category === 'Domain'),
    Behavioral: competencies.filter(c => c.category === 'Behavioral'),
  };
  return (
    <PanelSection title={title} icon={<Info className="w-3.5 h-3.5" />}>
      <p className="text-[11px] text-muted-foreground mb-3">
        This plan tests <span className="text-foreground font-semibold">{competencies.length} competencies</span> across 3 categories
      </p>
      <div className="flex gap-1.5 mb-4">
        {(['Technical', 'Domain', 'Behavioral'] as const).map(cat => {
          const items = byCat[cat];
          const tone = cat === 'Technical' ? 'bg-primary' : cat === 'Domain' ? 'bg-teal' : 'bg-hnxgreen-deep';
          return (
            <div key={cat} className="flex-1 text-center">
              <div className={cn('h-1 rounded-full mb-1.5', tone)} />
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{cat}</p>
              <p className="text-[15px] font-bold text-foreground tabular-nums">{items.length}</p>
            </div>
          );
        })}
      </div>
      <div className="space-y-2 max-h-56 overflow-y-auto scrollbar-thin pr-1">
        {competencies.map(c => (
          <div key={c.id} className="flex items-center gap-2">
            <span className={cn('w-1 h-3 rounded-full',
              c.category === 'Technical' ? 'bg-primary' : c.category === 'Domain' ? 'bg-teal' : 'bg-hnxgreen-deep')} />
            <span className="text-[11px] flex-1 truncate">{c.name}</span>
            <div className="w-12 h-1 rounded-full bg-muted overflow-hidden">
              <div className={cn('h-full rounded-full',
                c.coverage >= 80 ? 'bg-hnxgreen-deep' : c.coverage >= 60 ? 'bg-warning' : 'bg-destructive/70'
              )} style={{ width: `${c.coverage}%` }} />
            </div>
            <span className="text-[10px] text-muted-foreground w-7 text-right tabular-nums">{c.coverage}%</span>
          </div>
        ))}
      </div>
    </PanelSection>
  );
}

export function Recommendation({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-2 p-2.5 rounded-lg bg-teal-light/50 border border-teal/20 text-[12px]">
      <Sparkles className="w-3.5 h-3.5 text-teal shrink-0 mt-0.5" strokeWidth={2.5} />
      <span className="text-foreground/90">{children}</span>
    </div>
  );
}

export function Warning({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-2 p-2.5 rounded-lg bg-warning-light border border-warning/20 text-[12px]">
      <AlertTriangle className="w-3.5 h-3.5 text-warning shrink-0 mt-0.5" strokeWidth={2.5} />
      <span className="text-foreground/90">{children}</span>
    </div>
  );
}

// Container
export function IntelligencePanel({ children }: { children: ReactNode }) {
  return (
    <aside className="w-[340px] shrink-0 hidden xl:block">
      <div className="sticky top-[84px] space-y-3 pb-8">
        <div className="flex items-center gap-2 px-1">
          <div className="w-6 h-6 rounded-md bg-teal-light flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-teal-deep" strokeWidth={2.5} />
          </div>
          <h2 className="text-[13px] font-bold text-navy tracking-tight">Intelligence Panel</h2>
          <span className="ml-auto text-[10px] text-muted-foreground font-medium">Live</span>
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-teal" />
          </span>
        </div>
        {children}
      </div>
    </aside>
  );
}
