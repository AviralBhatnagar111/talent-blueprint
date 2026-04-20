import { useState, useEffect } from 'react';
import { Check, Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GenerationLoaderProps {
  steps: string[];
  title?: string;
  subtitle?: string;
  onComplete: () => void;
}

export function GenerationLoader({ steps, title = 'Building your assessment', subtitle = 'Takes about 10 seconds', onComplete }: GenerationLoaderProps) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (current >= steps.length) {
      const t = setTimeout(onComplete, 500);
      return () => clearTimeout(t);
    }
    const delay = 550 + Math.random() * 450;
    const t = setTimeout(() => setCurrent(c => c + 1), delay);
    return () => clearTimeout(t);
  }, [current, steps.length, onComplete]);

  const progress = Math.round((current / steps.length) * 100);

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center animate-fade-in-fast">
      <div className="w-full max-w-md mx-auto px-6">
        <div className="hnx-card-elevated p-8 relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-teal/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />

          <div className="relative text-center">
            <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-5 shadow-teal-glow animate-pulse-ring">
              <Sparkles className="w-6 h-6 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <h3 className="text-[17px] font-bold text-navy mb-1 tracking-tight">{title}</h3>
            <p className="text-[13px] text-muted-foreground mb-6">{subtitle}</p>

            <div className="h-1 bg-muted rounded-full overflow-hidden mb-6">
              <div className="h-full gradient-accent transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>

            <div className="space-y-1 text-left">
              {steps.map((step, i) => {
                const done = i < current;
                const active = i === current;
                return (
                  <div key={i} className={cn(
                    'flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] transition-all',
                    done && 'text-muted-foreground',
                    active && 'bg-teal-light/60 text-teal-deep font-medium',
                    !done && !active && 'text-muted-foreground/40',
                  )}>
                    {done ? <Check className="w-3.5 h-3.5 text-hnxgreen-deep shrink-0" strokeWidth={3} />
                      : active ? <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" strokeWidth={2.5} />
                      : <div className="w-3.5 h-3.5 rounded-full border-2 border-current opacity-25 shrink-0" />}
                    {step}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
