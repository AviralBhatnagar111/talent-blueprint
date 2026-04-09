import type { RoundRules, Competency } from '@/types/hirenowx';
import { DifficultyBar } from '@/components/shared/DifficultyBar';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Settings, Shield, Zap, BarChart3, RefreshCw } from 'lucide-react';

interface Props {
  rules: RoundRules;
  onChange: (rules: RoundRules) => void;
  competencies: Competency[];
}

export function RoundRulesStep({ rules, onChange, competencies }: Props) {
  const update = (partial: Partial<RoundRules>) => onChange({ ...rules, ...partial });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Settings className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="hnx-section-title">Round Rules & Blueprint</h2>
          <p className="text-xs text-muted-foreground">Configure global assessment logic before building specific assessments</p>
        </div>
      </div>

      {/* Difficulty Mix */}
      <div className="hnx-card p-6">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary" />Difficulty Distribution
        </h3>
        <DifficultyBar easy={rules.difficultyMix.easy} medium={rules.difficultyMix.medium} hard={rules.difficultyMix.hard} />
        <div className="grid grid-cols-3 gap-4 mt-4">
          {(['easy', 'medium', 'hard'] as const).map(d => (
            <div key={d}>
              <label className="hnx-label capitalize">{d} %</label>
              <Slider
                value={[rules.difficultyMix[d]]}
                onValueChange={([v]) => {
                  const mix = { ...rules.difficultyMix, [d]: v };
                  update({ difficultyMix: mix });
                }}
                max={100} min={0} step={5} className="mt-2"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Toggles */}
      <div className="hnx-card p-6">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4 text-teal" />Assessment Integrity
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {[
            { key: 'antiRepeat', label: 'Anti-Repeat Engine', desc: 'Prevent question reuse across candidates' },
            { key: 'randomizeQuestions', label: 'Randomize Questions', desc: 'Shuffle question order per candidate' },
            { key: 'randomizeOptions', label: 'Randomize Options', desc: 'Shuffle answer options per question' },
            { key: 'adaptiveDifficulty', label: 'Adaptive Difficulty (Beta)', desc: 'Adjust difficulty based on performance' },
            { key: 'percentileBenchmarking', label: 'Percentile Benchmarking', desc: 'Compare against role-level benchmarks' },
            { key: 'strictRoleAlignment', label: 'Strict Role Alignment', desc: 'Only generate role-relevant content' },
            { key: 'strictExperienceAlignment', label: 'Strict Experience Alignment', desc: 'Match difficulty to experience band' },
          ].map(toggle => (
            <div key={toggle.key} className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
              <div>
                <p className="text-sm font-medium">{toggle.label}</p>
                <p className="text-xs text-muted-foreground">{toggle.desc}</p>
              </div>
              <Switch
                checked={rules[toggle.key as keyof RoundRules] as boolean}
                onCheckedChange={v => update({ [toggle.key]: v })}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Time Pressure */}
      <div className="hnx-card p-6">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 text-warning" />Time Pressure Profile
        </h3>
        <Select value={rules.timePressure} onValueChange={v => update({ timePressure: v as any })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="relaxed">Relaxed — Extra time buffer</SelectItem>
            <SelectItem value="standard">Standard — Industry average</SelectItem>
            <SelectItem value="intense">Intense — Time-pressured</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
