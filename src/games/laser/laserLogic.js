/**
 * Laser Maze — Core Pure JS Game Logic (Zero React Dependencies)
 * 
 * Cell types:
 * - 'empty': beam passes straight through
 * - 'emitter': starts laser beam in direction dir ('U'|'R'|'D'|'L')
 * - 'mirror': orientation '/' or '\', can be locked: true/false
 * - 'target': beam marks it as hit and continues through
 * - 'wall': solid block that stops beam
 * - 'bomb': beam stops on impact, triggers hitBomb: true
 */

export const DIR_MAP = {
  U: { dr: -1, dc: 0, entry: 'top', opposite: 'bottom' },
  D: { dr: 1, dc: 0, entry: 'bottom', opposite: 'top' },
  L: { dr: 0, dc: -1, entry: 'left', opposite: 'right' },
  R: { dr: 0, dc: 1, entry: 'right', opposite: 'left' },
};

export const SLASH_REFLECT = {
  R: 'U', // R -> U
  L: 'D', // L -> D
  U: 'R', // U -> R
  D: 'L', // D -> L
};

export const BACKSLASH_REFLECT = {
  R: 'D', // R -> D
  L: 'U', // L -> U
  U: 'L', // U -> L
  D: 'R', // D -> R
};

/**
 * traceBeam(grid)
 * Walks from each emitter in the grid until beam leaves bounds or hits obstacle.
 * Returns: { segments, hitTargets, hitBomb, isWin, totalTargets }
 */
export function traceBeam(grid) {
  const rows = grid.length;
  const cols = grid[0].length;

  const hitTargets = new Set();
  let hitBomb = false;
  const visited = new Set();
  const segments = []; // array of { r, c, from, to, isBend, dir }

  let totalTargets = 0;
  const emitters = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = grid[r][c];
      if (cell.type === 'target') totalTargets++;
      if (cell.type === 'emitter') emitters.push({ r, c, dir: cell.dir || 'R' });
    }
  }

  for (const emitter of emitters) {
    let r = emitter.r;
    let c = emitter.c;
    let dir = emitter.dir;

    // Segment leaving the emitter
    segments.push({
      r,
      c,
      from: 'center',
      to: DIR_MAP[dir].entry,
      dir,
    });

    while (true) {
      const { dr, dc } = DIR_MAP[dir];
      const nextR = r + dr;
      const nextC = c + dc;

      // Out of bounds stops beam
      if (nextR < 0 || nextR >= rows || nextC < 0 || nextC >= cols) {
        break;
      }

      const loopKey = `${nextR},${nextC},${dir}`;
      if (visited.has(loopKey)) {
        break; // break infinite loop
      }
      visited.add(loopKey);

      const cell = grid[nextR][nextC];
      const fromSide = DIR_MAP[dir].opposite;

      if (cell.type === 'wall') {
        break;
      }

      if (cell.type === 'bomb') {
        hitBomb = true;
        segments.push({
          r: nextR,
          c: nextC,
          from: fromSide,
          to: 'center',
          isBomb: true,
          dir,
        });
        break;
      }

      if (cell.type === 'mirror') {
        const orient = cell.orientation; // '/' or '\'
        const nextDir = orient === '/' ? SLASH_REFLECT[dir] : BACKSLASH_REFLECT[dir];
        const toSide = DIR_MAP[nextDir].entry;

        segments.push({
          r: nextR,
          c: nextC,
          from: fromSide,
          to: toSide,
          isBend: true,
          dir: nextDir,
        });

        r = nextR;
        c = nextC;
        dir = nextDir;
        continue;
      }

      if (cell.type === 'target') {
        hitTargets.add(`${nextR},${nextC}`);
        const toSide = DIR_MAP[dir].entry;

        segments.push({
          r: nextR,
          c: nextC,
          from: fromSide,
          to: toSide,
          isTarget: true,
          dir,
        });

        r = nextR;
        c = nextC;
        continue;
      }

      // Empty or passing through emitter cell
      const toSide = DIR_MAP[dir].entry;
      segments.push({
        r: nextR,
        c: nextC,
        from: fromSide,
        to: toSide,
        dir,
      });

      r = nextR;
      c = nextC;
    }
  }

  const isWin = totalTargets > 0 && hitTargets.size === totalTargets && !hitBomb;

  return {
    segments,
    hitTargets: Array.from(hitTargets),
    hitBomb,
    isWin,
    totalTargets,
  };
}

/**
 * Brute force solver over unlocked mirrors
 * Returns { solvable, par, initialWin, error }
 */
export function solveLevel(level) {
  const grid = level.grid;
  const rows = grid.length;
  const cols = grid[0].length;

  const unlocked = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c].type === 'mirror' && !grid[r][c].locked) {
        unlocked.push({ r, c, initial: grid[r][c].orientation });
      }
    }
  }

  // Verify starting state is NOT winning
  const startRes = traceBeam(grid);
  if (startRes.isWin) {
    return {
      solvable: false,
      initialWin: true,
      error: `Level ${level.id} is already won in starting state!`,
    };
  }

  const k = unlocked.length;
  const totalCombos = 1 << k;
  let minTaps = Infinity;

  for (let mask = 0; mask < totalCombos; mask++) {
    const testGrid = grid.map((row) => row.map((cell) => ({ ...cell })));
    let taps = 0;

    for (let i = 0; i < k; i++) {
      const bit = (mask >> i) & 1;
      const orient = bit === 0 ? '/' : '\\';
      testGrid[unlocked[i].r][unlocked[i].c].orientation = orient;
      if (orient !== unlocked[i].initial) {
        taps++;
      }
    }

    const res = traceBeam(testGrid);
    if (res.isWin && taps < minTaps) {
      minTaps = taps;
    }
  }

  if (minTaps === Infinity) {
    return {
      solvable: false,
      initialWin: false,
      error: `Level ${level.id} has no valid solution!`,
    };
  }

  return {
    solvable: true,
    initialWin: false,
    par: minTaps,
    unlockedCount: k,
  };
}
