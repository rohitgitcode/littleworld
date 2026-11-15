/**
 * Little Big World — Game Zones Data
 * 
 * Centralized data source for all arcade game zones.
 */

export const GAME_ZONES = [
  {
    id: 'reaction-reactor',
    title: 'Reaction Reactor',
    shortDescription: 'Test your reaction speed.',
    fullDescription: 'Fast-paced reflex challenge! Tap targets the instant they appear before they expire.',
    iconName: 'bolt',
    badge: 'Reflex',
    accentColor: '#FF7A45', // Zone coral
    accentGlow: 'rgba(255, 122, 69, 0.25)',
    difficulty: 'Easy',
    status: 'available',
    statusLabel: 'Ready to Play',
    recommendedLevel: 1,
    highScore: 0,
    bestTime: '--',
  },
  {
    id: 'memory-maze',
    title: 'Memory Maze',
    shortDescription: 'Remember and repeat patterns.',
    fullDescription: 'Memorize the flashing sequence and repeat it flawlessly as the sequence expands each round.',
    iconName: 'brain',
    badge: 'Memory',
    accentColor: '#2DD4A7', // Zone teal
    accentGlow: 'rgba(45, 212, 167, 0.25)',
    difficulty: 'Medium',
    status: 'available',
    statusLabel: 'Ready to Play',
    recommendedLevel: 1,
    highScore: 0,
    bestTime: '--',
  },
  {
    id: 'pattern-panic',
    title: 'Pattern Panic',
    shortDescription: 'Solve challenging patterns.',
    fullDescription: 'Identify numerical and geometric patterns under a ticking clock before time runs out.',
    iconName: 'puzzle',
    badge: 'Puzzle',
    accentColor: '#9B7BFF', // Zone violet
    accentGlow: 'rgba(155, 123, 255, 0.25)',
    difficulty: 'Hard',
    status: 'available',
    statusLabel: 'Ready to Play',
    recommendedLevel: 1,
    highScore: 0,
    bestTime: '--',
  },
  {
    id: 'challenge-tower',
    title: 'Challenge Tower',
    shortDescription: 'Take on multiple arcade challenges.',
    fullDescription: 'Climb 4 floors of escalating arcade trials to reach the grand summit.',
    iconName: 'tower',
    badge: 'Gauntlet',
    accentColor: '#FFC93C', // Zone gold
    accentGlow: 'rgba(255, 201, 60, 0.25)',
    difficulty: 'Expert',
    status: 'locked',
    statusLabel: 'Tower Trial',
    recommendedLevel: 1,
    highScore: 0,
    bestTime: '--',
  },
];

/**
 * Sample Daily Challenge data
 */
export const DAILY_CHALLENGE = {
  id: 'daily-speed-blitz',
  title: 'Neon Blitz: Lightning Tap',
  category: 'Speed Trial',
  description: 'Tap 20 flashing targets in under 15 seconds without a single miss.',
  expiresIn: '14h 22m',
  reward: {
    xp: 150,
    coins: 50,
    badge: 'Blitz Striker'
  },
  status: 'Incomplete',
};

/**
 * Initial Player Profile & Stats
 */
export const INITIAL_PLAYER = {
  name: 'ArcadeRider',
  title: 'Novice Challenger',
  level: 1,
  xp: 0,
  nextLevelXp: 100,
  coins: 100,
  gamesPlayed: 0,
  highScore: 0,
  avatar: 'user',
  memberSince: 'Today',
};

/**
 * Sample Recent Activities
 */
export const RECENT_ACTIVITIES = [
  {
    id: 1,
    iconName: 'gamepad',
    title: 'Welcome to Little Big World',
    detail: 'Your arcade challenger license is active.',
    time: 'Just now',
    type: 'system',
  },
  {
    id: 2,
    iconName: 'bolt',
    title: 'Reaction Reactor Calibrated',
    detail: 'Reflex arena ready for high-score attempts.',
    time: '5 mins ago',
    type: 'zone',
  },
  {
    id: 3,
    iconName: 'coin',
    title: 'Starter Credit Granted',
    detail: 'Received 100 arcade coins.',
    time: '15 mins ago',
    type: 'reward',
  },
];

/**
 * Sample Achievements placeholder list
 */
export const SAMPLE_ACHIEVEMENTS = [
  {
    id: 'ach-first-step',
    title: 'First Steps',
    description: 'Enter the Little Big World arcade for the first time.',
    iconName: 'star',
    reward: 50,
    unlocked: true,
    progress: 100,
  },
  {
    id: 'ach-speed-demon',
    title: 'Speed Demon',
    description: 'Score a reaction time under 250ms in Reaction Reactor.',
    iconName: 'bolt',
    reward: 100,
    unlocked: false,
    progress: 35,
  },
  {
    id: 'ach-memory-sage',
    title: 'Memory Sage',
    description: 'Reach Round 7 in Memory Maze without errors.',
    iconName: 'brain',
    reward: 120,
    unlocked: false,
    progress: 0,
  },
  {
    id: 'ach-pattern-wizard',
    title: 'Pattern Wizard',
    description: 'Solve 10 patterns in Pattern Panic.',
    iconName: 'puzzle',
    reward: 150,
    unlocked: false,
    progress: 0,
  },
  {
    id: 'ach-tower-ascender',
    title: 'Tower Ascender',
    description: 'Conquer the 10th floor of Challenge Tower.',
    iconName: 'tower',
    reward: 300,
    unlocked: false,
    progress: 0,
  },
  {
    id: 'ach-coin-hoarder',
    title: 'Coin Hoarder',
    description: 'Accumulate 500 arcade coins.',
    iconName: 'coin',
    reward: 75,
    unlocked: false,
    progress: 20,
  },
];
