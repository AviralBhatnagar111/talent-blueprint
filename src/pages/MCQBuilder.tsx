import { useState, useCallback } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { StepProgress } from '@/components/shared/StepProgress';
import { ConfidencePanel } from '@/components/shared/ConfidencePanel';
import { GenerationLoader } from '@/components/shared/GenerationLoader';
import { MCQContextStep } from '@/components/mcq/MCQContextStep';
import { MCQCompetencyStep } from '@/components/mcq/MCQCompetencyStep';
import { MCQBlueprintStep } from '@/components/mcq/MCQBlueprintStep';
import { MCQReviewStep } from '@/components/mcq/MCQReviewStep';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Save, Sparkles } from 'lucide-react';
import { defaultRoleContext, engineeringCompetencies, defaultMCQBlueprint, sampleMCQQuestions, generationSteps } from '@/data/mockData';
import type { RoleContext, Competency, MCQBlueprint, MCQQuestion, AssessmentStep, ConfidenceMetrics, Difficulty } from '@/types/hirenowx';

const steps = [
  { number: 1, label: 'JD Context', description: 'Parse & confirm' },
  { number: 2, label: 'Competency Map', description: 'Weight & coverage' },
  { number: 3, label: 'Blueprint', description: 'Configure generation' },
  { number: 4, label: 'Generate & Review', description: 'Finalize assessment' },
];

export default function MCQBuilder() {
  const [currentStep, setCurrentStep] = useState<AssessmentStep>(1);
  const [roleContext, setRoleContext] = useState<RoleContext>(defaultRoleContext);
  const [competencies, setCompetencies] = useState<Competency[]>(engineeringCompetencies);
  const [blueprint, setBlueprint] = useState<MCQBlueprint>(defaultMCQBlueprint);
  const [questions, setQuestions] = useState<MCQQuestion[]>([]);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const handleGenerate = () => {
    setGenerating(true);
  };

  const handleGenerationComplete = useCallback(() => {
    setGenerating(false);
    setGenerated(true);
    setQuestions(sampleMCQQuestions);
  }, []);

  const approvedCount = questions.filter(q => q.approved).length;

  const questionStats = generated ? {
    total: questions.length,
    approved: approvedCount,
    byDifficulty: {
      easy: questions.filter(q => q.difficulty === 'easy').length,
      medium: questions.filter(q => q.difficulty === 'medium').length,
      hard: questions.filter(q => q.difficulty === 'hard').length,
    } as Record<Difficulty, number>,
    byCompetency: questions.reduce((a, q) => ({ ...a, [q.competency]: (a[q.competency] || 0) + 1 }), {} as Record<string, number>),
    byType: questions.reduce((a, q) => ({ ...a, [q.type]: (a[q.type] || 0) + 1 }), {} as Record<string, number>),
  } : undefined;

  const metrics: ConfidenceMetrics = {
    roleFit: 85,
    competencyCoverage: competencies.filter(c => c.included).length / competencies.length * 100,
    skillCoverage: 78,
    qualityConfidence: generated ? 82 : currentStep >= 3 ? 55 : 30,
    repeatRisk: 5,
    candidateEffort: `${blueprint.duration} min`,
    recruiterEffort: '15 min',
    warnings: generated ? questions.filter(q => q.flagged).map(q => `Review suggested: "${q.text.slice(0, 40)}..."`) : [],
    readinessState: generated && approvedCount === questions.length ? 'ready' : generated ? 'review' : 'in-progress',
  };

  return (
    <AppLayout>
      <div className="sticky top-0 z-10 bg-card border-b px-6 py-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-bold">MCQ Assessment Builder</h1>
            <p className="text-xs text-muted-foreground mt-0.5">{roleContext.jobTitle} • {roleContext.department}</p>
          </div>
          <Button variant="outline" size="sm"><Save className="w-3.5 h-3.5 mr-1" />Save Draft</Button>
        </div>
        <StepProgress steps={steps} currentStep={currentStep} onStepClick={s => setCurrentStep(s as AssessmentStep)} />
      </div>

      <div className="flex gap-6 p-6 max-w-[1600px] mx-auto">
        <div className="flex-1 min-w-0">
          {currentStep === 1 && <MCQContextStep context={roleContext} onChange={setRoleContext} />}
          {currentStep === 2 && <MCQCompetencyStep competencies={competencies} onChange={setCompetencies} />}
          {currentStep === 3 && <MCQBlueprintStep blueprint={blueprint} onChange={setBlueprint} />}
          {currentStep === 4 && !generating && !generated && (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
              <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mb-6">
                <Sparkles className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Ready to Generate</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-md">
                AI will generate {blueprint.poolSize} questions based on your blueprint, then select the best {blueprint.questionsToSend} for your assessment.
              </p>
              <Button size="lg" onClick={handleGenerate}>
                <Sparkles className="w-4 h-4 mr-2" />Generate Assessment
              </Button>
            </div>
          )}
          {currentStep === 4 && generating && (
            <GenerationLoader steps={generationSteps} onComplete={handleGenerationComplete} />
          )}
          {currentStep === 4 && generated && (
            <MCQReviewStep questions={questions} onChange={setQuestions} />
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
            <ConfidencePanel metrics={metrics} competencies={competencies} type="mcq" questionStats={questionStats} />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
