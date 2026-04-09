import type { RoleContext } from '@/types/hirenowx';
import { SkillChip } from '@/components/shared/SkillChip';
import { Sparkles, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Props { context: RoleContext; onChange: (ctx: RoleContext) => void; }

export function MCQContextStep({ context, onChange }: Props) {
  const update = (p: Partial<RoleContext>) => onChange({ ...context, ...p });

  return (
    <div className="space-y-6">
      <div className="bg-blue-light border border-primary/20 rounded-xl p-4 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-primary mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-primary">AI-Parsed Context</p>
          <p className="text-xs text-muted-foreground mt-1">Values below were extracted from the linked job description. Review and confirm or edit as needed.</p>
        </div>
      </div>

      <div className="hnx-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="w-5 h-5 text-primary" />
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
                <span className="hnx-badge bg-primary/10 text-primary text-[10px]">
                  <Sparkles className="w-2.5 h-2.5" />AI Parsed
                </span>
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
            <label className="hnx-label flex items-center gap-2">Primary Skills <span className="hnx-badge bg-primary/10 text-primary text-[10px]"><Sparkles className="w-2.5 h-2.5" />AI Parsed</span></label>
            <div className="flex flex-wrap gap-2 mt-1.5">
              {context.primarySkills.map((s, i) => <SkillChip key={s} label={s} variant="primary" removable onRemove={() => update({ primarySkills: context.primarySkills.filter((_, j) => j !== i) })} />)}
            </div>
          </div>
          <div>
            <label className="hnx-label">Secondary Skills</label>
            <div className="flex flex-wrap gap-2 mt-1.5">
              {context.secondarySkills.map((s, i) => <SkillChip key={s} label={s} variant="teal" removable onRemove={() => update({ secondarySkills: context.secondarySkills.filter((_, j) => j !== i) })} />)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
