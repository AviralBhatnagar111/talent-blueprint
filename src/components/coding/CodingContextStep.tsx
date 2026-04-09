import type { RoleContext } from '@/types/hirenowx';
import { SkillChip } from '@/components/shared/SkillChip';
import { Sparkles, Code2, Shield } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface Props { context: RoleContext; onChange: (ctx: RoleContext) => void; }

export function CodingContextStep({ context, onChange }: Props) {
  const update = (p: Partial<RoleContext>) => onChange({ ...context, ...p });

  const confidenceItems = [
    { label: 'Role-Fit', value: 88, color: 'bg-hnxgreen' },
    { label: 'Skill Extraction', value: 92, color: 'bg-hnxgreen' },
    { label: 'Seniority', value: 85, color: 'bg-hnxgreen' },
    { label: 'Language Relevance', value: 90, color: 'bg-hnxgreen' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-blue-light border border-primary/20 rounded-xl p-4 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-primary mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-primary">AI-Parsed Context</p>
          <p className="text-xs text-muted-foreground mt-1">Values extracted from the linked job description. Review and confirm.</p>
        </div>
      </div>

      <div className="hnx-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <Code2 className="w-5 h-5 text-primary" />
          <h2 className="hnx-section-title">JD & Role Context</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Role Title', value: context.jobTitle, key: 'jobTitle' },
            { label: 'Experience Level', value: context.jobLevel, key: 'jobLevel' },
            { label: 'Industry', value: context.industry, key: 'industry' },
            { label: 'Domain', value: context.domain, key: 'domain' },
            { label: 'Sub-Domain', value: context.subDomain, key: 'subDomain' },
          ].map(f => (
            <div key={f.key}>
              <label className="hnx-label flex items-center gap-2">
                {f.label}
                <span className="hnx-badge bg-primary/10 text-primary text-[10px]"><Sparkles className="w-2.5 h-2.5" />AI Parsed</span>
              </label>
              <Input value={f.value} onChange={e => update({ [f.key]: e.target.value })} className="mt-1" />
            </div>
          ))}
          <div className="col-span-2">
            <label className="hnx-label">Role Objective</label>
            <Input value={context.roleObjective} onChange={e => update({ roleObjective: e.target.value })} className="mt-1" />
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <div>
            <label className="hnx-label">Must-Test Technologies</label>
            <div className="flex flex-wrap gap-2 mt-1.5">
              {context.primarySkills.map(s => <SkillChip key={s} label={s} variant="primary" />)}
            </div>
          </div>
          <div>
            <label className="hnx-label">Coding Language Preferences</label>
            <div className="flex flex-wrap gap-2 mt-1.5">
              {['JavaScript', 'TypeScript', 'Python'].map(s => <SkillChip key={s} label={s} variant="teal" />)}
            </div>
          </div>
        </div>
      </div>

      {/* Confidence Summary */}
      <div className="hnx-card p-6">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4 text-teal" />Context Confidence
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {confidenceItems.map(item => (
            <div key={item.label} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <div className="hnx-progress-bar mt-1.5">
                  <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.value}%` }} />
                </div>
              </div>
              <span className="text-sm font-bold">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
