import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SkillChipProps {
  label: string;
  variant?: 'primary' | 'teal' | 'green' | 'muted' | 'ai';
  removable?: boolean;
  onRemove?: () => void;
  size?: 'sm' | 'md';
}

export function SkillChip({ label, variant = 'muted', removable, onRemove, size = 'sm' }: SkillChipProps) {
  const styles = {
    primary: 'bg-primary/10 text-primary border-primary/20',
    teal: 'bg-teal-light text-teal border-teal/20',
    green: 'bg-green-light text-hnxgreen border-hnxgreen/20',
    muted: 'bg-muted text-muted-foreground border-border',
    ai: 'bg-primary/5 text-primary border-primary/30 border-dashed',
  };

  return (
    <span className={cn(
      'hnx-chip inline-flex items-center gap-1',
      styles[variant],
      size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
    )}>
      {variant === 'ai' && <span className="text-[10px]">✨</span>}
      {label}
      {removable && (
        <button onClick={onRemove} className="ml-0.5 hover:opacity-70">
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
}
