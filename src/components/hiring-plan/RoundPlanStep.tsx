import { useState } from 'react';
import type { Round, Competency, RoundType } from '@/types/hirenowx';
import { cn } from '@/lib/utils';
import {
  GripVertical, ChevronDown, ChevronUp, Plus, Copy, Trash2,
  Phone, BrainCircuit, Code2, Bot, Users, Heart, CheckCircle2, Clock, Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { SkillChip } from '@/components/shared/SkillChip';

interface Props {
  rounds: Round[];
  onChange: (rounds: Round[]) => void;
  competencies: Competency[];
}

const roundTypeConfig: Record<RoundType, { icon: any; color: string; label: string }> = {
  screening: { icon: Phone, color: 'bg-teal-light text-teal border-teal/20', label: 'Screening' },
  mcq: { icon: BrainCircuit, color: 'bg-primary/10 text-primary border-primary/20', label: 'MCQ Assessment' },
  coding: { icon: Code2, color: 'bg-green-light text-hnxgreen border-hnxgreen/20', label: 'Coding Challenge' },
  'ai-interview': { icon: Bot, color: 'bg-primary/10 text-primary border-primary/20', label: 'AI Interview' },
  'manual-interview': { icon: Users, color: 'bg-warning-light text-warning border-warning/20', label: 'Manual Interview' },
  hr: { icon: Heart, color: 'bg-teal-light text-teal border-teal/20', label: 'HR Round' },
  'final-review': { icon: CheckCircle2, color: 'bg-green-light text-hnxgreen border-hnxgreen/20', label: 'Final Review' },
};

export function RoundPlanStep({ rounds, onChange, competencies }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(rounds.find(r => r.type === 'mcq')?.id || null);

  const toggleExpand = (id: string) => setExpandedId(expandedId === id ? null : id);

  const addRound = () => {
    const newRound: Round = {
      id: `r${Date.now()}`, order: rounds.length + 1, type: 'mcq',
      name: 'New Round', purpose: '', candidateLabel: 'Assessment',
      competencies: [], skills: [], owner: '', duration: 30,
      passThreshold: 70, mandatory: true, autoTrigger: false, notes: '',
    };
    onChange([...rounds, newRound]);
    setExpandedId(newRound.id);
  };

  const removeRound = (id: string) => onChange(rounds.filter(r => r.id !== id).map((r, i) => ({ ...r, order: i + 1 })));

  const duplicateRound = (round: Round) => {
    const dup = { ...round, id: `r${Date.now()}`, name: `${round.name} (Copy)`, order: rounds.length + 1 };
    onChange([...rounds, dup]);
  };

  const updateRound = (id: string, partial: Partial<Round>) => {
    onChange(rounds.map(r => r.id === id ? { ...r, ...partial } : r));
  };

  const moveRound = (index: number, direction: -1 | 1) => {
    const newRounds = [...rounds];
    const swapIndex = index + direction;
    if (swapIndex < 0 || swapIndex >= newRounds.length) return;
    [newRounds[index], newRounds[swapIndex]] = [newRounds[swapIndex], newRounds[index]];
    onChange(newRounds.map((r, i) => ({ ...r, order: i + 1 })));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="hnx-section-title">Round Plan</h2>
          <p className="text-xs text-muted-foreground mt-1">Design the evaluation journey for candidates</p>
        </div>
        <Button size="sm" onClick={addRound}>
          <Plus className="w-3.5 h-3.5 mr-1" />Add Round
        </Button>
      </div>

      {rounds.map((round, index) => {
        const config = roundTypeConfig[round.type];
        const expanded = expandedId === round.id;
        const Icon = config.icon;

        return (
          <div key={round.id} className="hnx-card overflow-hidden animate-fade-in">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/20" onClick={() => toggleExpand(round.id)}>
              <div className="flex flex-col gap-0.5">
                <button onClick={(e) => { e.stopPropagation(); moveRound(index, -1); }} className="hover:text-primary"><ChevronUp className="w-3 h-3" /></button>
                <button onClick={(e) => { e.stopPropagation(); moveRound(index, 1); }} className="hover:text-primary"><ChevronDown className="w-3 h-3" /></button>
              </div>
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground">
                {round.order}
              </div>
              <div className={cn('hnx-badge', config.color)}>
                <Icon className="w-3 h-3" />{config.label}
              </div>
              <span className="font-medium text-sm flex-1">{round.name}</span>

              {/* Quick stats */}
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Target className="w-3 h-3" />{round.competencies.length}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{round.duration}m</span>
                <span>{round.passThreshold}% pass</span>
                {round.mandatory && <span className="hnx-badge bg-primary/10 text-primary text-[10px]">Required</span>}
              </div>

              <div className="flex gap-1">
                <button onClick={(e) => { e.stopPropagation(); duplicateRound(round); }} className="p-1.5 rounded-md hover:bg-muted"><Copy className="w-3.5 h-3.5" /></button>
                <button onClick={(e) => { e.stopPropagation(); removeRound(round.id); }} className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>

            {/* Expanded */}
            {expanded && (
              <div className="px-6 pb-5 pt-2 border-t bg-muted/10 animate-fade-in">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="hnx-label">Round Name</label>
                    <Input value={round.name} onChange={e => updateRound(round.id, { name: e.target.value })} className="mt-1" />
                  </div>
                  <div>
                    <label className="hnx-label">Round Type</label>
                    <Select value={round.type} onValueChange={v => updateRound(round.id, { type: v as RoundType })}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(roundTypeConfig).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="hnx-label">Purpose</label>
                    <Input value={round.purpose} onChange={e => updateRound(round.id, { purpose: e.target.value })} className="mt-1" />
                  </div>
                  <div>
                    <label className="hnx-label">Candidate-Facing Label</label>
                    <Input value={round.candidateLabel} onChange={e => updateRound(round.id, { candidateLabel: e.target.value })} className="mt-1" />
                  </div>
                  <div>
                    <label className="hnx-label">Owner / Evaluator</label>
                    <Input value={round.owner} onChange={e => updateRound(round.id, { owner: e.target.value })} className="mt-1" />
                  </div>
                  <div>
                    <label className="hnx-label">Duration (minutes)</label>
                    <Input type="number" value={round.duration} onChange={e => updateRound(round.id, { duration: Number(e.target.value) })} className="mt-1" />
                  </div>
                  <div>
                    <label className="hnx-label">Pass Threshold (%)</label>
                    <Input type="number" value={round.passThreshold} onChange={e => updateRound(round.id, { passThreshold: Number(e.target.value) })} className="mt-1" />
                  </div>
                  <div className="flex items-end gap-6">
                    <div className="flex items-center gap-2">
                      <Switch checked={round.mandatory} onCheckedChange={v => updateRound(round.id, { mandatory: v })} />
                      <span className="text-sm">Mandatory</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={round.autoTrigger} onCheckedChange={v => updateRound(round.id, { autoTrigger: v })} />
                      <span className="text-sm">Auto-trigger</span>
                    </div>
                  </div>
                </div>

                {/* Mapped competencies */}
                <div className="mt-4">
                  <label className="hnx-label">Mapped Competencies</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {competencies.filter(c => c.included).map(c => {
                      const selected = round.competencies.includes(c.id);
                      return (
                        <button key={c.id}
                          onClick={() => updateRound(round.id, {
                            competencies: selected
                              ? round.competencies.filter(id => id !== c.id)
                              : [...round.competencies, c.id]
                          })}
                          className={cn('hnx-chip text-xs transition-colors cursor-pointer',
                            selected ? 'bg-primary/10 text-primary border-primary/30' : 'bg-muted text-muted-foreground border-border'
                          )}
                        >
                          {c.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
