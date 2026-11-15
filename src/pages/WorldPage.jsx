import Icon from '../components/common/Icons';
import { GAME_ZONES } from '../data/gameZones';

/**
 * WorldPage (Explore World)
 * 
 * Arcade realm selection screen showing all zones with vector icons:
 * 1. Reaction Reactor (⚡ Reflex)
 * 2. Memory Maze (🧠 Memory)
 * 3. Pattern Panic (🔷 Puzzle)
 * 4. Challenge Tower (🏆 Gauntlet)
 */
export default function WorldPage({ onNotify, onLaunchGame }) {
  const handleZoneAction = (zone) => {
    if (
      zone.id === 'reaction-reactor' ||
      zone.id === 'memory-maze' ||
      zone.id === 'pattern-panic' ||
      zone.id === 'challenge-tower'
    ) {
      if (onLaunchGame) {
        onLaunchGame(zone.id);
      }
      return;
    }

    if (zone.status === 'locked') {
      onNotify(
        'Zone Locked',
        `${zone.title} is locked. Requires Level ${zone.recommendedLevel} to enter.`
      );
    } else {
      onNotify(
        'In Development',
        `${zone.title} is coming in a future update.`
      );
    }
  };

  return (
    <div className="world-page-container">
      <div className="page-header">
        <h1 className="page-title">
          <Icon name="map" size={24} />
          <span>Explore Arcade Realms</span>
        </h1>
        <p className="page-subtitle">
          Choose a zone to challenge your reflexes, test your sequence memory, or solve geometric patterns.
        </p>
      </div>

      <div className="world-hero-banner">
        <span className="badge-pill badge-cyan" style={{ marginBottom: '8px' }}>
          <Icon name="controller" size={13} />
          <span>Sector Alpha • 3 Active Zones</span>
        </span>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '4px' }}>
          Pixarcade — Challengers Grid
        </h2>
        <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', maxWidth: '540px' }}>
          Conquer active game zones to test your reflexes and analytical speed in single-player arcade trials.
        </p>
      </div>

      <div className="world-grid">
        {GAME_ZONES.map((zone) => {
          const isLocked = zone.status === 'locked';

          return (
            <div
              key={zone.id}
              className={`world-zone-card ${isLocked ? 'locked' : ''}`}
              style={{
                '--zone-color': zone.accentColor,
                '--zone-glow': zone.accentGlow,
                '--zone-glow-bg': `${zone.accentColor}18`,
              }}
            >
              <div className="zone-header-meta">
                <span
                  className="badge-pill"
                  style={{
                    color: zone.accentColor,
                    background: `${zone.accentColor}15`,
                    border: `1px solid ${zone.accentColor}35`,
                  }}
                >
                  {zone.badge}
                </span>

                <span className={`zone-status-badge ${isLocked ? 'locked' : 'available'}`}>
                  <Icon name={isLocked ? 'lock' : 'check'} size={12} />
                  <span>{isLocked ? 'Locked' : 'Available'}</span>
                </span>
              </div>

              <div className="zone-icon-hero" aria-hidden="true">
                <Icon name={zone.iconName} size={28} />
              </div>

              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '6px' }}>
                {zone.title}
              </h3>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: 1.45 }}>
                {zone.fullDescription}
              </p>

              <div className="zone-meta-tags">
                <span className="zone-difficulty-chip">
                  Difficulty: {zone.difficulty}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {zone.statusLabel}
                </span>
              </div>

              <div className="zone-action-row">
                <button
                  type="button"
                  className={isLocked ? 'btn-secondary' : 'btn-primary'}
                  style={{ width: '100%' }}
                  onClick={() => handleZoneAction(zone)}
                  disabled={isLocked}
                >
                  <Icon name={isLocked ? 'lock' : 'play'} size={14} />
                  <span>
                    {isLocked
                      ? `Locked (Level ${zone.recommendedLevel})`
                      : 'Enter Zone'}
                  </span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
