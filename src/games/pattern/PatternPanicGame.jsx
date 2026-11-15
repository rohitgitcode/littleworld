import { useState, useEffect, useRef } from 'react';
import usePatternPanic from '../../hooks/usePatternPanic';
import Icon from '../../components/common/Icons';
import Mascot from '../../components/common/Mascot';
import RewardSummary from '../../components/common/RewardSummary';
import { useProgress } from '../../progression/store.jsx';
import './pattern.css';

/**
 * PatternPanicGame Component
 * 
 * Playable pattern solving puzzle arcade rush:
 * - HUD: 45s timer, Score, Correct/Wrong indicators, Pause/Exit
 * - Ready Screen with rules & Start CTA
 * - Puzzle Board with active sequence tiles and multiple choice buttons
 * - Results Screen with rank, accuracy, RewardSummary, and replay
 */
export default function PatternPanicGame({ onExit, config, onComplete, embedded }) {
  const {
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
  } = usePatternPanic(config);

  const { submitResult } = useProgress();
  const [rewardResult, setRewardResult] = useState(null);
  const [countedScore, setCountedScore] = useState(0);
  const runIdRef = useRef(null);

  // Score count-up on game completed
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
        if (current >= target) clearInterval(interval);
      }, 25);
      return () => clearInterval(interval);
    }
  }, [gameState, score]);

  const handleStart = () => {
    runIdRef.current = 'pat_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
    setRewardResult(null);
    startGame();
  };

  const handleExit = () => {
    exitGame();
    if (onExit) onExit();
  };

  // Submit result once when game ends
  useEffect(() => {
    if (gameState === 'completed') {
      if (embedded && onComplete) {
        onComplete({
          score,
          correct: correctCount,
          wrong: wrongCount,
          accuracy,
        });
      } else if (!embedded && runIdRef.current) {
        const res = submitResult({
          id: runIdRef.current,
          game: 'pattern-panic',
          stats: {
            score,
            correct: correctCount,
            wrong: wrongCount,
            accuracy,
          },
        });
        setRewardResult(res);
      }
    }
  }, [gameState, embedded, onComplete, submitResult, score, correctCount, wrongCount, accuracy]);

  const getRank = (pts) => {
    if (pts >= 160) return { label: 'PATTERN MASTER', color: '#f5b700' };
    if (pts >= 100) return { label: 'DECODER PRO', color: '#00d8f6' };
    if (pts >= 60) return { label: 'PUZZLE SOLVER', color: '#10b981' };
    return { label: 'APPRENTICE', color: '#94a3b8' };
  };

  const rank = getRank(score);

  return (
    <div className="pattern-game-wrapper">
      <header className="pattern-hud">
        <div className="pattern-hud-left">
          <button
            type="button"
            className="hud-exit-btn"
            onClick={handleExit}
            title="Exit to Arcade"
          >
            <Icon name="arrowLeft" size={13} />
            <span>Exit</span>
          </button>
          <div className="pattern-title-wrap">
            <Icon name="puzzle" size={17} />
            <span className="hud-title-text">Pattern Panic</span>
          </div>
        </div>

        <div className="pattern-hud-center">
          <div className="pattern-stat-box">
            <span className="pattern-stat-lbl">TIME</span>
            <span className={`pattern-stat-val ${timeLeft <= 10 ? 'urgent' : ''}`}>
              {timeLeft}s
            </span>
          </div>

          <div className="pattern-stat-box">
            <span className="pattern-stat-lbl">SCORE</span>
            <span className="pattern-stat-val score">{score}</span>
          </div>
        </div>

        <div className="pattern-hud-right">
          <div className="pattern-mini-stats">
            <span className="mini-stat hits" title="Correct">
              <Icon name="check" size={14} /> <strong>{correctCount}</strong>
            </span>
            <span className="mini-stat misses" title="Wrong">
              <Icon name="close" size={14} /> <strong>{wrongCount}</strong>
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

      {/* Thin time bar with transform: scaleX */}
      <div className="game-time-bar-track" aria-hidden="true">
        <div
          className={`game-time-bar-fill ${timeLeft <= 10 ? 'urgent' : ''}`}
          style={{ transform: `scaleX(${Math.max(0, timeLeft / 45)})` }}
        />
      </div>

      <main className="pattern-main-content">
        {gameState === 'ready' && (
          <section className="memory-card" aria-label="Game Instructions">
            <span className="badge-pill badge-pink" style={{ marginBottom: '10px' }}>
              <Icon name="puzzle" size={12} />
              <span>Logic & Sequence Rush</span>
            </span>

            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '6px' }}>
              Pattern Panic
            </h1>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', maxWidth: '520px', lineHeight: 1.5 }}>
              Identify numerical series, shape cycles, and geometric progressions.
              Select the missing element before the 45-second clock expires!
            </p>

            <div className="memory-rules-grid">
              <div className="rule-item">
                <span className="rule-icon"><Icon name="check" size={17} /></span>
                <span className="rule-title">Correct Match</span>
                <span className="rule-detail">+20 Points</span>
              </div>
              <div className="rule-item">
                <span className="rule-icon"><Icon name="close" size={17} /></span>
                <span className="rule-title">Mismatch</span>
                <span className="rule-detail">-5 Penalty</span>
              </div>
              <div className="rule-item">
                <span className="rule-icon"><Icon name="clock" size={17} /></span>
                <span className="rule-title">Rush Clock</span>
                <span className="rule-detail">45 Seconds</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                className="btn-primary"
                style={{ padding: '12px 28px', fontSize: '1rem' }}
                onClick={handleStart}
              >
                <Icon name="play" size={15} />
                <span>Start Rush</span>
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={handleExit}
              >
                Back to Arcade
              </button>
            </div>
          </section>
        )}

        {(gameState === 'playing' || gameState === 'paused') && currentPattern && (
          <section className="pattern-arena" aria-label="Pattern Arena">
            <div className="pattern-category-bar">
              {difficultyLevel === 1 && (
                <span className="badge-pill badge-pink">
                  <Icon name="puzzle" size={12} />
                  <span>{currentPattern.category}</span>
                </span>
              )}
              {answerFeedback && (
                <div className="pattern-feedback-row">
                  <Mascot state={answerFeedback.isCorrect ? 'happy' : 'sad'} size={32} />
                  <span className="pattern-feedback-explanation">
                    {currentPattern.hint}
                  </span>
                </div>
              )}
            </div>

            <div className="pattern-sequence-row">
              {currentPattern.sequence.map((item, index) => {
                const isMissing = item === '?';
                return (
                  <div
                    key={index}
                    className={`sequence-tile ${isMissing ? 'missing' : ''}`}
                  >
                    {item}
                  </div>
                );
              })}
            </div>

            <div className="pattern-choices-grid">
              {currentPattern.options.map((option, idx) => {
                let choiceClass = '';
                if (answerFeedback) {
                  if (String(option) === String(answerFeedback.selectedOption)) {
                    choiceClass = answerFeedback.isCorrect ? 'correct-choice' : 'wrong-choice';
                  } else if (String(option) === String(currentPattern.correctAnswer) && !answerFeedback.isCorrect) {
                    choiceClass = 'correct-choice';
                  }
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    className={`pattern-choice-btn ${choiceClass}`}
                    onClick={() => handleAnswer(option)}
                    disabled={answerFeedback !== null}
                  >
                    {option}
                  </button>
                );
              })}
            </div>

            {gameState === 'paused' && (
              <div className="pattern-pause-modal">
                <div className="pause-dialog">
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Icon name="pause" size={18} />
                    <span>GAME PAUSED</span>
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '8px' }}>
                    Clock is frozen. Ready to continue?
                  </p>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={resumeGame}
                    >
                      Resume
                    </button>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={handleExit}
                    >
                      Exit
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {gameState === 'completed' && (
          <section className="memory-card" aria-label="Game Results" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <Mascot state={score >= 100 ? 'happy' : score <= 20 ? 'sad' : 'idle'} size={68} />
            <span className="badge-pill badge-yellow" style={{ marginTop: '10px', marginBottom: '8px' }}>
              Trial Completed
            </span>

            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '4px' }}>
              Pattern Rush Finished
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Your pattern recognition capabilities have been evaluated.
            </p>

            <div className="results-score-banner" style={{ width: '100%', maxWidth: '400px', marginBottom: '16px' }}>
              <span className="results-rank-pill" style={{ color: rank.color, borderColor: rank.color }}>
                {rank.label}
              </span>
              <div className="results-score-num">{countedScore}</div>
              <div className="results-score-lbl">Total Pattern Score</div>
            </div>

            {/* Compact Progression Reward Summary with Pop */}
            <div className="reward-pop">
              <RewardSummary result={rewardResult} />
            </div>

            <div className="results-metrics-grid" style={{ maxWidth: '520px', gridTemplateColumns: 'repeat(4, 1fr)' }}>
              <div className="metric-box">
                <span className="metric-icon"><Icon name="check" size={15} /></span>
                <span className="metric-val">{correctCount}</span>
                <span className="metric-lbl">Correct</span>
              </div>
              <div className="metric-box">
                <span className="metric-icon"><Icon name="close" size={15} /></span>
                <span className="metric-val">{wrongCount}</span>
                <span className="metric-lbl">Mistakes</span>
              </div>
              <div className="metric-box">
                <span className="metric-icon"><Icon name="puzzle" size={15} /></span>
                <span className="metric-val">{totalQuestions}</span>
                <span className="metric-lbl">Puzzles Solved</span>
              </div>
              <div className="metric-box">
                <span className="metric-icon"><Icon name="star" size={15} /></span>
                <span className="metric-val">{accuracy}%</span>
                <span className="metric-lbl">Accuracy</span>
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
