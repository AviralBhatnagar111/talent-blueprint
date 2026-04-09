import {
  Shield, Target, Zap, AlertTriangle, CheckCircle2,
  Clock, Users, BarChart3, RefreshCw, Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ConfidenceMetrics, Competency, Difficulty } from '@/types/hirenowx';

interface ConfidencePanelProps {
  metrics: ConfidenceMetrics;
  competencies?: Competency[];
  type?: 'plan' | 'mcq' | 'coding';
  questionStats?: {
    total: number;
    approved: number;
    byDifficulty: Record<Difficulty, number>;
    byCompetency: Record<string, number>;
    byType: Record<string, number>;
  };
}

function ConfidenceBar({ value, label, color }: { value: number; label: string; color?: string }) {
  const barColor = color || (value >= 80 ? 'bg-hnxgreen' : value >= 60 ? 'bg-warning' : 'bg-destructive');
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold">{value}%</span>
      </div>
      <div className="hnx-progress-bar">
        <div className={cn('h-full rounded-full transition-all duration-500', barColor)} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function StatItem({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color?: string }) {
  return (
    <div className="flex items-center gap-2.5 py-1.5">
      <Icon className={cn('w-4 h-4 shrink-0', color || 'text-muted-foreground')} />
      <span className="text-xs text-muted-foreground flex-1">{label}</span>
      <span className="text-xs font-semibold">{value}</span>
    </div>
  );
}

export function ConfidencePanel({ metrics, competencies, type = 'plan', questionStats }: ConfidencePanelProps) {
  const readinessLabel = {
    'not-started': 'Not Started',
    'in-progress': 'In Progress',
    'review': 'Ready for Review',
    'ready': 'Ready',
  }[metrics.readinessState];

  const readinessColor = {
    'not-started': 'text-muted-foreground bg-muted',
    'in-progress': 'text-primary bg-primary/10',
    'review': 'text-warning bg-warning-light',
    'ready': 'text-hnxgreen bg-green-light',
  }[metrics.readinessState];

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Readiness */}
      <div className="hnx-card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">Readiness</h3>
          <span className={cn('hnx-badge', readinessColor)}>{readinessLabel}</span>
        </div>
        <div className="space-y-3">
          <ConfidenceBar value={metrics.roleFit} label="Role-Fit Confidence" />
          <ConfidenceBar value={metrics.competencyCoverage} label="Competency Coverage" />
          <ConfidenceBar value={metrics.skillCoverage} label="Skill Coverage" />
          <ConfidenceBar value={metrics.qualityConfidence} label="Quality Confidence" />
        </div>
      </div>

      {/* Risk */}
      <div className="hnx-card p-4">
        <h3 className="text-sm font-semibold mb-3">Risk & Effort</h3>
        <div className="divide-y">
          <StatItem icon={RefreshCw} label="Repeat Risk" value={`${metrics.repeatRisk}%`} color={metrics.repeatRisk > 20 ? 'text-destructive' : 'text-hnxgreen'} />
          <StatItem icon={Clock} label="Candidate Effort" value={metrics.candidateEffort} />
          <StatItem icon={Users} label="Recruiter Effort" value={metrics.recruiterEffort} />
        </div>
      </div>

      {/* Competency coverage */}
      {competencies && competencies.filter(c => c.included).length > 0 && (
        <div className="hnx-card p-4">
          <h3 className="text-sm font-semibold mb-3">Competency Map</h3>
          <div className="space-y-2">
            {competencies.filter(c => c.included).map(c => (
              <div key={c.id} className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground flex-1 truncate">{c.name}</span>
                <div className="w-16 h-1.5 rounded-full bg-muted">
                  <div className="h-full rounded-full bg-teal transition-all" style={{ width: `${c.weight * 6.67}%` }} />
                </div>
                <span className="text-[10px] font-medium w-6 text-right">{c.weight}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Question stats */}
      {questionStats && (
        <div className="hnx-card p-4">
          <h3 className="text-sm font-semibold mb-3">
            {type === 'coding' ? 'Problem' : 'Question'} Analytics
          </h3>
          <div className="divide-y">
            <StatItem icon={BarChart3} label="Total Generated" value={String(questionStats.total)} />
            <StatItem icon={CheckCircle2} label="Approved" value={String(questionStats.approved)} color="text-hnxgreen" />
            <StatItem icon={Eye} label="Pending Review" value={String(questionStats.total - questionStats.approved)} />
          </div>

          <div className="mt-3 pt-3 border-t">
            <p className="text-xs font-medium mb-2">By Difficulty</p>
            <div className="flex gap-2">
              {Object.entries(questionStats.byDifficulty).map(([d, count]) => (
                <div key={d} className={cn('flex-1 text-center py-1.5 rounded-md text-xs font-medium',
                  d === 'easy' ? 'bg-green-light text-hnxgreen' :
                  d === 'medium' ? 'bg-warning-light text-warning' :
                  'bg-danger-light text-destructive'
                )}>
                  <div className="font-bold text-sm">{count}</div>
                  <div className="capitalize">{d}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Warnings */}
      {metrics.warnings.length > 0 && (
        <div className="hnx-card p-4">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-warning" />
            Warnings
          </h3>
          <div className="space-y-2">
            {metrics.warnings.map((w, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground bg-warning-light p-2 rounded-md">
                <AlertTriangle className="w-3 h-3 text-warning mt-0.5 shrink-0" />
                {w}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
