import Icon from '../common/Icons';

/**
 * GameZoneCard Component
 * 
 * Clean arcade game card with vector icons:
 * - Icon container
 * - Category badge
 * - Title and description
 * - Action button with play/lock icon
 */
export default function GameZoneCard({ zone, onPlayClick }) {
  const {
    title,
    shortDescription,
    iconName,
    badge,
    accentColor,
    accentGlow,
    difficulty,
    status,
  } = zone;

  const isLocked = status === 'locked';

  return (
    <article
      className="game-zone-card"
      style={{
        '--card-accent': accentColor,
        '--card-glow': accentGlow,
        '--card-glow-bg': `${accentColor}18`,
      }}
    >
      <div className="card-top-row">
        <div className="zone-icon-box" aria-hidden="true">
          <Icon name={iconName} size={22} />
        </div>
        <span
          className="badge-pill"
          style={{
            color: accentColor,
            background: `${accentColor}15`,
            border: `1px solid ${accentColor}35`,
          }}
        >
          {badge} • {difficulty}
        </span>
      </div>

      <div className="zone-details">
        <h3 className="zone-title">{title}</h3>
        <p className="zone-desc">{shortDescription}</p>
      </div>

      <div className="zone-card-footer">
        <button
          type="button"
          className="btn-arcade secondary zone-play-btn"
          onClick={() => onPlayClick(zone)}
          style={{
            borderColor: `${accentColor}44`,
          }}
        >
          <Icon name={isLocked ? 'lock' : 'play'} size={14} />
          <span>{isLocked ? 'Locked' : 'Play Zone'}</span>
        </button>
      </div>
    </article>
  );
}
