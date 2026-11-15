import Icon from '../common/Icons';

/**
 * DailyChallengeCard Component
 * 
 * Renders the 3 live daily challenges with progress & claim actions.
 */
export default function DailyChallengeCard({ dailies = [], onClaim, onNavigate }) {
  return (
    <article className="daily-challenge-card" aria-label="Daily Challenges">
      <div className="daily-header">
        <div className="daily-badge">
          <Icon name="flame" size={13} />
          <span>Daily Challenges</span>
        </div>
        <div className="daily-timer" title="Reset at local midnight">
          <Icon name="clock" size={13} />
          <span>Resets Midnight</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
        {dailies.map((c) => {
          const isDone = c.completed;
          const isClaimed = c.claimed;

          return (
            <div
              key={c.instanceId}
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {c.title}
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--arcade-yellow)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  +{c.reward} <Icon name="coin" size={12} />
                </span>
              </div>

              <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                {c.desc}
              </span>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginTop: '2px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Progress: {Math.min(c.progress, c.target)} / {c.target}
                </span>

                {isClaimed ? (
                  <span className="badge-pill badge-green" style={{ fontSize: '0.7rem', padding: '2px 6px' }}>
                    <Icon name="check" size={10} />
                    <span>Claimed</span>
                  </span>
                ) : isDone ? (
                  <button
                    type="button"
                    className="btn-arcade yellow"
                    style={{ padding: '3px 10px', fontSize: '0.74rem' }}
                    onClick={() => onClaim(c.instanceId)}
                  >
                    Claim Reward
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn-arcade secondary"
                    style={{ padding: '3px 8px', fontSize: '0.72rem' }}
                    onClick={() => onNavigate && onNavigate('world')}
                  >
                    Play
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </article>
  );
}
