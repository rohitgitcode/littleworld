/**
 * Laser Maze — 12 Handcrafted Levels
 * 
 * Grid rules: 6x6 max (fits 360px viewport).
 * Types:
 *   'empty': { type: 'empty' }
 *   'emitter': { type: 'emitter', dir: 'U'|'D'|'L'|'R' }
 *   'mirror': { type: 'mirror', orientation: '/'|'\\', locked: boolean }
 *   'target': { type: 'target' }
 *   'wall': { type: 'wall' }
 *   'bomb': { type: 'bomb' }
 * 
 * Progression tiers:
 *   L1-4: Basic mirrors & walls
 *   L5-8: Locked mirrors + walls
 *   L9-12: Bombs + targets + locked/unlocked mirrors
 */

const _ = () => ({ type: 'empty' });
const E = (dir) => ({ type: 'emitter', dir });
const M = (orientation, locked = false) => ({ type: 'mirror', orientation, locked });
const T = () => ({ type: 'target' });
const W = () => ({ type: 'wall' });
const B = () => ({ type: 'bomb' });

export const LASER_LEVELS = [
  // --- TIER 1: BASIC MIRRORS & WALLS (L1-4) ---
  {
    id: 1,
    title: 'First Reflection',
    difficulty: 'Easy',
    rows: 5,
    cols: 5,
    par: 1,
    grid: [
      [_(), _(), _(), _(), _()],
      [E('R'), _(), _(), M('/'), _()],
      [_(), _(), _(), _(), _()],
      [_(), _(), _(), T(), _()],
      [_(), _(), _(), _(), _()],
    ],
  },
  {
    id: 2,
    title: 'Corner Bender',
    difficulty: 'Easy',
    rows: 5,
    cols: 5,
    par: 2,
    grid: [
      [_(), E('D'), _(), _(), _()],
      [_(), _(), _(), _(), T()],
      [_(), _(), W(), _(), _()],
      [_(), M('/'), _(), _(), M('\\')],
      [_(), _(), _(), _(), _()],
    ],
  },
  {
    id: 3,
    title: 'Dual Targets',
    difficulty: 'Easy',
    rows: 5,
    cols: 5,
    par: 2,
    grid: [
      [E('R'), _(), T(), _(), M('/')],
      [_(), _(), _(), _(), _()],
      [_(), _(), W(), _(), _()],
      [_(), _(), _(), _(), _()],
      [_(), _(), T(), _(), M('\\')],
    ],
  },
  {
    id: 4,
    title: 'Zig-Zag Route',
    difficulty: 'Normal',
    rows: 5,
    cols: 5,
    par: 4,
    grid: [
      [E('R'), _(), _(), M('/'), _()],
      [_(), _(), _(), _(), _()],
      [M('\\'), _(), T(), M('\\'), _()],
      [_(), _(), _(), _(), _()],
      [M('/'), _(), _(), T(), _()],
    ],
  },

  // --- TIER 2: LOCKED MIRRORS (L5-8) ---
  {
    id: 5,
    title: 'Fixed Pivot',
    difficulty: 'Normal',
    rows: 5,
    cols: 5,
    par: 2,
    grid: [
      [_(), T(), _(), _(), _()],
      [E('R'), _(), _(), M('/'), _()],
      [_(), _(), _(), _(), _()],
      [_(), M('/'), _(), M('/', true), _()],
      [_(), _(), _(), _(), _()],
    ],
  },
  {
    id: 6,
    title: 'Channel Guide',
    difficulty: 'Medium',
    rows: 5,
    cols: 5,
    par: 2,
    grid: [
      [E('D'), _(), _(), _(), _()],
      [_(), M('/', true), _(), M('/'), _()],
      [M('/'), _(), T(), M('/', true), _()],
      [_(), T(), _(), _(), _()],
      [_(), _(), _(), _(), _()],
    ],
  },
  {
    id: 7,
    title: 'Triple Ring',
    difficulty: 'Medium',
    rows: 6,
    cols: 6,
    par: 3,
    grid: [
      [_(), M('\\'), _(), T(), _(), _()],
      [E('R'), _(), T(), _(), M('/'), _()],
      [_(), _(), _(), _(), _(), _()],
      [_(), M('/'), T(), _(), M('/', true), _()],
      [_(), _(), _(), _(), _(), _()],
      [_(), _(), _(), _(), _(), _()],
    ],
  },
  {
    id: 8,
    title: 'Prism Circuit',
    difficulty: 'Hard',
    rows: 6,
    cols: 6,
    par: 4,
    grid: [
      [E('R'), _(), T(), _(), M('/'), _()],
      [_(), M('\\'), _(), T(), _(), _()],
      [_(), _(), _(), _(), M('\\', true), M('/')],
      [_(), _(), W(), _(), _(), _()],
      [_(), _(), _(), _(), _(), T()],
      [_(), M('/'), T(), _(), _(), M('/', true)],
    ],
  },

  // --- TIER 3: BOMBS & TARGETS (L9-12) ---
  {
    id: 9,
    title: 'Danger Zone',
    difficulty: 'Hard',
    rows: 5,
    cols: 5,
    par: 1,
    grid: [
      [_(), _(), _(), _(), _()],
      [E('R'), M('/'), B(), _(), _()],
      [_(), _(), _(), _(), _()],
      [_(), T(), _(), _(), _()],
      [_(), M('\\'), _(), T(), _()],
    ],
  },
  {
    id: 10,
    title: 'Minefield Beam',
    difficulty: 'Hard',
    rows: 6,
    cols: 6,
    par: 2,
    grid: [
      [_(), _(), _(), _(), _(), _()],
      [E('R'), _(), M('/'), _(), B(), _()],
      [_(), _(), _(), _(), _(), _()],
      [_(), _(), T(), _(), B(), _()],
      [_(), _(), M('\\'), _(), _(), M('/')],
      [_(), _(), _(), _(), _(), T()],
    ],
  },
  {
    id: 11,
    title: 'Precision Optics',
    difficulty: 'Expert',
    rows: 6,
    cols: 6,
    par: 1,
    grid: [
      [E('R'), _(), T(), _(), M('/'), B()],
      [_(), _(), _(), _(), _(), _()],
      [_(), _(), _(), _(), T(), _()],
      [_(), B(), M('/'), _(), M('/', true), _()],
      [_(), _(), _(), _(), _(), _()],
      [_(), _(), T(), _(), _(), _()],
    ],
  },
  {
    id: 12,
    title: 'Master Chamber',
    difficulty: 'Expert',
    rows: 6,
    cols: 6,
    par: 2,
    grid: [
      [E('D'), _(), _(), _(), B(), _()],
      [_(), _(), M('/'), _(), M('\\', true), _()],
      [M('/'), _(), T(), _(), M('\\'), B()],
      [B(), _(), _(), _(), _(), _()],
      [_(), _(), T(), _(), _(), _()],
      [_(), M('\\'), M('/', true), _(), _(), _()],
    ],
  },
];
