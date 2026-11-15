import { useState, useRef, useEffect } from 'react';
import ReactionGame from '../reaction/ReactionGame';
import MemoryMazeGame from '../memory/MemoryMazeGame';
import PatternPanicGame from '../pattern/PatternPanicGame';
import FinalMixFloor from './FinalMixFloor';
import RewardSummary from '../../components/common/RewardSummary';
import Icon from '../../components/common/Icons';
import Mascot from '../../components/common/Mascot';
import { useProgress } from '../../progression/store.jsx';
import {
  FLOORS_CONFIG,
  normalizeRound1,
  normalizeRound2,
  normalizeRound3,
  normalizeRound4,
  calculateTowerTotal,
} from './towerRules';
import './tower.css';

/**
 * ChallengeTowerGame Component
 * 4-Floor Arcade Gauntlet:
 * Floor 1 (Reaction 30s) -> Floor 2 (Memory up to L7) -> Floor 3 (Pattern 8Q) -> Floor 4 (Final Mix 60s)
 * Reuses existing components seamlessly.
 */
export default function ChallengeTowerGame({ onExit }) {
  const { saveData, submitResult } = useProgress();

  // Unlock check: player must have completed each of the 3 standalone games at least once
  const rxPlays = saveData.plays?.['reaction-reactor'] || 0;
  const mmPlays = saveData.plays?.['memory-maze'] || 0;
  const ppPlays = saveData.plays?.['pattern-panic'] || 0;
  const isUnlocked = rxPlays > 0 && mmPlays > 0 && ppPlays > 0;

  // Stages: 'intro' | 'floor_intro' | 'playing' | 'summit'
  const [stage, setStage] = useState('intro');
  const [currentFloorIndex, setCurrentFloorIndex] = useState(0); // 0 to 3

  // Scores per floor (normalized 0-100)
  const [floorScores, setFloorScores] = useState({ 0: 0, 1: 0, 2: 0, 3: 0 });

  // Summit results
  const [summitResult, setSummitResult] = useState(null);
  const [rewardResult, setRewardResult] = useState(null);
  const [countedTotal, setCountedTotal] = useState(0);
  const runIdRef = useRef(null);

  // Calculate current running total from normalized scores
  const currentRunningTotal = Math.round(
    floorScores[0] * FLOORS_CONFIG[0].weight +
    floorScores[1] * FLOORS_CONFIG[1].weight +
    floorScores[2] * FLOORS_CONFIG[2].weight +
    floorScores[3] * FLOORS_CONFIG[3].weight
  );

  const startTowerClimb = () => {
    runIdRef.current = 'twr_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
    setCurrentFloorIndex(0);
    setFloorScores({ 0: 0, 1: 0, 2: 0, 3: 0 });
    setSummitResult(null);
    setRewardResult(null);
    setStage('floor_intro');
  };

  const handleStartFloor = () => {
    setStage('playing');
  };

  const handleFloor1Done = (stats) => {
    const norm = normalizeRound1(stats);
    setFloorScores((prev) => ({ ...prev, 0: norm }));
    setCurrentFloorIndex(1);
    setStage('floor_intro');
  };

  const handleFloor2Done = (stats) => {
    const norm = normalizeRound2(stats);
    setFloorScores((prev) => ({ ...prev, 1: norm }));
    setCurrentFloorIndex(2);
    setStage('floor_intro');
  };

  const handleFloor3Done = (stats) => {
    const norm = normalizeRound3(stats);
    setFloorScores((prev) => ({ ...prev, 2: norm }));
    setCurrentFloorIndex(3);
    setStage('floor_intro');
  };

  const handleFloor4Done = (stats) => {
    const norm = normalizeRound4(stats);
    const updatedScores = { ...floorScores, 3: norm };
    setFloorScores(updatedScores);

    // Calculate final grand total & rank
    const grand = calculateTowerTotal(
      updatedScores[0],
      updatedScores[1],
      updatedScores[2],
      norm
    );

    setSummitResult(grand);
    setStage('summit');
  };

  // Submit result on summit
  useEffect(() => {
    if (stage === 'summit' && summitResult && runIdRef.current) {
      const res = submitResult({
        id: runIdRef.current,
        game: 'tower',
        stats: {
          score: summitResult.total,
          rank: summitResult.rank,
        },
      });
      setRewardResult(res);
    }
  }, [stage, summitResult, submitResult]);

  // Total score count-up animation on summit
  useEffect(() => {
    if (stage === 'summit' && summitResult) {
      const target = summitResult.total;
      const step = Math.max(1, Math.ceil(target / 25));
      let current = 0;
      const interval = setInterval(() => {
        if (target <= 0) {
          clearInterval(interval);
          return;
        }
        current = Math.min(target, current + step);
        setCountedTotal(current);
        if (current >= target) clearInterval(interval);
      }, 25);
      return () => clearInterval(interval);
    }
  }, [stage, summitResult]);

  const handleQuitRun = () => {
    if (stage === 'playing' || stage === 'floor_intro') {
      const confirmQuit = window.confirm(
        'Abandon tower climb? Your current tower run will be terminated with no rewards.'
      );
      if (!confirmQuit) return;
    }
    if (onExit) onExit();
  };

  // If locked, render intentional locked state
  if (!isUnlocked) {
    return (
      <div className="tower-game-container">
        <div className="tower-card" style={{ borderColor: 'var(--coral)' }}>
          <div className="tower-floor-hero-badge" style={{ background: 'rgba(255, 90, 95, 0.15)', color: 'var(--coral)' }}>
            <Icon name="lock" size={28} />
          </div>
          <h2 className="tower-floor-title">Challenge Tower Locked</h2>
          <p className="tower-floor-desc">
            To unlock the 4-floor Challenge Tower, you must complete each of the three foundational arcade trials at least once:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', maxWidth: '340px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--surface-2)', borderRadius: '10px' }}>
              <span>Reaction Reactor:</span>
              <strong style={{ color: rxPlays > 0 ? 'var(--zone-memory)' : 'var(--coral)' }}>
                {rxPlays > 0 ? '✓ Completed' : '1 Run Required'}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--surface-2)', borderRadius: '10px' }}>
              <span>Memory Maze:</span>
              <strong style={{ color: mmPlays > 0 ? 'var(--zone-memory)' : 'var(--coral)' }}>
                {mmPlays > 0 ? '✓ Completed' : '1 Run Required'}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--surface-2)', borderRadius: '10px' }}>
              <span>Pattern Panic:</span>
              <strong style={{ color: ppPlays > 0 ? 'var(--zone-memory)' : 'var(--coral)' }}>
                {ppPlays > 0 ? '✓ Completed' : '1 Run Required'}
              </strong>
            </div>
          </div>

          <button
            type="button"
            className="btn-secondary"
            style={{ marginTop: '12px' }}
            onClick={onExit}
          >
            Back to Arcade
          </button>
        </div>
      </div>
    );
  }

  const currentFloorConfig = FLOORS_CONFIG[currentFloorIndex];

  return (
    <div className="tower-game-container">
      {/* Tower Status HUD */}
      <header className="tower-hud">
        <div className="tower-hud-left">
          <div className="tower-hud-badge">
            <Icon name="tower" size={15} />
            <span>CHALLENGE TOWER</span>
          </div>
          {stage !== 'intro' && stage !== 'summit' && (
            <span style={{ fontSize: '0.85rem', color: 'var(--yellow)', fontWeight: 700 }}>
              {currentFloorConfig.name}
            </span>
          )}
        </div>

        <div className="tower-hud-right">
          {stage !== 'intro' && (
            <div className="tower-running-score">
              <span>Running:</span>
              <span className="tower-running-val">{currentRunningTotal} pts</span>
            </div>
          )}

          <button
            type="button"
            className="hud-exit-btn tower-quit-btn"
            onClick={handleQuitRun}
          >
            <Icon name="arrowLeft" size={13} />
            <span>{stage === 'summit' || stage === 'intro' ? 'Exit' : 'Quit'}</span>
          </button>
        </div>
      </header>

      {/* 4-Floor Progress Bar (visible during run) */}
      {stage !== 'intro' && (
        <div className="tower-floors-progress-bar">
          {FLOORS_CONFIG.map((fl, idx) => {
            const isCompleted = currentFloorIndex > idx || stage === 'summit';
            const isActive = currentFloorIndex === idx && stage !== 'summit';

            return (
              <div
                key={fl.floor}
                className={`tower-floor-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
              >
                <div className="tower-floor-num">
                  <span>F{fl.floor}</span>
                  {isCompleted && <span style={{ color: 'var(--zone-memory)' }}>✓</span>}
                </div>
                <div className="tower-floor-name">{fl.discipline}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* STAGE 1: TOWER INTRO / HUB */}
      {stage === 'intro' && (
        <div className="tower-card">
          <div className="tower-floor-hero-badge">
            <Icon name="tower" size={32} />
          </div>
          <h1 className="tower-floor-title">Arcade Challenge Tower</h1>
          <p className="tower-floor-desc">
            Climb all 4 escalating floors in a single continuous trial:
            Speed Reflex → Sequence Memory → Pattern Puzzles → Final Mix.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', width: '100%', maxWidth: '440px' }}>
            <div style={{ background: 'var(--surface-2)', padding: '10px', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>Tower PB Score</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--yellow)' }}>
                {saveData.personalBests?.['tower']?.score || 0} pts
              </div>
            </div>
            <div style={{ background: 'var(--surface-2)', padding: '10px', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>Best Summit Rank</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--cyan)' }}>
                {saveData.personalBests?.['tower']?.rank || '--'}
              </div>
            </div>
          </div>

          <button
            type="button"
            className="play-cta-btn"
            style={{ width: '100%', maxWidth: '300px', marginTop: '12px' }}
            onClick={startTowerClimb}
          >
            <Icon name="controller" size={18} />
            <span>START CLIMB</span>
          </button>
        </div>
      )}

      {/* STAGE 2: INTERSTITIAL FLOOR INTRO */}
      {stage === 'floor_intro' && (
        <div className="tower-card">
          <div className="tower-floor-hero-badge">
            <Icon name={currentFloorIndex === 0 ? 'bolt' : currentFloorIndex === 1 ? 'brain' : currentFloorIndex === 2 ? 'puzzle' : 'tower'} size={28} />
          </div>
          <span className="badge-pill badge-yellow">
            FLOOR {currentFloorConfig.floor} OF 4 ({currentFloorConfig.weightPct} Weight)
          </span>
          <h2 className="tower-floor-title">{currentFloorConfig.name}</h2>
          <p className="tower-floor-desc">{currentFloorConfig.desc}</p>
          <div className="tower-floor-target-box">
            Goal: {currentFloorConfig.target}
          </div>

          <button
            type="button"
            className="btn-primary"
            style={{ minWidth: '220px', marginTop: '14px' }}
            onClick={handleStartFloor}
          >
            <Icon name="play" size={16} />
            <span>ENTER {currentFloorConfig.shortName.toUpperCase()}</span>
          </button>
        </div>
      )}

      {/* STAGE 3: ACTIVE PLAYING FLOOR */}
      {stage === 'playing' && (
        <div className="tower-floor-content">
          {currentFloorIndex === 0 && (
            <ReactionGame
              config={{ duration: 30 }}
              embedded={true}
              onComplete={handleFloor1Done}
            />
          )}

          {currentFloorIndex === 1 && (
            <MemoryMazeGame
              config={{ maxLevel: 7 }}
              embedded={true}
              onComplete={handleFloor2Done}
            />
          )}

          {currentFloorIndex === 2 && (
            <PatternPanicGame
              config={{ maxQuestions: 8, duration: 45 }}
              embedded={true}
              onComplete={handleFloor3Done}
            />
          )}

          {currentFloorIndex === 3 && (
            <FinalMixFloor
              onComplete={handleFloor4Done}
            />
          )}
        </div>
      )}

      {/* STAGE 4: SUMMIT RESULTS SCREEN */}
      {stage === 'summit' && summitResult && (
        <div className="tower-summit-card">
          <Mascot state={countedTotal >= 80 ? 'happy' : countedTotal < 40 ? 'sad' : 'idle'} size={72} />
          <span className="badge-pill badge-yellow">
            <Icon name="trophy" size={14} />
            <span>SUMMIT CONQUERED</span>
          </span>

          <div className="tower-rank-display">
            <div className="tower-rank-badge" style={{ color: summitResult.rankColor }}>
              RANK {summitResult.rank}
            </div>
            <div className="tower-rank-label">Tower Performance Grade</div>
          </div>

          <div style={{ fontSize: '2.5rem', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--text)' }}>
            {countedTotal} <span style={{ fontSize: '1.2rem', color: 'var(--muted)' }}>/ 100 PTS</span>
          </div>

          {/* Reward Summary */}
          <div className="reward-pop" style={{ width: '100%', maxWidth: '440px' }}>
            <RewardSummary result={rewardResult} />
          </div>

          {/* 4 Floors Breakdown */}
          <div className="tower-breakdown-list">
            {FLOORS_CONFIG.map((fl, idx) => {
              const raw = floorScores[idx] || 0;
              const weighted = (raw * fl.weight).toFixed(1);

              return (
                <div key={fl.floor} className="tower-breakdown-row">
                  <div className="tower-breakdown-row-name">
                    <span>{fl.name}</span>
                  </div>
                  <div className="tower-breakdown-row-scores">
                    <span style={{ color: 'var(--muted)' }}>{raw}/100</span>
                    <span style={{ color: 'var(--yellow)' }}>+{weighted} pts</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '12px' }}>
            <button
              type="button"
              className="btn-primary"
              onClick={startTowerClimb}
            >
              <Icon name="refresh" size={16} />
              <span>Climb Again</span>
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={onExit}
            >
              <Icon name="home" size={16} />
              <span>Back to Arcade</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
