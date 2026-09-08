import type {
  BigFiveTrait, PersonalityFacet, PersonalityItem, PersonalityReport,
} from '@/types/hirenowx';

export const BIG_FIVE: BigFiveTrait[] = [
  'Conscientiousness',
  'Extraversion',
  'Agreeableness',
  'Openness',
  'Emotional Stability',
];

export const TRAIT_DESCRIPTIONS: Record<BigFiveTrait, string> = {
  Conscientiousness: 'Planning, follow-through, and standards of work.',
  Extraversion: 'Energy in group settings, visibility, and drive to engage.',
  Agreeableness: 'Cooperation, trust, and consideration of others.',
  Openness: 'Curiosity, comfort with new approaches, and conceptual thinking.',
  'Emotional Stability': 'Composure and steadiness under pressure.',
};

/** Role relevance of each trait for this role profile (Senior Product Management). */
export const TRAIT_RELEVANCE: Record<BigFiveTrait, { relevance: 'High' | 'Moderate'; weight: number; note: string }> = {
  Conscientiousness: { relevance: 'High', weight: 92, note: 'Roadmap discipline and delivery follow-through' },
  Extraversion: { relevance: 'Moderate', weight: 64, note: 'Stakeholder visibility without dominance' },
  Agreeableness: { relevance: 'High', weight: 81, note: 'Cross-functional cooperation and trust' },
  Openness: { relevance: 'High', weight: 88, note: 'Discovery, experimentation, conceptual framing' },
  'Emotional Stability': { relevance: 'High', weight: 86, note: 'Steadiness through ambiguity and escalations' },
};

type FacetSeed = {
  name: string;
  relevance: PersonalityFacet['relevance'];
  range: [number, number];
  direction: PersonalityFacet['direction'];
  descriptor: string;
  positive: [string, string];
  reverse: [string, string];
};

const FACET_SEEDS: Record<BigFiveTrait, FacetSeed[]> = {
  Conscientiousness: [
    { name: 'Self-Efficacy', relevance: 'High', range: [65, 90], direction: 'Higher preferred', descriptor: 'Belief in own capability to deliver',
      positive: ['I am confident I can handle work that is new to me.', 'I trust my ability to deliver on commitments I make.'],
      reverse: ['I doubt whether I can handle demanding assignments.', 'I feel unsure of myself when work becomes complex.'] },
    { name: 'Orderliness', relevance: 'High', range: [60, 88], direction: 'Higher preferred', descriptor: 'Structure, planning, and organisation',
      positive: ['I keep my work organised so nothing is lost track of.', 'I plan my week before it begins.'],
      reverse: ['I leave my work in a disorganised state.', 'I start working without a clear plan.'] },
    { name: 'Dutifulness', relevance: 'High', range: [65, 92], direction: 'Higher preferred', descriptor: 'Reliability and honouring obligations',
      positive: ['I honour the commitments I give to others.', 'I follow through on responsibilities even when it is inconvenient.'],
      reverse: ['I let commitments slip when something else comes up.', 'I treat deadlines as flexible suggestions.'] },
    { name: 'Achievement Striving', relevance: 'High', range: [62, 90], direction: 'Higher preferred', descriptor: 'Drive towards ambitious outcomes',
      positive: ['I set demanding goals for myself at work.', 'I push to do more than what is expected of me.'],
      reverse: ['I am satisfied doing the minimum required.', 'I avoid setting ambitious targets for myself.'] },
    { name: 'Self-Discipline', relevance: 'High', range: [65, 92], direction: 'Higher preferred', descriptor: 'Sustained effort without external pressure',
      positive: ['I usually complete tasks even when they require sustained effort.', 'I stay with a task until it is finished.'],
      reverse: ['I often put off tasks that require sustained effort.', 'I lose momentum before finishing what I started.'] },
    { name: 'Cautiousness', relevance: 'Moderate', range: [45, 75], direction: 'Balanced', descriptor: 'Deliberation before acting',
      positive: ['I think through consequences before I decide.', 'I weigh options carefully before committing.'],
      reverse: ['I act on decisions before thinking them through.', 'I commit quickly and reconsider later.'] },
  ],
  Extraversion: [
    { name: 'Friendliness', relevance: 'Moderate', range: [45, 80], direction: 'Balanced', descriptor: 'Warmth in approaching others',
      positive: ['I find it easy to build rapport with new colleagues.', 'I make an effort to make others feel comfortable.'],
      reverse: ['I keep my distance from people at work.', 'I find it hard to warm up to new colleagues.'] },
    { name: 'Gregariousness', relevance: 'Low', range: [35, 70], direction: 'Balanced', descriptor: 'Preference for group settings',
      positive: ['I enjoy working in busy group settings.', 'I look forward to team gatherings.'],
      reverse: ['I prefer to work away from groups.', 'I avoid large team settings when I can.'] },
    { name: 'Assertiveness', relevance: 'High', range: [60, 88], direction: 'Higher preferred', descriptor: 'Willingness to lead and take a position',
      positive: ['I take the lead when a group needs direction.', 'I state my position clearly, even to senior people.'],
      reverse: ['I hold back my view when others disagree.', 'I wait for someone else to take charge.'] },
    { name: 'Activity Level', relevance: 'Moderate', range: [50, 82], direction: 'Balanced', descriptor: 'Pace and energy at work',
      positive: ['I keep a fast pace through my working day.', 'I like having several things in motion at once.'],
      reverse: ['I prefer a slow, unhurried pace of work.', 'I feel drained when work moves quickly.'] },
    { name: 'Excitement Seeking', relevance: 'Low', range: [30, 65], direction: 'Balanced', descriptor: 'Appetite for stimulation and risk',
      positive: ['I am drawn to high-stakes situations.', 'I enjoy work that feels risky.'],
      reverse: ['I steer clear of situations with high stakes.', 'I prefer predictable, low-risk work.'] },
    { name: 'Cheerfulness', relevance: 'Moderate', range: [45, 80], direction: 'Balanced', descriptor: 'Positive outlook shared with others',
      positive: ['I bring a positive tone to my team.', 'I stay upbeat during long projects.'],
      reverse: ['I rarely show enthusiasm at work.', 'I find little to be positive about at work.'] },
  ],
  Agreeableness: [
    { name: 'Trust', relevance: 'Moderate', range: [50, 82], direction: 'Balanced', descriptor: 'Assuming good intent in others',
      positive: ['I assume colleagues intend well.', 'I give people the benefit of the doubt.'],
      reverse: ['I suspect colleagues have hidden motives.', 'I find it hard to trust what people tell me.'] },
    { name: 'Morality', relevance: 'High', range: [65, 92], direction: 'Higher preferred', descriptor: 'Straightforwardness and candour',
      positive: ['I am straightforward with people, even when it is awkward.', 'I say what I mean rather than managing impressions.'],
      reverse: ['I shade the facts to get an outcome I want.', 'I present things selectively to win support.'] },
    { name: 'Altruism', relevance: 'High', range: [60, 88], direction: 'Higher preferred', descriptor: 'Willingness to help colleagues',
      positive: ['I make time to help colleagues who are stuck.', 'I go out of my way to support my team.'],
      reverse: ['I stay out of other people\'s problems at work.', 'I focus only on my own workload.'] },
    { name: 'Cooperation', relevance: 'High', range: [62, 90], direction: 'Higher preferred', descriptor: 'Working through disagreement constructively',
      positive: ['I look for common ground when we disagree.', 'I work through conflict without making it personal.'],
      reverse: ['I dig in and argue my case regardless.', 'I find disagreements hard to move past.'] },
    { name: 'Modesty', relevance: 'Moderate', range: [45, 78], direction: 'Balanced', descriptor: 'Sharing credit and staying grounded',
      positive: ['I give credit to the team for shared results.', 'I am comfortable letting others take the spotlight.'],
      reverse: ['I make sure people know my contribution first.', 'I emphasise my own role in team wins.'] },
    { name: 'Sympathy', relevance: 'Moderate', range: [50, 82], direction: 'Balanced', descriptor: 'Attention to how decisions affect people',
      positive: ['I consider how decisions affect people, not just outcomes.', 'I notice when a colleague is under strain.'],
      reverse: ['I keep feelings out of work decisions entirely.', 'I pay little attention to how others are coping.'] },
  ],
  Openness: [
    { name: 'Imagination', relevance: 'High', range: [60, 88], direction: 'Higher preferred', descriptor: 'Generating new possibilities',
      positive: ['I picture possibilities others have not considered.', 'I enjoy imagining how things could work differently.'],
      reverse: ['I stick to what already exists.', 'I find speculative thinking a waste of time.'] },
    { name: 'Artistic Interests', relevance: 'Low', range: [35, 70], direction: 'Balanced', descriptor: 'Appreciation for craft and design',
      positive: ['I notice and value good design in the work around me.', 'I care about craft, not only function.'],
      reverse: ['Design details matter little to me.', 'I pay no attention to how work looks.'] },
    { name: 'Emotionality', relevance: 'Moderate', range: [45, 78], direction: 'Balanced', descriptor: 'Awareness of own reactions',
      positive: ['I am aware of how I am reacting in the moment.', 'I can name what I am feeling at work.'],
      reverse: ['I pay no attention to my own reactions.', 'I find it hard to describe how I feel.'] },
    { name: 'Adventurousness', relevance: 'High', range: [58, 86], direction: 'Higher preferred', descriptor: 'Comfort changing approach',
      positive: ['I am comfortable changing my approach when evidence shifts.', 'I willingly try unfamiliar ways of working.'],
      reverse: ['I prefer to keep doing things the established way.', 'I resist changes to how I work.'] },
    { name: 'Intellect', relevance: 'High', range: [65, 92], direction: 'Higher preferred', descriptor: 'Engagement with complex problems',
      positive: ['I enjoy working through complex, abstract problems.', 'I seek out ideas that stretch my thinking.'],
      reverse: ['I avoid problems that require abstract thinking.', 'I lose interest in conceptual discussions.'] },
    { name: 'Liberalism', relevance: 'Moderate', range: [45, 80], direction: 'Balanced', descriptor: 'Willingness to challenge convention',
      positive: ['I question established practice when it stops working.', 'I am willing to challenge how things have always been done.'],
      reverse: ['I prefer established practice to remain unchallenged.', 'I am uncomfortable questioning convention.'] },
  ],
  'Emotional Stability': [
    { name: 'Calmness', relevance: 'High', range: [62, 90], direction: 'Higher preferred', descriptor: 'Low anxiety under load',
      positive: ['I stay calm when work becomes demanding.', 'I keep a level head in busy periods.'],
      reverse: ['I feel tense for much of the working day.', 'I worry a great deal about work.'] },
    { name: 'Even Temper', relevance: 'High', range: [62, 90], direction: 'Higher preferred', descriptor: 'Measured response to friction',
      positive: ['I keep my temper when things go wrong.', 'I respond evenly when I am challenged.'],
      reverse: ['I get irritated quickly when plans change.', 'I react sharply when others make mistakes.'] },
    { name: 'Contentment', relevance: 'Moderate', range: [50, 82], direction: 'Balanced', descriptor: 'Steady satisfaction at work',
      positive: ['I feel generally satisfied with how work is going.', 'I am at ease with where I am professionally.'],
      reverse: ['I often feel dissatisfied at work.', 'I dwell on what is going badly.'] },
    { name: 'Self-Assurance', relevance: 'High', range: [58, 86], direction: 'Higher preferred', descriptor: 'Comfort being visible and scrutinised',
      positive: ['I am comfortable presenting to a senior audience.', 'Being observed at work does not unsettle me.'],
      reverse: ['I feel self-conscious when others watch me work.', 'I dread being put on the spot.'] },
    { name: 'Composure', relevance: 'High', range: [60, 88], direction: 'Higher preferred', descriptor: 'Restraint under pressure',
      positive: ['I keep my composure when pressure rises.', 'I hold back reactions I would regret.'],
      reverse: ['I act on impulse when I am under pressure.', 'I say things in the moment that I later regret.'] },
    { name: 'Resilience', relevance: 'High', range: [62, 90], direction: 'Higher preferred', descriptor: 'Recovery after setbacks',
      positive: ['I recover quickly after a setback.', 'I keep going after disappointing news.'],
      reverse: ['A setback affects me for a long time.', 'I find it hard to get going again after a failure.'] },
  ],
};

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-');

export const PERSONALITY_FACETS: PersonalityFacet[] = BIG_FIVE.flatMap(trait =>
  FACET_SEEDS[trait].map(f => ({
    id: `${slug(trait)}-${slug(f.name)}`,
    name: f.name,
    trait,
    relevance: f.relevance,
    preferredMin: f.range[0],
    preferredMax: f.range[1],
    direction: f.direction,
    descriptor: f.descriptor,
  })),
);

export const facetsByTrait = (trait: BigFiveTrait) => PERSONALITY_FACETS.filter(f => f.trait === trait);

/** The validated item bank: 4 approved items per facet plus alternates for replacement. */
export const PERSONALITY_ITEM_BANK: PersonalityItem[] = (() => {
  const items: PersonalityItem[] = [];
  let order = 0;
  BIG_FIVE.forEach(trait => {
    FACET_SEEDS[trait].forEach(seed => {
      const facetId = `${slug(trait)}-${slug(seed.name)}`;
      const build = (text: string, direction: 'Positive' | 'Reverse', idx: number): PersonalityItem => ({
        id: `${facetId}-${direction === 'Positive' ? 'p' : 'r'}${idx + 1}`,
        order: 0,
        text,
        trait,
        facetId,
        facetName: seed.name,
        direction,
        status: 'active',
        usageCount: 40 + ((order * 7) % 160),
        reviewed: true,
        language: 'English',
        source: 'Validated Item Bank',
      });
      seed.positive.forEach((t, i) => { items.push(build(t, 'Positive', i)); order++; });
      seed.reverse.forEach((t, i) => { items.push(build(t, 'Reverse', i)); order++; });
    });
  });
  return items;
})();

/** Controlled selection: 2 positive + 2 reverse per facet → 120 items, facet-interleaved. */
export function selectPersonalityItems(): PersonalityItem[] {
  const selected: PersonalityItem[] = [];
  PERSONALITY_FACETS.forEach(facet => {
    const pool = PERSONALITY_ITEM_BANK.filter(i => i.facetId === facet.id);
    const pos = pool.filter(i => i.direction === 'Positive').slice(0, 2);
    const rev = pool.filter(i => i.direction === 'Reverse').slice(0, 2);
    selected.push(pos[0], rev[0], pos[1], rev[1]);
  });
  return selected.map((item, i) => ({ ...item, id: `sel-${item.id}`, order: i + 1 }));
}

export const personalityBuildSteps = [
  'Reading job context',
  'Determining job family',
  'Determining seniority',
  'Loading personality role profile',
  'Selecting validated personality items',
  'Checking facet coverage',
  'Balancing positive and reverse-keyed items',
  'Checking duplicate exposure',
  'Preparing assessment',
];

export const LIKERT_SCALE = [
  { value: 1, label: 'Strongly Disagree' },
  { value: 2, label: 'Disagree' },
  { value: 3, label: 'Neither Agree nor Disagree' },
  { value: 4, label: 'Agree' },
  { value: 5, label: 'Strongly Agree' },
];

export const PERSONALITY_TOTAL_ITEMS = 120;
export const PERSONALITY_DURATION_MIN = 25;

// ============================================================
// Sample recruiter report (illustrative prototype data)
// ============================================================
const TRAIT_SCORES: Record<BigFiveTrait, number> = {
  Conscientiousness: 79,
  Extraversion: 68,
  Agreeableness: 74,
  Openness: 82,
  'Emotional Stability': 71,
};

const facetScore = (base: number, i: number) => Math.max(28, Math.min(96, base + [6, -8, 3, 11, -5, -2][i % 6]));

export const samplePersonalityReport: PersonalityReport = {
  candidateId: 'cand-1',
  candidateName: 'Aarav Mehta',
  completedAt: '2026-09-06T10:24:00Z',
  answered: 120,
  total: 120,
  autoSubmitted: false,
  roleAlignment: 82,
  alignmentLabel: 'Strong Alignment',
  traits: BIG_FIVE.map(trait => ({
    trait,
    score: TRAIT_SCORES[trait],
    facets: facetsByTrait(trait).map((f, i) => {
      const score = facetScore(TRAIT_SCORES[trait], i);
      return { facetId: f.id, name: f.name, score, relevance: f.relevance, inRange: score >= f.preferredMin && score <= f.preferredMax };
    }),
  })),
  strengths: [
    'Strong follow-through: sustained effort and reliability across long-running work.',
    'High conceptual engagement — comfortable framing ambiguous problems.',
    'Cooperative in disagreement; looks for common ground before escalating.',
  ],
  areasToExplore: [
    'Assertiveness sits slightly below the role profile — explore how they hold a position with senior stakeholders.',
    'Moderate excitement seeking — explore comfort with high-stakes launch periods.',
    'Explore how they sustain composure during sustained escalation cycles.',
  ],
  summary:
    'Responses indicate a structured, follow-through oriented work style with strong conceptual curiosity and cooperative instincts. Profile aligns closely with the Senior Product Management role profile, with assertiveness and stimulus appetite worth exploring in interview.',
};

export const personalityPipelineCandidates = [
  { id: 'cand-1', name: 'Aarav Mehta', initials: 'AM', status: 'Evaluation Complete', alignment: 82, sentAt: '2026-09-04' },
  { id: 'cand-2', name: 'Priya Nair', initials: 'PN', status: 'Evaluation Complete', alignment: 68, sentAt: '2026-09-04' },
  { id: 'cand-3', name: 'Rohan Iyer', initials: 'RI', status: 'In Progress', alignment: null, sentAt: '2026-09-05' },
  { id: 'cand-4', name: 'Sneha Kulkarni', initials: 'SK', status: 'Invited', alignment: null, sentAt: '2026-09-06' },
] as const;
