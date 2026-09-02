import type { CandidateRecord, OneWayAnswerEval, OneWayQuestion, OneWaySubmission } from '@/types/hirenowx';

export const oneWayGenerationSteps = [
  'Reading role context…',
  'Mapping interview competencies…',
  'Drafting role-relevant questions…',
  'Calibrating think & answer time…',
  'Balancing behavioral vs technical mix…',
  'Preparing evaluation rubric…',
];

const q = (
  id: string,
  text: string,
  category: OneWayQuestion['category'],
  competencyName: string,
  skillTag: string,
  difficulty: OneWayQuestion['difficulty'],
  answerTimeSec: number,
  idealAnswerPoints: string[],
): OneWayQuestion => ({
  id,
  text,
  category,
  competencyName,
  skillTag,
  difficulty,
  thinkTimeSec: 30,
  answerTimeSec,
  retakesAllowed: 1,
  mustAsk: false,
  idealAnswerPoints,
  source: 'bank',
  status: 'pending',
});

/** Reusable question bank — recruiters can pull these into any One-Way interview. */
export const oneWayQuestionBank: OneWayQuestion[] = [
  q('bank-1', 'Walk us through your background and the work you are most proud of in the last two years.', 'Communication', 'Communication', 'Self Presentation', 'Easy', 120, ['Clear narrative arc', 'Quantified impact', 'Relevance to this role']),
  q('bank-2', 'Describe a production issue you owned end to end. How did you diagnose and resolve it?', 'Technical', 'Debugging', 'Debugging', 'Hard', 180, ['Structured diagnosis', 'Tooling & telemetry used', 'Permanent fix and prevention']),
  q('bank-3', 'How do you decide between shipping fast and investing in architecture?', 'Situational', 'System Thinking', 'Architecture', 'Medium', 150, ['Trade-off framing', 'Business context', 'Concrete example']),
  q('bank-4', 'Tell us about a time you disagreed with a design or technical decision. What happened?', 'Behavioral', 'Collaboration', 'Collaboration', 'Medium', 150, ['Specific situation', 'Respectful influence', 'Outcome and learning']),
  q('bank-5', 'Explain a performance problem you optimised. What did you measure before and after?', 'Technical', 'Performance Optimization', 'Web Performance', 'Hard', 180, ['Baseline metrics', 'Root cause', 'Measured improvement']),
  q('bank-6', 'How do you mentor engineers who are earlier in their career?', 'Behavioral', 'Collaboration', 'Mentoring', 'Medium', 120, ['Coaching approach', 'Feedback cadence', 'Evidence of growth']),
  q('bank-7', 'A stakeholder changes requirements mid-sprint. How do you respond?', 'Situational', 'Communication', 'Stakeholder Mgmt', 'Medium', 120, ['Clarify impact', 'Re-prioritise transparently', 'Protect quality']),
  q('bank-8', 'Describe how you approach breaking down an ambiguous problem into deliverables.', 'RoleSpecific', 'Problem Solving', 'Problem Solving', 'Medium', 150, ['Discovery method', 'Slicing strategy', 'Risk sequencing']),
  q('bank-9', 'What does high code quality mean to you in a fast-moving product team?', 'Technical', 'Frontend Ecosystem', 'Code Quality', 'Easy', 120, ['Standards and reviews', 'Testing philosophy', 'Pragmatism']),
  q('bank-10', 'Tell us about a project that did not go well. What would you do differently?', 'Behavioral', 'Problem Solving', 'Ownership', 'Medium', 150, ['Honest reflection', 'Root cause ownership', 'Applied learning']),
  q('bank-11', 'How do you keep accessibility in scope when deadlines are tight?', 'RoleSpecific', 'Frontend Ecosystem', 'Accessibility', 'Medium', 120, ['Baseline standards', 'Automation', 'Non-negotiables']),
  q('bank-12', 'Why this role, and what would make the first 90 days a success for you?', 'Communication', 'Motivation', 'Motivation', 'Easy', 120, ['Role-specific motivation', 'Concrete 90-day plan', 'Alignment with team goals']),
];

const answer = (
  questionId: string,
  questionText: string,
  competencyName: string,
  durationSec: number,
  overall: number,
  transcript: string,
  highlights: string[],
  concerns: string[],
  keywords: string[],
  retakesUsed = 0,
): OneWayAnswerEval => ({
  questionId,
  questionText,
  competencyName,
  durationSec,
  retakesUsed,
  transcript,
  scores: {
    communication: Math.min(100, overall + 4),
    relevance: overall,
    depth: Math.max(30, overall - 6),
    confidence: Math.min(100, overall + 2),
    structure: Math.max(30, overall - 3),
  },
  overall,
  highlights,
  concerns,
  keywords,
});

const strongSubmission: OneWaySubmission = {
  submittedAt: '2026-02-11T09:24:00Z',
  overallScore: 86,
  recommendation: 'Strong Fit',
  aiSummary:
    'Candidate communicates with clear structure and consistently grounds answers in measurable outcomes. Strong depth on debugging and performance, with credible senior-level architecture trade-off reasoning. Slightly lighter on mentoring specifics.',
  strengths: ['Evidence-backed impact statements', 'Structured problem decomposition', 'Confident, well-paced delivery'],
  risks: ['Mentoring examples stayed high level', 'Limited detail on cross-team influence'],
  integrity: { faceMatch: 97, tabSwitches: 0, multipleFaces: 0, audioClarity: 94, deviceChanges: 0 },
  answers: [
    answer('bank-1', 'Walk us through your background and the work you are most proud of in the last two years.', 'Communication', 108, 89,
      'I have spent the last six years in frontend engineering, the last three leading the design-system and performance workstreams for an enterprise analytics suite. The work I am proudest of is a rendering rewrite that cut dashboard time-to-interactive from 4.1s to 1.3s for our largest tenant, which unblocked a seven-figure renewal.',
      ['Quantified outcome tied to business value', 'Clear ownership language'], [], ['design system', 'performance', 'time-to-interactive', 'ownership']),
    answer('bank-2', 'Describe a production issue you owned end to end. How did you diagnose and resolve it?', 'Debugging', 172, 88,
      'We had intermittent blank screens after navigation. I reproduced it behind a feature flag, captured heap snapshots, and found event listeners surviving unmount in a legacy chart wrapper. I shipped the cleanup fix, added a lint rule for effect cleanup, and a synthetic check that fails the pipeline if memory grows across a navigation loop.',
      ['Systematic diagnosis with real tooling', 'Added permanent prevention'], ['Did not mention customer comms during incident'], ['heap snapshot', 'memory leak', 'effect cleanup', 'regression guard']),
    answer('bank-3', 'How do you decide between shipping fast and investing in architecture?', 'System Thinking', 141, 84,
      'I look at the reversibility of the decision. If the cost of change later is low, I ship the simple version behind a flag. If it is a data-shape or contract decision, I invest early because those are expensive to unwind. On our billing migration we did the second and it saved us a quarter of rework.',
      ['Reversibility framing', 'Concrete supporting example'], ['Could quantify the trade-off more'], ['reversibility', 'feature flag', 'contracts', 'trade-off']),
    answer('bank-6', 'How do you mentor engineers who are earlier in their career?', 'Collaboration', 96, 74,
      'I pair weekly, review pull requests with intent rather than nitpicks, and try to give people a project with real stakes early. I keep a short growth doc per person so feedback is not a surprise at review time.',
      ['Structured feedback cadence'], ['No named outcome or promotion example', 'Answer ended early'], ['pairing', 'code review', 'growth plan'], 1),
  ],
};

const borderlineSubmission: OneWaySubmission = {
  submittedAt: '2026-02-12T14:02:00Z',
  overallScore: 62,
  recommendation: 'Borderline',
  aiSummary:
    'Answers are relevant but stay conceptual. Communication is calm and clear, yet several responses lack concrete metrics or a named example. Technical depth is adequate for mid-level scope; senior-level architecture reasoning was not demonstrated.',
  strengths: ['Clear, calm delivery', 'Good collaboration instincts'],
  risks: ['Few quantified outcomes', 'Shallow depth on performance question', 'One long pause and a retake used'],
  integrity: { faceMatch: 91, tabSwitches: 2, multipleFaces: 0, audioClarity: 88, deviceChanges: 1 },
  answers: [
    answer('bank-1', 'Walk us through your background and the work you are most proud of in the last two years.', 'Communication', 94, 70,
      'I have worked mostly on React applications for internal tooling. The project I am proudest of is a rebuild of our admin console which made things much faster and easier for the support team to use.',
      ['Relevant stack experience'], ['No metrics on the improvement claimed'], ['React', 'admin console', 'internal tooling']),
    answer('bank-2', 'Describe a production issue you owned end to end. How did you diagnose and resolve it?', 'Debugging', 121, 64,
      'We had an issue where the page was slow after a release. I checked the console and the network tab, found a large request, and asked the backend team to reduce the payload which fixed it.',
      ['Used browser tooling'], ['Handed off root cause instead of owning it', 'No prevention step'], ['network tab', 'payload']),
    answer('bank-5', 'Explain a performance problem you optimised. What did you measure before and after?', 'Performance Optimization', 88, 55,
      'We noticed the list page was laggy so we added pagination and it felt smoother afterwards.',
      [], ['No baseline or after measurement', 'Very short answer for a hard question'], ['pagination'], 1),
    answer('bank-12', 'Why this role, and what would make the first 90 days a success for you?', 'Motivation', 112, 72,
      'I want to work on a product with more scale and a stronger engineering culture. In the first 90 days I would want to understand the codebase and start shipping features independently.',
      ['Genuine motivation'], ['90-day plan is generic'], ['scale', 'engineering culture', 'ramp up']),
  ],
};

export const mockCandidates: CandidateRecord[] = [
  {
    id: 'cand-1', jobId: 'eng-001', name: 'Aarav Mehta', email: 'aarav.mehta@example.com', initials: 'AM',
    appliedAt: '2026-02-08', experience: '7 yrs', currentRole: 'Senior Frontend Engineer, Zenpay',
    oneWayStatus: 'submitted', invitedAt: '2026-02-09', submission: strongSubmission,
  },
  {
    id: 'cand-2', jobId: 'eng-001', name: 'Priya Nair', email: 'priya.nair@example.com', initials: 'PN',
    appliedAt: '2026-02-08', experience: '5 yrs', currentRole: 'Frontend Engineer, Lumen',
    oneWayStatus: 'submitted', invitedAt: '2026-02-09', submission: borderlineSubmission,
  },
  {
    id: 'cand-3', jobId: 'eng-001', name: 'Rohan Iyer', email: 'rohan.iyer@example.com', initials: 'RI',
    appliedAt: '2026-02-09', experience: '6 yrs', currentRole: 'UI Engineer, Craftbase',
    oneWayStatus: 'in_progress', invitedAt: '2026-02-10',
  },
  {
    id: 'cand-4', jobId: 'eng-001', name: 'Sneha Kulkarni', email: 'sneha.k@example.com', initials: 'SK',
    appliedAt: '2026-02-10', experience: '8 yrs', currentRole: 'Staff Engineer, Fintrail',
    oneWayStatus: 'invited', invitedAt: '2026-02-11',
  },
  {
    id: 'cand-5', jobId: 'eng-001', name: 'Devansh Rao', email: 'devansh.rao@example.com', initials: 'DR',
    appliedAt: '2026-02-11', experience: '5 yrs', currentRole: 'Frontend Engineer, Nudge',
    oneWayStatus: 'not_invited',
  },
  {
    id: 'cand-6', jobId: 'sales-001', name: 'Meera Shah', email: 'meera.shah@example.com', initials: 'MS',
    appliedAt: '2026-02-07', experience: '6 yrs', currentRole: 'Account Executive, Orbital',
    oneWayStatus: 'not_invited',
  },
];
