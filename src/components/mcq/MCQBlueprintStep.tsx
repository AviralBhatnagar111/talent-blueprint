import type { MCQBlueprint, QuestionType } from '@/types/hirenowx';
import { DifficultyBar } from '@/components/shared/DifficultyBar';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { BarChart3, Settings, Shield, Clock } from 'lucide-react';

interface Props { blueprint: MCQBlueprint; onChange: (b: MCQBlueprint) => void; }

export function MCQBlueprintStep({ blueprint, onChange }: Props) {
  const update = (p: Partial<MCQBlueprint>) => onChange({ ...blueprint, ...p });

  return (
    <div className="space-y-6">
      {/* Core settings */}
      <div className="hnx-card p-6">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <Settings className="w-4 h-4 text-primary" />Core Settings
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="hnx-label">Questions to Send</label>
            <Input type="number" value={blueprint.questionsToSend} onChange={e => update({ questionsToSend: Number(e.target.value) })} className="mt-1" />
          </div>
          <div>
            <label className="hnx-label">Pool Size to Generate</label>
            <Input type="number" value={blueprint.poolSize} onChange={e => update({ poolSize: Number(e.target.value) })} className="mt-1" />
          </div>
          <div>
            <label className="hnx-label">Duration (minutes)</label>
            <Input type="number" value={blueprint.duration} onChange={e => update({ duration: Number(e.target.value) })} className="mt-1" />
          </div>
        </div>
      </div>

      {/* Difficulty */}
      <div className="hnx-card p-6">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary" />Difficulty Split
        </h3>
        <DifficultyBar easy={blueprint.difficultySplit.easy} medium={blueprint.difficultySplit.medium} hard={blueprint.difficultySplit.hard} />
      </div>

      {/* Question Type Mix */}
      <div className="hnx-card p-6">
        <h3 className="text-sm font-semibold mb-4">Question Type Mix</h3>
        <div className="space-y-3">
          {([
            ['mcq', 'Multiple Choice'],
            ['true-false', 'True / False'],
            ['scenario', 'Scenario-Based'],
            ['short-answer', 'Short Answer (AI Graded)'],
          ] as [QuestionType, string][]).map(([key, label]) => (
            <div key={key} className="flex items-center gap-4">
              <span className="text-sm w-40">{label}</span>
              {key === 'short-answer' && <span className="hnx-badge bg-warning-light text-warning text-[10px]">Beta</span>}
              <Slider
                value={[blueprint.typeMix[key]]}
                onValueChange={([v]) => update({ typeMix: { ...blueprint.typeMix, [key]: v } })}
                max={100} min={0} step={5} className="flex-1"
              />
              <span className="text-sm font-semibold w-10 text-right">{blueprint.typeMix[key]}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Advanced */}
      <div className="hnx-card p-6">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4 text-teal" />Advanced Settings
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { key: 'antiRepeat', label: 'Anti-Repeat Engine' },
            { key: 'strictExperienceFit', label: 'Strict Experience Fit' },
            { key: 'strictSkillFit', label: 'Strict Skill Fit' },
          ].map(t => (
            <div key={t.key} className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
              <span className="text-sm">{t.label}</span>
              <Switch checked={blueprint[t.key as keyof MCQBlueprint] as boolean} onCheckedChange={v => update({ [t.key]: v })} />
            </div>
          ))}
          <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
            <span className="text-sm">Freshness</span>
            <Select value={blueprint.freshnessPreference} onValueChange={v => update({ freshnessPreference: v as any })}>
              <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">Latest</SelectItem>
                <SelectItem value="mixed">Mixed</SelectItem>
                <SelectItem value="classic">Classic</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
