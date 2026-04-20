import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ContextTopBarProps {
  backTo: string;
  backLabel?: string;
  breadcrumbs: { label: string; to?: string }[];
  chips?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function ContextTopBar({ backTo, backLabel = 'Back', breadcrumbs, chips, actions, className }: ContextTopBarProps) {
  return (
    <div className={cn('sticky top-0 z-30 gradient-navy text-navy-foreground border-b border-navy-soft shadow-navy', className)}>
      <div className="px-6 py-3 flex items-center gap-4">
        <Button asChild variant="ghost" size="sm" className="h-8 px-2 text-navy-foreground/90 hover:bg-white/10 hover:text-navy-foreground -ml-2">
          <Link to={backTo}>
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
            <span className="text-[12px] font-medium">{backLabel}</span>
          </Link>
        </Button>
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {breadcrumbs.map((b, i) => (
            <div key={i} className="flex items-center gap-2 min-w-0">
              {i > 0 && <span className="text-navy-foreground/30">/</span>}
              {b.to ? (
                <Link to={b.to} className="text-[13px] text-navy-foreground/70 hover:text-navy-foreground truncate">{b.label}</Link>
              ) : (
                <span className="text-[13px] text-navy-foreground font-semibold truncate">{b.label}</span>
              )}
            </div>
          ))}
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
      {chips && (
        <div className="px-6 pb-3 flex items-center gap-2 flex-wrap">{chips}</div>
      )}
    </div>
  );
}

export function NavyChip({ children, tone = 'default' }: { children: React.ReactNode; tone?: 'default' | 'teal' | 'green' }) {
  const styles = {
    default: 'bg-white/10 text-navy-foreground/90 border-white/10',
    teal: 'bg-teal/20 text-teal border-teal/30',
    green: 'bg-hnxgreen/20 text-hnxgreen border-hnxgreen/30',
  };
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium border', styles[tone])}>
      {children}
    </span>
  );
}
