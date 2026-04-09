import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { StepProgress } from '@/components/shared/StepProgress';
import { ConfidencePanel } from '@/components/shared/ConfidencePanel';
import { RoleContextStep } from '@/components/hiring-plan/RoleContextStep';
import { CompetencyStep } from '@/components/hiring-plan/CompetencyStep';
import { RoundPlanStep } from '@/components/hiring-plan/RoundPlanStep';
import { RoundRulesStep } from '@/components/hiring-plan/RoundRulesStep';
import { ReviewStep } from '@/components/hiring-plan/ReviewStep';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Save, FileText, ArrowRight } from 'lucide-react';
import { defaultRoleContext, engineeringCompetencies, defaultRounds, defaultRules } from '@/data/mockData';
import type { RoleContext, Competency, Round, RoundRules, PlanStep, ConfidenceMetrics } from '@/types/hirenowx';

const steps = [
  { number: 1, label: 'Role Context', description: 'Define the role' },
  { number: 2, label: 'Competencies', description: 'Framework mapping' },
  { number: 3, label: 'Round Plan', description: 'Evaluation journey' },
  { number: 4, label: 'Rules & Blueprint', description: 'Global settings' },
  { number: 5, label: 'Review & Save', description: 'Finalize plan' },
];

export default function HiringPlanBuilder() {
  const [currentStep, setCurrentStep] = useState<PlanStep>(1);
  const [roleContext, setRoleContext] = useState<RoleContext>(defaultRoleContext);
  const [competencies, setCompetencies] = useState<Competency[]>(engineeringCompetencies);
  const [rounds, setRounds] = useState<Round[]>(defaultRounds);
  const [rules, setRules] = useState<RoundRules>(defaultRules);
  const [saved, setSaved] = useState(false);

  const metrics: ConfidenceMetrics = {
    roleFit: currentStep >= 2 ? 85 : 40,
    competencyCoverage: currentStep >= 2 ? competencies.filter(c => c.included).length / competencies.length * 100 : 0,
    skillCoverage: currentStep >= 1 ? 78 : 0,
    qualityConfidence: currentStep >= 4 ? 82 : currentStep >= 2 ? 55 : 20,
    repeatRisk: 8,
    candidateEffort: `${rounds.reduce((a, r) => a + r.duration, 0)} min`,
    recruiterEffort: `${rounds.filter(r => r.type === 'manual-interview' || r.type === 'hr').length * 60} min`,
    warnings: currentStep < 3 ? ['Round plan not configured yet'] : [],
    readinessState: currentStep >= 5 ? 'review' : currentStep >= 3 ? 'in-progress' : 'not-started',
  };

  return (
    <AppLayout>
      {/* Sticky top bar */}
      <div className="sticky top-0 z-10 bg-card border-b px-6 py-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-bold text-foreground">Hiring Plan Builder</h1>
            <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{roleContext.jobTitle}</span>
              <span>•</span>
              <span>{roleContext.department}</span>
              <span>•</span>
              <span>{roleContext.experienceRange[0]}–{roleContext.experienceRange[1]} years</span>
              <span>•</span>
              <span>{rounds.length} rounds</span>
              <span>•</span>
              <span>{competencies.filter(c => c.included).length} competencies</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setSaved(true)}>
              <Save className="w-3.5 h-3.5 mr-1" />Save Draft
            </Button>
          </div>
        </div>
        <StepProgress steps={steps} currentStep={currentStep} onStepClick={(s) => setCurrentStep(s as PlanStep)} />
      </div>

      <div className="flex gap-6 p-6 max-w-[1600px] mx-auto">
        {/* Main area */}
        <div className="flex-1 min-w-0 animate-fade-in">
          {currentStep === 1 && <RoleContextStep context={roleContext} onChange={setRoleContext} />}
          {currentStep === 2 && <CompetencyStep competencies={competencies} onChange={setCompetencies} />}
          {currentStep === 3 && <RoundPlanStep rounds={rounds} onChange={setRounds} competencies={competencies} />}
          {currentStep === 4 && <RoundRulesStep rules={rules} onChange={setRules} competencies={competencies} />}
          {currentStep === 5 && <ReviewStep context={roleContext} competencies={competencies} rounds={rounds} rules={rules} />}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t">
            <Button
              variant="outline"
              onClick={() => setCurrentStep((s) => Math.max(1, s - 1) as PlanStep)}
              disabled={currentStep === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />Previous
            </Button>
            {currentStep < 5 ? (
              <Button onClick={() => setCurrentStep((s) => Math.min(5, s + 1) as PlanStep)}>
                Next<ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline">
                  <FileText className="w-4 h-4 mr-1" />Save Template
                </Button>
                <Button>
                  Continue to Assessment<ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Right panel */}
        <div className="w-[300px] shrink-0 hidden xl:block">
          <div className="sticky top-[140px]">
            <ConfidencePanel metrics={metrics} competencies={competencies} type="plan" />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
