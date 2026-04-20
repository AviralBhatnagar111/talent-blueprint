import { cn } from '@/lib/utils';

interface DifficultyBarProps {
  easy: number;
  medium: number;
  hard: number;
  showLabels?: boolean;
  height?: 'sm' | 'md';
  className?: string;
}

export function DifficultyBar({ easy, medium, hard, showLabels = true, height = 'md', className }: DifficultyBarProps) {
  const h = height === 'sm' ? 'h-2' : 'h-3';
  return (
    <div className={cn('space-y-2', className)}>
      <div className={cn('flex rounded-full overflow-hidden bg-muted', h)}>
        <div className="bg-hnxgreen-deep transition-all" style={{ width: `${easy}%` }} />
        <div className="bg-warning transition-all" style={{ width: `${medium}%` }} />
        <div className="bg-destructive/80 transition-all" style={{ width: `${hard}%` }} />
      </div>
      {showLabels && (
        <div className="flex justify-between text-[11px] font-medium">
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-hnxgreen-deep" /><span className="text-foreground">Easy</span><span className="text-muted-foreground">{easy}%</span></span>
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-warning" /><span className="text-foreground">Medium</span><span className="text-muted-foreground">{medium}%</span></span>
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-destructive/80" /><span className="text-foreground">Hard</span><span className="text-muted-foreground">{hard}%</span></span>
        </div>
      )}
    </div>
  );
}
