/**
 * Little Big World — Progression Rules & Mathematical Models
 * 
 * Strict specifications:
 * - XP formula: completion 10 + game bonus (Reaction score/5, Memory longest*8, Pattern correct*6)
 * - Coins = max(1, floor(xp / 4))
 * - Level formula: XP needed from n to n+1 = 100 + 50 * (n - 1)
 * - Ranks by level: Novice (1-4), Challenger (5-9), Pro (10-14), Master (15-19), Legend (20+)
 * - Deterministic challenges by local date and ISO week
 * - Streak consecutive day logic
 * - Themes catalog and purchase validation
 */

export const STORAGE_KEY = 'lbw_save_v1';

export const DEFAULT_SAVE = {
  version: 1,
  player: {
    name: 'ArcadeRider',
    title: 'Novice',
    avatar: 'user',
  },
  level: 1,
  currentLevelXp: 0,
  totalXp: 0,
  coins: 100, // Starter coins
  gamesPlayed: 0,
  plays: {
    'reaction-reactor': 0,
    'memory-maze': 0,
    'pattern-panic': 0,
    'tower': 0,
  },
  personalBests: {
    'reaction-reactor': { score: 0, bestRt: 0, accuracy: 0 },
    'memory-maze': { score: 0, level: 0, longest: 0 },
    'pattern-panic': { score: 0, correct: 0, accuracy: 0 },
    'tower': { score: 0, rank: 'D' },
  },
  streak: {
    current: 0,
    best: 0,
    lastPlayDate: null,
  },
  achievements: {},
  challenges: {
    lastDailyDate: null,
    dailies: [],
    lastWeeklyWeek: null,
    weeklies: [],
  },
  cosmetics: {
    unlockedThemes: ['default'],
    activeTheme: 'default',
  },
  settings: {
    sound: true,
    haptics: true,
  },
  onboardingCompleted: false,
  processedRunIds: [],
};

export const RANKS = [
  { minLevel: 20, title: 'Legend' },
  { minLevel: 15, title: 'Master' },
  { minLevel: 10, title: 'Pro' },
  { minLevel: 5, title: 'Challenger' },
  { minLevel: 1, title: 'Novice' },
];

export const getRankForLevel = (lvl) => {
  const match = RANKS.find((r) => lvl >= r.minLevel);
  return match ? match.title : 'Novice';
};

// XP needed to advance from level n to level n + 1
export const getXpNeededForLevel = (n) => 100 + 50 * (Math.max(1, n) - 1);

// Level-up calculator supporting multiple level gains from large XP bursts
export const calculateLevelUp = (startLevel, startCurrentXp, xpGained) => {
  let level = Math.max(1, startLevel);
  let currentXp = Math.max(0, startCurrentXp) + Math.max(0, xpGained);
  let levelsGained = 0;

  while (true) {
    const needed = getXpNeededForLevel(level);
    if (currentXp >= needed) {
      currentXp -= needed;
      level += 1;
      levelsGained += 1;
    } else {
      break;
    }
  }

  return {
    level,
    currentXp,
    leveledUp: levelsGained > 0,
    levelsGained,
    xpNeeded: getXpNeededForLevel(level),
  };
};

// Game XP & Coins reward calculator
export const calculateRewards = (game, stats) => {
  let bonus = 0;
  if (game === 'reaction-reactor') {
    bonus = Math.floor((stats?.score || 0) / 5);
  } else if (game === 'memory-maze') {
    const longest = stats?.longest || stats?.level || 0;
    bonus = Math.floor(longest * 8);
  } else if (game === 'pattern-panic') {
    bonus = Math.floor((stats?.correct || 0) * 6);
  } else if (game === 'tower' || game === 'challenge-tower') {
    const rankMultipliers = { S: 2.2, A: 1.8, B: 1.4, C: 1.1, D: 0.9 };
    const mult = rankMultipliers[stats?.rank] || 1.0;
    bonus = Math.floor(Math.max(15, (stats?.score || 0) * 0.8) * mult);
  }

  const xpEarned = Math.max(0, 10 + Math.max(0, bonus));
  const coinsEarned = Math.max(1, Math.floor(xpEarned / 4));

  return { xpEarned, coinsEarned };
};

// Achievements definitions
export const ACHIEVEMENTS = [
  {
    id: 'first_game',
    title: 'First Steps',
    description: 'Play any arcade challenge.',
    rewardCoins: 25,
    icon: 'star',
  },
  {
    id: 'quick_hands',
    title: 'Quick Hands',
    description: 'Score 120+ or under 300ms reflex in Reaction Reactor.',
    rewardCoins: 30,
    icon: 'bolt',
  },
  {
    id: 'sharp_memory',
    title: 'Sharp Memory',
    description: 'Reach Round 5 in Memory Maze.',
    rewardCoins: 30,
    icon: 'brain',
  },
  {
    id: 'pattern_master',
    title: 'Pattern Master',
    description: 'Solve 6+ patterns in Pattern Panic.',
    rewardCoins: 30,
    icon: 'puzzle',
  },
  {
    id: 'arcade_veteran',
    title: 'Arcade Veteran',
    description: 'Complete 25 total arcade matches.',
    rewardCoins: 50,
    icon: 'trophy',
  },
  {
    id: 'streak_3',
    title: 'Streak Master',
    description: 'Achieve a 3-day consecutive play streak.',
    rewardCoins: 50,
    icon: 'fire',
  },
  {
    id: 'tower_climber',
    title: 'Tower Climber',
    description: 'Complete all 4 floors of the Challenge Tower.',
    rewardCoins: 50,
    icon: 'tower',
  },
  {
    id: 'tower_s_rank',
    title: 'Tower S Rank',
    description: 'Achieve the prestigious S Rank in Challenge Tower.',
    rewardCoins: 100,
    icon: 'star',
  },
];

// Cosmetics catalog
export const THEMES = [
  {
    id: 'default',
    name: 'Sticker Arcade',
    description: 'Chunky pastel arcade paper with bold ink lines and colorful stickers.',
    cost: 0,
    previewColor: '#FFC21A',
  },
  {
    id: 'night-arcade',
    name: 'Night Arcade',
    description: 'Deep ink paper with crisp glowing white borders and radiant stickers.',
    cost: 40,
    previewColor: '#1E1B2E',
  },
  {
    id: 'cyberpunk',
    name: 'Cyber Mint',
    description: 'Electric mint and neon yellow high-contrast arcade grid.',
    cost: 60,
    previewColor: '#1FBF9F',
  },
  {
    id: 'synthwave',
    name: 'Bubblegum',
    description: 'Playful vibrant pink and magenta candy arcade aesthetic.',
    cost: 60,
    previewColor: '#FF7DB8',
  },
];

// Date and ISO Week helpers based on local browser time
export const getLocalDateString = (d = new Date()) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getISOWeekString = (d = new Date()) => {
  const date = new Date(d.getTime());
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  const week1 = new Date(date.getFullYear(), 0, 4);
  const weekNum = 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
  return `${date.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
};

export const getDaysBetween = (dateStr1, dateStr2) => {
  if (!dateStr1 || !dateStr2) return Infinity;
  const d1 = new Date(dateStr1 + 'T00:00:00');
  const d2 = new Date(dateStr2 + 'T00:00:00');
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
};

// Deterministic Pseudo-Random Generator from string seed
const getSeed = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

// Challenge pools
const DAILY_POOL = [
  { id: 'd_play_reaction', title: 'Reaction Calibration', desc: 'Complete 1 round of Reaction Reactor', game: 'reaction-reactor', target: 1, type: 'plays', reward: 30 },
  { id: 'd_score_reaction', title: 'Speed Reflex', desc: 'Score at least 100 in Reaction Reactor', game: 'reaction-reactor', target: 100, type: 'score', reward: 40 },
  { id: 'd_play_memory', title: 'Neural Test', desc: 'Reach Round 3 in Memory Maze', game: 'memory-maze', target: 3, type: 'level', reward: 35 },
  { id: 'd_score_memory', title: 'Sequence Flow', desc: 'Score 60+ in Memory Maze', game: 'memory-maze', target: 60, type: 'score', reward: 40 },
  { id: 'd_play_pattern', title: 'Pattern Rush', desc: 'Solve 4 correct patterns in Pattern Panic', game: 'pattern-panic', target: 4, type: 'correct', reward: 35 },
  { id: 'd_score_pattern', title: 'Logic Burst', desc: 'Score 80+ in Pattern Panic', game: 'pattern-panic', target: 80, type: 'score', reward: 45 },
  { id: 'd_any_games', title: 'Arcade Triad', desc: 'Play 3 arcade matches today', game: 'any', target: 3, type: 'plays', reward: 50 },
];

const WEEKLY_POOL = [
  { id: 'w_games_10', title: 'Arcade Dedicated', desc: 'Complete 10 total games this week', game: 'any', target: 10, type: 'plays', reward: 120 },
  { id: 'w_reaction_200', title: 'High Velocity', desc: 'Score 180+ in Reaction Reactor', game: 'reaction-reactor', target: 180, type: 'score', reward: 100 },
  { id: 'w_memory_7', title: 'Memory Legend', desc: 'Reach Round 7 in Memory Maze', game: 'memory-maze', target: 7, type: 'level', reward: 120 },
  { id: 'w_pattern_150', title: 'Pattern Master', desc: 'Score 140+ in Pattern Panic', game: 'pattern-panic', target: 140, type: 'score', reward: 110 },
];

export const generateDailyChallenges = (dateStr) => {
  const seed = getSeed(dateStr);
  const count = DAILY_POOL.length;
  const pickedIndices = [
    seed % count,
    (seed + 2) % count,
    (seed + 4) % count,
  ];

  // Guarantee 3 distinct challenges
  const indices = Array.from(new Set(pickedIndices));
  let cur = 0;
  while (indices.length < 3) {
    if (!indices.includes(cur)) indices.push(cur);
    cur += 1;
  }

  return indices.slice(0, 3).map((idx) => ({
    ...DAILY_POOL[idx],
    instanceId: `${DAILY_POOL[idx].id}_${dateStr}`,
    progress: 0,
    completed: false,
    claimed: false,
  }));
};

export const generateWeeklyChallenges = (weekStr) => {
  const seed = getSeed(weekStr);
  const count = WEEKLY_POOL.length;
  const idx1 = seed % count;
  const idx2 = (seed + 1) % count;

  return [WEEKLY_POOL[idx1], WEEKLY_POOL[idx2]].map((c) => ({
    ...c,
    instanceId: `${c.id}_${weekStr}`,
    progress: 0,
    completed: false,
    claimed: false,
  }));
};
