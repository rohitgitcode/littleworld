/**
 * Little Big World — Challenge Tower Rules & Scoring Formulas
 * 
 * Round weights:
 * - Round 1 (Reaction Reactor): 20% (0.20)
 * - Round 2 (Memory Maze): 25% (0.25)
 * - Round 3 (Pattern Panic): 25% (0.25)
 * - Round 4 (Final Mix): 30% (0.30)
 * 
 * Total: 0 - 100 points
 * Ranks:
 * - S: >= 90
 * - A: >= 80
 * - B: >= 65
 * - C: >= 50
 * - D: < 50
 */

export const TOWER_WEIGHTS = {
  round1: 0.20,
  round2: 0.25,
  round3: 0.25,
  round4: 0.30,
};

export const FLOORS_CONFIG = [
  {
    floor: 1,
    id: 'reaction',
    name: 'Floor 1: Reaction Reactor',
    shortName: 'Floor 1',
    discipline: 'Speed Reflex',
    color: 'var(--zone-reaction)',
    weightPct: '20%',
    weight: 0.20,
    desc: '30 seconds of accelerated reflex targets.',
    target: 'Hit targets before they disappear. 250+ pts = 100%',
  },
  {
    floor: 2,
    id: 'memory',
    name: 'Floor 2: Memory Maze',
    shortName: 'Floor 2',
    discipline: 'Sequence Memory',
    color: 'var(--zone-memory)',
    weightPct: '25%',
    weight: 0.25,
    desc: 'Repeat memory sequences until first error or Level 7 summit.',
    target: 'Complete Level 7 sequence for 100%',
  },
  {
    floor: 3,
    id: 'pattern',
    name: 'Floor 3: Pattern Panic',
    shortName: 'Floor 3',
    discipline: 'Analytical Puzzle',
    color: 'var(--zone-pattern)',
    weightPct: '25%',
    weight: 0.25,
    desc: '8 fast visual and numerical pattern puzzles.',
    target: 'Answer 8/8 patterns correctly for 100%',
  },
  {
    floor: 4,
    id: 'final_mix',
    name: 'Floor 4: Final Mix',
    shortName: 'Floor 4',
    discipline: 'Grand Gauntlet',
    color: 'var(--yellow)',
    weightPct: '30%',
    weight: 0.30,
    desc: '60 seconds alternating rapid reflex targets & pattern choices.',
    target: 'Reach 100+ points in rapid alternation for 100%',
  },
];

// Round 1 Normalization (0-100)
export const normalizeRound1 = (stats) => {
  const score = stats?.score || 0;
  return Math.min(100, Math.max(0, Math.round((score / 250) * 100)));
};

// Round 2 Normalization (0-100)
export const normalizeRound2 = (stats) => {
  const level = stats?.level || 1;
  const score = stats?.score || 0;
  const levelNorm = Math.min(100, Math.round(((level - 1) / 6) * 100));
  const scoreNorm = Math.min(100, Math.round((score / 140) * 100));
  return Math.max(levelNorm, scoreNorm);
};

// Round 3 Normalization (0-100)
export const normalizeRound3 = (stats) => {
  const correct = stats?.correct || 0;
  return Math.min(100, Math.max(0, Math.round((correct / 8) * 100)));
};

// Round 4 Normalization (0-100)
export const normalizeRound4 = (stats) => {
  const score = stats?.score || 0;
  return Math.min(100, Math.max(0, Math.round((score / 100) * 100)));
};

// Calculate Grand Total and Rank
export const calculateTowerTotal = (r1, r2, r3, r4) => {
  const total = Math.round(
    r1 * TOWER_WEIGHTS.round1 +
    r2 * TOWER_WEIGHTS.round2 +
    r3 * TOWER_WEIGHTS.round3 +
    r4 * TOWER_WEIGHTS.round4
  );
  const clampedTotal = Math.min(100, Math.max(0, total));

  let rank = 'D';
  let rankColor = 'var(--coral)';
  if (clampedTotal >= 90) {
    rank = 'S';
    rankColor = 'var(--yellow)';
  } else if (clampedTotal >= 80) {
    rank = 'A';
    rankColor = 'var(--cyan)';
  } else if (clampedTotal >= 65) {
    rank = 'B';
    rankColor = 'var(--zone-memory)';
  } else if (clampedTotal >= 50) {
    rank = 'C';
    rankColor = 'var(--zone-pattern)';
  }

  return { total: clampedTotal, rank, rankColor };
};
