import { useState } from 'react';
import type { Competency, CompetencyCategory } from '@/types/hirenowx';
import { cn } from '@/lib/utils';
import { Sparkles, GripVertical, Eye, EyeOff, ChevronDown, ChevronUp } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';

interface Props {
  competencies: Competency[];
  onChange: (comps: Competency[]) => void;
}

const categoryLabels: Record<CompetencyCategory, string> = {
  technical: 'Technical / Functional',
  domain: 'Domain / System / Business',
  behavioral: 'Behavioral / Collaboration',
};

const categoryColors: Record<CompetencyCategory, string> = {
  technical: 'border-l-primary bg-primary/5',
  domain: 'border-l-teal bg-teal-light',
  behavioral: 'border-l-hnxgreen bg-green-light',
};

export function CompetencyStep({ competencies, onChange }: Props) {
  const [expandedCategory, setExpandedCategory] = useState<CompetencyCategory | null>('technical');

  const toggleInclude = (id: string) => {
    onChange(competencies.map(c => c.id === id ? { ...c, included: !c.included } : c));
  };

  const updateWeight = (id: string, weight: number) => {
    onChange(competencies.map(c => c.id === id ? { ...c, weight } : c));
  };

  const grouped = competencies.reduce((acc, c) => {
    (acc[c.category] = acc[c.category] || []).push(c);
    return acc;
  }, {} as Record<CompetencyCategory, Competency[]>);

  const includedCount = competencies.filter(c => c.included).length;
  const totalWeight = competencies.filter(c => c.included).reduce((a, c) => a + c.weight, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="hnx-card p-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-accent flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-navy" />
            </div>
            <div>
              <h2 className="hnx-section-title">Competency Framework</h2>
              <p className="text-xs text-muted-foreground">AI-recommended competencies based on your role context</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="hnx-badge bg-primary/10 text-primary">{includedCount} selected</span>
            <span className="hnx-badge bg-teal-light text-teal">Weight: {totalWeight}%</span>
          </div>
        </div>
      </div>

      {/* Categories */}
      {(Object.entries(grouped) as [CompetencyCategory, Competency[]][]).map(([cat, comps]) => {
        const expanded = expandedCategory === cat;
        return (
          <div key={cat} className="hnx-card overflow-hidden">
            <button
              onClick={() => setExpandedCategory(expanded ? null : cat)}
              className="w-full flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={cn('w-1 h-8 rounded-full', cat === 'technical' ? 'bg-primary' : cat === 'domain' ? 'bg-teal' : 'bg-hnxgreen')} />
                <div className="text-left">
                  <h3 className="text-sm font-semibold">{categoryLabels[cat]}</h3>
                  <p className="text-xs text-muted-foreground">{comps.filter(c => c.included).length} of {comps.length} selected</p>
                </div>
              </div>
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {expanded && (
              <div className="px-6 pb-4 space-y-2 animate-fade-in">
                {comps.map(comp => (
                  <div key={comp.id} className={cn(
                    'border-l-4 rounded-lg p-4 flex items-center gap-4 transition-all',
                    comp.included ? categoryColors[cat] : 'border-l-border bg-muted/20 opacity-60'
                  )}>
                    <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{comp.name}</span>
                        {comp.mustCover && <span className="hnx-badge bg-destructive/10 text-destructive text-[10px]">Must Cover</span>}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{comp.description}</p>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="w-24">
                        <Slider
                          value={[comp.weight]}
                          onValueChange={([v]) => updateWeight(comp.id, v)}
                          max={25}
                          min={1}
                          step={1}
                          disabled={!comp.included}
                        />
                        <p className="text-[10px] text-center text-muted-foreground mt-1">{comp.weight}%</p>
                      </div>
                      <Switch checked={comp.included} onCheckedChange={() => toggleInclude(comp.id)} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
