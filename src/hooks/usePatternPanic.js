import { useState, useEffect, useRef, useCallback } from 'react';
import { playCorrectSound, playWrongSound, triggerHaptic } from '../utils/audio';
import { generatePattern } from '../games/pattern/patternGenerators';

export { generatePattern };

const GAME_DURATION = 45; // 45-second pattern rush

// Time allotted per question based on correct count
const getQuestionTimeForCorrect = (correct) => {
  if (correct < 3) return 10;
  if (correct < 7) return 7;
  return 5;
};

// Difficulty tier based on correct count
const getTierForCorrect = (correct) => {
  if (correct < 3) return 1;
  if (correct < 7) return 2;
  return 3;
};

/**
 * usePatternPanic Hook
 * 
 * Manages game state and puzzles for Pattern Panic:
 * - 45s countdown rush
 * - Difficulty ramps by correct-answer count (Tier 1 -> Tier 2 -> Tier 3)
 * - Shorter time per question at higher levels (10s -> 7s -> 5s)
 * - Non-repetitive questions tracked via history signatures
 * - Multiple choice answer evaluation with 400ms double-tap protection
 * - Scoring (+20 per correct, -5 per wrong, min 0)
 * - Visual feedback with post-answer rule explanation
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
  const [questionTimeLeft, setQuestionTimeLeft] = useState(10);
  const [questionTimeLimit, setQuestionTimeLimit] = useState(10);

  const gameTimerRef = useRef(null);
  const questionTimerRef = useRef(null);
  const feedbackTimerRef = useRef(null);
  const isAnsweringRef = useRef(false);
  const historyRef = useRef([]);

  const clearTimers = useCallback(() => {
    if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    if (questionTimerRef.current) clearInterval(questionTimerRef.current);
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
  }, []);

  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  // Load next puzzle with history tracking
  const nextPuzzle = useCallback((newCorrectCount = correctCount) => {
    const tier = getTierForCorrect(newCorrectCount);
    setDifficultyLevel(tier);

    const qLimit = getQuestionTimeForCorrect(newCorrectCount);
    setQuestionTimeLimit(qLimit);
    setQuestionTimeLeft(qLimit);

    const puzzle = generatePattern(tier, historyRef.current);
    if (puzzle?.signature) {
      historyRef.current.push(puzzle.signature);
      if (historyRef.current.length > 12) {
        historyRef.current.shift();
      }
    }
    setCurrentPattern(puzzle);
    setAnswerFeedback(null);
  }, [correctCount]);

  // Start game session
  const startGame = useCallback(() => {
    clearTimers();
    setScore(0);
    setCorrectCount(0);
    setWrongCount(0);
    setTimeLeft(gameDuration);
    setDifficultyLevel(1);
    setQuestionTimeLimit(10);
    setQuestionTimeLeft(10);
    historyRef.current = [];
    isAnsweringRef.current = false;
    setAnswerFeedback(null);

    const firstPuzzle = generatePattern(1, []);
    if (firstPuzzle?.signature) historyRef.current.push(firstPuzzle.signature);
    setCurrentPattern(firstPuzzle);
    setGameState('playing');
  }, [clearTimers, gameDuration]);

  // Main game countdown timer (45s)
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

  // Per-question timer (shorter at higher tiers)
  useEffect(() => {
    if (gameState !== 'playing' || answerFeedback !== null || !currentPattern) {
      if (questionTimerRef.current) clearInterval(questionTimerRef.current);
      return;
    }

    questionTimerRef.current = setInterval(() => {
      setQuestionTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(questionTimerRef.current);
          // Question timed out
          playWrongSound();
          triggerHaptic(40);
          setScore((s) => Math.max(0, s - 5));
          setWrongCount((w) => w + 1);
          setAnswerFeedback({
            isCorrect: false,
            selectedOption: 'TIMEOUT',
            timedOut: true,
          });

          feedbackTimerRef.current = setTimeout(() => {
            if (maxQuestions && (correctCount + wrongCount + 1) >= maxQuestions) {
              clearTimers();
              setGameState('completed');
            } else {
              nextPuzzle();
            }
          }, 800);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (questionTimerRef.current) clearInterval(questionTimerRef.current);
    };
  }, [gameState, answerFeedback, currentPattern, correctCount, wrongCount, maxQuestions, clearTimers, nextPuzzle]);

  // Evaluate user choice with double-tap blocking (400ms)
  const handleAnswer = useCallback((option) => {
    if (gameState !== 'playing' || answerFeedback !== null || !currentPattern || isAnsweringRef.current) return;

    isAnsweringRef.current = true;
    setTimeout(() => {
      isAnsweringRef.current = false;
    }, 400);

    // Stop question timer immediately on answer
    if (questionTimerRef.current) clearInterval(questionTimerRef.current);

    const isCorrect = String(option) === String(currentPattern.correctAnswer);

    let updatedCorrect = correctCount;
    if (isCorrect) {
      playCorrectSound();
      triggerHaptic(20);
      setScore((prev) => prev + 20);
      updatedCorrect = correctCount + 1;
      setCorrectCount(updatedCorrect);
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
        nextPuzzle(updatedCorrect);
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
    questionTimeLeft,
    questionTimeLimit,
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
