import { useState, useEffect, useRef, useCallback } from 'react';
import ReactionArena from '../reaction/ReactionArena';
import { generatePattern } from '../../hooks/usePatternPanic';
import Icon from '../../components/common/Icons';

/**
 * Floor 4: Final Mix Component
 * 60s alternating quick reaction hits and pattern puzzles.
 * Reuses ReactionArena and generatePattern without duplicate logic.
 */
export default function FinalMixFloor({ onComplete }) {
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [hits, setHits] = useState(0);
  const [correctPatterns, setCorrectPatterns] = useState(0);
  const [phase, setPhase] = useState('target'); // 'target' | 'pattern'

  // Target state
  const [target, setTarget] = useState(null);
  const [floatingFeedbacks, setFloatingFeedbacks] = useState([]);
  const targetTimeoutRef = useRef(null);
  const targetSpawnTimeRef = useRef(0);

  // Pattern state
  const [currentPattern, setCurrentPattern] = useState(null);
  const [patternFeedback, setPatternFeedback] = useState(null);
  const patternTimeoutRef = useRef(null);

  // Game clock timer
  const gameClockRef = useRef(null);

  const cleanupAll = useCallback(() => {
    if (gameClockRef.current) clearInterval(gameClockRef.current);
    if (targetTimeoutRef.current) clearTimeout(targetTimeoutRef.current);
    if (patternTimeoutRef.current) clearTimeout(patternTimeoutRef.current);
  }, []);

  useEffect(() => {
    return () => cleanupAll();
  }, [cleanupAll]);

  // Spawn Target function
  const spawnTarget = useCallback(() => {
    const x = Math.floor(Math.random() * 66) + 17;
    const y = Math.floor(Math.random() * 66) + 17;
    const newTarget = {
      id: Date.now() + Math.random(),
      x,
      y,
      size: 54,
    };
    targetSpawnTimeRef.current = Date.now();
    setTarget(newTarget);

    targetTimeoutRef.current = setTimeout(() => {
      // Target expired -> switch to pattern
      setTarget(null);
      setPhase('pattern');
      setCurrentPattern(generatePattern(2));
      setPatternFeedback(null);
    }, 1500);
  }, []);

  // Initialize Game on Mount
  useEffect(() => {
    const startTimer = setTimeout(() => {
      spawnTarget();
    }, 50);

    gameClockRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          cleanupAll();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearTimeout(startTimer);
      cleanupAll();
    };
  }, [spawnTarget, cleanupAll]);

  // When timer hits 0, complete round
  useEffect(() => {
    if (timeLeft === 0) {
      cleanupAll();
      if (onComplete) {
        onComplete({ score, hits, correct: correctPatterns });
      }
    }
  }, [timeLeft, onComplete, score, hits, correctPatterns, cleanupAll]);

  // Handle Target Click
  const handleTargetClick = (e) => {
    e.stopPropagation();
    if (targetTimeoutRef.current) clearTimeout(targetTimeoutRef.current);

    setScore((prev) => prev + 10);
    setHits((prev) => prev + 1);
    setTarget(null);

    // Immediate switch to pattern puzzle
    setPhase('pattern');
    setCurrentPattern(generatePattern(2));
    setPatternFeedback(null);
  };

  // Handle Arena Miss Click
  const handleArenaClick = () => {
    setScore((prev) => Math.max(0, prev - 2));
  };

  // Handle Pattern Choice
  const handlePatternChoice = (option) => {
    if (!currentPattern || patternFeedback !== null) return;

    const isCorrect = String(option) === String(currentPattern.correctAnswer);
    if (isCorrect) {
      setScore((prev) => prev + 12);
      setCorrectPatterns((prev) => prev + 1);
      setPatternFeedback({ isCorrect: true, selected: option });
    } else {
      setScore((prev) => Math.max(0, prev - 4));
      setPatternFeedback({ isCorrect: false, selected: option });
    }

    patternTimeoutRef.current = setTimeout(() => {
      setPatternFeedback(null);
      setCurrentPattern(null);
      setPhase('target');
      spawnTarget();
    }, 450);
  };

  const removeFeedback = (id) => {
    setFloatingFeedbacks((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <div className="final-mix-container" style={{ width: '100%', maxWidth: '720px', margin: '0 auto' }}>
      {/* HUD */}
      <div
        className="final-mix-hud"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--surface)',
          padding: '12px 18px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
          marginBottom: '14px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="badge-pill badge-yellow">
            <Icon name="tower" size={13} />
            <span>FINAL MIX</span>
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
            Phase: <strong style={{ color: phase === 'target' ? 'var(--zone-reaction)' : 'var(--zone-pattern)' }}>
              {phase === 'target' ? '⚡ Reflex Hit' : '🧩 Solve Pattern'}
            </strong>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--muted)', fontWeight: 700 }}>TIME</div>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.3rem',
                fontWeight: 800,
                color: timeLeft <= 10 ? 'var(--coral)' : 'var(--text)',
              }}
            >
              {timeLeft}s
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--muted)', fontWeight: 700 }}>SCORE</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 800, color: 'var(--yellow)' }}>
              {score}
            </div>
          </div>
        </div>
      </div>

      {/* Main Gameplay Screen depending on phase */}
      {phase === 'target' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--zone-reaction)', fontWeight: 700 }}>
            TAP THE TARGET FAST!
          </div>
          <ReactionArena
            gameState="playing"
            countdown={0}
            target={target}
            floatingFeedbacks={floatingFeedbacks}
            onTargetClick={handleTargetClick}
            onArenaClick={handleArenaClick}
            onResume={() => {}}
            onRestart={() => {}}
            onExit={() => {}}
            onRemoveFeedback={removeFeedback}
          />
        </div>
      ) : (
        <div
          className="final-mix-pattern-box"
          style={{
            background: 'var(--surface)',
            border: '2px solid rgba(155, 123, 255, 0.35)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px 18px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            minHeight: '400px',
            justifyContent: 'center',
          }}
        >
          <span className="badge-pill badge-purple">
            {currentPattern?.category || 'Pattern Sequence'}
          </span>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              flexWrap: 'wrap',
              margin: '12px 0',
            }}
          >
            {currentPattern?.sequence.map((item, idx) => (
              <div
                key={idx}
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '12px',
                  background: item === '?' ? 'rgba(255, 201, 60, 0.2)' : 'var(--surface-2)',
                  border: `2px solid ${item === '?' ? 'var(--yellow)' : 'var(--border-medium)'}`,
                  color: item === '?' ? 'var(--yellow)' : 'var(--text)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.25rem',
                  fontWeight: 800,
                }}
              >
                {item}
              </div>
            ))}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '10px',
              width: '100%',
              maxWidth: '360px',
            }}
          >
            {currentPattern?.options.map((opt, i) => {
              const isSelected = patternFeedback?.selected === opt;
              let btnBg = 'var(--surface-2)';
              if (isSelected) {
                btnBg = patternFeedback.isCorrect ? 'var(--zone-memory)' : 'var(--coral)';
              }

              return (
                <button
                  key={i}
                  type="button"
                  className="btn-arcade secondary"
                  style={{
                    background: btnBg,
                    minHeight: '48px',
                    fontSize: '1.1rem',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 800,
                  }}
                  onClick={() => handlePatternChoice(opt)}
                  disabled={patternFeedback !== null}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
