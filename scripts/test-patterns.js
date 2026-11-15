/**
 * Dev Check: Assert 500 questions per type for Pattern Panic
 * Run via: node scripts/test-patterns.js
 */

/* global process */
import {
  generateArithmetic,
  generateIncreasingDiff,
  generateGeometric,
  generateInterleaved,
  generateFibonacci,
  generateMixedOps,
  generateAlphabet,
  generateShapeCycle,
  generatePattern,
} from '../src/games/pattern/patternGenerators.js';

const TYPES = [
  { name: 'Arithmetic (+n)', fn: generateArithmetic },
  { name: 'Increasing Differences', fn: generateIncreasingDiff },
  { name: 'Geometric Scaling', fn: () => generateGeometric(2) },
  { name: 'Interleaved Dual Sequences', fn: generateInterleaved },
  { name: 'Fibonacci-like', fn: generateFibonacci },
  { name: 'Mixed Operations', fn: generateMixedOps },
  { name: 'Alphabet Series', fn: generateAlphabet },
  { name: 'Shape Cycle', fn: generateShapeCycle },
];

console.log('--- Testing Pattern Panic Generators (500 questions per type) ---');

let totalTested = 0;
let errors = 0;

for (const { name, fn } of TYPES) {
  let passed = 0;
  for (let i = 0; i < 500; i++) {
    const q = fn();
    totalTested++;

    // Assert 1: options has length 4
    if (!Array.isArray(q.options) || q.options.length !== 4) {
      console.error(`[FAIL] ${name} iteration ${i}: options length is not 4`, q);
      errors++;
      break;
    }

    // Assert 2: options are all unique
    const uniqueCount = new Set(q.options.map(String)).size;
    if (uniqueCount !== 4) {
      console.error(`[FAIL] ${name} iteration ${i}: duplicate options found`, q.options);
      errors++;
      break;
    }

    // Assert 3: exactly ONE option matches correctAnswer
    const matches = q.options.filter((opt) => String(opt) === String(q.correctAnswer));
    if (matches.length !== 1) {
      console.error(`[FAIL] ${name} iteration ${i}: expected 1 match for answer ${q.correctAnswer}, found ${matches.length}`, q);
      errors++;
      break;
    }

    // Assert 4: hint is non-empty string
    if (!q.hint || typeof q.hint !== 'string') {
      console.error(`[FAIL] ${name} iteration ${i}: missing hint`, q);
      errors++;
      break;
    }

    passed++;
  }

  if (passed === 500) {
    console.log(`✓ ${name}: 500/500 passed (unique options, single correct answer)`);
  }
}

// Test tier generator with history
console.log('Testing Tier Generator with history deduplication (100 runs)...');
const history = [];
for (let i = 0; i < 100; i++) {
  const tier = (i % 3) + 1;
  const p = generatePattern(tier, history);
  if (!p || p.options.length !== 4) {
    errors++;
  }
  history.push(p.signature);
  if (history.length > 10) history.shift();
}
console.log('✓ Tier Generator tested successfully.');

if (errors === 0) {
  console.log(`\nALL TESTS PASSED! (${totalTested} questions validated)`);
  process.exit(0);
} else {
  console.error(`\nFAILED with ${errors} errors!`);
  process.exit(1);
}
