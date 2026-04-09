import type { Competency } from '@/types/hirenowx';
import { CompetencyStep } from '@/components/hiring-plan/CompetencyStep';

interface Props { competencies: Competency[]; onChange: (c: Competency[]) => void; }

export function MCQCompetencyStep({ competencies, onChange }: Props) {
  return (
    <div>
      <div className="bg-teal-light border border-teal/20 rounded-xl p-4 flex items-start gap-3 mb-6">
        <div className="w-5 h-5 rounded-full bg-teal flex items-center justify-center shrink-0 mt-0.5">
          <span className="text-xs text-accent-foreground font-bold">✓</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Pre-populated from Hiring Plan</p>
          <p className="text-xs text-muted-foreground mt-1">Competencies are inherited from your hiring plan template. Review weights and toggle as needed for this MCQ assessment.</p>
        </div>
      </div>
      <CompetencyStep competencies={competencies} onChange={onChange} />
    </div>
  );
}
