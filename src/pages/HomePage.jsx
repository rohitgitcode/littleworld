import { useState } from 'react';
import Icon from '../components/common/Icons';
import Mascot from '../components/common/Mascot';
import { useProgress } from '../progression/store.jsx';
import { playWinSound } from '../utils/audio';

/**
 * HomePage (Sticker Arcade Hub)
 * - Compact player strip with Mascot
 * - Daily Run 3-checkpoint trail with tappable treasure chest
 * - Zone cards (Reaction, Memory, Pattern, Tower) with sticker aesthetics
 */
export default function HomePage({ onNotify, onLaunchGame }) {
  const { player, saveData, claimChallenge } = useProgress();
  const [chestPopped, setChestPopped] = useState(false);

  const streak = saveData.streak || { current: 0, best: 0 };
  const plays = saveData.plays || {};
  const pbs = saveData.personalBests || {};

  // 3 Checkpoint Daily Challenges (guaranteed 3 items)
  const rawDailies = saveData.challenges?.dailies || saveData.challenges?.daily || [];
  const dailyChallenges = rawDailies.length >= 3 ? rawDailies.slice(0, 3) : [
    { instanceId: 'cp_1', title: 'Reflex Trial', game: 'reaction-reactor', target: 1, progress: 0, claimed: false },
    { instanceId: 'cp_2', title: 'Sequence Flow', game: 'memory-maze', target: 3, progress: 0, claimed: false },
    { instanceId: 'cp_3', title: 'Pattern Rush', game: 'pattern-panic', target: 4, progress: 0, claimed: false },
  ];

  // Unlock condition for Challenge Tower: completed each of the 3 games at least once
  const rxPlayed = (plays['reaction-reactor'] || 0) > 0;
  const mmPlayed = (plays['memory-maze'] || 0) > 0;
  const ppPlayed = (plays['pattern-panic'] || 0) > 0;
  const isTowerUnlocked = rxPlayed && mmPlayed && ppPlayed;

  // Level progress
  const xpNeeded = player?.xpNeeded || 100;
  const currentXp = player?.currentLevelXp || 0;

  const handleLaunchOrNavigate = (gameId) => {
    if (onLaunchGame) {
      onLaunchGame(gameId);
    }
  };

  const handlePlayDailyRun = () => {
    const uncompleted = dailyChallenges.find((c) => !c.claimed && c.progress < c.target);
    const targetGame = uncompleted?.game || uncompleted?.gameId || 'reaction-reactor';
    handleLaunchOrNavigate(targetGame);
  };

  const completedDailyCount = dailyChallenges.filter((c) => c.claimed || c.progress >= c.target).length;
  const allDailyDone = dailyChallenges.length > 0 && dailyChallenges.every((c) => c.progress >= c.target);
  const allDailyClaimed = dailyChallenges.length > 0 && dailyChallenges.every((c) => c.claimed);

  const handleChestClick = () => {
    if (allDailyClaimed) {
      onNotify('Chest Claimed', "You've unlocked today's daily treasure!");
      return;
    }
    if (!allDailyDone) {
      onNotify('Chest Locked', `Complete all 3 checkpoints to unlock the chest! (${completedDailyCount}/3 done)`);
      return;
    }
    dailyChallenges.forEach((c) => {
      if (!c.claimed) {
        claimChallenge(c.instanceId);
      }
    });
    setChestPopped(true);
    playWinSound();
    onNotify('Treasure Chest Unlocked!', 'Congratulations! All daily bonus rewards collected!');
  };

  return (
    <div className="dashboard-container">
      {/* 1. COMPACT PLAYER STRIP WITH MASCOT (NO DUPLICATE COINS, SINGLE MASCOT) */}
      <section className="player-strip" aria-label="Player Status">
        <div className="player-strip-left">
          <Mascot state={allDailyDone ? 'happy' : 'idle'} size={40} />

          <div className="player-strip-details">
            <span className="player-strip-name">{player?.name || 'ArcadePlayer'}</span>
            <div className="player-strip-meta">
              <span>LVL {player?.level || 1} • {player?.title || 'Novice'}</span>
              <span>•</span>
              <span>{currentXp}/{xpNeeded} XP</span>
            </div>
          </div>
        </div>

        <div className="player-strip-right">
          <div
            className={`strip-pill streak ${streak.current >= 1 ? 'active-streak' : 'zero-streak'}`}
            title={`Streak: ${streak.current} day(s)`}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 23C7.58172 23 4 19.4183 4 15C4 11.4394 6.32626 7.4258 8.89539 4.3168C9.57018 3.50022 10.8718 3.96696 10.9238 5.02115C11.0858 8.29828 12.8719 10.0274 14.5441 9.47963C15.2289 9.25531 15.9388 9.87321 15.7797 10.5739C15.4217 12.1497 16.0963 13.7842 17.159 14.7709C17.7011 15.2743 18.2323 15.8239 18.6644 16.4356C19.5161 17.6417 20 18.9959 20 20.315C20 21.7979 16.4183 23 12 23Z" />
            </svg>
            <span>{streak.current}d</span>
          </div>
        </div>
      </section>

      {/* 2. DAILY RUN CARD WITH COMPACT HEIGHT & 3-CHECKPOINT PATH */}
      <section className="daily-run-card" aria-label="Daily Run Challenges">
        <div className="daily-run-header">
          <div className="daily-run-title-group">
            <div className="daily-run-title-icon">
              <Icon name="calendar" size={17} />
            </div>
            <div>
              <h2 className="daily-run-title">Daily Run</h2>
              <span className="daily-run-sub">
                {completedDailyCount}/3 Checkpoints • Resets midnight
              </span>
            </div>
          </div>
          <span className="badge-pill badge-yellow">
            <Icon name="trophy" size={12} />
            <span>Bonus Chest</span>
          </span>
        </div>

        {/* 3 Checkpoint Trail Path + Treasure Chest */}
        <div className="daily-trail-wrapper">
          <div className="daily-checkpoints-row">
            <div className="trail-connecting-line" />
            {dailyChallenges.map((ch, idx) => {
              const isDone = ch.claimed || ch.progress >= ch.target;

              return (
                <div key={ch.instanceId || `cp_${idx}`} className="checkpoint-node">
                  <div className={`checkpoint-circle ${isDone ? 'done' : ''}`}>
                    {isDone ? '✓' : idx + 1}
                  </div>
                  <span className="checkpoint-lbl">
                    {idx === 0 ? 'Reflex' : idx === 1 ? 'Memory' : 'Pattern'}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Tappable Treasure Chest at end of path */}
          <div
            className={`treasure-chest-wrap ${chestPopped ? 'reward-pop' : ''}`}
            onClick={handleChestClick}
            title={allDailyClaimed ? 'Claimed!' : allDailyDone ? 'Tap to claim!' : 'Locked'}
            role="button"
            tabIndex={0}
          >
            <div className={`chest-btn ${allDailyDone && !allDailyClaimed ? 'ready-to-claim' : ''}`}>
              <svg width="28" height="24" viewBox="0 0 34 30" fill="none">
                <rect x="2" y="10" width="30" height="18" rx="4" fill="var(--sun)" stroke="var(--ink)" strokeWidth="2.5" />
                <path d="M2 10 C2 4 8 2 17 2 C26 2 32 4 32 10 Z" fill={allDailyClaimed ? 'var(--pink)' : 'var(--sun)'} stroke="var(--ink)" strokeWidth="2.5" />
                <rect x="14" y="9" width="6" height="8" rx="2" fill="var(--ink)" />
                <circle cx="17" cy="13" r="1.5" fill="#FFFFFF" />
              </svg>
            </div>
            <span className="chest-status-text">
              {allDailyClaimed ? 'CLAIMED' : allDailyDone ? 'OPEN!' : 'CHEST'}
            </span>
          </div>
        </div>

        <button
          type="button"
          className="btn-primary"
          style={{ width: '100%', minHeight: '38px', padding: '6px 14px', fontSize: '0.84rem' }}
          onClick={handlePlayDailyRun}
        >
          <Icon name="controller" size={16} />
          <span>PLAY TODAY'S RUN</span>
        </button>
      </section>

      {/* 3. ARCADE ZONES */}
      <section className="arcade-zones-wrap" aria-label="Game Zones">
        <div className="zones-header">
          <h2 className="zones-header-title">
            <Icon name="bolt" size={18} />
            <span>Arcade Zones</span>
          </h2>
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--muted)' }}>
            Choose a challenge
          </span>
        </div>

        {/* 3A. FEATURED REACTION REACTOR CARD (VISIBLE IN FIRST VIEWPORT) */}
        <div className="zone-card featured-reaction">
          <div className="reaction-card-body">
            <span
              className="zone-badge-tag"
              style={{ background: 'var(--tomato)', color: '#FFFFFF' }}
            >
              Featured • Speed Reflex
            </span>
            <h3 className="zone-title">Reaction Reactor</h3>
            <p className="zone-desc">
              Tap targets the instant they appear. 30 seconds of high-speed reflex testing with combo multipliers.
            </p>
            <div className="zone-stats-row">
              <div className="zone-stat-item">
                <span className="zone-stat-label">Best Score:</span>
                <span className="zone-stat-val">{pbs['reaction-reactor']?.score || 0} pts</span>
              </div>
              <div className="zone-stat-item">
                <span className="zone-stat-label">Best Reflex:</span>
                <span className="zone-stat-val">
                  {pbs['reaction-reactor']?.bestRt ? `${pbs['reaction-reactor'].bestRt}ms` : '--'}
                </span>
              </div>
            </div>
            <div style={{ marginTop: '8px' }}>
              <button
                type="button"
                className="btn-primary btn-zone-reaction"
                onClick={() => handleLaunchOrNavigate('reaction-reactor')}
              >
                <Icon name="controller" size={16} />
                <span>PLAY REACTOR</span>
              </button>
            </div>
          </div>

          {/* Concentric Target Rings Art */}
          <div className="art-reaction-rings" aria-hidden="true">
            <div className="ring-outer">
              <div className="ring-middle">
                <div className="ring-center" />
              </div>
            </div>
          </div>
        </div>

        {/* 3B. TWO SMALLER CARDS SIDE-BY-SIDE (MEMORY MAZE & PATTERN PANIC KEEP ±1DEG ROTATION ONLY) */}
        <div className="zones-subgrid">
          {/* Memory Maze (-1deg) */}
          <div className="zone-card card-memory tilt-left">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span
                  className="zone-badge-tag"
                  style={{ background: 'var(--teal)', color: '#1E1B2E' }}
                >
                  Memory
                </span>
                {/* 3x3 Tile Grid Art */}
                <div className="art-memory-grid" aria-hidden="true">
                  <div className="mini-tile active-teal" />
                  <div className="mini-tile" />
                  <div className="mini-tile active-yellow" />
                  <div className="mini-tile" />
                  <div className="mini-tile active-teal" />
                  <div className="mini-tile" />
                  <div className="mini-tile active-purple" />
                  <div className="mini-tile" />
                  <div className="mini-tile" />
                </div>
              </div>

              <h3 className="zone-title" style={{ marginTop: '12px' }}>Memory Maze</h3>
              <p className="zone-desc" style={{ marginTop: '4px' }}>
                Repeat expanding color tile sequences.
              </p>
              <div className="zone-stats-row" style={{ marginTop: '8px' }}>
                <span className="zone-stat-label">Max Level:</span>
                <span className="zone-stat-val">{pbs['memory-maze']?.level || 0}</span>
                <span className="zone-stat-label" style={{ marginLeft: '8px' }}>PB:</span>
                <span className="zone-stat-val">{pbs['memory-maze']?.score || 0}</span>
              </div>
            </div>

            <button
              type="button"
              className="btn-primary btn-zone-memory"
              style={{ marginTop: '12px' }}
              onClick={() => handleLaunchOrNavigate('memory-maze')}
            >
              <Icon name="controller" size={16} />
              <span>PLAY MAZE</span>
            </button>
          </div>

          {/* Pattern Panic (+1deg) */}
          <div className="zone-card card-pattern tilt-right">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span
                  className="zone-badge-tag"
                  style={{ background: 'var(--violet)', color: '#FFFFFF' }}
                >
                  Puzzle
                </span>
                {/* Diagonal Shards Art */}
                <div className="art-pattern-shards" aria-hidden="true">
                  <div className="shard shard-1" />
                  <div className="shard shard-2" />
                  <div className="shard shard-3" />
                </div>
              </div>

              <h3 className="zone-title" style={{ marginTop: '12px' }}>Pattern Panic</h3>
              <p className="zone-desc" style={{ marginTop: '4px' }}>
                Identify numerical and visual sequences.
              </p>
              <div className="zone-stats-row" style={{ marginTop: '8px' }}>
                <span className="zone-stat-label">Correct:</span>
                <span className="zone-stat-val">{pbs['pattern-panic']?.correct || 0}</span>
                <span className="zone-stat-label" style={{ marginLeft: '8px' }}>PB:</span>
                <span className="zone-stat-val">{pbs['pattern-panic']?.score || 0}</span>
              </div>
            </div>

            <button
              type="button"
              className="btn-primary btn-zone-pattern"
              style={{ marginTop: '12px' }}
              onClick={() => handleLaunchOrNavigate('pattern-panic')}
            >
              <Icon name="controller" size={16} />
              <span>PLAY PATTERN</span>
            </button>
          </div>
        </div>

        {/* 3C. CHALLENGE TOWER WIDE CARD (NO ROTATION) */}
        <div className={`zone-card card-tower ${!isTowerUnlocked ? 'locked' : ''}`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span
                className="zone-badge-tag"
                style={{ background: 'var(--sun)', color: '#1E1B2E' }}
              >
                Gauntlet • 4 Floors
              </span>
              {!isTowerUnlocked && (
                <span style={{ fontSize: '0.8rem', color: 'var(--tomato)', fontWeight: 800 }}>
                  Locked Trial
                </span>
              )}
            </div>

            <h3 className="zone-title">Challenge Tower</h3>
            <p className="zone-desc">
              Climb 4 escalating floors: Reaction → Memory → Pattern → Final Mix!
            </p>

            {!isTowerUnlocked ? (
              <div className="tower-locked-overlay">
                <Icon name="lock" size={16} />
                <span>
                  Play Reaction ({rxPlayed ? '✓' : '1 needed'}), Memory ({mmPlayed ? '✓' : '1 needed'}), and Pattern ({ppPlayed ? '✓' : '1 needed'}) to unlock!
                </span>
              </div>
            ) : (
              <div className="zone-stats-row">
                <div className="zone-stat-item">
                  <span className="zone-stat-label">Tower PB:</span>
                  <span className="zone-stat-val">{pbs['tower']?.score || 0} pts</span>
                </div>
                <div className="zone-stat-item">
                  <span className="zone-stat-label">Best Rank:</span>
                  <span className="zone-stat-val">{pbs['tower']?.rank || '--'}</span>
                </div>
              </div>
            )}

            {isTowerUnlocked && (
              <div style={{ marginTop: '8px' }}>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => handleLaunchOrNavigate('challenge-tower')}
                >
                  <Icon name="tower" size={16} />
                  <span>CLIMB TOWER</span>
                </button>
              </div>
            )}
          </div>

          {/* Stacked Floors Tower Art */}
          <div className="art-tower-floors" aria-hidden="true">
            <div className="tower-floor-level floor-4" title="Floor 4: Final Mix" />
            <div className="tower-floor-level floor-3" title="Floor 3: Pattern" />
            <div className="tower-floor-level floor-2" title="Floor 2: Memory" />
            <div className="tower-floor-level floor-1" title="Floor 1: Reaction" />
          </div>
        </div>
      </section>
    </div>
  );
}
