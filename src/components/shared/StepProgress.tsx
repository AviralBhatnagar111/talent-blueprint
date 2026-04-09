import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  number: number;
  label: string;
  description?: string;
}

interface StepProgressProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export function StepProgress({ steps, currentStep, onStepClick }: StepProgressProps) {
  return (
    <div className="flex items-center gap-1 w-full">
      {steps.map((step, i) => {
        const isActive = step.number === currentStep;
        const isComplete = step.number < currentStep;
        const isPending = step.number > currentStep;

        return (
          <div key={step.number} className="flex items-center flex-1 last:flex-none">
            <button
              onClick={() => onStepClick?.(step.number)}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all text-left',
                isActive && 'bg-primary/10',
                isComplete && 'cursor-pointer hover:bg-accent/10',
                isPending && 'opacity-50'
              )}
            >
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 transition-all',
                isActive && 'hnx-stepper-active',
                isComplete && 'hnx-stepper-complete',
                isPending && 'hnx-stepper-pending'
              )}>
                {isComplete ? <Check className="w-4 h-4" /> : step.number}
              </div>
              <div className="hidden lg:block min-w-0">
                <p className={cn(
                  'text-xs font-semibold truncate',
                  isActive ? 'text-primary' : isComplete ? 'text-accent' : 'text-muted-foreground'
                )}>
                  {step.label}
                </p>
                {step.description && (
                  <p className="text-[10px] text-muted-foreground truncate">{step.description}</p>
                )}
              </div>
            </button>
            {i < steps.length - 1 && (
              <div className={cn(
                'flex-1 h-0.5 mx-1 rounded-full min-w-[16px]',
                isComplete ? 'bg-accent' : 'bg-border'
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}
