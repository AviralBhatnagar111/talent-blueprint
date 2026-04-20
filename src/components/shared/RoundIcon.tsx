import {
  ClipboardCheck, Brain, Code2, Mic, Users, UserCheck, FileText, CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RoundType } from '@/types/hirenowx';

export const ROUND_META: Record<RoundType, { icon: any; name: string; description: string; tone: string }> = {
  Screening: { icon: ClipboardCheck, name: 'Screening', description: 'Automated pre-qualification from application data', tone: 'bg-blue-light text-primary' },
  MCQ: { icon: Brain, name: 'MCQ Assessment', description: 'AI-generated multiple-choice assessment', tone: 'bg-teal-light text-teal-deep' },
  Coding: { icon: Code2, name: 'Coding Round', description: 'Hands-on coding challenge with test cases', tone: 'bg-green-light text-hnxgreen-deep' },
  AIInterview: { icon: Mic, name: 'AI Avatar Interview', description: 'Voice-based AI interview with scoring', tone: 'bg-primary/10 text-primary' },
  ManualInterview: { icon: Users, name: 'Manual Interview', description: 'Panel interview with team members', tone: 'bg-navy/10 text-navy' },
  HR: { icon: UserCheck, name: 'HR Round', description: 'Culture fit, compensation, offer alignment', tone: 'bg-warning-light text-warning' },
  TakeHome: { icon: FileText, name: 'Take-home Assignment', description: 'Extended project completed asynchronously', tone: 'bg-muted text-foreground/70' },
  FinalApproval: { icon: CheckCircle2, name: 'Final Approval', description: 'Final hiring decision and offer extension', tone: 'bg-green-light text-hnxgreen-deep' },
};

export function RoundTypeIcon({ type, size = 'md' }: { type: RoundType; size?: 'sm' | 'md' | 'lg' }) {
  const meta = ROUND_META[type];
  const Icon = meta.icon;
  const sizes = {
    sm: 'w-7 h-7 [&>svg]:w-3.5 [&>svg]:h-3.5',
    md: 'w-9 h-9 [&>svg]:w-4 [&>svg]:h-4',
    lg: 'w-11 h-11 [&>svg]:w-5 [&>svg]:h-5',
  };
  return (
    <div className={cn('rounded-lg flex items-center justify-center shrink-0', meta.tone, sizes[size])}>
      <Icon strokeWidth={2.2} />
    </div>
  );
}
