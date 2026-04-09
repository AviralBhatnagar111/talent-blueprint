import { useState } from 'react';
import type { RoleContext } from '@/types/hirenowx';
import { SkillChip } from '@/components/shared/SkillChip';
import { Sparkles, Briefcase, MapPin, Users, Target } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Props {
  context: RoleContext;
  onChange: (ctx: RoleContext) => void;
}

export function RoleContextStep({ context, onChange }: Props) {
  const [newSkill, setNewSkill] = useState('');

  const update = (partial: Partial<RoleContext>) => onChange({ ...context, ...partial });

  const addSkill = (type: 'primarySkills' | 'secondarySkills') => {
    if (newSkill.trim()) {
      update({ [type]: [...context[type], newSkill.trim()] });
      setNewSkill('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="hnx-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Target className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="hnx-section-title">Role Context</h2>
            <p className="text-xs text-muted-foreground">This context drives competency mapping and question quality downstream.</p>
          </div>
          <span className="hnx-badge bg-primary/10 text-primary ml-auto">
            <Sparkles className="w-3 h-3" />AI Enhanced
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="hnx-label">Job Title</label>
            <Input value={context.jobTitle} onChange={e => update({ jobTitle: e.target.value })} className="mt-1" />
          </div>
          <div>
            <label className="hnx-label">Job Level</label>
            <Select value={context.jobLevel} onValueChange={v => update({ jobLevel: v })}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {['Junior', 'Mid', 'Senior', 'Staff', 'Lead', 'Director'].map(l => (
                  <SelectItem key={l} value={l}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="hnx-label">Department</label>
            <Select value={context.department} onValueChange={v => update({ department: v })}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {['Engineering', 'Product', 'Design', 'Sales', 'Marketing', 'HR', 'Finance', 'Operations'].map(d => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="hnx-label">Role Type</label>
            <Select value={context.roleType} onValueChange={v => update({ roleType: v })}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {['Individual Contributor', 'Team Lead', 'Manager', 'Director', 'VP'].map(r => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="hnx-label">Industry</label>
            <Input value={context.industry} onChange={e => update({ industry: e.target.value })} className="mt-1" />
          </div>
          <div>
            <label className="hnx-label">Domain</label>
            <Input value={context.domain} onChange={e => update({ domain: e.target.value })} className="mt-1" />
          </div>
          <div>
            <label className="hnx-label">Sub-Domain</label>
            <Input value={context.subDomain} onChange={e => update({ subDomain: e.target.value })} className="mt-1" />
          </div>
          <div>
            <label className="hnx-label">Work Mode</label>
            <Select value={context.workMode} onValueChange={v => update({ workMode: v })}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {['Remote', 'Hybrid', 'On-site'].map(w => (
                  <SelectItem key={w} value={w}>{w}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="hnx-label">Experience Range</label>
            <div className="flex gap-2 mt-1">
              <Input type="number" value={context.experienceRange[0]} onChange={e => update({ experienceRange: [Number(e.target.value), context.experienceRange[1]] })} placeholder="Min" />
              <span className="self-center text-muted-foreground">–</span>
              <Input type="number" value={context.experienceRange[1]} onChange={e => update({ experienceRange: [context.experienceRange[0], Number(e.target.value)] })} placeholder="Max" />
            </div>
          </div>
          <div>
            <label className="hnx-label">Hiring Manager</label>
            <Input value={context.hiringManager} onChange={e => update({ hiringManager: e.target.value })} className="mt-1" />
          </div>
          <div>
            <label className="hnx-label">Openings</label>
            <Input type="number" value={context.openings} onChange={e => update({ openings: Number(e.target.value) })} className="mt-1" />
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="hnx-card p-6">
        <h3 className="hnx-section-title mb-4 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-primary" />Skills
        </h3>
        <div className="space-y-4">
          <div>
            <label className="hnx-label">Primary Skills</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {context.primarySkills.map((s, i) => (
                <SkillChip key={s} label={s} variant="primary" removable onRemove={() => update({ primarySkills: context.primarySkills.filter((_, j) => j !== i) })} />
              ))}
              <input
                className="text-sm px-2 py-0.5 border rounded-lg outline-none focus:border-primary min-w-[100px]"
                placeholder="Add skill..."
                value={newSkill}
                onChange={e => setNewSkill(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addSkill('primarySkills')}
              />
            </div>
          </div>
          <div>
            <label className="hnx-label">Secondary Skills</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {context.secondarySkills.map((s, i) => (
                <SkillChip key={s} label={s} variant="teal" removable onRemove={() => update({ secondarySkills: context.secondarySkills.filter((_, j) => j !== i) })} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Info callout */}
      <div className="bg-blue-light border border-primary/20 rounded-xl p-4 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-primary mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium text-primary">Why Role Context Matters</p>
          <p className="text-xs text-muted-foreground mt-1">
            This context drives the AI-powered competency mapping and question generation. More detailed context leads to higher-quality, role-specific assessments with better candidate-role fit.
          </p>
        </div>
      </div>
    </div>
  );
}
