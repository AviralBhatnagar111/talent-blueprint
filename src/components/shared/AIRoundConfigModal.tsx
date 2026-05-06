import { useState } from 'react';
import { X, Sparkles, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { Round } from '@/types/hirenowx';

type Mode = 'interview' | 'liveCoding';

export function AIRoundConfigModal({
  round, mode, skills, onClose, onSave,
}: {
  round: Round;
  mode: Mode;
  skills: string[];
  onClose: () => void;
  onSave: (patch: Partial<Round>) => void;
}) {
  const [name, setName] = useState(round.label);
  const [picked, setPicked] = useState<string[]>(skills.slice(0, 4));
  const [duration, setDuration] = useState(round.durationMin || (mode === 'liveCoding' ? 60 : 30));
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [style, setStyle] = useState<string>(mode === 'liveCoding' ? 'Implementation' : 'Mixed');
  const [language, setLanguage] = useState('English');
  const [proctoring, setProctoring] = useState<'Off' | 'Standard' | 'Strict'>('Standard');
  const [threshold, setThreshold] = useState(70);
  const [instructions, setInstructions] = useState('Be concise, think aloud, and explain your reasoning.');

  const styles = mode === 'liveCoding'
    ? ['Debugging', 'Implementation', 'Live Reasoning', 'Code Explanation']
    : ['Technical', 'Behavioral', 'Scenario-based', 'Mixed'];

  const togglePick = (s: string) =>
    setPicked(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);

  const save = () => {
    if (!name.trim()) return toast.error('Add a round name');
    if (picked.length === 0) return toast.error('Pick at least one skill');
    onSave({
      label: name,
      durationMin: duration,
      passThreshold: threshold,
      assessmentStatus: 'ready',
      notes: `${mode === 'liveCoding' ? 'AI Live Coding' : 'AI Interview'} · ${style} · ${difficulty}`,
    });
    toast.success(`${mode === 'liveCoding' ? 'AI Coding' : 'AI Interview'} configured`, { description: `${name} is ready.` });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[80] bg-navy/40 backdrop-blur-sm flex items-center justify-center p-6">
      <div className="hnx-card w-full max-w-2xl shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
        <div className="px-5 py-4 border-b flex items-center justify-between sticky top-0 bg-card z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-light flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-teal-deep" strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-navy">
                Configure {mode === 'liveCoding' ? 'AI Live Coding' : 'AI Interview'}
              </h3>
              <p className="text-[11px] text-muted-foreground">Lightweight setup — no question pool needed.</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-md hover:bg-muted flex items-center justify-center"><X className="w-4 h-4" /></button>
        </div>

        <div className="p-5 space-y-4">
          <Field label="Round name">
            <input className="hnx-input w-full" value={name} onChange={e => setName(e.target.value)} />
          </Field>

          <Field label="Skills / competencies to assess">
            <div className="flex flex-wrap gap-1.5">
              {skills.map(s => {
                const on = picked.includes(s);
                return (
                  <button key={s} type="button" onClick={() => togglePick(s)}
                    className={cn('px-2.5 py-1 rounded-md text-[12px] font-semibold border transition-all',
                      on ? 'bg-teal-light text-teal-deep border-teal/40' : 'bg-card text-muted-foreground border-border hover:border-teal/30')}>
                    {s}
                  </button>
                );
              })}
            </div>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Duration (min)">
              <input type="number" className="hnx-input w-full" value={duration} onChange={e => setDuration(+e.target.value)} />
            </Field>
            <Field label="Difficulty">
              <select className="hnx-input w-full" value={difficulty} onChange={e => setDifficulty(e.target.value as any)}>
                <option>Easy</option><option>Medium</option><option>Hard</option>
              </select>
            </Field>
            <Field label={mode === 'liveCoding' ? 'Problem style' : 'Question style'}>
              <select className="hnx-input w-full" value={style} onChange={e => setStyle(e.target.value)}>
                {styles.map(s => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Language">
              <input className="hnx-input w-full" value={language} onChange={e => setLanguage(e.target.value)} />
            </Field>
            <Field label="Proctoring / integrity">
              <select className="hnx-input w-full" value={proctoring} onChange={e => setProctoring(e.target.value as any)}>
                <option>Off</option><option>Standard</option><option>Strict</option>
              </select>
            </Field>
            <Field label="Pass / recommendation threshold (%)">
              <input type="number" className="hnx-input w-full" value={threshold} onChange={e => setThreshold(+e.target.value)} />
            </Field>
          </div>

          <Field label="Candidate instructions">
            <textarea className="hnx-input min-h-20 w-full" value={instructions} onChange={e => setInstructions(e.target.value)} />
          </Field>
        </div>

        <div className="px-5 py-3 border-t flex items-center justify-end gap-2 bg-muted/20">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button className="bg-hnxgreen hover:bg-hnxgreen-deep text-navy font-semibold" onClick={save}>
            <Save className="w-3.5 h-3.5 mr-1.5" />Save Configuration
          </Button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="hnx-label block mb-1.5">{label}</label>
      {children}
    </div>
  );
}