import { useState, useEffect, useRef, useCallback } from 'react';
import { playHitSound, playCorrectSound, playWrongSound } from '../utils/audio';

// 4 Arcade Pads configuration
export const PADS = [
  { id: 0, name: 'TEAL', color: 'var(--teal)', border: 'var(--ink)' },
  { id: 1, name: 'SUN', color: 'var(--sun)', border: 'var(--ink)' },
  { id: 2, name: 'PINK', color: 'var(--pink)', border: 'var(--ink)' },
  { id: 3, name: 'TOMATO', color: 'var(--tomato)', border: 'var(--ink)' },
];

/**
 * useMemoryMaze Hook
 * 
 * Manages full Simon-style sequence memory logic:
 * - States: ready | watch | your_turn | correct | wrong | game_over
 * - Sequence generation and step-by-step playback
 * - Input blocking during playback to prevent rapid-click race conditions
 * - Safe timer cleanups on unmount and exit
 * - Scoring and session best score tracking
 */
export default function useMemoryMaze(config = {}) {
  const maxLevel = config?.maxLevel ?? null;
  const [gameState, setGameState] = useState('ready');
  const [sequence, setSequence] = useState([]);
  const [playerStep, setPlayerStep] = useState(0);
  const [activePad, setActivePad] = useState(null);
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);

  // Timeouts references for cleanup
  const playbackTimeouts = useRef([]);
  const feedbackTimeout = useRef(null);

  const clearAllTimeouts = useCallback(() => {
    playbackTimeouts.current.forEach((id) => clearTimeout(id));
    playbackTimeouts.current = [];
    if (feedbackTimeout.current) {
      clearTimeout(feedbackTimeout.current);
      feedbackTimeout.current = null;
    }
  }, []);

  useEffect(() => {
    return () => clearAllTimeouts();
  }, [clearAllTimeouts]);

  // Play sequence visually to the player
  const playSequence = useCallback((seq, currentRound) => {
    clearAllTimeouts();
    setGameState('watch');
    setActivePad(null);
    setPlayerStep(0);

    // Calculate tempo: faster as rounds advance (min 300ms)
    const onDuration = Math.max(300, 520 - (currentRound * 20));
    const gapDuration = Math.max(160, 260 - (currentRound * 10));
    const stepDuration = onDuration + gapDuration;

    // Small initial pause before playback begins
    const initialDelay = 500;

    seq.forEach((padId, index) => {
      // Pad turns ON
      const onTimer = setTimeout(() => {
        setActivePad(padId);
      }, initialDelay + index * stepDuration);

      // Pad turns OFF
      const offTimer = setTimeout(() => {
        setActivePad(null);
      }, initialDelay + index * stepDuration + onDuration);

      playbackTimeouts.current.push(onTimer, offTimer);
    });

    // When entire sequence is finished playing, hand over to player
    const handoverTimer = setTimeout(() => {
      setActivePad(null);
      setGameState('your_turn');
    }, initialDelay + seq.length * stepDuration + 150);

    playbackTimeouts.current.push(handoverTimer);
  }, [clearAllTimeouts]);

  // Start a fresh game session
  const startGame = useCallback(() => {
    clearAllTimeouts();
    setScore(0);
    setLevel(1);
    setPlayerStep(0);
    setActivePad(null);

    // Initial sequence of 2 pads
    const initialSeq = [
      Math.floor(Math.random() * 4),
      Math.floor(Math.random() * 4),
    ];
    setSequence(initialSeq);
    playSequence(initialSeq, 1);
  }, [clearAllTimeouts, playSequence]);

  // Handle player pressing a pad
  const handlePadClick = useCallback((padId) => {
    // Strictly prevent input if not in 'your_turn' state
    if (gameState !== 'your_turn') return;

    // Momentary pad illumination
    setActivePad(padId);
    playHitSound();
    if (feedbackTimeout.current) clearTimeout(feedbackTimeout.current);
    feedbackTimeout.current = setTimeout(() => {
      setActivePad(null);
    }, 200);

    // Check against expected pad in sequence
    const expectedPad = sequence[playerStep];

    if (padId === expectedPad) {
      const nextStep = playerStep + 1;

      if (nextStep === sequence.length) {
        // Player completed the full sequence for this round!
        playCorrectSound();
        const roundPoints = 20 + level * 5;
        const newScore = score + roundPoints;
        setScore(newScore);
        setBestScore((prev) => Math.max(prev, newScore));
        setGameState('correct');

        if (maxLevel && level >= maxLevel) {
          feedbackTimeout.current = setTimeout(() => {
            setGameState('game_over');
          }, 800);
          return;
        }

        // Next round: add 1 pad and increase level
        const nextRound = level + 1;
        setLevel(nextRound);
        const newPad = Math.floor(Math.random() * 4);
        const nextSequence = [...sequence, newPad];
        setSequence(nextSequence);

        feedbackTimeout.current = setTimeout(() => {
          playSequence(nextSequence, nextRound);
        }, 900);
      } else {
        // Correct step, wait for next player tap
        setPlayerStep(nextStep);
      }
    } else {
      // Wrong pad clicked!
      playWrongSound();
      setGameState('wrong');
      feedbackTimeout.current = setTimeout(() => {
        setGameState('game_over');
      }, 800);
    }
  }, [gameState, sequence, playerStep, level, score, playSequence, maxLevel]);

  // Exit & cleanup
  const exitGame = useCallback(() => {
    clearAllTimeouts();
    setActivePad(null);
    setGameState('ready');
  }, [clearAllTimeouts]);

  // Keyboard Esc support
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        exitGame();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [exitGame]);

  return {
    gameState,
    level,
    score,
    bestScore,
    sequenceLength: sequence.length,
    playerStep,
    activePad,
    startGame,
    handlePadClick,
    exitGame,
  };
}
