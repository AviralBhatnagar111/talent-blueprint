import { X, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SkillChipProps {
  label: string;
  variant?: 'primary' | 'teal' | 'green' | 'muted' | 'ai' | 'navy';
  removable?: boolean;
  onRemove?: () => void;
  size?: 'xs' | 'sm' | 'md';
  onClick?: () => void;
}

export function SkillChip({ label, variant = 'muted', removable, onRemove, size = 'sm', onClick }: SkillChipProps) {
  const styles = {
    primary: 'bg-primary/10 text-primary border-primary/20',
    teal: 'bg-teal-light text-teal-deep border-teal/30',
    green: 'bg-green-light text-hnxgreen-deep border-hnxgreen/30',
    navy: 'bg-navy/5 text-navy border-navy/20',
    muted: 'bg-muted text-foreground/80 border-border',
    ai: 'bg-gradient-to-r from-teal-light to-blue-light text-teal-deep border-teal/30',
  };
  const sizes = {
    xs: 'px-2 py-0.5 text-[10px]',
    sm: 'px-2 py-0.5 text-[11px]',
    md: 'px-2.5 py-1 text-xs',
  };

  return (
    <span
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1 rounded-md border font-medium transition-colors',
        styles[variant], sizes[size],
        onClick && 'cursor-pointer hover:shadow-sm',
      )}
    >
      {variant === 'ai' && <Sparkles className="w-2.5 h-2.5" strokeWidth={2.5} />}
      <span className="truncate">{label}</span>
      {removable && (
        <button onClick={(e) => { e.stopPropagation(); onRemove?.(); }} className="ml-0.5 hover:opacity-70 shrink-0">
          <X className="w-2.5 h-2.5" strokeWidth={2.5} />
        </button>
      )}
    </span>
  );
}
