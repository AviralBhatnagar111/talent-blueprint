import type {
  RoleContext, Competency, Round, MCQBlueprint, MCQQuestion,
  CodingBlueprint, CodingProblem, JobRecord,
} from '@/types/hirenowx';

// ============================================================
// Engineering Role — Senior Frontend Engineer
// ============================================================
const engineeringRoleContext: RoleContext = {
  roleTitle: 'Senior Frontend Engineer',
  roleLevel: 'Senior',
  department: 'Engineering',
  experienceMin: 5,
  experienceMax: 8,
  industry: 'SaaS / B2B',
  domain: 'Web Engineering',
  subDomain: 'React Ecosystem',
  workMode: 'Hybrid',
  primarySkills: ['React', 'TypeScript', 'Redux', 'CSS'],
  secondarySkills: ['Testing', 'Performance', 'Accessibility', 'GraphQL'],
  mustTestTech: ['React', 'TypeScript', 'Node.js'],
  codingLanguages: ['JavaScript', 'TypeScript'],
  roleObjective:
    'Build and scale complex UI for enterprise customers. Lead frontend architecture decisions, mentor mid-level engineers, and drive performance improvements across the product suite.',
  hiringManager: 'Sarah Chen',
  openings: 2,
  aiConfidence: { roleFit: 94, skillExtraction: 91, seniority: 96, languageRelevance: 93 },
};

const engineeringCompetencies: Competency[] = [
  { id: 'c1', name: 'Problem Solving', category: 'Technical', weight: 18, coverage: 92, isMustCover: true },
  { id: 'c2', name: 'Language Fluency (TS/JS)', category: 'Technical', weight: 16, coverage: 88, isMustCover: true },
  { id: 'c3', name: 'Frontend Ecosystem', category: 'Technical', weight: 14, coverage: 90, isMustCover: true },
  { id: 'c4', name: 'Debugging', category: 'Technical', weight: 10, coverage: 78, isMustCover: false },
  { id: 'c5', name: 'System Thinking', category: 'Technical', weight: 10, coverage: 72, isMustCover: false },
  { id: 'c6', name: 'API Integration', category: 'Domain', weight: 8, coverage: 80, isMustCover: false },
  { id: 'c7', name: 'Performance Optimization', category: 'Domain', weight: 8, coverage: 65, isMustCover: false },
  { id: 'c8', name: 'Communication', category: 'Behavioral', weight: 8, coverage: 70, isMustCover: false },
  { id: 'c9', name: 'Collaboration', category: 'Behavioral', weight: 8, coverage: 75, isMustCover: false },
];

const engineeringRounds: Round[] = [
  { id: 'r1', orderIndex: 0, type: 'Screening', label: 'Initial Screening', purpose: 'Verify basic qualifications and role fit', durationMin: 15, mandatory: true, autoTrigger: true, passThreshold: 60, assessmentStatus: 'ready' },
  { id: 'r2', orderIndex: 1, type: 'MCQ', label: 'Technical MCQ', purpose: 'Evaluate core technical knowledge', durationMin: 30, mandatory: true, autoTrigger: true, passThreshold: 65, assessmentStatus: 'not_built' },
  { id: 'r3', orderIndex: 2, type: 'Coding', label: 'Coding Round', purpose: 'Hands-on implementation ability', durationMin: 90, mandatory: true, autoTrigger: true, passThreshold: 60, assessmentStatus: 'not_built' },
  { id: 'r4', orderIndex: 3, type: 'AIInterview', label: 'AI Technical Interview', purpose: 'Deep dive into system design', durationMin: 45, mandatory: true, autoTrigger: false, passThreshold: 70, assessmentStatus: 'ready' },
  { id: 'r5', orderIndex: 4, type: 'HR', label: 'HR & Culture Fit', purpose: 'Team fit and compensation', durationMin: 30, mandatory: true, autoTrigger: false, passThreshold: 70, assessmentStatus: 'ready' },
];

// ============================================================
// Sales Role — Senior Account Executive
// ============================================================
const salesRoleContext: RoleContext = {
  roleTitle: 'Senior Account Executive',
  roleLevel: 'Senior',
  department: 'Sales',
  experienceMin: 4,
  experienceMax: 7,
  industry: 'SaaS / B2B',
  domain: 'Enterprise Sales',
  subDomain: 'Mid-Market Acquisition',
  workMode: 'Hybrid',
  primarySkills: ['Enterprise Sales', 'Negotiation', 'Pipeline Management', 'Salesforce'],
  secondarySkills: ['Prospecting', 'Demo Delivery', 'Stakeholder Mapping'],
  roleObjective:
    'Own the full sales cycle for mid-market accounts. Build and manage a healthy pipeline, close $1M+ ARR annually, and collaborate with SDRs and Solution Engineers.',
  hiringManager: 'David Kim',
  openings: 3,
  aiConfidence: { roleFit: 89, skillExtraction: 86, seniority: 92 },
};

const salesCompetencies: Competency[] = [
  { id: 's1', name: 'Prospecting', category: 'Technical', weight: 16, coverage: 88, isMustCover: true },
  { id: 's2', name: 'Objection Handling', category: 'Technical', weight: 18, coverage: 85, isMustCover: true },
  { id: 's3', name: 'Negotiation', category: 'Technical', weight: 14, coverage: 82, isMustCover: true },
  { id: 's4', name: 'CRM Proficiency', category: 'Domain', weight: 10, coverage: 90, isMustCover: false },
  { id: 's5', name: 'Product Knowledge', category: 'Domain', weight: 10, coverage: 75, isMustCover: false },
  { id: 's6', name: 'Stakeholder Handling', category: 'Behavioral', weight: 16, coverage: 80, isMustCover: true },
  { id: 's7', name: 'Communication', category: 'Behavioral', weight: 16, coverage: 86, isMustCover: true },
];

const salesRounds: Round[] = [
  { id: 'sr1', orderIndex: 0, type: 'Screening', label: 'Recruiter Screen', durationMin: 20, mandatory: true, autoTrigger: true, passThreshold: 60, assessmentStatus: 'ready' },
  { id: 'sr2', orderIndex: 1, type: 'MCQ', label: 'Sales Scenario Assessment', purpose: 'Evaluate scenario-based judgment', durationMin: 25, mandatory: true, autoTrigger: true, passThreshold: 70, assessmentStatus: 'not_built' },
  { id: 'sr3', orderIndex: 2, type: 'AIInterview', label: 'AI Sales Interview', durationMin: 30, mandatory: true, autoTrigger: false, passThreshold: 70, assessmentStatus: 'ready' },
  { id: 'sr4', orderIndex: 3, type: 'ManualInterview', label: 'Hiring Manager Interview', durationMin: 45, mandatory: true, autoTrigger: false, passThreshold: 75, assessmentStatus: 'ready' },
  { id: 'sr5', orderIndex: 4, type: 'HR', label: 'HR Round', durationMin: 25, mandatory: true, autoTrigger: false, passThreshold: 65, assessmentStatus: 'ready' },
];

// ============================================================
// Blueprints
// ============================================================
export const defaultMCQBlueprint: MCQBlueprint = {
  questionsToSend: 20,
  poolSize: 60,
  questionsToGenerate: 60,
  durationMin: 30,
  difficultyMix: { easy: 30, medium: 50, hard: 20 },
  questionTypes: ['MCQ', 'TrueFalse', 'Scenario'],
  competencyWeights: {},
  antiRepeat: true,
  randomizeOrder: true,
  randomizeOptions: true,
  strictExperience: true,
  language: 'English',
  industryEmphasis: 65,
};

export const defaultCodingBlueprint: CodingBlueprint = {
  problemsToSend: 5,
  poolSize: 15,
  problemsToGenerate: 15,
  durationMin: 90,
  difficultyMix: { easy: 20, medium: 60, hard: 20 },
  languages: ['JavaScript', 'TypeScript'],
  problemTypes: ['Algorithmic', 'Implementation', 'Debugging'],
  competencyWeights: {},
  testCases: { visible: 2, hidden: 5 },
  executionLimits: { timeMs: 2000, memoryMB: 256 },
  scoring: { partial: true, weighted: true },
  integrity: { plagiarism: true, tabSwitch: true, copyPasteBlock: true, aiDetection: true },
  proctoringLevel: 'Standard',
  antiRepeat: true,
  benchmarkMode: true,
  strictExperience: true,
};

// ============================================================
// Sample MCQs (20 — engineering-focused)
// ============================================================
export const sampleMCQQuestions: MCQQuestion[] = [
  { id: 'q1', text: 'What is the primary purpose of the useCallback hook in React?', options: [{ id: 'a', text: 'To memoize expensive calculations', isCorrect: false }, { id: 'b', text: 'To memoize callback functions and prevent unnecessary re-renders', isCorrect: true }, { id: 'c', text: 'To create side effects in functional components', isCorrect: false }, { id: 'd', text: 'To manage local component state', isCorrect: false }], explanation: 'useCallback returns a memoized callback that only changes when its dependencies change, preventing unnecessary re-renders of child components that receive the callback as a prop.', competencyId: 'c3', competencyName: 'Frontend Ecosystem', skillTag: 'React', difficulty: 'Medium', type: 'MCQ', estimatedTimeSec: 60, status: 'pending', freshness: 'new' },
  { id: 'q2', text: 'Which TypeScript utility type makes all properties of T optional?', options: [{ id: 'a', text: 'Required<T>', isCorrect: false }, { id: 'b', text: 'Partial<T>', isCorrect: true }, { id: 'c', text: 'Readonly<T>', isCorrect: false }, { id: 'd', text: 'Pick<T, K>', isCorrect: false }], explanation: 'Partial<T> constructs a type where all properties of T are marked optional.', competencyId: 'c2', competencyName: 'Language Fluency', skillTag: 'TypeScript', difficulty: 'Easy', type: 'MCQ', estimatedTimeSec: 45, status: 'approved', freshness: 'new' },
  { id: 'q3', text: 'A React app becomes unresponsive after navigating between pages multiple times. The most likely cause is:', options: [{ id: 'a', text: 'CSS animations causing layout thrashing', isCorrect: false }, { id: 'b', text: 'Memory leaks from uncleared event listeners or timers', isCorrect: true }, { id: 'c', text: 'Too many API calls on page load', isCorrect: false }, { id: 'd', text: 'Browser cache overflow', isCorrect: false }], explanation: 'Memory leaks in React commonly occur when useEffect cleanup functions are missing, leaving subscriptions, listeners, or intervals active after unmount.', competencyId: 'c4', competencyName: 'Debugging', skillTag: 'React', difficulty: 'Hard', type: 'Scenario', estimatedTimeSec: 90, status: 'flagged', reviewFlag: 'ambiguous', freshness: 'new' },
  { id: 'q4', text: 'React virtual DOM reconciliation uses an O(n) diffing algorithm.', options: [{ id: 'a', text: 'True', isCorrect: true }, { id: 'b', text: 'False', isCorrect: false }], explanation: 'React uses a heuristic O(n) algorithm based on two assumptions: elements of different types produce different trees, and keys indicate stable identity.', competencyId: 'c3', competencyName: 'Frontend Ecosystem', skillTag: 'React', difficulty: 'Medium', type: 'TrueFalse', estimatedTimeSec: 30, status: 'approved', freshness: 'new' },
  { id: 'q5', text: 'What does console.log(typeof null) output?', options: [{ id: 'a', text: '"null"', isCorrect: false }, { id: 'b', text: '"undefined"', isCorrect: false }, { id: 'c', text: '"object"', isCorrect: true }, { id: 'd', text: '"string"', isCorrect: false }], explanation: 'A long-standing JavaScript quirk: typeof null returns "object" due to a historical implementation detail.', competencyId: 'c2', competencyName: 'Language Fluency', skillTag: 'JavaScript', difficulty: 'Easy', type: 'MCQ', estimatedTimeSec: 30, status: 'approved', freshness: 'new' },
  { id: 'q6', text: 'Which combination reliably creates a new CSS stacking context?', options: [{ id: 'a', text: 'display: block', isCorrect: false }, { id: 'b', text: 'position: relative with z-index', isCorrect: true }, { id: 'c', text: 'margin: auto', isCorrect: false }, { id: 'd', text: 'padding: 0', isCorrect: false }], explanation: 'A new stacking context is created when an element has a position value other than static combined with a z-index value other than auto, among other triggers.', competencyId: 'c3', competencyName: 'Frontend Ecosystem', skillTag: 'CSS', difficulty: 'Medium', type: 'MCQ', estimatedTimeSec: 60, status: 'approved', freshness: 'new' },
  { id: 'q7', text: 'Dashboard loads data from 5 independent endpoints. What best optimizes initial load?', options: [{ id: 'a', text: 'Sequential awaited fetches', isCorrect: false }, { id: 'b', text: 'Promise.all with Suspense boundaries per section', isCorrect: true }, { id: 'c', text: 'Single useEffect with nested callbacks', isCorrect: false }, { id: 'd', text: 'setTimeout to stagger requests', isCorrect: false }], explanation: 'Parallel fetching with Promise.all plus per-section Suspense boundaries enables concurrent loads and graceful progressive rendering.', competencyId: 'c7', competencyName: 'Performance Optimization', skillTag: 'React', difficulty: 'Hard', type: 'Scenario', estimatedTimeSec: 90, status: 'pending', freshness: 'new' },
  { id: 'q8', text: 'GraphQL mutations modify server-side data.', options: [{ id: 'a', text: 'True', isCorrect: true }, { id: 'b', text: 'False', isCorrect: false }], explanation: 'Mutations are GraphQL\'s write operations, designed for creating, updating, or deleting server-side data.', competencyId: 'c6', competencyName: 'API Integration', skillTag: 'GraphQL', difficulty: 'Easy', type: 'TrueFalse', estimatedTimeSec: 30, status: 'approved', freshness: 'new' },
  { id: 'q9', text: 'Which React pattern best handles deeply nested prop passing?', options: [{ id: 'a', text: 'Higher-order components with deeper nesting', isCorrect: false }, { id: 'b', text: 'Context API or state library like Redux/Zustand', isCorrect: true }, { id: 'c', text: 'Global window variables', isCorrect: false }, { id: 'd', text: 'localStorage for all props', isCorrect: false }], explanation: 'Prop drilling is the anti-pattern; Context or a dedicated state library is the canonical solution.', competencyId: 'c3', competencyName: 'Frontend Ecosystem', skillTag: 'React', difficulty: 'Medium', type: 'MCQ', estimatedTimeSec: 60, status: 'approved', freshness: 'new' },
  { id: 'q10', text: 'What does the `infer` keyword enable in TypeScript conditional types?', options: [{ id: 'a', text: 'Runtime type inference', isCorrect: false }, { id: 'b', text: 'Extracting types within conditional type branches', isCorrect: true }, { id: 'c', text: 'Compiling TypeScript to JavaScript', isCorrect: false }, { id: 'd', text: 'Inferring component state', isCorrect: false }], explanation: 'The `infer` keyword is used inside the `extends` clause of a conditional type to declare a type variable that TypeScript will infer.', competencyId: 'c2', competencyName: 'Language Fluency', skillTag: 'TypeScript', difficulty: 'Hard', type: 'MCQ', estimatedTimeSec: 75, status: 'approved', freshness: 'new' },
  { id: 'q11', text: 'Which is NOT a valid way to trigger a browser repaint optimization?', options: [{ id: 'a', text: 'Using CSS transform instead of top/left', isCorrect: false }, { id: 'b', text: 'will-change CSS property', isCorrect: false }, { id: 'c', text: 'Forcing synchronous layout with offsetHeight reads in a loop', isCorrect: true }, { id: 'd', text: 'Using requestAnimationFrame for animations', isCorrect: false }], explanation: 'Reading layout properties like offsetHeight inside write-loops causes layout thrashing — the opposite of optimization.', competencyId: 'c7', competencyName: 'Performance Optimization', skillTag: 'CSS', difficulty: 'Hard', type: 'MCQ', estimatedTimeSec: 90, status: 'pending', freshness: 'new' },
  { id: 'q12', text: 'React Server Components run on the server and cannot use browser APIs.', options: [{ id: 'a', text: 'True', isCorrect: true }, { id: 'b', text: 'False', isCorrect: false }], explanation: 'RSCs execute exclusively on the server at render time; they can\'t use hooks like useState or access DOM APIs.', competencyId: 'c3', competencyName: 'Frontend Ecosystem', skillTag: 'React', difficulty: 'Medium', type: 'TrueFalse', estimatedTimeSec: 30, status: 'pending', freshness: 'new' },
  { id: 'q13', text: 'Best practice when a Redux reducer must handle async side effects?', options: [{ id: 'a', text: 'Make the reducer async', isCorrect: false }, { id: 'b', text: 'Use middleware like Redux Thunk or Redux Toolkit\'s createAsyncThunk', isCorrect: true }, { id: 'c', text: 'Call fetch() directly inside the reducer', isCorrect: false }, { id: 'd', text: 'Use setTimeout inside the reducer', isCorrect: false }], explanation: 'Reducers must be pure. Async logic belongs in middleware: Thunk, Saga, or RTK\'s createAsyncThunk.', competencyId: 'c3', competencyName: 'Frontend Ecosystem', skillTag: 'Redux', difficulty: 'Medium', type: 'MCQ', estimatedTimeSec: 60, status: 'approved', freshness: 'new' },
  { id: 'q14', text: 'You observe "Warning: Each child in a list should have a unique key prop". What\'s the correct fix?', options: [{ id: 'a', text: 'Use array index as key', isCorrect: false }, { id: 'b', text: 'Use a stable unique identifier from the data', isCorrect: true }, { id: 'c', text: 'Use Math.random() on each render', isCorrect: false }, { id: 'd', text: 'Remove the list', isCorrect: false }], explanation: 'Stable, unique keys (usually an id from the data) allow React\'s reconciler to identify items across re-renders correctly.', competencyId: 'c4', competencyName: 'Debugging', skillTag: 'React', difficulty: 'Easy', type: 'MCQ', estimatedTimeSec: 45, status: 'approved', freshness: 'new' },
  { id: 'q15', text: 'Which statement about JavaScript closures is TRUE?', options: [{ id: 'a', text: 'Closures only work in strict mode', isCorrect: false }, { id: 'b', text: 'A closure captures variables by reference from its enclosing scope', isCorrect: true }, { id: 'c', text: 'Closures are a TypeScript-only feature', isCorrect: false }, { id: 'd', text: 'Closures prevent garbage collection of the entire call stack', isCorrect: false }], explanation: 'Closures hold live references to variables in their lexical scope — not snapshots — which is why they reflect updated values after the outer function returns.', competencyId: 'c2', competencyName: 'Language Fluency', skillTag: 'JavaScript', difficulty: 'Medium', type: 'MCQ', estimatedTimeSec: 60, status: 'pending', freshness: 'new' },
  { id: 'q16', text: 'You see high cumulative layout shift (CLS). Which is the LEAST effective fix?', options: [{ id: 'a', text: 'Setting explicit width/height on images', isCorrect: false }, { id: 'b', text: 'Reserving space for ads/embeds', isCorrect: false }, { id: 'c', text: 'Lazy-loading above-the-fold content', isCorrect: true }, { id: 'd', text: 'Preloading web fonts', isCorrect: false }], explanation: 'Lazy-loading above-the-fold content increases CLS as content pops in after layout. The others prevent layout shifts.', competencyId: 'c7', competencyName: 'Performance Optimization', skillTag: 'Web Performance', difficulty: 'Hard', type: 'Scenario', estimatedTimeSec: 90, status: 'pending', freshness: 'new' },
  { id: 'q17', text: 'Which React pattern is best for sharing stateful logic between components?', options: [{ id: 'a', text: 'Mixins', isCorrect: false }, { id: 'b', text: 'Custom hooks', isCorrect: true }, { id: 'c', text: 'Inheritance', isCorrect: false }, { id: 'd', text: 'Global window methods', isCorrect: false }], explanation: 'Custom hooks are the idiomatic way to share stateful logic in modern React.', competencyId: 'c3', competencyName: 'Frontend Ecosystem', skillTag: 'React', difficulty: 'Easy', type: 'MCQ', estimatedTimeSec: 45, status: 'approved', freshness: 'new' },
  { id: 'q18', text: 'A teammate writes `if (user.address.city)` and gets "Cannot read properties of undefined". Best fix?', options: [{ id: 'a', text: 'Wrap the entire component in try/catch', isCorrect: false }, { id: 'b', text: 'Use optional chaining: user?.address?.city', isCorrect: true }, { id: 'c', text: 'Add a setTimeout before reading', isCorrect: false }, { id: 'd', text: 'Use eval()', isCorrect: false }], explanation: 'Optional chaining (?.) safely short-circuits to undefined when a segment is null/undefined.', competencyId: 'c4', competencyName: 'Debugging', skillTag: 'JavaScript', difficulty: 'Easy', type: 'MCQ', estimatedTimeSec: 45, status: 'approved', freshness: 'new' },
  { id: 'q19', text: 'You need to test an exported React component that uses a custom hook fetching data. Best approach?', options: [{ id: 'a', text: 'Skip testing — it uses a hook', isCorrect: false }, { id: 'b', text: 'Mock the hook or its underlying fetch via MSW/jest mocks', isCorrect: true }, { id: 'c', text: 'Test only in production', isCorrect: false }, { id: 'd', text: 'Rewrite without hooks', isCorrect: false }], explanation: 'Mocking the hook or its network layer (e.g., with MSW) allows deterministic tests of the component\'s rendering behavior.', competencyId: 'c1', competencyName: 'Problem Solving', skillTag: 'Testing', difficulty: 'Medium', type: 'Scenario', estimatedTimeSec: 75, status: 'pending', freshness: 'new' },
  { id: 'q20', text: 'You must reduce an app\'s JavaScript bundle by 40%. Which lever has the HIGHEST impact?', options: [{ id: 'a', text: 'Minify whitespace', isCorrect: false }, { id: 'b', text: 'Replace a large dependency with a lighter alternative or remove unused ones', isCorrect: true }, { id: 'c', text: 'Rename variables to single letters manually', isCorrect: false }, { id: 'd', text: 'Disable source maps', isCorrect: false }], explanation: 'Dependency audit and substitution (or tree-shaking dead imports) typically yields the largest savings by far.', competencyId: 'c7', competencyName: 'Performance Optimization', skillTag: 'Web Performance', difficulty: 'Hard', type: 'Scenario', estimatedTimeSec: 90, status: 'pending', freshness: 'new' },
];

// ============================================================
// Sample Coding Problems (5)
// ============================================================
export const sampleCodingProblems: CodingProblem[] = [
  {
    id: 'cp1',
    title: 'Implement a Debounce Function',
    summary: 'Build a production-grade debounce utility that supports immediate invocation and cancellation.',
    fullStatement: 'Implement a `debounce(fn, wait, options?)` utility that delays invoking `fn` until `wait` milliseconds have elapsed since the last call. Support an optional `{ immediate: boolean }` flag and return a debounced function with a `.cancel()` method.',
    ioFormat: { input: 'fn: Function, wait: number, options?: { immediate?: boolean }', output: 'Debounced function with .cancel()' },
    constraints: ['Must preserve `this` and arguments on invocation', 'Must support `immediate: true` (leading edge) mode', 'Must expose a cancel() method that aborts pending invocations', 'Timer must be cleared on each call'],
    sampleCases: [
      { input: 'const d = debounce(log, 300); d("a"); d("b"); // wait 400ms', output: 'log called once with "b"', explanation: 'Only the last call within the wait window fires.' },
      { input: 'const d = debounce(log, 300, { immediate: true }); d("x"); d("y");', output: 'log called once with "x" immediately', explanation: 'Leading-edge mode invokes on the first call.' },
    ],
    hiddenCaseCount: 5,
    expectedComplexity: { time: 'O(1) per call', space: 'O(1)' },
    scoring: { maxPoints: 20, perTestCase: 2 },
    competencyId: 'c2', competencyName: 'Language Fluency',
    skillTag: 'JavaScript',
    difficulty: 'Medium',
    problemType: 'Implementation',
    languagesSupported: ['JavaScript', 'TypeScript'],
    estimatedSolveTimeMin: 25,
    rationale: 'Tests closures, timer management, and API design — all core senior-frontend skills. Strong signal for React/event-handling competency.',
    status: 'approved',
    freshness: 'new',
    highRoleFit: true,
  },
  {
    id: 'cp2',
    title: 'Fix the Stale Closure Bug',
    summary: 'Debug a React component where the alert always shows the initial counter value instead of the current one.',
    fullStatement: 'The provided React component uses a setInterval inside useEffect to log the current `count`. Users report the logged value never updates. Identify the root cause and fix it using idiomatic React patterns. Do NOT rewrite the component — make the minimal fix.',
    ioFormat: { input: 'Buggy React component', output: 'Fixed component + 1-line explanation of root cause' },
    constraints: ['Must keep setInterval inside useEffect', 'Must log current count on every interval tick', 'Must clean up interval on unmount', 'Cannot use useReducer'],
    sampleCases: [
      { input: 'Increment button clicked 3 times, wait 4s', output: 'Console logs 1, 2, 3 correctly', explanation: 'Current count is visible to the closure.' },
    ],
    hiddenCaseCount: 4,
    expectedComplexity: { time: 'N/A (bug fix)', space: 'N/A' },
    scoring: { maxPoints: 20, perTestCase: 4 },
    competencyId: 'c4', competencyName: 'Debugging',
    skillTag: 'React',
    difficulty: 'Hard',
    problemType: 'Debugging',
    languagesSupported: ['JavaScript', 'TypeScript'],
    estimatedSolveTimeMin: 20,
    rationale: 'Directly tests understanding of React closure semantics and effect dependencies — a common senior-level pitfall.',
    status: 'approved',
    freshness: 'new',
    highRoleFit: true,
  },
  {
    id: 'cp3',
    title: 'Aggregate Nested Order Data',
    summary: 'Transform nested order objects into a flat summary with totals, averages, and tax breakdown.',
    fullStatement: 'Given an array of `Order` objects (each containing `items[]`, `discounts`, and `taxRate`), produce an `OrderSummary` containing: `totalRevenue`, `averageOrderValue`, `topProducts` (top 3 by revenue), and `taxBreakdown` (by taxRate).',
    ioFormat: { input: 'Array<Order>', output: 'OrderSummary object' },
    constraints: ['Use a functional approach (map/reduce/filter)', 'Handle missing/null fields gracefully', 'Exclude refunded orders from totals'],
    sampleCases: [
      { input: '[{ items: [{ name: "A", price: 10, qty: 2 }], taxRate: 0.1 }]', output: '{ totalRevenue: 22, avgOrderValue: 22, topProducts: [{name:"A",revenue:20}], taxBreakdown: { "0.1": 2 } }', explanation: 'Revenue = 10*2 + tax; tax bucketed by rate.' },
    ],
    hiddenCaseCount: 5,
    expectedComplexity: { time: 'O(n·m) where m=items/order', space: 'O(k) distinct products' },
    scoring: { maxPoints: 25, perTestCase: 2.5 },
    competencyId: 'c6', competencyName: 'API Integration',
    skillTag: 'TypeScript',
    difficulty: 'Medium',
    problemType: 'Implementation',
    languagesSupported: ['JavaScript', 'TypeScript'],
    estimatedSolveTimeMin: 25,
    rationale: 'Mirrors real product work: transforming backend responses for frontend consumption. Tests functional composition and type safety.',
    status: 'pending',
    freshness: 'new',
  },
  {
    id: 'cp4',
    title: 'LRU Cache with O(1) Operations',
    summary: 'Design a Least Recently Used cache supporting O(1) get and put.',
    fullStatement: 'Implement `LRUCache(capacity)` with `get(key)` and `put(key, value)` methods, both O(1). On overflow, evict the least-recently-used item. Both `get` and `put` count as "uses."',
    ioFormat: { input: 'capacity: number', output: 'LRUCache instance' },
    constraints: ['O(1) for get and put', 'Capacity ≥ 1', 'get returns -1 for missing keys'],
    sampleCases: [
      { input: 'c=new LRUCache(2); c.put(1,1); c.put(2,2); c.get(1); c.put(3,3); c.get(2);', output: '1, -1', explanation: '2 was evicted when 3 was inserted because 1 was used more recently.' },
    ],
    hiddenCaseCount: 7,
    expectedComplexity: { time: 'O(1) get/put', space: 'O(capacity)' },
    scoring: { maxPoints: 30, perTestCase: 3 },
    competencyId: 'c1', competencyName: 'Problem Solving',
    skillTag: 'Data Structures',
    difficulty: 'Hard',
    problemType: 'Algorithmic',
    languagesSupported: ['JavaScript', 'TypeScript', 'Python', 'Java'],
    estimatedSolveTimeMin: 35,
    rationale: 'Classic data-structures composition (HashMap + Doubly Linked List). Tests architectural trade-off awareness.',
    status: 'pending',
    reviewFlag: 'leetcode_similar',
    freshness: 'recent',
  },
  {
    id: 'cp5',
    title: 'Build an Accessible Autocomplete',
    summary: 'Implement a keyboard-accessible autocomplete component with debounced search and ARIA announcements.',
    fullStatement: 'Build a React `<Autocomplete items={...} onSelect={...} />` component that supports: typeahead filtering (debounced 200ms), arrow key navigation, enter-to-select, escape-to-close, and proper ARIA attributes (combobox pattern).',
    ioFormat: { input: 'items: Array<{ id, label }>, onSelect: (item) => void', output: 'Accessible autocomplete React component' },
    constraints: ['WAI-ARIA combobox pattern', 'Keyboard navigation: ↑ ↓ Enter Esc', 'Debounced filtering (200ms)', 'Screen-reader announces result count'],
    sampleCases: [
      { input: 'User types "ab", waits 250ms', output: 'List shows filtered items matching "ab"', explanation: 'Debounce suppresses intermediate filters.' },
    ],
    hiddenCaseCount: 6,
    expectedComplexity: { time: 'O(n) filter', space: 'O(n)' },
    scoring: { maxPoints: 25, perTestCase: 2.5 },
    competencyId: 'c3', competencyName: 'Frontend Ecosystem',
    skillTag: 'React',
    difficulty: 'Medium',
    problemType: 'FrontendUI',
    languagesSupported: ['JavaScript', 'TypeScript'],
    estimatedSolveTimeMin: 30,
    rationale: 'Directly role-relevant: senior FE engineers must ship accessible components. Covers React, ARIA, and debouncing in one problem.',
    status: 'pending',
    freshness: 'new',
    highRoleFit: true,
  },
];

// ============================================================
// Job records (2 — one eng, one sales)
// ============================================================
export const mockJobs: JobRecord[] = [
  {
    id: 'eng-001',
    title: 'Senior Frontend Engineer',
    department: 'Engineering',
    location: 'Bengaluru, IN',
    workMode: 'Hybrid',
    employmentType: 'Full-time',
    experienceBand: '5–8 years',
    openings: 2,
    status: 'Open',
    postedAt: '2 days ago',
    applicants: 142,
    inPipeline: 28,
    templateStatus: 'draft',
    roleContext: engineeringRoleContext,
    competencies: engineeringCompetencies,
    rounds: engineeringRounds,
  },
  {
    id: 'sales-001',
    title: 'Senior Account Executive',
    department: 'Sales',
    location: 'Mumbai, IN',
    workMode: 'Hybrid',
    employmentType: 'Full-time',
    experienceBand: '4–7 years',
    openings: 3,
    status: 'Open',
    postedAt: '5 days ago',
    applicants: 87,
    inPipeline: 14,
    templateStatus: 'not_built',
    roleContext: salesRoleContext,
    competencies: salesCompetencies,
    rounds: salesRounds,
  },
];

export const getJob = (id: string) => mockJobs.find(j => j.id === id);

// ============================================================
// Role-based default round sets
// ============================================================
export const defaultRoundsByRole: Record<string, Omit<Round, 'id'>[]> = {
  engineering: [
    { orderIndex: 0, type: 'Screening', label: 'Initial Screening', durationMin: 15, mandatory: true, autoTrigger: true, passThreshold: 60, assessmentStatus: 'ready' },
    { orderIndex: 1, type: 'MCQ', label: 'Technical MCQ', durationMin: 30, mandatory: true, autoTrigger: true, passThreshold: 65, assessmentStatus: 'not_built' },
    { orderIndex: 2, type: 'Coding', label: 'Coding Round', durationMin: 90, mandatory: true, autoTrigger: true, passThreshold: 60, assessmentStatus: 'not_built' },
    { orderIndex: 3, type: 'AIInterview', label: 'AI Technical Interview', durationMin: 45, mandatory: true, autoTrigger: false, passThreshold: 70, assessmentStatus: 'ready' },
    { orderIndex: 4, type: 'HR', label: 'HR Round', durationMin: 30, mandatory: true, autoTrigger: false, passThreshold: 70, assessmentStatus: 'ready' },
  ],
  sales: [
    { orderIndex: 0, type: 'Screening', label: 'Recruiter Screen', durationMin: 20, mandatory: true, autoTrigger: true, passThreshold: 60, assessmentStatus: 'ready' },
    { orderIndex: 1, type: 'MCQ', label: 'Sales Scenario Assessment', durationMin: 25, mandatory: true, autoTrigger: true, passThreshold: 70, assessmentStatus: 'not_built' },
    { orderIndex: 2, type: 'AIInterview', label: 'AI Sales Interview', durationMin: 30, mandatory: true, autoTrigger: false, passThreshold: 70, assessmentStatus: 'ready' },
    { orderIndex: 3, type: 'ManualInterview', label: 'Hiring Manager Interview', durationMin: 45, mandatory: true, autoTrigger: false, passThreshold: 75, assessmentStatus: 'ready' },
    { orderIndex: 4, type: 'HR', label: 'HR Round', durationMin: 25, mandatory: true, autoTrigger: false, passThreshold: 65, assessmentStatus: 'ready' },
  ],
};

export const mcqGenerationSteps = [
  'Reading role context…',
  'Matching competencies…',
  'Generating question pool…',
  'Balancing difficulty…',
  'Checking uniqueness & freshness…',
  'Calibrating final set…',
];

export const codingGenerationSteps = [
  'Reading role context…',
  'Matching coding competencies…',
  'Generating problem pool…',
  'Calibrating difficulty & solve time…',
  'Validating test cases…',
  'Checking freshness & repeat risk…',
  'Preparing final set…',
];
