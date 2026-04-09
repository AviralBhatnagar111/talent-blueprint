// ========== ROLE CONTEXT ==========
export interface RoleContext {
  jobTitle: string;
  department: string;
  roleType: string;
  jobLevel: string;
  industry: string;
  domain: string;
  subDomain: string;
  experienceRange: [number, number];
  primarySkills: string[];
  secondarySkills: string[];
  workMode: string;
  hiringManager: string;
  openings: number;
  roleObjective: string;
}

// ========== COMPETENCY ==========
export type CompetencyCategory = 'technical' | 'domain' | 'behavioral';

export interface Competency {
  id: string;
  name: string;
  category: CompetencyCategory;
  weight: number;
  included: boolean;
  description: string;
  mustCover?: boolean;
}

// ========== ROUNDS ==========
export type RoundType = 'screening' | 'mcq' | 'coding' | 'ai-interview' | 'manual-interview' | 'hr' | 'final-review';

export interface Round {
  id: string;
  order: number;
  type: RoundType;
  name: string;
  purpose: string;
  candidateLabel: string;
  competencies: string[];
  skills: string[];
  owner: string;
  duration: number;
  passThreshold: number;
  mandatory: boolean;
  autoTrigger: boolean;
  notes: string;
  questionCount?: number;
  poolSize?: number;
  timeLimit?: number;
  expanded?: boolean;
}

// ========== RULES ==========
export interface RoundRules {
  difficultyMix: { easy: number; medium: number; hard: number };
  competencyWeights: Record<string, number>;
  questionDistribution: string;
  antiRepeat: boolean;
  randomizeQuestions: boolean;
  randomizeOptions: boolean;
  timePressure: 'relaxed' | 'standard' | 'intense';
  adaptiveDifficulty: boolean;
  percentileBenchmarking: boolean;
  strictRoleAlignment: boolean;
  strictExperienceAlignment: boolean;
}

// ========== MCQ ASSESSMENT ==========
export type QuestionType = 'mcq' | 'true-false' | 'scenario' | 'short-answer';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface MCQQuestion {
  id: string;
  text: string;
  competency: string;
  difficulty: Difficulty;
  type: QuestionType;
  skill: string;
  estimatedTime: number;
  options: { id: string; text: string; correct: boolean }[];
  explanation: string;
  approved: boolean;
  locked: boolean;
  flagged: boolean;
}

export interface MCQBlueprint {
  questionsToSend: number;
  poolSize: number;
  duration: number;
  difficultySplit: { easy: number; medium: number; hard: number };
  typeMix: Record<QuestionType, number>;
  industry: string;
  language: string;
  scenarioStyle: string;
  antiRepeat: boolean;
  freshnessPreference: 'latest' | 'mixed' | 'classic';
  strictExperienceFit: boolean;
  strictSkillFit: boolean;
}

// ========== CODING ASSESSMENT ==========
export type CodingProblemType = 'debugging' | 'output-prediction' | 'implementation' | 'algorithmic' | 'practical' | 'api-logic' | 'sql-data' | 'frontend-ui' | 'backend-logic' | 'test-completion' | 'refactoring';

export interface CodingProblem {
  id: string;
  title: string;
  summary: string;
  competency: string;
  skill: string;
  difficulty: Difficulty;
  experienceFit: string;
  languages: string[];
  estimatedTime: number;
  scoreWeight: number;
  type: CodingProblemType;
  freshness: 'fresh' | 'recent' | 'classic';
  testCases: { visible: number; hidden: number };
  explanation: string;
  prompt: string;
  constraints: string[];
  inputFormat: string;
  outputFormat: string;
  sampleCases: { input: string; output: string }[];
  expectedComplexity: string;
  evaluationType: string;
  scoringLogic: string;
  approved: boolean;
  locked: boolean;
  flagged: boolean;
}

export interface CodingBlueprint {
  problemsToSend: number;
  poolSize: number;
  duration: number;
  difficultySplit: { easy: number; medium: number; hard: number };
  languages: string[];
  multiLanguageMode: boolean;
  typeMix: Record<string, number>;
  visibleTestCases: number;
  hiddenTestCases: number;
  executionTimeLimit: number;
  memoryLimit: number;
  partialScoring: boolean;
  plagiarismCheck: boolean;
  antiRepeat: boolean;
  randomize: boolean;
  strictExperienceAlignment: boolean;
  strictDomainAlignment: boolean;
  allowHints: boolean;
  proctoringMode: boolean;
  benchmarkMode: boolean;
}

// ========== CONFIDENCE ==========
export interface ConfidenceMetrics {
  roleFit: number;
  competencyCoverage: number;
  skillCoverage: number;
  qualityConfidence: number;
  repeatRisk: number;
  candidateEffort: string;
  recruiterEffort: string;
  warnings: string[];
  readinessState: 'not-started' | 'in-progress' | 'review' | 'ready';
}

// ========== PLAN STATUS ==========
export type PlanStep = 1 | 2 | 3 | 4 | 5;
export type AssessmentStep = 1 | 2 | 3 | 4;
