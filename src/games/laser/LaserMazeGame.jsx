import { useState, useMemo, useEffect, useRef } from 'react';
import { useProgression } from '../../progression/store';
import { LASER_LEVELS } from './laserLevels';
import { traceBeam } from './laserLogic';
import Icon from '../../components/common/Icons';
import Mascot from '../../components/common/Mascot';
import { playHitSound, playWrongSound, playWinSound } from '../../utils/audio';
import './laser.css';

const CELL_SIZE = 50;
const GAP = 4;

export default function LaserMazeGame({ onExit }) {
  const { data, submitResult } = useProgression();
  const clearedLevels = useMemo(
    () => data?.laserProgress?.clearedLevels || {},
    [data?.laserProgress?.clearedLevels]
  );

  const [view, setView] = useState('select'); // 'select' | 'playing'
  const [currentLevelId, setCurrentLevelId] = useState(1);
  const [grid, setGrid] = useState([]);
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);
  const [winStats, setWinStats] = useState(null);
  const [shakeBomb, setShakeBomb] = useState(null);
  const [mascotState, setMascotState] = useState('idle');

  const winTimeoutRef = useRef(null);

  // Current level definition
  const levelDef = useMemo(() => {
    return LASER_LEVELS.find((l) => l.id === currentLevelId) || LASER_LEVELS[0];
  }, [currentLevelId]);

  // Deep clone level grid into active state
  const initLevel = (levelId) => {
    const lvl = LASER_LEVELS.find((l) => l.id === levelId) || LASER_LEVELS[0];
    const clonedGrid = lvl.grid.map((row) =>
      row.map((cell) => ({ ...cell }))
    );
    setCurrentLevelId(lvl.id);
    setGrid(clonedGrid);
    setMoves(0);
    setWon(false);
    setWinStats(null);
    setShakeBomb(null);
    setMascotState('idle');
    setView('playing');
  };

  // Compute beam trace (memoized on grid state)
  const traceResult = useMemo(() => {
    if (!grid || grid.length === 0) {
      return { segments: [], hitTargets: [], hitBomb: false, isWin: false, totalTargets: 0 };
    }
    return traceBeam(grid);
  }, [grid]);

  // Handle win hold delay (400ms)
  useEffect(() => {
    if (view !== 'playing' || !traceResult.isWin || won) return;

    // 400ms hold before showing win modal
    winTimeoutRef.current = setTimeout(() => {
      const par = levelDef.par;
      let stars = 1;
      if (moves <= par) {
        stars = 3;
      } else if (moves <= par + 2) {
        stars = 2;
      }

      const isReplay = Boolean(clearedLevels[currentLevelId]);
      const result = submitResult({
        id: `laser-lvl-${currentLevelId}-${Date.now()}`,
        game: 'laser',
        stats: {
          level: currentLevelId,
          stars,
          moves,
          par,
        },
      });

      playWinSound();
      setMascotState('happy');
      setWinStats({
        stars,
        moves,
        par,
        xp: result?.xp || 0,
        coins: result?.coins || 0,
        isReplay,
      });
      setWon(true);
    }, 400);

    return () => {
      if (winTimeoutRef.current) clearTimeout(winTimeoutRef.current);
    };
  }, [traceResult.isWin, won, view, moves, levelDef.par, clearedLevels, currentLevelId, submitResult]);

  // Mirror tap handler
  const handleTapCell = (r, c) => {
    if (won) return;
    const cell = grid[r][c];
    if (cell.type !== 'mirror' || cell.locked) return;

    const nextOrientation = cell.orientation === '/' ? '\\' : '/';
    const newGrid = grid.map((row, ri) =>
      row.map((colCell, ci) => {
        if (ri === r && ci === c) {
          return { ...colCell, orientation: nextOrientation };
        }
        return colCell;
      })
    );

    const nextTrace = traceBeam(newGrid);
    setGrid(newGrid);
    setMoves((m) => m + 1);

    if (nextTrace.hitBomb) {
      setMascotState('sad');
      playWrongSound();
      const bombSeg = nextTrace.segments.find((s) => s.isBomb);
      if (bombSeg) {
        setShakeBomb(`${bombSeg.r},${bombSeg.c}`);
        setTimeout(() => setShakeBomb(null), 250);
      }
    } else {
      playHitSound();
      if (mascotState === 'sad') {
        setMascotState('idle');
      }
    }
  };

  // Reset current level
  const handleResetLevel = () => {
    initLevel(currentLevelId);
  };

  // Back navigation
  const handleBack = () => {
    if (view === 'playing') {
      setView('select');
    } else if (onExit) {
      onExit();
    }
  };

  // Next level navigation
  const handleNextLevel = () => {
    if (currentLevelId < LASER_LEVELS.length) {
      initLevel(currentLevelId + 1);
    } else {
      setView('select');
    }
  };

  // SVG coordinate helpers for beam segments
  const rows = grid.length || 5;
  const cols = (grid[0] && grid[0].length) || 5;
  const totalW = cols * CELL_SIZE + (cols - 1) * GAP;
  const totalH = rows * CELL_SIZE + (rows - 1) * GAP;

  const getPoint = (r, c, side) => {
    const ox = c * (CELL_SIZE + GAP);
    const oy = r * (CELL_SIZE + GAP);
    const cx = ox + CELL_SIZE / 2;
    const cy = oy + CELL_SIZE / 2;

    switch (side) {
      case 'top':
        return { x: cx, y: r > 0 ? oy - GAP / 2 : oy };
      case 'bottom':
        return { x: cx, y: r < rows - 1 ? oy + CELL_SIZE + GAP / 2 : oy + CELL_SIZE };
      case 'left':
        return { x: c > 0 ? ox - GAP / 2 : ox, y: cy };
      case 'right':
        return { x: c < cols - 1 ? ox + CELL_SIZE + GAP / 2 : ox + CELL_SIZE, y: cy };
      case 'center':
      default:
        return { x: cx, y: cy };
    }
  };

  return (
    <div className="laser-game-wrapper">
      {/* 1. HUD */}
      <header className="laser-hud" role="region" aria-label="Laser Maze HUD">
        <div className="laser-hud-left">
          <button
            type="button"
            className="btn-exit-hud"
            onClick={handleBack}
            aria-label={view === 'playing' ? 'Back to Level Select' : 'Exit Laser Maze'}
          >
            <Icon name="arrow-left" size={16} />
            <span>{view === 'playing' ? 'Levels' : 'Exit'}</span>
          </button>
          <div className="laser-title-wrap">
            <Icon name="laser" size={20} />
            <span className="hud-title-text">Laser Maze</span>
          </div>
        </div>

        {view === 'playing' ? (
          <>
            <div className="laser-hud-center">
              <div className="laser-stat-box">
                <span className="laser-stat-lbl">MOVES</span>
                <span className={`laser-stat-val ${moves > levelDef.par ? 'pink' : ''}`}>
                  {moves}
                </span>
              </div>
              <div className="laser-stat-box">
                <span className="laser-stat-lbl">PAR</span>
                <span className="laser-stat-val">{levelDef.par}</span>
              </div>
              <div className="laser-stat-box">
                <span className="laser-stat-lbl">TARGETS</span>
                <span className="laser-stat-val">
                  {traceResult.hitTargets.length}/{traceResult.totalTargets}
                </span>
              </div>
            </div>

            <div className="laser-hud-right">
              <span className="btn-hint-free" title="Pure logic, no hints">
                Hint-Free
              </span>
              <button
                type="button"
                className="btn-secondary"
                style={{ padding: '6px 12px', minHeight: '38px', fontSize: '0.82rem' }}
                onClick={handleResetLevel}
                aria-label="Reset Level"
              >
                <Icon name="refresh" size={14} />
                <span>Reset</span>
              </button>
            </div>
          </>
        ) : (
          <div className="laser-hud-right">
            <span className="btn-hint-free">12 Puzzle Chambers</span>
          </div>
        )}
      </header>

      {/* 2. VIEW: LEVEL SELECT */}
      {view === 'select' && (
        <section className="laser-select-card">
          <div className="laser-select-header">
            <Mascot state="idle" size={60} />
            <h2 className="laser-select-title">Select Chamber</h2>
            <p className="laser-select-desc">
              Rotate optical mirrors to reflect the laser beam into every target diamond.
              Watch out for high-voltage demolition bombs!
            </p>
          </div>

          <div className="laser-levels-grid">
            {LASER_LEVELS.map((lvl) => {
              const isCleared = Boolean(clearedLevels[lvl.id]);
              const isUnlocked = lvl.id === 1 || Boolean(clearedLevels[lvl.id - 1]);
              const stars = clearedLevels[lvl.id]?.stars || 0;

              return (
                <button
                  key={lvl.id}
                  type="button"
                  className={`level-tile ${isCleared ? 'cleared' : ''} ${!isUnlocked ? 'locked' : ''}`}
                  onClick={() => isUnlocked && initLevel(lvl.id)}
                  disabled={!isUnlocked}
                  aria-label={`Level ${lvl.id}: ${lvl.title}${!isUnlocked ? ' (Locked)' : ''}`}
                >
                  <span className="level-tile-num">{lvl.id}</span>
                  <div className="level-tile-stars" aria-label={`${stars} stars`}>
                    {!isUnlocked ? (
                      <Icon name="lock" size={14} style={{ color: 'var(--muted)' }} />
                    ) : (
                      '★'.repeat(stars) + '☆'.repeat(3 - stars)
                    )}
                  </div>
                  <span className="level-tile-par">Par {lvl.par}</span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* 3. VIEW: PLAYING ARENA */}
      {view === 'playing' && (
        <section className="laser-arena-card">
          <div className="laser-level-banner">
            <div className="laser-level-info">
              <span className="laser-level-name">
                Chamber {currentLevelId}: {levelDef.title}
              </span>
            </div>
            <span className="laser-par-chip">
              Difficulty: {levelDef.difficulty} • Par: {levelDef.par}
            </span>
          </div>

          {/* LASER GRID WITH SVG OVERLAY */}
          <div className="laser-board-wrapper">
            <div
              className="laser-grid"
              style={{
                gridTemplateColumns: `repeat(${cols}, ${CELL_SIZE}px)`,
                gridTemplateRows: `repeat(${rows}, ${CELL_SIZE}px)`,
              }}
            >
              {grid.map((row, r) =>
                row.map((cell, c) => {
                  const cellKey = `${r},${c}`;
                  const isHitTarget = traceResult.hitTargets.includes(cellKey);
                  const isShakingBomb = shakeBomb === cellKey;

                  return (
                    <div
                      key={cellKey}
                      className={`laser-cell ${cell.type === 'wall' ? 'cell-wall' : ''}`}
                    >
                      {/* Emitter */}
                      {cell.type === 'emitter' && (
                        <div
                          className={`laser-emitter-box dir-${cell.dir || 'R'}`}
                          title={`Emitter (${cell.dir || 'R'})`}
                        >
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                            <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      )}

                      {/* Mirror */}
                      {cell.type === 'mirror' && (
                        <button
                          type="button"
                          className={`laser-mirror-btn ${cell.orientation === '/' ? 'slash' : 'backslash'} ${cell.locked ? 'locked' : ''}`}
                          onClick={() => handleTapCell(r, c)}
                          disabled={cell.locked || won}
                          aria-label={`Mirror at (${r + 1}, ${c + 1}), orientation ${cell.orientation}${cell.locked ? ' (Locked)' : ''}`}
                        >
                          <div className="laser-mirror-bar" />
                          {cell.locked && <div className="locked-pin" title="Locked Mirror" />}
                        </button>
                      )}

                      {/* Target */}
                      {cell.type === 'target' && (
                        <div
                          className={`laser-target-ring ${isHitTarget ? 'hit' : ''}`}
                          title={isHitTarget ? 'Target Powered' : 'Target'}
                        >
                          {isHitTarget ? (
                            <Icon name="check" size={16} />
                          ) : (
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                              <circle cx="12" cy="12" r="4" />
                            </svg>
                          )}
                        </div>
                      )}

                      {/* Bomb */}
                      {cell.type === 'bomb' && (
                        <div
                          className={`laser-bomb-circle ${isShakingBomb ? 'hit-shake' : ''}`}
                          title="Demolition Bomb"
                        >
                          <Icon name="bomb" size={18} />
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* FLAT SVG BEAM OVERLAY */}
            <svg
              className="laser-beam-svg-overlay"
              viewBox={`0 0 ${totalW} ${totalH}`}
              aria-hidden="true"
            >
              {traceResult.segments.map((seg, idx) => {
                const pt1 = getPoint(seg.r, seg.c, seg.from);
                const pt2 = getPoint(seg.r, seg.c, seg.to);

                if (seg.isBend) {
                  const centerPt = getPoint(seg.r, seg.c, 'center');
                  return (
                    <path
                      key={idx}
                      d={`M ${pt1.x} ${pt1.y} L ${centerPt.x} ${centerPt.y} L ${pt2.x} ${pt2.y}`}
                      className="beam-line"
                    />
                  );
                }

                return (
                  <path
                    key={idx}
                    d={`M ${pt1.x} ${pt1.y} L ${pt2.x} ${pt2.y}`}
                    className="beam-line"
                  />
                );
              })}
            </svg>
          </div>

          <div className="laser-controls-row">
            <button
              type="button"
              className="btn-secondary"
              onClick={handleResetLevel}
            >
              <Icon name="refresh" size={16} />
              <span>Reset Puzzle</span>
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setView('select')}
            >
              <Icon name="controller" size={16} />
              <span>Select Chamber</span>
            </button>
          </div>
        </section>
      )}

      {/* 4. LEVEL COMPLETE MODAL OVERLAY */}
      {won && winStats && (
        <div className="laser-win-overlay" role="dialog" aria-modal="true" aria-label="Level Complete">
          <div className="laser-win-card">
            <Mascot state="happy" size={72} />
            <h2 className="laser-select-title" style={{ color: 'var(--ink)' }}>
              Chamber Cleared!
            </h2>
            <div className="laser-win-stars" aria-label={`${winStats.stars} stars earned`}>
              {'★'.repeat(winStats.stars) + '☆'.repeat(3 - winStats.stars)}
            </div>

            <div className="laser-win-stats-grid">
              <div className="laser-win-stat">
                <span className="laser-win-stat-val">{winStats.moves}</span>
                <span className="laser-win-stat-lbl">Moves Used</span>
              </div>
              <div className="laser-win-stat">
                <span className="laser-win-stat-val">{winStats.par}</span>
                <span className="laser-win-stat-lbl">Par Target</span>
              </div>
              <div className="laser-win-stat">
                <span className="laser-win-stat-val" style={{ color: 'var(--sun)' }}>
                  +{winStats.xp}
                </span>
                <span className="laser-win-stat-lbl">XP Earned</span>
              </div>
              <div className="laser-win-stat">
                <span className="laser-win-stat-val" style={{ color: 'var(--sun)' }}>
                  +{winStats.coins}
                </span>
                <span className="laser-win-stat-lbl">Coins</span>
              </div>
            </div>

            {winStats.isReplay && (
              <p style={{ fontSize: '0.8rem', color: 'var(--muted)', margin: '0' }}>
                Replay clear: Great practice! (First clear awards full rewards)
              </p>
            )}

            <div className="laser-win-actions">
              {currentLevelId < LASER_LEVELS.length ? (
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleNextLevel}
                  autoFocus
                >
                  <Icon name="play" size={18} />
                  <span>Next Chamber</span>
                </button>
              ) : (
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => setView('select')}
                >
                  <Icon name="trophy" size={18} />
                  <span>Mastered All Chambers!</span>
                </button>
              )}
              <button
                type="button"
                className="btn-secondary"
                onClick={handleResetLevel}
              >
                <Icon name="refresh" size={16} />
                <span>Replay Chamber</span>
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setView('select')}
              >
                <span>Chamber Select</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
