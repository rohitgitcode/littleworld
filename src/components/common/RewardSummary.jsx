import Icon from './Icons';

/**
 * Compact Reward Summary for Game Results Screens
 * Reuses existing badge and pill styles.
 */
export default function RewardSummary({ result }) {
  if (!result || result.alreadyProcessed) return null;

  return (
    <div
      className="reward-summary-card"
      style={{
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid var(--border-medium)',
        borderRadius: 'var(--radius-md)',
        padding: '12px 18px',
        margin: '14px 0',
        width: '100%',
        maxWidth: '460px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="badge-pill badge-cyan">
            <Icon name="bolt" size={12} />
            <span>+{result.xpEarned} XP</span>
          </span>
          <span className="badge-pill badge-yellow">
            <Icon name="coin" size={12} />
            <span>+{result.coinsEarned} Coins</span>
          </span>
        </div>

        {result.newBest && (
          <span
            className="badge-pill"
            style={{
              background: 'var(--yellow)',
              color: '#120B24',
              fontWeight: 800,
              boxShadow: '0 2px 0 var(--yellow-dark)',
              letterSpacing: '0.04em',
            }}
          >
            <Icon name="trophy" size={13} />
            <span>NEW BEST!</span>
          </span>
        )}
      </div>

      {result.leveledUp && (
        <div
          className="badge-pill badge-green"
          style={{ justifyContent: 'center', padding: '6px 12px', fontSize: '0.8rem' }}
        >
          <Icon name="star" size={14} />
          <span>LEVEL UP! Reached Level {result.newLevel}</span>
        </div>
      )}

      {result.unlockedAchievements?.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '2px' }}>
          {result.unlockedAchievements.map((ach) => (
            <div
              key={ach.id}
              style={{
                fontSize: '0.78rem',
                color: 'var(--neon-cyan)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Icon name="star" size={12} />
              <span>Achievement Unlocked: {ach.title} (+{ach.rewardCoins} Coins)</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
