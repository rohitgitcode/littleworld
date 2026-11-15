import { useState, useEffect, useRef } from 'react';
import useReactionGame from '../../hooks/useReactionGame';
import ReactionArena from './ReactionArena';
import Icon from '../../components/common/Icons';
import Mascot from '../../components/common/Mascot';
import RewardSummary from '../../components/common/RewardSummary';
import { useProgress } from '../../progression/store.jsx';
import './reaction.css';

/**
 * ReactionGame Component
 * 
 * Main container for Reaction Reactor:
 * - HUD (Score, Time Left countdown, Hits/Misses, Pause/Exit)
 * - Ready Screen (Instructions, Target Preview, Start CTA)
 * - Arena Screen (Reaction target gameplay)
 * - Results Screen (Final Score, Accuracy, Average & Best Reaction Times, Reward Summary)
 */
export default function ReactionGame({ onExit, config, onComplete, embedded }) {
  const {
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
  } = useReactionGame(config);

  const { submitResult } = useProgress();
  const [rewardResult, setRewardResult] = useState(null);
  const [countedScore, setCountedScore] = useState(0);
  const runIdRef = useRef(null);

  // Score count-up animation on results
  useEffect(() => {
    if (gameState === 'completed') {
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
        if (current >= target) {
          clearInterval(interval);
        }
      }, 25);
      return () => clearInterval(interval);
    }
  }, [gameState, score]);

  const handleStart = () => {
    runIdRef.current = 'rx_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
    setRewardResult(null);
    startGame();
  };

  const handleRestart = () => {
    runIdRef.current = 'rx_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
    setRewardResult(null);
    restartGame();
  };

  const handleExitToArcade = () => {
    exitGame();
    if (onExit) onExit();
  };

  // Submit run result once when completed
  useEffect(() => {
    if (gameState === 'completed') {
      if (embedded && onComplete) {
        onComplete({
          score,
          hits,
          misses,
          wrong: wrongClicks,
          accuracy,
          avgRt: averageReactionTime,
          bestRt: bestReactionTime,
        });
      } else if (!embedded && runIdRef.current) {
        const res = submitResult({
          id: runIdRef.current,
          game: 'reaction-reactor',
          stats: {
            score,
            hits,
            misses,
            wrong: wrongClicks,
            accuracy,
            avgRt: averageReactionTime,
            bestRt: bestReactionTime,
          },
        });
        setRewardResult(res);
      }
    }
  }, [gameState, embedded, onComplete, submitResult, score, hits, misses, wrongClicks, accuracy, averageReactionTime, bestReactionTime]);

  const getGrade = (pts) => {
    if (pts >= 250) return { label: 'S RANK', color: '#f5b700' };
    if (pts >= 180) return { label: 'A RANK', color: '#00d8f6' };
    if (pts >= 120) return { label: 'B RANK', color: '#10b981' };
    if (pts >= 60) return { label: 'C RANK', color: '#9d5cf7' };
    return { label: 'ROOKIE', color: '#94a3b8' };
  };

  const grade = getGrade(score);

  return (
    <div className="reaction-game-wrapper">
      <header className="reaction-hud">
        <div className="hud-left">
          <button
            type="button"
            className="hud-exit-btn"
            onClick={handleExitToArcade}
            title="Exit to Arcade"
          >
            <Icon name="arrowLeft" size={13} />
            <span>Exit</span>
          </button>
          <div className="hud-title-wrap">
            <span className="hud-icon">
              <Icon name="bolt" size={17} />
            </span>
            <span className="hud-name">Reaction Reactor</span>
          </div>
        </div>

        <div className="hud-center">
          <div className="hud-timer-box">
            <span className="hud-timer-label">TIME</span>
            <span className={`hud-timer-value ${timeLeft <= 5 ? 'urgent' : ''}`}>
              {timeLeft}s
            </span>
          </div>

          <div className="hud-score-box">
            <span className="hud-score-label">SCORE</span>
            <span className="hud-score-value">{score}</span>
          </div>
        </div>

        <div className="hud-right">
          {combo >= 2 && (
            <span className="badge-pill badge-yellow" style={{ animation: 'rewardPop 140ms ease' }}>
              ⚡ {combo}x COMBO!
            </span>
          )}

          <div className="hud-mini-stats">
            <span className="mini-stat hits" title="Hits">
              <Icon name="check" size={14} /> <strong>{hits}</strong>
            </span>
            <span className="mini-stat misses" title="Misses">
              <Icon name="close" size={14} /> <strong>{misses}</strong>
            </span>
          </div>

          {gameState === 'playing' && (
            <button
              type="button"
              className="hud-pause-btn"
              onClick={pauseGame}
              aria-label="Pause game"
            >
              <Icon name="pause" size={14} />
            </button>
          )}
        </div>
      </header>

      <div className="hud-progress-track" aria-hidden="true">
        <div
          className={`hud-progress-fill ${timeLeft <= 10 ? 'urgent' : ''}`}
          style={{ transform: `scaleX(${Math.max(0, timeLeft / 30)})` }}
        />
      </div>

      <main className="reaction-main-content">
        {gameState === 'ready' && (
          <section className="reaction-card ready-card" aria-label="Game Instructions">
            <div className="ready-badge">
              <span className="badge-pill badge-cyan">
                <Icon name="bolt" size={12} />
                <span>Reflex Challenge</span>
              </span>
            </div>

            <h1 className="ready-title">Reaction Reactor</h1>
            <p className="ready-desc">
              Test your neurological speed. Neon energy targets will materialize across the arena.
              Tap them as fast as you can before they overload!
            </p>

            <div className="ready-rules-grid">
              <div className="rule-item">
                <span className="rule-icon">
                  <Icon name="check" size={18} />
                </span>
                <span className="rule-title">Direct Hit</span>
                <span className="rule-detail">+10 Points</span>
              </div>
              <div className="rule-item">
                <span className="rule-icon">
                  <Icon name="close" size={18} />
                </span>
                <span className="rule-title">Missed Tap</span>
                <span className="rule-detail">-2 Penalty</span>
              </div>
              <div className="rule-item">
                <span className="rule-icon">
                  <Icon name="clock" size={18} />
                </span>
                <span className="rule-title">Duration</span>
                <span className="rule-detail">30 Seconds</span>
              </div>
            </div>

            <div className="ready-target-preview">
              <span className="preview-label">Target Visual:</span>
              <div className="preview-target" aria-hidden="true">
                <span className="target-outer-ring"></span>
                <span className="target-core">
                  <Icon name="bolt" size={18} />
                </span>
              </div>
            </div>

            <div className="ready-actions">
              <button
                type="button"
                className="btn-arcade primary ready-start-btn"
                onClick={handleStart}
              >
                <Icon name="play" size={15} />
                <span>Start Challenge</span>
              </button>
              <button
                type="button"
                className="btn-arcade secondary"
                onClick={handleExitToArcade}
              >
                Return to Arcade
              </button>
            </div>
          </section>
        )}

        {(gameState === 'countdown' || gameState === 'playing' || gameState === 'paused') && (
          <ReactionArena
            gameState={gameState}
            countdown={countdown}
            target={target}
            floatingFeedbacks={floatingFeedbacks}
            onTargetClick={handleTargetClick}
            onArenaClick={handleArenaClick}
            onResume={resumeGame}
            onRestart={handleRestart}
            onExit={handleExitToArcade}
            onRemoveFeedback={removeFeedback}
          />
        )}

        {gameState === 'completed' && (
          <section className="reaction-card results-card" aria-label="Game Results">
            <Mascot state={score >= 120 ? 'happy' : score <= 20 ? 'sad' : 'idle'} size={68} />

            <div className="results-header">
              <span className="badge-pill badge-yellow">Challenge Complete</span>
              <h2 className="results-title">Trial Finished</h2>
            </div>

            <div className="results-score-banner">
              <div className="results-rank-pill" style={{ color: grade.color, borderColor: grade.color }}>
                {grade.label}
              </div>
              <div className="results-score-num">{countedScore}</div>
              <div className="results-score-lbl">Total Arcade Score</div>
            </div>

            {/* Compact Progression Reward Summary with Pop */}
            <div className="reward-pop">
              <RewardSummary result={rewardResult} />
            </div>

            <div className="results-metrics-grid">
              <div className="metric-box">
                <span className="metric-icon">
                  <Icon name="check" size={15} />
                </span>
                <span className="metric-val">{hits} / {totalTargets}</span>
                <span className="metric-lbl">Targets Hit</span>
              </div>

              <div className="metric-box">
                <span className="metric-icon">
                  <Icon name="close" size={15} />
                </span>
                <span className="metric-val">{misses}</span>
                <span className="metric-lbl">Expired Misses</span>
              </div>

              <div className="metric-box">
                <span className="metric-icon">
                  <Icon name="sparkle" size={15} />
                </span>
                <span className="metric-val">{wrongClicks}</span>
                <span className="metric-lbl">Off-Target Taps</span>
              </div>

              <div className="metric-box">
                <span className="metric-icon">
                  <Icon name="star" size={15} />
                </span>
                <span className="metric-val">{accuracy}%</span>
                <span className="metric-lbl">Hit Accuracy</span>
              </div>

              <div className="metric-box">
                <span className="metric-icon">
                  <Icon name="bolt" size={15} />
                </span>
                <span className="metric-val">
                  {averageReactionTime > 0 ? `${averageReactionTime}ms` : '--'}
                </span>
                <span className="metric-lbl">Avg Reaction Time</span>
              </div>

              <div className="metric-box">
                <span className="metric-icon">
                  <Icon name="trophy" size={15} />
                </span>
                <span className="metric-val">
                  {bestReactionTime > 0 ? `${bestReactionTime}ms` : '--'}
                </span>
                <span className="metric-lbl">Best Reflex Time</span>
              </div>
            </div>

            <div className="results-actions" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '16px' }}>
              <button
                type="button"
                className="btn-primary"
                onClick={handleRestart}
              >
                <Icon name="refresh" size={16} />
                <span>Play Again</span>
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={handleExitToArcade}
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
