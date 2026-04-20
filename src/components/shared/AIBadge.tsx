import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AIBadge({ label = 'AI Parsed', className }: { label?: string; className?: string }) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider',
      'bg-teal-light text-teal-deep border border-teal/20',
      className
    )}>
      <Sparkles className="w-2.5 h-2.5" strokeWidth={2.5} />
      {label}
    </span>
  );
}
