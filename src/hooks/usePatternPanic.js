import { useState, useEffect, useRef, useCallback } from 'react';
import { playCorrectSound, playWrongSound, triggerHaptic } from '../utils/audio';

const GAME_DURATION = 45; // 45-second pattern rush

// Curated pattern templates with algorithmic variation
export const generatePattern = (difficultyLevel) => {
  const type = Math.floor(Math.random() * 6);

  if (type === 0 || difficultyLevel === 1) {
    // Arithmetic progression (e.g., +3, +4, +5)
    const start = Math.floor(Math.random() * 15) + 1;
    const step = Math.floor(Math.random() * 5) + 2;
    const full = [start, start + step, start + step * 2, start + step * 3, start + step * 4];
    const missingIndex = Math.floor(Math.random() * 2) + 3; // missing 3rd or 4th item
    const answer = full[missingIndex];
    full[missingIndex] = '?';

    // Generate distractors
    const options = [
      answer,
      answer + step,
      answer - step > 0 ? answer - step : answer + step * 2,
      answer + 1,
    ].sort(() => Math.random() - 0.5);

    return {
      category: 'Arithmetic Series',
      sequence: full,
      correctAnswer: answer,
      options,
      hint: `Step pattern: +${step}`,
    };
  } else if (type === 1) {
    // Multiplicative / Doubling series
    const mult = difficultyLevel > 2 ? 3 : 2;
    const start = Math.floor(Math.random() * 3) + 2;
    const full = [start, start * mult, start * mult * mult, start * mult * mult * mult];
    const missingIndex = 3;
    const answer = full[missingIndex];
    full[missingIndex] = '?';

    const options = [
      answer,
      answer - start,
      answer + start * 2,
      answer * 2,
    ].sort(() => Math.random() - 0.5);

    return {
      category: 'Scaling Series',
      sequence: full,
      correctAnswer: answer,
      options,
      hint: `Multiplying by ${mult}`,
    };
  } else if (type === 2) {
    // Alternating addition / subtraction (e.g., +4, -1, +4, -1)
    const base = Math.floor(Math.random() * 10) + 10;
    const add = Math.floor(Math.random() * 3) + 3;
    const sub = Math.floor(Math.random() * 2) + 1;
    const full = [base, base + add, base + add - sub, base + add - sub + add, base + add - sub + add - sub];
    const missingIndex = 4;
    const answer = full[missingIndex];
    full[missingIndex] = '?';

    const options = [
      answer,
      answer + 2,
      answer - 2,
      answer + sub,
    ].sort(() => Math.random() - 0.5);

    return {
      category: 'Oscillating Series',
      sequence: full,
      correctAnswer: answer,
      options,
      hint: `Alternating +${add} and -${sub}`,
    };
  } else if (type === 3) {
    // Geometric / Symbolic progression
    const sets = [
      ['▲', '◆', '●', '▲', '◆', '?'],
      ['■', '▲', '■', '▲', '■', '?'],
      ['★', '✦', '★', '✦', '★', '?'],
      ['⬡', '⬢', '⬡', '⬢', '⬡', '?'],
    ];
    const chosen = sets[Math.floor(Math.random() * sets.length)];
    const sequence = [...chosen];
    const answer = chosen[chosen.length - 2] === chosen[0] ? chosen[1] : chosen[0];

    const distractorPool = ['▲', '◆', '●', '■', '★', '⬡'].filter((s) => s !== answer);
    const options = [
      answer,
      distractorPool[0],
      distractorPool[1],
      distractorPool[2],
    ].sort(() => Math.random() - 0.5);

    return {
      category: 'Shape Cycle',
      sequence,
      correctAnswer: answer,
      options,
      hint: 'Repeating shape cycle',
    };
  } else if (type === 4) {
    // Square Numbers series (1, 4, 9, 16, 25, 36)
    const startN = Math.floor(Math.random() * 3) + 1;
    const full = [startN ** 2, (startN + 1) ** 2, (startN + 2) ** 2, (startN + 3) ** 2];
    const answer = full[3];
    full[3] = '?';

    const options = [
      answer,
      answer - 5,
      answer + 7,
      answer + 9,
    ].sort(() => Math.random() - 0.5);

    return {
      category: 'Square Powers',
      sequence: full,
      correctAnswer: answer,
      options,
      hint: 'Perfect square sequence',
    };
  } else {
    // Fibonacci-style addition (a + b = c)
    const a = Math.floor(Math.random() * 3) + 1;
    const b = a + 1;
    const c = a + b;
    const d = b + c;
    const e = c + d;
    const full = [a, b, c, d, '?'];
    const answer = e;

    const options = [
      answer,
      answer + 2,
      answer - 1,
      answer + 4,
    ].sort(() => Math.random() - 0.5);

    return {
      category: 'Fibonacci Addition',
      sequence: full,
      correctAnswer: answer,
      options,
      hint: 'Each number is the sum of previous two',
    };
  }
};

/**
 * usePatternPanic Hook
 * 
 * Manages game state and puzzles for Pattern Panic:
 * - 45s countdown rush
 * - Algorithmic and curated puzzle sequence generation
 * - Multiple choice answer evaluation
 * - Scoring (+20 per correct, -5 per wrong, min 0)
 * - Immediate visual feedback and proper result screen
 */
export default function usePatternPanic(config = {}) {
  const gameDuration = config?.duration ?? GAME_DURATION;
  const maxQuestions = config?.maxQuestions ?? null;

  const [gameState, setGameState] = useState('ready'); // ready | playing | paused | completed
  const [timeLeft, setTimeLeft] = useState(gameDuration);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [currentPattern, setCurrentPattern] = useState(null);
  const [answerFeedback, setAnswerFeedback] = useState(null); // { isCorrect, selectedOption } | null
  const [difficultyLevel, setDifficultyLevel] = useState(1);

  const gameTimerRef = useRef(null);
  const feedbackTimerRef = useRef(null);
  const difficultyCounterRef = useRef(1);
  const isAnsweringRef = useRef(false);

  const clearTimers = useCallback(() => {
    if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
  }, []);

  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  // Load next puzzle
  const nextPuzzle = useCallback(() => {
    difficultyCounterRef.current += 1;
    setDifficultyLevel(difficultyCounterRef.current);
    const puzzle = generatePattern(difficultyCounterRef.current);
    setCurrentPattern(puzzle);
    setAnswerFeedback(null);
  }, []);

  // Start game session
  const startGame = useCallback(() => {
    clearTimers();
    setScore(0);
    setCorrectCount(0);
    setWrongCount(0);
    setTimeLeft(gameDuration);
    difficultyCounterRef.current = 1;
    setDifficultyLevel(1);
    isAnsweringRef.current = false;
    setAnswerFeedback(null);
    setCurrentPattern(generatePattern(1));
    setGameState('playing');
  }, [clearTimers, gameDuration]);

  // Main countdown timer
  useEffect(() => {
    if (gameState !== 'playing') return;

    gameTimerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearTimers();
          setGameState('completed');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    };
  }, [gameState, clearTimers]);

  // Evaluate user choice with double-tap blocking (400ms)
  const handleAnswer = useCallback((option) => {
    if (gameState !== 'playing' || answerFeedback !== null || !currentPattern || isAnsweringRef.current) return;

    isAnsweringRef.current = true;
    setTimeout(() => {
      isAnsweringRef.current = false;
    }, 400);

    const isCorrect = String(option) === String(currentPattern.correctAnswer);

    if (isCorrect) {
      playCorrectSound();
      triggerHaptic(20);
      setScore((prev) => prev + 20);
      setCorrectCount((prev) => prev + 1);
      setAnswerFeedback({ isCorrect: true, selectedOption: option });
    } else {
      playWrongSound();
      triggerHaptic(40);
      setScore((prev) => Math.max(0, prev - 5));
      setWrongCount((prev) => prev + 1);
      setAnswerFeedback({ isCorrect: false, selectedOption: option });
    }

    // Brief visual pause before next puzzle
    feedbackTimerRef.current = setTimeout(() => {
      if (maxQuestions && (correctCount + wrongCount + 1) >= maxQuestions) {
        clearTimers();
        setGameState('completed');
      } else {
        nextPuzzle();
      }
    }, 550);
  }, [gameState, answerFeedback, currentPattern, nextPuzzle, maxQuestions, correctCount, wrongCount, clearTimers]);

  const pauseGame = useCallback(() => {
    if (gameState !== 'playing') return;
    clearTimers();
    setGameState('paused');
  }, [gameState, clearTimers]);

  const resumeGame = useCallback(() => {
    if (gameState !== 'paused') return;
    setGameState('playing');
  }, [gameState]);

  const exitGame = useCallback(() => {
    clearTimers();
    setGameState('ready');
  }, [clearTimers]);

  const totalQuestions = correctCount + wrongCount;
  const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  // Keyboard Esc support to pause/resume
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (gameState === 'playing') pauseGame();
        else if (gameState === 'paused') resumeGame();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, pauseGame, resumeGame]);

  return {
    gameState,
    timeLeft,
    score,
    correctCount,
    wrongCount,
    totalQuestions,
    accuracy,
    difficultyLevel,
    currentPattern,
    answerFeedback,
    startGame,
    pauseGame,
    resumeGame,
    exitGame,
    handleAnswer,
  };
}
