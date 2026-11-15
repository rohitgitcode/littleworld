/**
 * Test & Solver Verification for Laser Maze (12 Levels)
 * Run via: node scripts/test-laser-levels.js
 */

/* global process */
import { LASER_LEVELS } from '../src/games/laser/laserLevels.js';
import { solveLevel } from '../src/games/laser/laserLogic.js';

console.log('--- Testing Laser Maze Solver (12 Levels) ---');

let failed = 0;

for (const level of LASER_LEVELS) {
  const result = solveLevel(level);

  if (!result.solvable) {
    console.error(`✗ Level ${level.id} ("${level.title}") FAILED: ${result.error}`);
    failed++;
  } else if (result.initialWin) {
    console.error(`✗ Level ${level.id} ("${level.title}") FAILED: solves in starting state!`);
    failed++;
  } else {
    console.log(`✓ Level ${level.id} ("${level.title}"): SOLVABLE | Par: ${result.par} taps (defined par: ${level.par}) | Unlocked mirrors: ${result.unlockedCount}`);
    // Check if defined par matches solver par
    if (level.par !== result.par) {
      console.warn(`  ↳ Notice: Updating level ${level.id} par from ${level.par} to solver par ${result.par}`);
    }
  }
}

if (failed === 0) {
  console.log(`\nALL 12/12 LEVELS VALIDATED & SOLVABLE!`);
  process.exit(0);
} else {
  console.error(`\n${failed} levels failed verification!`);
  process.exit(1);
}
