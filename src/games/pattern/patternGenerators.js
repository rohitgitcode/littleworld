/**
 * Pattern Panic — Algorithmic Pattern Generators & Distractor System
 * 
 * Generators:
 * 1. Arithmetic Progression (+n, -n)
 * 2. Increasing Differences / Quadratic (+1, +2, +3... or +2, +4, +6...)
 * 3. Geometric Scaling (x2, x3)
 * 4. Interleaved Dual Sequences (even vs odd indices)
 * 5. Fibonacci-like Custom Seed Addition
 * 6. Mixed Operations (*a then +b, or +a then *b)
 * 7. Alphabet Skip & Progression Series
 * 8. Shape & Symbol Rotations
 */

const SHAPES = ['▲', '◆', '●', '■', '★', '⬡', '✦', '▼'];
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

// Helper to shuffle an array
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// Helper to create 3 unique distractors alongside the correct answer
const buildOptions = (correctAnswer, candidates, fallbackGenerator) => {
  const correctStr = String(correctAnswer);
  const uniqueDistractors = new Set();

  for (const c of candidates) {
    if (c !== undefined && c !== null && String(c) !== correctStr && !Number.isNaN(c)) {
      uniqueDistractors.add(typeof correctAnswer === 'number' ? Number(c) : String(c));
      if (uniqueDistractors.size === 3) break;
    }
  }

  // Fallback if needed to guarantee exactly 3 unique distractors
  let attempts = 0;
  while (uniqueDistractors.size < 3 && attempts < 20) {
    attempts++;
    const fb = fallbackGenerator(attempts);
    if (fb !== undefined && fb !== null && String(fb) !== correctStr && !Number.isNaN(fb)) {
      uniqueDistractors.add(typeof correctAnswer === 'number' ? Number(fb) : String(fb));
    }
  }

  const options = [correctAnswer, ...Array.from(uniqueDistractors)];
  return shuffle(options);
};

// 1. Classic Arithmetic Progression
export const generateArithmetic = () => {
  const steps = [3, 4, 5, 6, 7, 8, 9, 11, 12, 15, -3, -4, -5, -6, -7];
  const step = steps[Math.floor(Math.random() * steps.length)];
  const start = step > 0
    ? Math.floor(Math.random() * 20) + 1
    : Math.floor(Math.random() * 25) + 35;

  const sequence = [start, start + step, start + step * 2, start + step * 3, start + step * 4];
  const missingIndex = 4; // last item is the question
  const answer = sequence[missingIndex];
  const displaySequence = [...sequence];
  displaySequence[missingIndex] = '?';

  const candidates = [
    answer + step,
    answer - step,
    answer + 1,
    answer - 1,
    answer + 2,
    answer - 2,
  ];

  const options = buildOptions(answer, candidates, (i) => answer + i * (step > 0 ? 1 : -1));

  return {
    type: 'arithmetic',
    signature: `arith_${step}_${start % 5}`,
    category: 'Arithmetic Series',
    sequence: displaySequence,
    correctAnswer: answer,
    options,
    hint: `Rule: Each number ${step > 0 ? `adds +${step}` : `subtracts ${Math.abs(step)}`}`,
  };
};

// 2. Increasing Differences (Quadratic Series: differences grow each step)
export const generateIncreasingDiff = () => {
  const diffGrowth = [1, 2, 3][Math.floor(Math.random() * 3)];
  const initialDiff = Math.floor(Math.random() * 3) + 2;
  const start = Math.floor(Math.random() * 10) + 1;

  const sequence = [start];
  let cur = start;
  let d = initialDiff;
  const diffs = [];

  for (let i = 0; i < 4; i++) {
    cur += d;
    diffs.push(d);
    sequence.push(cur);
    d += diffGrowth;
  }

  const answer = sequence[4];
  const displaySequence = [...sequence];
  displaySequence[4] = '?';

  const lastDiff = diffs[diffs.length - 1];
  const candidates = [
    answer - lastDiff, // repeated previous difference
    answer + lastDiff, // missed the increase
    answer + diffGrowth, // added only the growth
    answer - 1,
    answer + 2,
  ];

  const options = buildOptions(answer, candidates, (i) => answer + i * 3);

  return {
    type: 'increasing_diff',
    signature: `inc_${initialDiff}_${diffGrowth}`,
    category: 'Growing Differences',
    sequence: displaySequence,
    correctAnswer: answer,
    options,
    hint: `Rule: Differences increase by +${diffGrowth} each step (+${diffs.join(', +')})`,
  };
};

// 3. Geometric Scaling (Multiplication x2 or x3)
export const generateGeometric = (difficultyTier = 2) => {
  const mult = difficultyTier >= 3 ? 3 : 2;
  const start = mult === 2
    ? Math.floor(Math.random() * 6) + 2
    : Math.floor(Math.random() * 3) + 1;

  const sequence = [
    start,
    start * mult,
    start * mult * mult,
    start * mult * mult * mult,
  ];

  const answer = sequence[3];
  const displaySequence = [...sequence];
  displaySequence[3] = '?';

  const prev = sequence[2];
  const candidates = [
    prev + (prev - sequence[1]), // treated as arithmetic instead of geometric
    answer + start,
    answer - start * 2,
    answer * 2,
    prev * (mult + 1),
    answer - 2,
  ];

  const options = buildOptions(answer, candidates, (i) => answer + i * start);

  return {
    type: 'geometric',
    signature: `geom_${mult}_${start}`,
    category: 'Scaling Multiplier',
    sequence: displaySequence,
    correctAnswer: answer,
    options,
    hint: `Rule: Each number multiplied by ${mult} (×${mult})`,
  };
};

// 4. Interleaved Dual Sequences
export const generateInterleaved = () => {
  const stepA = Math.floor(Math.random() * 4) + 2; // +2..+5
  const stepB = [ -2, -3, 3, 4 ][Math.floor(Math.random() * 4)];
  const startA = Math.floor(Math.random() * 6) + 2;
  const startB = stepB < 0
    ? Math.floor(Math.random() * 10) + 30
    : Math.floor(Math.random() * 5) + 15;

  // Pattern: [A0, B0, A1, B1, A2, B2, A3] -> missing A3
  const seqA = [startA, startA + stepA, startA + stepA * 2, startA + stepA * 3];
  const seqB = [startB, startB + stepB, startB + stepB * 2];

  const full = [seqA[0], seqB[0], seqA[1], seqB[1], seqA[2], seqB[2], seqA[3]];
  const answer = full[6];
  const displaySequence = [...full];
  displaySequence[6] = '?';

  const candidates = [
    seqB[2] + stepB, // continued the wrong sequence (B instead of A)
    answer + stepA, // extra step
    answer - stepA, // repeated previous A
    seqB[2] + stepA, // mixed steps
    answer + 1,
  ];

  const options = buildOptions(answer, candidates, (i) => answer + i * 2);

  return {
    type: 'interleaved',
    signature: `inter_${stepA}_${stepB}`,
    category: 'Interleaved Series',
    sequence: displaySequence,
    correctAnswer: answer,
    options,
    hint: `Rule: Two alternating sequences. Even positions add +${stepA}`,
  };
};

// 5. Fibonacci-like Custom Seed Series
export const generateFibonacci = () => {
  const seeds = [
    [1, 2], [2, 3], [1, 3], [2, 4], [3, 4], [1, 4], [3, 5], [2, 5],
  ];
  const [a, b] = seeds[Math.floor(Math.random() * seeds.length)];

  const c = a + b;
  const d = b + c;
  const e = c + d;
  const f = d + e;

  const sequence = [a, b, c, d, e, f];
  const answer = f;
  const displaySequence = [...sequence];
  displaySequence[5] = '?';

  const candidates = [
    e + c, // added wrong prior term
    e + (e - d), // treated as arithmetic difference
    answer + a,
    answer - b,
    e * 2,
    answer + 2,
  ];

  const options = buildOptions(answer, candidates, (i) => answer + i * 3);

  return {
    type: 'fibonacci',
    signature: `fib_${a}_${b}`,
    category: 'Sum of Previous',
    sequence: displaySequence,
    correctAnswer: answer,
    options,
    hint: `Rule: Each number is the sum of the previous two (${d} + ${e} = ${f})`,
  };
};

// 6. Mixed Operations (+a then *b, or *a then +b)
export const generateMixedOps = () => {
  const configs = [
    { op1Name: '×2', op2Name: '+1', fn: (n, step) => (step % 2 === 0 ? n * 2 : n + 1) },
    { op1Name: '+3', op2Name: '×2', fn: (n, step) => (step % 2 === 0 ? n + 3 : n * 2) },
    { op1Name: '×2', op2Name: '-2', fn: (n, step) => (step % 2 === 0 ? n * 2 : n - 2) },
    { op1Name: '+4', op2Name: '-1', fn: (n, step) => (step % 2 === 0 ? n + 4 : n - 1) },
  ];

  const cfg = configs[Math.floor(Math.random() * configs.length)];
  const start = Math.floor(Math.random() * 4) + 2;

  const sequence = [start];
  let cur = start;
  for (let i = 0; i < 4; i++) {
    cur = cfg.fn(cur, i);
    sequence.push(cur);
  }

  const answer = sequence[4];
  const displaySequence = [...sequence];
  displaySequence[4] = '?';

  const prev = sequence[3];
  const candidates = [
    cfg.fn(prev, 1), // applied step 1 instead of step 2
    answer + 2,
    answer - 2,
    prev * 2,
    prev + 3,
    answer + 4,
  ];

  const options = buildOptions(answer, candidates, (i) => answer + i * 2);

  return {
    type: 'mixed_ops',
    signature: `mixed_${cfg.op1Name}_${cfg.op2Name}_${start}`,
    category: 'Mixed Operations',
    sequence: displaySequence,
    correctAnswer: answer,
    options,
    hint: `Rule: Alternating operations: ${cfg.op1Name} then ${cfg.op2Name}`,
  };
};

// 7. Alphabet Skip Series
export const generateAlphabet = () => {
  const modes = ['fixed', 'increasing'];
  const mode = modes[Math.floor(Math.random() * modes.length)];

  if (mode === 'fixed') {
    const step = [2, 3, 4][Math.floor(Math.random() * 3)];
    const maxStart = 25 - step * 4;
    const startIdx = Math.floor(Math.random() * Math.max(1, maxStart));

    const sequence = [
      ALPHABET[startIdx],
      ALPHABET[startIdx + step],
      ALPHABET[startIdx + step * 2],
      ALPHABET[startIdx + step * 3],
      ALPHABET[startIdx + step * 4],
    ];

    const answer = sequence[4];
    const displaySequence = [...sequence];
    displaySequence[4] = '?';

    const lastIdx = startIdx + step * 4;
    const candidates = [
      ALPHABET[(lastIdx + 1) % 26],
      ALPHABET[(lastIdx - 1 + 26) % 26],
      ALPHABET[(lastIdx + step) % 26],
      ALPHABET[(lastIdx - step + 26) % 26],
    ];

    const options = buildOptions(answer, candidates, (i) => ALPHABET[(lastIdx + i) % 26]);

    return {
      type: 'alphabet',
      signature: `alpha_fixed_${step}_${startIdx}`,
      category: 'Letter Progression',
      sequence: displaySequence,
      correctAnswer: answer,
      options,
      hint: `Rule: Alphabet advances by +${step} letters each time`,
    };
  } else {
    // Increasing jump: +1, +2, +3, +4
    const startIdx = Math.floor(Math.random() * 6); // A..F
    const jumps = [1, 2, 3, 4];
    const sequence = [ALPHABET[startIdx]];

    let cur = startIdx;
    for (const j of jumps) {
      cur += j;
      sequence.push(ALPHABET[cur % 26]);
    }

    const answer = sequence[4];
    const displaySequence = [...sequence];
    displaySequence[4] = '?';

    const ansIdx = cur % 26;
    const candidates = [
      ALPHABET[(ansIdx - 1 + 26) % 26],
      ALPHABET[(ansIdx + 1) % 26],
      ALPHABET[(ansIdx + 3) % 26],
      ALPHABET[(ansIdx - 4 + 26) % 26],
    ];

    const options = buildOptions(answer, candidates, (i) => ALPHABET[(ansIdx + i) % 26]);

    return {
      type: 'alphabet',
      signature: `alpha_inc_${startIdx}`,
      category: 'Letter Expansion',
      sequence: displaySequence,
      correctAnswer: answer,
      options,
      hint: 'Rule: Letter step increases by +1 each turn (+1, +2, +3, +4)',
    };
  }
};

// 8. Shape & Symbol Rotation
export const generateShapeCycle = () => {
  const sets = [
    ['▲', '◆', '●', '■', '▲', '◆', '?'],
    ['★', '✦', '⬡', '★', '✦', '?'],
    ['●', '■', '▲', '●', '■', '?'],
    ['⬢', '⬡', '◆', '⬢', '⬡', '?'],
    ['▲', '▼', '▲', '▼', '▲', '?'],
  ];

  const chosen = sets[Math.floor(Math.random() * sets.length)];
  const displaySequence = [...chosen];

  // Determine correct answer from cycle
  let answer;
  if (chosen.length === 7) {
    // 4-cycle: item at idx 2 is answer
    answer = chosen[2];
  } else if (chosen.length === 6 && chosen[0] === chosen[4]) {
    // 2-cycle
    answer = chosen[1];
  } else {
    // 3-cycle
    answer = chosen[2];
  }

  const otherShapes = SHAPES.filter((s) => s !== answer);
  const candidates = shuffle(otherShapes).slice(0, 3);
  const options = buildOptions(answer, candidates, (i) => otherShapes[i % otherShapes.length]);

  return {
    type: 'shape_cycle',
    signature: `shape_${chosen[0]}_${chosen[1]}`,
    category: 'Symbol Rotation',
    sequence: displaySequence,
    correctAnswer: answer,
    options,
    hint: 'Rule: Repeating cyclic symbol sequence',
  };
};

/**
 * Master Pattern Dispatcher
 * Selects puzzle type based on correct-count progression tier and recent history
 */
export const generatePattern = (difficultyTier = 1, history = []) => {
  // Tier definition:
  // Tier 1 (correct < 3): Arithmetic, Simple Shapes, Alphabet
  // Tier 2 (3 <= correct < 7): Increasing Diffs, Geometric x2, Fibonacci, Mixed Ops
  // Tier 3 (correct >= 7): Interleaved, Geometric x3, Complex Mixed Ops, Increasing Alphabet
  let eligibleGenerators;

  if (difficultyTier <= 1) {
    eligibleGenerators = [
      generateArithmetic,
      generateShapeCycle,
      generateAlphabet,
    ];
  } else if (difficultyTier === 2) {
    eligibleGenerators = [
      generateIncreasingDiff,
      generateGeometric,
      generateFibonacci,
      generateMixedOps,
      generateArithmetic,
    ];
  } else {
    eligibleGenerators = [
      generateInterleaved,
      () => generateGeometric(3),
      generateIncreasingDiff,
      generateMixedOps,
      generateFibonacci,
      generateAlphabet,
    ];
  }

  // Attempt up to 15 times to avoid recent signatures
  let chosenPuzzle = null;
  for (let attempt = 0; attempt < 15; attempt++) {
    const gen = eligibleGenerators[Math.floor(Math.random() * eligibleGenerators.length)];
    const puzzle = gen();
    if (!history.includes(puzzle.signature)) {
      chosenPuzzle = puzzle;
      break;
    }
    chosenPuzzle = puzzle; // fallback if all match
  }

  return chosenPuzzle;
};
