import { useState, useEffect, useRef, useCallback } from 'react';
import { playHitSound, playWrongSound } from '../utils/audio';

// Gameplay configuration constants
const GAME_DURATION = 30; // 30 seconds game time
const COUNTDOWN_SECONDS = 3; // 3-second ready countdown
const HIT_POINTS = 10;
const WRONG_CLICK_PENALTY = 2;

// Difficulty curves based on remaining seconds
const getDifficultyParams = (timeLeft) => {
  if (timeLeft > 20) {
    // Phase 1 (First 10s): Beginner pace
    return { lifetime: 1400, spawnDelay: 250, targetSize: 64 };
  } else if (timeLeft > 10) {
    // Phase 2 (Middle 10s): Intermediate pace
    return { lifetime: 1050, spawnDelay: 180, targetSize: 58 };
  } else {
    // Phase 3 (Final 10s): Rapid fire pace
    return { lifetime: 800, spawnDelay: 120, targetSize: 52 };
  }
};

/**
 * useReactionGame Hook
 * 
 * Manages complete state and timing for Reaction Reactor:
 * - Ready, Countdown, Playing, Paused, and Completed states
 * - 30-second game clock and 3-second pre-game countdown
 * - Target generation with coordinate bounds guaranteed inside the arena
 * - Reaction time recording (average & best in milliseconds)
 * - Accurate scoring (+10 hits, -2 wrong clicks, min 0)
 * - Safe timer cleanups on unmount, pause, and game end
 */
export default function useReactionGame(config = {}) {
  const gameDuration = config?.duration ?? GAME_DURATION;
  const [gameState, setGameState] = useState('ready'); // ready | countdown | playing | paused | completed
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [timeLeft, setTimeLeft] = useState(gameDuration);
  const [score, setScore] = useState(0);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [wrongClicks, setWrongClicks] = useState(0);
  const [target, setTarget] = useState(null);
  const [reactionTimes, setReactionTimes] = useState([]);
  const [floatingFeedbacks, setFloatingFeedbacks] = useState([]);
  const [combo, setCombo] = useState(0);

  // Refs for tracking mutable timing across renders without triggering effects
  const targetTimeoutRef = useRef(null);
  const spawnTimeoutRef = useRef(null);
  const gameIntervalRef = useRef(null);
  const countdownIntervalRef = useRef(null);
  const targetSpawnTimeRef = useRef(0);
  const remainingLifetimeRef = useRef(0);
  const currentLifetimeRef = useRef(1400);
  const targetIdCounter = useRef(0);
  const spawnTargetRef = useRef(null);

  // Clear all active timers safely
  const clearAllTimers = useCallback(() => {
    if (gameIntervalRef.current) clearInterval(gameIntervalRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    if (targetTimeoutRef.current) clearTimeout(targetTimeoutRef.current);
    if (spawnTimeoutRef.current) clearTimeout(spawnTimeoutRef.current);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => clearAllTimers();
  }, [clearAllTimers]);

  // Spawn a new target inside the safe arena zone
  const spawnTarget = useCallback((remainingSeconds) => {
    clearTimeout(targetTimeoutRef.current);

    const { lifetime, targetSize } = getDifficultyParams(remainingSeconds);
    currentLifetimeRef.current = lifetime;
    remainingLifetimeRef.current = lifetime;

    // Keep coordinates well within bounds (12% to 85% prevents overflowing arena borders)
    const x = Math.floor(Math.random() * 73) + 12;
    const y = Math.floor(Math.random() * 70) + 14;
    const now = Date.now();
    targetSpawnTimeRef.current = now;
    targetIdCounter.current += 1;

    const newTarget = {
      id: targetIdCounter.current,
      x,
      y,
      size: targetSize,
      spawnedAt: now,
      lifetime,
    };

    setTarget(newTarget);

    // Schedule target expiration (miss)
    targetTimeoutRef.current = setTimeout(() => {
      // Target expired without being hit
      setMisses((prev) => prev + 1);
      setCombo(0);
      setTarget(null);

      // Trigger next target spawn after brief difficulty-based delay
      const { spawnDelay } = getDifficultyParams(remainingSeconds);
      spawnTimeoutRef.current = setTimeout(() => {
        if (spawnTargetRef.current) {
          spawnTargetRef.current(remainingSeconds);
        }
      }, spawnDelay);
    }, lifetime);
  }, []);

  // Keep spawnTargetRef synchronized
  useEffect(() => {
    spawnTargetRef.current = spawnTarget;
  }, [spawnTarget]);

  // Start the 3-second countdown
  const startGame = useCallback(() => {
    clearAllTimers();
    setScore(0);
    setHits(0);
    setMisses(0);
    setWrongClicks(0);
    setCombo(0);
    setReactionTimes([]);
    setFloatingFeedbacks([]);
    setTarget(null);
    setTimeLeft(gameDuration);
    setCountdown(COUNTDOWN_SECONDS);
    setGameState('countdown');

    let count = COUNTDOWN_SECONDS;
    countdownIntervalRef.current = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdown(count);
      } else {
        clearInterval(countdownIntervalRef.current);
        setGameState('playing');
        spawnTarget(gameDuration);
      }
    }, 1000);
  }, [clearAllTimers, spawnTarget, gameDuration]);

  // Game clock timer when in 'playing' state
  useEffect(() => {
    if (gameState !== 'playing') return;

    gameIntervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearAllTimers();
          setTarget(null);
          setGameState('completed');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (gameIntervalRef.current) clearInterval(gameIntervalRef.current);
    };
  }, [gameState, clearAllTimers]);

  // Handle successful target tap/click
  const handleTargetClick = useCallback((e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (gameState !== 'playing' || !target) return;

    clearTimeout(targetTimeoutRef.current);
    playHitSound();

    const reactionTime = Date.now() - targetSpawnTimeRef.current;
    setReactionTimes((prev) => [...prev, reactionTime]);
    setHits((prev) => prev + 1);
    setCombo((prev) => prev + 1);
    setScore((prev) => prev + HIT_POINTS);

    // Floating text indicator
    const feedbackId = Date.now() + Math.random();
    setFloatingFeedbacks((prev) => [
      ...prev.slice(-4),
      {
        id: feedbackId,
        text: `+${HIT_POINTS}`,
        x: target.x,
        y: target.y,
        type: 'hit',
        reactionTime: `${reactionTime}ms`,
      },
    ]);

    setTarget(null);

    // Schedule next target spawn
    const { spawnDelay } = getDifficultyParams(timeLeft);
    spawnTimeoutRef.current = setTimeout(() => {
      spawnTarget(timeLeft);
    }, spawnDelay);
  }, [gameState, target, timeLeft, spawnTarget]);

  // Handle wrong click on arena background
  const handleArenaClick = useCallback((e) => {
    if (gameState !== 'playing') return;

    playWrongSound();
    setCombo(0);

    // Apply wrong click penalty, score cannot go below 0
    setScore((prev) => Math.max(0, prev - WRONG_CLICK_PENALTY));
    setWrongClicks((prev) => prev + 1);

    // Calculate approximate click coordinates inside arena for visual feedback
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const clickY = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    const feedbackId = Date.now() + Math.random();
    setFloatingFeedbacks((prev) => [
      ...prev.slice(-4),
      {
        id: feedbackId,
        text: `-${WRONG_CLICK_PENALTY}`,
        x: Math.min(85, Math.max(15, clickX)),
        y: Math.min(85, Math.max(15, clickY)),
        type: 'penalty',
      },
    ]);
  }, [gameState]);

  // Pause gameplay
  const pauseGame = useCallback(() => {
    if (gameState !== 'playing') return;

    clearAllTimers();

    // Preserve remaining target lifetime
    if (target) {
      const elapsed = Date.now() - targetSpawnTimeRef.current;
      remainingLifetimeRef.current = Math.max(100, currentLifetimeRef.current - elapsed);
    }

    setGameState('paused');
  }, [gameState, target, clearAllTimers]);

  // Resume gameplay
  const resumeGame = useCallback(() => {
    if (gameState !== 'paused') return;

    setGameState('playing');

    // Resume current target with preserved remaining lifetime, or spawn new
    if (target) {
      targetSpawnTimeRef.current = Date.now();
      targetTimeoutRef.current = setTimeout(() => {
        setMisses((prev) => prev + 1);
        setTarget(null);
        const { spawnDelay } = getDifficultyParams(timeLeft);
        spawnTimeoutRef.current = setTimeout(() => {
          spawnTarget(timeLeft);
        }, spawnDelay);
      }, remainingLifetimeRef.current);
    } else {
      spawnTarget(timeLeft);
    }
  }, [gameState, target, timeLeft, spawnTarget]);

  // Restart game
  const restartGame = useCallback(() => {
    startGame();
  }, [startGame]);

  // Exit game and clean up
  const exitGame = useCallback(() => {
    clearAllTimers();
    setTarget(null);
    setGameState('ready');
  }, [clearAllTimers]);

  // Remove stale floating feedback animations
  const removeFeedback = useCallback((id) => {
    setFloatingFeedbacks((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // Performance statistics calculation
  const totalTargets = hits + misses;
  const accuracy = totalTargets > 0 ? Math.round((hits / totalTargets) * 100) : 0;
  const averageReactionTime = reactionTimes.length > 0
    ? Math.round(reactionTimes.reduce((acc, val) => acc + val, 0) / reactionTimes.length)
    : 0;
  const bestReactionTime = reactionTimes.length > 0
    ? Math.min(...reactionTimes)
    : 0;

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
    countdown,
    timeLeft,
    score,
    hits,
    misses,
    wrongClicks,
    combo,
    target,
    floatingFeedbacks,
    accuracy,
    totalTargets,
    averageReactionTime,
    bestReactionTime,
    startGame,
    pauseGame,
    resumeGame,
    restartGame,
    exitGame,
    handleTargetClick,
    handleArenaClick,
    removeFeedback,
  };
}
