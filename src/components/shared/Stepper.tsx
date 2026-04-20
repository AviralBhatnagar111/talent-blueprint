import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepperProps {
  steps: { number: number; label: string }[];
  currentStep: number;
  onStepClick?: (n: number) => void;
}

export function Stepper({ steps, currentStep, onStepClick }: StepperProps) {
  return (
    <div className="flex items-center gap-2">
      {steps.map((s, i) => {
        const active = s.number === currentStep;
        const done = s.number < currentStep;
        const clickable = done || active;
        return (
          <div key={s.number} className="flex items-center gap-2">
            <button
              type="button"
              disabled={!clickable}
              onClick={() => clickable && onStepClick?.(s.number)}
              className={cn(
                'flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border text-[12px] font-semibold transition-all',
                active && 'bg-primary text-primary-foreground border-primary shadow-sm',
                done && 'bg-teal-light text-teal-deep border-teal/30 hover:bg-teal-light/80 cursor-pointer',
                !active && !done && 'bg-card text-muted-foreground border-border cursor-not-allowed',
              )}
            >
              <span className={cn(
                'w-5 h-5 rounded-full flex items-center justify-center text-[10px]',
                active && 'bg-primary-foreground/20 text-primary-foreground',
                done && 'bg-teal text-primary-foreground',
                !active && !done && 'bg-muted text-muted-foreground',
              )}>
                {done ? <Check className="w-3 h-3" strokeWidth={3} /> : s.number}
              </span>
              {s.label}
            </button>
            {i < steps.length - 1 && (
              <div className={cn('w-6 h-px', done ? 'bg-teal' : 'bg-border')} />
            )}
          </div>
        );
      })}
    </div>
  );
}
