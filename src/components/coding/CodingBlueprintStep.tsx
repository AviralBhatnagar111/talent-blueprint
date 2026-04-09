import type { CodingBlueprint } from '@/types/hirenowx';
import { DifficultyBar } from '@/components/shared/DifficultyBar';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { SkillChip } from '@/components/shared/SkillChip';
import { Settings, Shield, Code2, BarChart3, Eye } from 'lucide-react';

interface Props { blueprint: CodingBlueprint; onChange: (b: CodingBlueprint) => void; }

const allLanguages = ['JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'Go', 'SQL'];

const problemTypes = [
  ['implementation', 'Coding Implementation'],
  ['practical', 'Practical Real-World'],
  ['debugging', 'Debugging Challenge'],
  ['algorithmic', 'Algorithmic Problem'],
  ['api-logic', 'API Logic'],
  ['sql-data', 'SQL / Data Problem'],
  ['frontend-ui', 'Frontend UI Logic'],
  ['refactoring', 'Refactoring / Quality'],
];

export function CodingBlueprintStep({ blueprint, onChange }: Props) {
  const update = (p: Partial<CodingBlueprint>) => onChange({ ...blueprint, ...p });

  const toggleLanguage = (lang: string) => {
    const langs = blueprint.languages.includes(lang)
      ? blueprint.languages.filter(l => l !== lang)
      : [...blueprint.languages, lang];
    update({ languages: langs });
  };

  return (
    <div className="space-y-6">
      {/* Core settings */}
      <div className="hnx-card p-6">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <Settings className="w-4 h-4 text-primary" />Core Settings
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="hnx-label">Problems to Send</label>
            <Input type="number" value={blueprint.problemsToSend} onChange={e => update({ problemsToSend: Number(e.target.value) })} className="mt-1" />
          </div>
          <div>
            <label className="hnx-label">Pool Size</label>
            <Input type="number" value={blueprint.poolSize} onChange={e => update({ poolSize: Number(e.target.value) })} className="mt-1" />
          </div>
          <div>
            <label className="hnx-label">Duration (minutes)</label>
            <Input type="number" value={blueprint.duration} onChange={e => update({ duration: Number(e.target.value) })} className="mt-1" />
          </div>
        </div>
      </div>

      {/* Languages */}
      <div className="hnx-card p-6">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <Code2 className="w-4 h-4 text-primary" />Language Support
        </h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {allLanguages.map(lang => (
            <button key={lang} onClick={() => toggleLanguage(lang)}
              className={`hnx-chip text-sm cursor-pointer transition-colors ${
                blueprint.languages.includes(lang) ? 'bg-primary/10 text-primary border-primary/30' : 'bg-muted text-muted-foreground border-border'
              }`}
            >{lang}</button>
          ))}
        </div>
        <div className="flex items-center gap-2 p-3 rounded-lg border bg-muted/20">
          <span className="text-sm">Multi-Language Solve Mode</span>
          <Switch checked={blueprint.multiLanguageMode} onCheckedChange={v => update({ multiLanguageMode: v })} />
          <span className="text-xs text-muted-foreground ml-2">Allow candidates to solve in any supported language</span>
        </div>
      </div>

      {/* Difficulty */}
      <div className="hnx-card p-6">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary" />Difficulty Split
        </h3>
        <DifficultyBar easy={blueprint.difficultySplit.easy} medium={blueprint.difficultySplit.medium} hard={blueprint.difficultySplit.hard} />
      </div>

      {/* Problem Types */}
      <div className="hnx-card p-6">
        <h3 className="text-sm font-semibold mb-4">Problem Type Mix</h3>
        <div className="space-y-3">
          {problemTypes.map(([key, label]) => (
            <div key={key} className="flex items-center gap-4">
              <span className="text-sm w-44">{label}</span>
              <Slider
                value={[blueprint.typeMix[key] || 0]}
                onValueChange={([v]) => update({ typeMix: { ...blueprint.typeMix, [key]: v } })}
                max={100} min={0} step={5} className="flex-1"
              />
              <span className="text-sm font-semibold w-10 text-right">{blueprint.typeMix[key] || 0}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Test cases & Scoring */}
      <div className="hnx-card p-6">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <Eye className="w-4 h-4 text-teal" />Test Cases & Scoring
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="hnx-label">Visible Test Cases</label>
            <Input type="number" value={blueprint.visibleTestCases} onChange={e => update({ visibleTestCases: Number(e.target.value) })} className="mt-1" />
          </div>
          <div>
            <label className="hnx-label">Hidden Test Cases</label>
            <Input type="number" value={blueprint.hiddenTestCases} onChange={e => update({ hiddenTestCases: Number(e.target.value) })} className="mt-1" />
          </div>
          <div>
            <label className="hnx-label">Execution Time Limit (s)</label>
            <Input type="number" value={blueprint.executionTimeLimit} onChange={e => update({ executionTimeLimit: Number(e.target.value) })} className="mt-1" />
          </div>
          <div>
            <label className="hnx-label">Memory Limit (MB)</label>
            <Input type="number" value={blueprint.memoryLimit} onChange={e => update({ memoryLimit: Number(e.target.value) })} className="mt-1" />
          </div>
        </div>
      </div>

      {/* Advanced */}
      <div className="hnx-card p-6">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4 text-teal" />Advanced Settings
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { key: 'partialScoring', label: 'Partial Scoring' },
            { key: 'plagiarismCheck', label: 'Plagiarism Check' },
            { key: 'antiRepeat', label: 'Anti-Repeat Engine' },
            { key: 'randomize', label: 'Randomize Problem Set' },
            { key: 'strictExperienceAlignment', label: 'Strict Experience Alignment' },
            { key: 'strictDomainAlignment', label: 'Strict Domain Alignment' },
            { key: 'allowHints', label: 'Allow Compiler Hints' },
            { key: 'proctoringMode', label: 'Proctoring Mode' },
            { key: 'benchmarkMode', label: 'Benchmark by Percentile' },
          ].map(t => (
            <div key={t.key} className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
              <span className="text-sm">{t.label}</span>
              <Switch checked={blueprint[t.key as keyof CodingBlueprint] as boolean} onCheckedChange={v => update({ [t.key]: v })} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
