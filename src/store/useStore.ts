import { create } from 'zustand';
import type { JobRecord, Round, MCQQuestion, CodingProblem, RoleContext, Competency } from '@/types/hirenowx';
import { mockJobs, sampleMCQQuestions, sampleCodingProblems } from '@/data/mockData';

interface AssessmentMCQ {
  id: string;
  roundId: string;
  name: string;
  questionsToSend: number;
  durationMin: number;
  passThreshold: number;
  questions: MCQQuestion[];
  status: 'draft' | 'ready';
}

interface AssessmentCoding {
  id: string;
  roundId: string;
  name: string;
  problemsToSend: number;
  durationMin: number;
  passThreshold: number;
  languages: string[];
  problems: CodingProblem[];
  status: 'draft' | 'ready';
}

interface HireNowXStore {
  jobs: JobRecord[];
  mcqAssessments: Record<string, AssessmentMCQ>; // key = roundId
  codingAssessments: Record<string, AssessmentCoding>;

  getJob: (id: string) => JobRecord | undefined;
  updateJobRounds: (jobId: string, rounds: Round[]) => void;
  updateJobContext: (jobId: string, patch: Partial<RoleContext>) => void;
  updateJobCompetencies: (jobId: string, competencies: Competency[]) => void;

  saveMCQAssessment: (jobId: string, roundId: string, a: AssessmentMCQ) => void;
  saveCodingAssessment: (jobId: string, roundId: string, a: AssessmentCoding) => void;

  getMCQ: (roundId: string) => AssessmentMCQ | undefined;
  getCoding: (roundId: string) => AssessmentCoding | undefined;

  getSampleMCQ: () => MCQQuestion[];
  getSampleCoding: () => CodingProblem[];
}

export const useStore = create<HireNowXStore>((set, get) => ({
  jobs: mockJobs,
  mcqAssessments: {},
  codingAssessments: {},

  getJob: (id) => get().jobs.find(j => j.id === id),

  updateJobRounds: (jobId, rounds) =>
    set(state => ({
      jobs: state.jobs.map(j => j.id === jobId ? { ...j, rounds: rounds.map((r, i) => ({ ...r, orderIndex: i })) } : j),
    })),

  updateJobContext: (jobId, patch) =>
    set(state => ({
      jobs: state.jobs.map(j => j.id === jobId ? { ...j, roleContext: { ...j.roleContext, ...patch } } : j),
    })),

  updateJobCompetencies: (jobId, competencies) =>
    set(state => ({
      jobs: state.jobs.map(j => j.id === jobId ? { ...j, competencies } : j),
    })),

  saveMCQAssessment: (jobId, roundId, a) =>
    set(state => {
      const updatedRounds = state.jobs.find(j => j.id === jobId)?.rounds.map(r =>
        r.id === roundId ? { ...r, assessmentStatus: 'ready' as const, assessmentId: a.id, assessmentMeta: { count: a.questionsToSend, unit: 'questions' } } : r
      ) ?? [];
      return {
        mcqAssessments: { ...state.mcqAssessments, [roundId]: a },
        jobs: state.jobs.map(j => j.id === jobId ? { ...j, rounds: updatedRounds } : j),
      };
    }),

  saveCodingAssessment: (jobId, roundId, a) =>
    set(state => {
      const updatedRounds = state.jobs.find(j => j.id === jobId)?.rounds.map(r =>
        r.id === roundId ? { ...r, assessmentStatus: 'ready' as const, assessmentId: a.id, assessmentMeta: { count: a.problemsToSend, unit: 'problems' } } : r
      ) ?? [];
      return {
        codingAssessments: { ...state.codingAssessments, [roundId]: a },
        jobs: state.jobs.map(j => j.id === jobId ? { ...j, rounds: updatedRounds } : j),
      };
    }),

  getMCQ: (roundId) => get().mcqAssessments[roundId],
  getCoding: (roundId) => get().codingAssessments[roundId],

  getSampleMCQ: () => sampleMCQQuestions.map(q => ({ ...q })),
  getSampleCoding: () => sampleCodingProblems.map(p => ({ ...p })),
}));
