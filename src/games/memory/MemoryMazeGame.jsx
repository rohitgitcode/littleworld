import { useState, useEffect, useRef } from 'react';
import useMemoryMaze, { PADS } from '../../hooks/useMemoryMaze';
import Icon from '../../components/common/Icons';
import Mascot from '../../components/common/Mascot';
import RewardSummary from '../../components/common/RewardSummary';
import { useProgress } from '../../progression/store.jsx';
import './memory.css';

/**
 * MemoryMazeGame Component
 * 
 * Playable Simon-style arcade memory sequence challenge:
 * - HUD: Round Level, Score, Best Score, Exit button
 * - Ready Screen with rules & start CTA
 * - Console Arena with 4 responsive arcade pads & step tracker
 * - Game Over results screen with RewardSummary, replay, and return options
 */
export default function MemoryMazeGame({ onExit, config, onComplete, embedded }) {
  const {
    gameState,
    level,
    score,
    bestScore,
    sequenceLength,
    playerStep,
    activePad,
    startGame,
    handlePadClick,
    exitGame,
  } = useMemoryMaze(config);

  const { submitResult } = useProgress();
  const [rewardResult, setRewardResult] = useState(null);
  const [countedScore, setCountedScore] = useState(0);
  const runIdRef = useRef(null);

  // Score count-up on game over
  useEffect(() => {
    if (gameState === 'game_over') {
      const target = score;
      const step = Math.max(1, Math.ceil(target / 30));
      let current = 0;
      const interval = setInterval(() => {
        if (target <= 0) {
          clearInterval(interval);
          return;
        }
        current = Math.min(target, current + step);
        setCountedScore(current);
        if (current >= target) clearInterval(interval);
      }, 25);
      return () => clearInterval(interval);
    }
  }, [gameState, score]);

  const handleStart = () => {
    runIdRef.current = 'mem_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
    setRewardResult(null);
    startGame();
  };

  const handleExit = () => {
    exitGame();
    if (onExit) onExit();
  };

  // Submit result once when game ends
  useEffect(() => {
    if (gameState === 'game_over') {
      if (embedded && onComplete) {
        onComplete({
          level,
          score,
          longest: sequenceLength,
        });
      } else if (!embedded && runIdRef.current) {
        const res = submitResult({
          id: runIdRef.current,
          game: 'memory-maze',
          stats: {
            level,
            score,
            longest: sequenceLength,
          },
        });
        setRewardResult(res);
      }
    }
  }, [gameState, embedded, onComplete, submitResult, level, score, sequenceLength]);

  const getStatusText = () => {
    switch (gameState) {
      case 'watch':
        return { text: 'WATCH THE PATTERN', className: 'watch' };
      case 'your_turn':
        return { text: `YOUR TURN: STEP ${playerStep + 1} OF ${sequenceLength}`, className: 'your_turn' };
      case 'correct':
        return { text: 'SEQUENCE CONFIRMED!', className: 'correct' };
      case 'wrong':
        return { text: 'SEQUENCE MISMATCH', className: 'wrong' };
      default:
        return null;
    }
  };

  const status = getStatusText();
  const glyphs = ['bolt', 'brain', 'puzzle', 'star'];

  return (
    <div className="memory-game-wrapper">
      <header className="memory-hud">
        <div className="memory-hud-left">
          <button
            type="button"
            className="hud-exit-btn"
            onClick={handleExit}
            title="Exit to Arcade"
          >
            <Icon name="arrowLeft" size={13} />
            <span>Exit</span>
          </button>
          <div className="memory-title-wrap">
            <Icon name="brain" size={17} />
            <span className="hud-title-text">Memory Maze</span>
          </div>
        </div>

        <div className="memory-hud-center">
          <div className="memory-stat-box">
            <span className="memory-stat-lbl">ROUND</span>
            <span className="memory-stat-val">{level}</span>
          </div>

          <div className="memory-stat-box">
            <span className="memory-stat-lbl">SCORE</span>
            <span className="memory-stat-val score">{score}</span>
          </div>
        </div>

        <div className="memory-hud-right">
          <span className="badge-pill badge-yellow" title="Session High Score">
            <Icon name="trophy" size={12} />
            <span>Best: {bestScore}</span>
          </span>
        </div>
      </header>

      <main className="memory-main-content">
        {gameState === 'ready' && (
          <section className="memory-card" aria-label="Game Instructions">
            <span className="badge-pill badge-purple" style={{ marginBottom: '10px' }}>
              <Icon name="brain" size={12} />
              <span>Sequence Recall</span>
            </span>

            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '6px' }}>
              Memory Maze
            </h1>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', maxWidth: '520px', lineHeight: 1.5 }}>
              Memorize the glowing arcade pad sequence. Repeat each pattern flawlessly.
              Every round adds one additional step to the maze!
            </p>

            <div className="memory-rules-grid">
              <div className="rule-item">
                <span className="rule-icon"><Icon name="clock" size={17} /></span>
                <span className="rule-title">Watch Carefully</span>
                <span className="rule-detail">Observe Order</span>
              </div>
              <div className="rule-item">
                <span className="rule-icon"><Icon name="controller" size={17} /></span>
                <span className="rule-title">Repeat Steps</span>
                <span className="rule-detail">Tap Identical Order</span>
              </div>
              <div className="rule-item">
                <span className="rule-icon"><Icon name="star" size={17} /></span>
                <span className="rule-title">Survive Rounds</span>
                <span className="rule-detail">+25 Pts / Round</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                className="btn-arcade purple"
                style={{ padding: '12px 28px', fontSize: '1rem' }}
                onClick={handleStart}
              >
                <Icon name="play" size={15} />
                <span>Start Trial</span>
              </button>
              <button
                type="button"
                className="btn-arcade secondary"
                onClick={handleExit}
              >
                Back to Arcade
              </button>
            </div>
          </section>
        )}

        {(gameState === 'watch' || gameState === 'your_turn' || gameState === 'correct' || gameState === 'wrong') && (
          <section className="memory-arena" aria-label="Memory Maze Console">
            <div className="memory-status-banner">
              {status && (
                <div className={`status-pill ${status.className}`}>
                  {gameState === 'watch' && <Icon name="clock" size={14} />}
                  {gameState === 'your_turn' && <Icon name="controller" size={14} />}
                  {gameState === 'correct' && <Icon name="check" size={14} />}
                  {gameState === 'wrong' && <Icon name="close" size={14} />}
                  <span>{status.text}</span>
                </div>
              )}
            </div>

            <div className="memory-grid-container">
              <div className="memory-pads-grid">
                {PADS.map((pad, idx) => {
                  const isLit = activePad === pad.id;
                  const isInputDisabled = gameState !== 'your_turn';

                  return (
                    <button
                      key={pad.id}
                      type="button"
                      className={`memory-pad ${isLit ? 'lit' : ''}`}
                      style={{
                        '--pad-color': pad.color,
                        '--pad-glow': pad.glow,
                        '--pad-bg': pad.bg,
                        '--pad-border': `${pad.color}44`,
                      }}
                      onClick={() => handlePadClick(pad.id)}
                      disabled={isInputDisabled}
                      aria-label={`Memory Pad ${pad.name}`}
                    >
                      <span className="pad-glyph">
                        <Icon name={glyphs[idx]} size={24} />
                      </span>
                      <span className="pad-label">{pad.name}</span>
                    </button>
                  );
                })}
              </div>

              <div className="memory-center-core" aria-hidden="true">
                <span className="core-step-text">R{level}</span>
                <span className="core-subtext">{sequenceLength} STEPS</span>
              </div>
            </div>
          </section>
        )}

        {gameState === 'game_over' && (
          <section className="memory-card" aria-label="Game Over Summary">
            <Mascot state={level >= 5 ? 'happy' : level <= 2 ? 'sad' : 'idle'} size={68} />

            <span className="badge-pill badge-pink" style={{ marginBottom: '10px' }}>
              Sequence Finished
            </span>

            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '4px' }}>
              Memory Maze Concluded
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              The sequence overloaded your neural buffer.
            </p>

            <div className="results-score-banner" style={{ width: '100%', maxWidth: '400px', marginBottom: '16px' }}>
              <span className="results-rank-pill" style={{ color: '#9d5cf7', borderColor: '#9d5cf7' }}>
                {level >= 8 ? 'MASTER TIER' : level >= 5 ? 'EXPERT TIER' : level >= 3 ? 'NOVICE TIER' : 'CADET'}
              </span>
              <div className="results-score-num">{countedScore}</div>
              <div className="results-score-lbl">Total Memory Score</div>
            </div>

            {/* Compact Progression Reward Summary with Pop */}
            <div className="reward-pop">
              <RewardSummary result={rewardResult} />
            </div>

            <div className="results-metrics-grid" style={{ maxWidth: '460px', gridTemplateColumns: 'repeat(3, 1fr)' }}>
              <div className="metric-box">
                <span className="metric-icon"><Icon name="controller" size={15} /></span>
                <span className="metric-val">{level}</span>
                <span className="metric-lbl">Rounds Reached</span>
              </div>
              <div className="metric-box">
                <span className="metric-icon"><Icon name="star" size={15} /></span>
                <span className="metric-val">{sequenceLength}</span>
                <span className="metric-lbl">Max Sequence</span>
              </div>
              <div className="metric-box">
                <span className="metric-icon"><Icon name="trophy" size={15} /></span>
                <span className="metric-val">{bestScore}</span>
                <span className="metric-lbl">Session Best</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button
                type="button"
                className="btn-primary"
                onClick={handleStart}
              >
                <Icon name="refresh" size={16} />
                <span>Play Again</span>
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={handleExit}
              >
                <Icon name="home" size={16} />
                <span>Back to Home</span>
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
