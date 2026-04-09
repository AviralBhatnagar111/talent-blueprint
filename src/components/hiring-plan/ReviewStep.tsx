import type { RoleContext, Competency, Round, RoundRules } from '@/types/hirenowx';
import { SkillChip } from '@/components/shared/SkillChip';
import { DifficultyBar } from '@/components/shared/DifficultyBar';
import { CheckCircle2, Target, Layers, Settings, Clock, Users } from 'lucide-react';

interface Props {
  context: RoleContext;
  competencies: Competency[];
  rounds: Round[];
  rules: RoundRules;
}

export function ReviewStep({ context, competencies, rounds, rules }: Props) {
  const included = competencies.filter(c => c.included);
  const totalDuration = rounds.reduce((a, r) => a + r.duration, 0);

  return (
    <div className="space-y-6">
      <div className="bg-green-light border border-hnxgreen/20 rounded-xl p-4 flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-hnxgreen mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-foreground">Plan Ready for Review</p>
          <p className="text-xs text-muted-foreground mt-1">Review the complete hiring plan below before saving or continuing to assessment creation.</p>
        </div>
      </div>

      {/* Role Summary */}
      <div className="hnx-card">
        <div className="hnx-card-header flex items-center gap-2">
          <Target className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold">Role Context</h3>
        </div>
        <div className="p-6 grid grid-cols-3 gap-4 text-sm">
          {[
            ['Job Title', context.jobTitle],
            ['Level', context.jobLevel],
            ['Department', context.department],
            ['Experience', `${context.experienceRange[0]}–${context.experienceRange[1]} years`],
            ['Work Mode', context.workMode],
            ['Hiring Manager', context.hiringManager],
            ['Openings', String(context.openings)],
            ['Industry', context.industry],
            ['Domain', `${context.domain} / ${context.subDomain}`],
          ].map(([label, value]) => (
            <div key={label}>
              <span className="hnx-label">{label}</span>
              <p className="font-medium mt-0.5">{value}</p>
            </div>
          ))}
        </div>
        <div className="px-6 pb-4">
          <span className="hnx-label">Skills</span>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {context.primarySkills.map(s => <SkillChip key={s} label={s} variant="primary" />)}
            {context.secondarySkills.map(s => <SkillChip key={s} label={s} variant="teal" />)}
          </div>
        </div>
      </div>

      {/* Competencies */}
      <div className="hnx-card">
        <div className="hnx-card-header flex items-center gap-2">
          <Layers className="w-4 h-4 text-teal" />
          <h3 className="text-sm font-semibold">Competencies ({included.length})</h3>
        </div>
        <div className="p-4 grid grid-cols-2 gap-2">
          {included.map(c => (
            <div key={c.id} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30">
              <span className="text-sm">{c.name}</span>
              <span className="text-xs font-semibold text-muted-foreground">{c.weight}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Rounds */}
      <div className="hnx-card">
        <div className="hnx-card-header flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold">Rounds ({rounds.length})</h3>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Total: {totalDuration} min</span>
          </div>
        </div>
        <div className="divide-y">
          {rounds.map(r => (
            <div key={r.id} className="px-6 py-3 flex items-center gap-4 text-sm">
              <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold">{r.order}</span>
              <span className="font-medium flex-1">{r.name}</span>
              <span className="text-xs text-muted-foreground">{r.type}</span>
              <span className="text-xs">{r.duration}m</span>
              <span className="text-xs">{r.passThreshold}% pass</span>
            </div>
          ))}
        </div>
      </div>

      {/* Rules */}
      <div className="hnx-card">
        <div className="hnx-card-header flex items-center gap-2">
          <Settings className="w-4 h-4 text-warning" />
          <h3 className="text-sm font-semibold">Rules</h3>
        </div>
        <div className="p-6">
          <DifficultyBar easy={rules.difficultyMix.easy} medium={rules.difficultyMix.medium} hard={rules.difficultyMix.hard} />
          <div className="grid grid-cols-3 gap-3 mt-4 text-sm">
            {[
              ['Anti-Repeat', rules.antiRepeat],
              ['Randomize Questions', rules.randomizeQuestions],
              ['Randomize Options', rules.randomizeOptions],
              ['Adaptive Difficulty', rules.adaptiveDifficulty],
              ['Percentile Benchmark', rules.percentileBenchmarking],
              ['Strict Role Alignment', rules.strictRoleAlignment],
            ].map(([label, val]) => (
              <div key={String(label)} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${val ? 'bg-hnxgreen' : 'bg-muted-foreground/30'}`} />
                <span className="text-xs">{String(label)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
