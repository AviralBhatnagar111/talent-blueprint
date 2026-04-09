import { useState, useCallback } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { StepProgress } from '@/components/shared/StepProgress';
import { ConfidencePanel } from '@/components/shared/ConfidencePanel';
import { GenerationLoader } from '@/components/shared/GenerationLoader';
import { CodingContextStep } from '@/components/coding/CodingContextStep';
import { CodingCompetencyStep } from '@/components/coding/CodingCompetencyStep';
import { CodingBlueprintStep } from '@/components/coding/CodingBlueprintStep';
import { CodingReviewStep } from '@/components/coding/CodingReviewStep';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Save, Sparkles } from 'lucide-react';
import { defaultRoleContext, engineeringCompetencies, defaultCodingBlueprint, sampleCodingProblems, codingGenerationSteps } from '@/data/mockData';
import type { RoleContext, Competency, CodingBlueprint, CodingProblem, AssessmentStep, ConfidenceMetrics, Difficulty } from '@/types/hirenowx';

const steps = [
  { number: 1, label: 'JD & Role Context', description: 'Parse & confirm' },
  { number: 2, label: 'Coding Competencies', description: 'Map & weight' },
  { number: 3, label: 'Blueprint', description: 'Configure generation' },
  { number: 4, label: 'Generate & Review', description: 'Finalize problems' },
];

export default function CodingBuilder() {
  const [currentStep, setCurrentStep] = useState<AssessmentStep>(1);
  const [roleContext, setRoleContext] = useState<RoleContext>(defaultRoleContext);
  const [competencies, setCompetencies] = useState<Competency[]>(engineeringCompetencies);
  const [blueprint, setBlueprint] = useState<CodingBlueprint>(defaultCodingBlueprint);
  const [problems, setProblems] = useState<CodingProblem[]>([]);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const handleGenerate = () => setGenerating(true);
  const handleGenerationComplete = useCallback(() => {
    setGenerating(false);
    setGenerated(true);
    setProblems(sampleCodingProblems);
  }, []);

  const approvedCount = problems.filter(p => p.approved).length;
  const problemStats = generated ? {
    total: problems.length,
    approved: approvedCount,
    byDifficulty: {
      easy: problems.filter(p => p.difficulty === 'easy').length,
      medium: problems.filter(p => p.difficulty === 'medium').length,
      hard: problems.filter(p => p.difficulty === 'hard').length,
    } as Record<Difficulty, number>,
    byCompetency: problems.reduce((a, p) => ({ ...a, [p.competency]: (a[p.competency] || 0) + 1 }), {} as Record<string, number>),
    byType: problems.reduce((a, p) => ({ ...a, [p.type]: (a[p.type] || 0) + 1 }), {} as Record<string, number>),
  } : undefined;

  const metrics: ConfidenceMetrics = {
    roleFit: 88,
    competencyCoverage: competencies.filter(c => c.included).length / competencies.length * 100,
    skillCoverage: 82,
    qualityConfidence: generated ? 85 : currentStep >= 3 ? 60 : 30,
    repeatRisk: 3,
    candidateEffort: `${blueprint.duration} min`,
    recruiterEffort: '20 min',
    warnings: generated ? problems.filter(p => p.flagged).map(p => `Review: "${p.title}"`) : [],
    readinessState: generated && approvedCount === problems.length ? 'ready' : generated ? 'review' : 'in-progress',
  };

  return (
    <AppLayout>
      <div className="sticky top-0 z-10 bg-card border-b px-6 py-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-bold">Coding Assessment Builder</h1>
            <p className="text-xs text-muted-foreground mt-0.5">{roleContext.jobTitle} • {roleContext.department}</p>
          </div>
          <Button variant="outline" size="sm"><Save className="w-3.5 h-3.5 mr-1" />Save Draft</Button>
        </div>
        <StepProgress steps={steps} currentStep={currentStep} onStepClick={s => setCurrentStep(s as AssessmentStep)} />
      </div>

      <div className="flex gap-6 p-6 max-w-[1600px] mx-auto">
        <div className="flex-1 min-w-0">
          {currentStep === 1 && <CodingContextStep context={roleContext} onChange={setRoleContext} />}
          {currentStep === 2 && <CodingCompetencyStep competencies={competencies} onChange={setCompetencies} />}
          {currentStep === 3 && <CodingBlueprintStep blueprint={blueprint} onChange={setBlueprint} />}
          {currentStep === 4 && !generating && !generated && (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
              <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mb-6">
                <Sparkles className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Ready to Generate</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-md">
                AI will generate {blueprint.poolSize} coding problems, then select the best {blueprint.problemsToSend} for your assessment.
              </p>
              <Button size="lg" onClick={handleGenerate}>
                <Sparkles className="w-4 h-4 mr-2" />Generate Problems
              </Button>
            </div>
          )}
          {currentStep === 4 && generating && (
            <GenerationLoader steps={codingGenerationSteps} onComplete={handleGenerationComplete} />
          )}
          {currentStep === 4 && generated && (
            <CodingReviewStep problems={problems} onChange={setProblems} />
          )}

          <div className="flex items-center justify-between mt-8 pt-6 border-t">
            <Button variant="outline" onClick={() => setCurrentStep(s => Math.max(1, s - 1) as AssessmentStep)} disabled={currentStep === 1}>
              <ChevronLeft className="w-4 h-4 mr-1" />Previous
            </Button>
            {currentStep < 4 && (
              <Button onClick={() => setCurrentStep(s => Math.min(4, s + 1) as AssessmentStep)}>
                Next<ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </div>

        <div className="w-[300px] shrink-0 hidden xl:block">
          <div className="sticky top-[140px]">
            <ConfidencePanel metrics={metrics} competencies={competencies} type="coding" questionStats={problemStats} />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
