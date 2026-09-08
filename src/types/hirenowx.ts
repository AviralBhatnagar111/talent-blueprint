// ============================================================
// HireNowX — Shared Type System
// Backend-ready interfaces. All three builders consume these.
// ============================================================

export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type RoleLevel = 'Junior' | 'Mid' | 'Senior' | 'Staff' | 'Lead' | 'Director';

// -------------------- Role Context --------------------
export interface RoleContext {
  roleTitle: string;
  roleLevel: RoleLevel;
  department: string;
  experienceMin: number;
  experienceMax: number;
  industry: string;
  domain: string;
  subDomain: string;
  workMode: 'Remote' | 'Hybrid' | 'Onsite';
  primarySkills: string[];
  secondarySkills: string[];
  mustTestTech?: string[];
  codingLanguages?: string[];
  roleObjective: string;
  hiringManager: string;
  openings: number;
  aiConfidence: { roleFit: number; skillExtraction: number; seniority: number; languageRelevance?: number };
}

// -------------------- Competency --------------------
export type CompetencyCategory = 'Technical' | 'Domain' | 'Behavioral';

export interface Competency {
  id: string;
  name: string;
  category: CompetencyCategory;
  weight: number;
  coverage: number; // 0-100 live coverage
  isMustCover: boolean;
}

// -------------------- Round Plan --------------------
export type RoundType =
  | 'Screening'
  | 'MCQ'
  | 'Coding'
  | 'OneWayInterview'
  | 'AIInterview'
  | 'AICoding'
  | 'ManualInterview'
  | 'HR'
  | 'TakeHome'
  | 'FinalApproval';

export interface Round {
  id: string;
  orderIndex: number;
  type: RoundType;
  label: string;
  purpose?: string;
  durationMin: number;
  mandatory: boolean;
  autoTrigger: boolean;
  evaluatorId?: string;
  passThreshold?: number;
  notes?: string;
  assessmentStatus: 'not_built' | 'draft' | 'ready';
  assessmentId?: string;
  assessmentMeta?: { count: number; unit: string };
  assessedSkills?: string[];
  aiConfig?: AIRoundConfig;
}

export interface AIRoundConfig {
  kind: 'AIInterview' | 'AICoding';
  name?: string;
  skills: string[];
  experienceLevel?: string;
  durationMin: number;
  questionStyle?: 'Technical' | 'Behavioral' | 'Scenario' | 'Mixed';
  problemStyle?: 'Debugging' | 'Implementation' | 'LiveReasoning' | 'CodeExplanation' | 'Mixed';
  difficulty?: Difficulty;
  language?: string;
  codingLanguage?: string;
  proctoring?: 'Off' | 'Standard' | 'Strict';
  threshold?: number;
  candidateInstructions?: string;
  rubric?: string;
}

// -------------------- MCQ --------------------
export type MCQType = 'MCQ' | 'TrueFalse' | 'Scenario' | 'ShortAnswer';

export interface MCQBlueprint {
  questionsToSend: number;
  poolSize: number;
  durationMin: number;
  difficultyMix: { easy: number; medium: number; hard: number };
  questionTypes: MCQType[];
  competencyWeights: Record<string, number>;
  antiRepeat: boolean;
  randomizeOrder: boolean;
  randomizeOptions: boolean;
  strictExperience: boolean;
  language: string;
  industryEmphasis: number; // 0-100
}

export interface MCQQuestion {
  id: string;
  text: string;
  options: Array<{ id: string; text: string; isCorrect: boolean }>;
  explanation: string;
  competencyId: string;
  competencyName: string;
  skillTag: string;
  difficulty: Difficulty;
  type: MCQType;
  estimatedTimeSec: number;
  status: 'pending' | 'approved' | 'flagged' | 'locked' | 'removed';
  reviewFlag?: 'ambiguous' | 'too_easy' | 'too_hard' | 'duplicate_risk';
  freshness: 'new' | 'recent' | 'stale';
}

// -------------------- Coding --------------------
export type CodingProblemType =
  | 'Algorithmic'
  | 'Implementation'
  | 'Debugging'
  | 'OutputPrediction'
  | 'Refactoring'
  | 'APILogic'
  | 'FrontendUI'
  | 'SQL'
  | 'SystemDesignLite'
  | 'RealWorld';

export type CodingLanguage = 'JavaScript' | 'TypeScript' | 'Python' | 'Java' | 'C++' | 'Go' | 'SQL';

export interface CodingBlueprint {
  problemsToSend: number;
  poolSize: number;
  durationMin: number;
  difficultyMix: { easy: number; medium: number; hard: number };
  languages: CodingLanguage[];
  problemTypes: CodingProblemType[];
  competencyWeights: Record<string, number>;
  testCases: { visible: number; hidden: number };
  executionLimits: { timeMs: number; memoryMB: number };
  scoring: { partial: boolean; weighted: boolean };
  integrity: { plagiarism: boolean; tabSwitch: boolean; copyPasteBlock: boolean; aiDetection: boolean };
  proctoringLevel: 'Off' | 'Standard' | 'Strict';
  antiRepeat: boolean;
  benchmarkMode: boolean;
  strictExperience: boolean;
}

export interface CodingProblem {
  id: string;
  title: string;
  summary: string;
  fullStatement: string;
  ioFormat: { input: string; output: string };
  constraints: string[];
  sampleCases: Array<{ input: string; output: string; explanation: string }>;
  hiddenCaseCount: number;
  expectedComplexity: { time: string; space: string };
  scoring: { maxPoints: number; perTestCase: number };
  competencyId: string;
  competencyName: string;
  skillTag: string;
  difficulty: Difficulty;
  problemType: CodingProblemType;
  languagesSupported: CodingLanguage[];
  estimatedSolveTimeMin: number;
  rationale: string;
  status: 'pending' | 'approved' | 'flagged' | 'locked' | 'removed';
  reviewFlag?: 'leetcode_similar' | 'ambiguous' | 'too_easy' | 'too_hard';
  freshness: 'new' | 'recent' | 'stale';
  highRoleFit?: boolean;
}

// -------------------- Job / Template --------------------
export interface JobRecord {
  id: string;
  title: string;
  department: string;
  location: string;
  workMode: 'Remote' | 'Hybrid' | 'Onsite';
  employmentType: 'Full-time' | 'Contract' | 'Part-time';
  experienceBand: string;
  openings: number;
  status: 'Open' | 'Draft' | 'Closed';
  postedAt: string;
  applicants: number;
  inPipeline: number;
  templateStatus: 'not_built' | 'draft' | 'ready';
  roleContext: RoleContext;
  competencies: Competency[];
  rounds: Round[];
}

// -------------------- Panel metrics --------------------
export interface PlanHealth {
  readiness: number;
  roundsConfigured: number;
  candidateEffort: number;
  recruiterEffort: number;
  competencyCoverage: 'Low' | 'Medium' | 'High';
  warnings: string[];
  notes: string[];
}

export interface PoolAnalyticsMCQ {
  qualityConfidence: number;
  poolSize: number;
  selected: number;
  approved: number;
  pending: number;
  flagged: number;
  difficulty: { easy: number; medium: number; hard: number };
  competencyCoverage: Record<string, number>;
  typeDistribution: Record<MCQType, number>;
  antiRepeatActive: boolean;
  freshnessHigh: boolean;
  strictRoleAligned: boolean;
}

export interface PoolAnalyticsCoding extends PoolAnalyticsMCQ {
  languageCoverage: Record<string, number>;
  testCaseHealth: { visibleAvg: number; hiddenAvg: number };
  plagiarismArmed: boolean;
  aiDetectionArmed: boolean;
}

// ============================================================
// One-Way (async recorded) Interview
// ============================================================
export type OneWaySource = 'ai' | 'bank' | 'manual';
export type OneWayCategory = 'Technical' | 'Behavioral' | 'Situational' | 'RoleSpecific' | 'Communication';

export interface OneWayQuestion {
  id: string;
  text: string;
  category: OneWayCategory;
  competencyName: string;
  skillTag: string;
  difficulty: Difficulty;
  thinkTimeSec: number;
  answerTimeSec: number;
  retakesAllowed: number;
  mustAsk: boolean;
  idealAnswerPoints: string[];
  source: OneWaySource;
  status: 'pending' | 'approved';
}

export interface OneWayConfig {
  name: string;
  mode: 'Video' | 'Audio';
  defaultThinkTimeSec: number;
  defaultAnswerTimeSec: number;
  retakesAllowed: number;
  practiceQuestion: boolean;
  systemCheck: boolean;
  idVerification: boolean;
  proctoring: 'Off' | 'Standard' | 'Strict';
  deadlineDays: number;
  threshold: number;
  instructions: string;
  difficultyMix: { easy: number; medium: number; hard: number };
}

export interface OneWayAssessment {
  id: string;
  roundId: string;
  config: OneWayConfig;
  questions: OneWayQuestion[];
  status: 'draft' | 'ready';
}

export interface OneWayAnswerEval {
  questionId: string;
  questionText: string;
  competencyName: string;
  durationSec: number;
  retakesUsed: number;
  transcript: string;
  scores: { communication: number; relevance: number; depth: number; confidence: number; structure: number };
  overall: number;
  highlights: string[];
  concerns: string[];
  keywords: string[];
}

export interface OneWaySubmission {
  submittedAt: string;
  answers: OneWayAnswerEval[];
  overallScore: number;
  integrity: { faceMatch: number; tabSwitches: number; multipleFaces: number; audioClarity: number; deviceChanges: number };
  aiSummary: string;
  strengths: string[];
  risks: string[];
  recommendation: 'Strong Fit' | 'Fit' | 'Borderline' | 'Not a Fit';
}

export interface CandidateRecord {
  id: string;
  jobId: string;
  name: string;
  email: string;
  initials: string;
  appliedAt: string;
  experience: string;
  currentRole: string;
  oneWayStatus: 'not_invited' | 'invited' | 'in_progress' | 'submitted' | 'reviewed';
  invitedAt?: string;
  submission?: OneWaySubmission;
  decision?: 'shortlist' | 'hold' | 'reject';
  recruiterNotes?: string;
  recruiterScore?: number;
}

// ============================================================
// Personality Assessment (Big Five / FFM)
// ============================================================
export type BigFiveTrait =
  | 'Conscientiousness'
  | 'Extraversion'
  | 'Agreeableness'
  | 'Openness'
  | 'Emotional Stability';

export type FacetRelevance = 'High' | 'Moderate' | 'Low';
export type ItemDirection = 'Positive' | 'Reverse';

export interface PersonalityFacet {
  id: string;
  name: string;
  trait: BigFiveTrait;
  relevance: FacetRelevance;
  preferredMin: number;
  preferredMax: number;
  direction: 'Higher preferred' | 'Balanced' | 'Lower preferred';
  descriptor: string;
}

export interface PersonalityItem {
  id: string;
  order: number;
  text: string;
  trait: BigFiveTrait;
  facetId: string;
  facetName: string;
  direction: ItemDirection;
  status: 'active' | 'locked' | 'removed';
  reviewSuggested?: boolean;
  usageCount: number;
  reviewed: boolean;
  language: string;
  source: 'Validated Item Bank';
}

export interface PersonalityAssessment {
  id: string;
  roundId: string;
  name: string;
  roleProfileName: string;
  itemCount: number;
  durationMin: number;
  items: PersonalityItem[];
  status: 'draft' | 'ready';
}

export interface PersonalityTraitScore {
  trait: BigFiveTrait;
  score: number;
  facets: Array<{ facetId: string; name: string; score: number; relevance: FacetRelevance; inRange: boolean }>;
}

export interface PersonalityReport {
  candidateId: string;
  candidateName: string;
  completedAt: string;
  answered: number;
  total: number;
  autoSubmitted: boolean;
  roleAlignment: number;
  alignmentLabel: 'Strong Alignment' | 'Good Alignment' | 'Partial Alignment' | 'Limited Alignment';
  traits: PersonalityTraitScore[];
  strengths: string[];
  areasToExplore: string[];
  summary: string;
}
