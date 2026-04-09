import { useState, useEffect } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GenerationLoaderProps {
  steps: string[];
  onComplete: () => void;
}

export function GenerationLoader({ steps, onComplete }: GenerationLoaderProps) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (currentStep >= steps.length) {
      const t = setTimeout(onComplete, 600);
      return () => clearTimeout(t);
    }
    const delay = 800 + Math.random() * 1200;
    const t = setTimeout(() => setCurrentStep(s => s + 1), delay);
    return () => clearTimeout(t);
  }, [currentStep, steps.length, onComplete]);

  const progress = Math.round((currentStep / steps.length) * 100);

  return (
    <div className="flex items-center justify-center min-h-[400px] animate-fade-in">
      <div className="w-full max-w-md mx-auto text-center">
        <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-6">
          <Loader2 className="w-8 h-8 text-primary-foreground animate-spin" />
        </div>
        <h3 className="text-lg font-semibold mb-1">Generating Assessment</h3>
        <p className="text-sm text-muted-foreground mb-6">AI is building your assessment with role-aware intelligence</p>

        <div className="hnx-progress-bar mb-6">
          <div className="h-full rounded-full gradient-accent transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>

        <div className="space-y-2 text-left">
          {steps.map((step, i) => {
            const done = i < currentStep;
            const active = i === currentStep;
            return (
              <div key={i} className={cn(
                'flex items-center gap-3 px-4 py-2 rounded-lg transition-all text-sm',
                done && 'text-muted-foreground',
                active && 'bg-primary/5 text-primary font-medium',
                !done && !active && 'text-muted-foreground/40'
              )}>
                {done ? (
                  <Check className="w-4 h-4 text-accent shrink-0" />
                ) : active ? (
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-current opacity-30 shrink-0" />
                )}
                {step}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
