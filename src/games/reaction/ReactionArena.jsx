import { useEffect } from 'react';
import Icon from '../../components/common/Icons';

/**
 * ReactionArena Component
 * 
 * Interactive target arena with clean vector icons:
 * - Touch & click surface with scroll lock (touch-action: none)
 * - Dynamic target placement strictly bounded inside arena
 * - Floating feedback markers (+10, -2, reaction ms)
 * - Countdown overlay & Pause modal
 */
export default function ReactionArena({
  gameState,
  countdown,
  target,
  floatingFeedbacks,
  onTargetClick,
  onArenaClick,
  onResume,
  onRestart,
  onExit,
  onRemoveFeedback,
}) {
  useEffect(() => {
    if (floatingFeedbacks.length === 0) return;
    const latest = floatingFeedbacks[floatingFeedbacks.length - 1];
    const timer = setTimeout(() => {
      onRemoveFeedback(latest.id);
    }, 700);
    return () => clearTimeout(timer);
  }, [floatingFeedbacks, onRemoveFeedback]);

  return (
    <div
      className={`reaction-arena ${gameState === 'playing' ? 'arena-active' : ''}`}
      onClick={onArenaClick}
      role="region"
      aria-label="Reaction Reactor Game Arena"
    >
      {gameState === 'playing' && target && (
        <button
          type="button"
          className="reaction-target"
          style={{
            left: `${target.x}%`,
            top: `${target.y}%`,
            width: `${target.size}px`,
            height: `${target.size}px`,
          }}
          onClick={onTargetClick}
          aria-label="Reaction Target"
        >
          <span className="target-outer-ring"></span>
          <span className="target-core">
            <Icon name="bolt" size={Math.round(target.size * 0.45)} />
          </span>
        </button>
      )}

      {floatingFeedbacks.map((fb) => (
        <div
          key={fb.id}
          className={`floating-feedback ${fb.type}`}
          style={{ left: `${fb.x}%`, top: `${fb.y}%` }}
        >
          <span className="feedback-text">{fb.text}</span>
          {fb.reactionTime && (
            <span className="feedback-time">{fb.reactionTime}</span>
          )}
        </div>
      ))}

      {gameState === 'countdown' && (
        <div className="arena-overlay countdown-overlay">
          <div className="countdown-number" key={countdown}>
            {countdown > 0 ? countdown : 'GO!'}
          </div>
          <div className="countdown-subtext">Focus on the arena...</div>
        </div>
      )}

      {gameState === 'paused' && (
        <div className="arena-overlay pause-overlay">
          <div className="pause-modal">
            <h3 className="pause-title">
              <Icon name="pause" size={18} />
              <span>GAME PAUSED</span>
            </h3>
            <p className="pause-desc">Take a breather. Targets are on hold.</p>
            <div className="pause-actions">
              <button
                type="button"
                className="btn-arcade primary"
                onClick={onResume}
              >
                Resume
              </button>
              <button
                type="button"
                className="btn-arcade secondary"
                onClick={onRestart}
              >
                Restart
              </button>
              <button
                type="button"
                className="btn-arcade secondary"
                onClick={onExit}
              >
                Exit Game
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
