import Icon from '../components/common/Icons';
import { useProgress } from '../progression/store.jsx';
import { ACHIEVEMENTS } from '../progression/rules';

/**
 * AchievementsPage (Trophy Hall)
 * 
 * Connected to live progression store:
 * - Real unlocked badges count
 * - Real unlock timestamps
 * - Coin bounties awarded on completion
 */
export default function AchievementsPage({ onNotify }) {
  const { saveData, player } = useProgress();
  const unlockedRecords = saveData.achievements || {};
  const unlockedCount = Object.keys(unlockedRecords).length;
  const totalCount = ACHIEVEMENTS.length;

  return (
    <div className="achievements-page-container">
      <div className="page-header">
        <h1 className="page-title">
          <Icon name="trophy" size={24} />
          <span>Trophy Hall</span>
        </h1>
        <p className="page-subtitle">
          Unlock milestone badges by playing arcade challenges, mastering sequences, and building daily streaks.
        </p>
      </div>

      <div className="achievements-stats-banner">
        <div className="achievements-summary-card">
          <div className="icon">
            <Icon name="star" size={20} />
          </div>
          <div>
            <div className="value">{unlockedCount} / {totalCount}</div>
            <div className="label">Badges Unlocked</div>
          </div>
        </div>

        <div className="achievements-summary-card">
          <div className="icon">
            <Icon name="coin" size={20} />
          </div>
          <div>
            <div className="value">{player.coins}</div>
            <div className="label">Coins Balance</div>
          </div>
        </div>

        <div className="achievements-summary-card">
          <div className="icon">
            <Icon name="controller" size={20} />
          </div>
          <div>
            <div className="value">{player.title}</div>
            <div className="label">Challenger Tier</div>
          </div>
        </div>
      </div>

      <div className="achievements-grid">
        {ACHIEVEMENTS.map((item) => {
          const record = unlockedRecords[item.id];
          const isUnlocked = Boolean(record?.unlocked);

          return (
            <div
              key={item.id}
              className={`achievement-card ${isUnlocked ? 'unlocked' : 'locked'}`}
              onClick={() =>
                onNotify(
                  isUnlocked ? 'Achievement Unlocked' : 'Milestone Locked',
                  `${item.title}: ${item.description}`
                )
              }
              role="button"
              tabIndex={0}
            >
              <div className="achievement-icon-wrap" aria-hidden="true">
                <Icon name={item.icon || 'star'} size={20} />
              </div>

              <div className="achievement-info">
                <div className="achievement-title-row">
                  <span className="achievement-title">{item.title}</span>
                  <span className="achievement-reward-tag">
                    +{item.rewardCoins} <Icon name="coin" size={12} />
                  </span>
                </div>

                <p className="achievement-desc">{item.description}</p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem', color: isUnlocked ? 'var(--arcade-green)' : 'var(--text-muted)' }}>
                  <span>{isUnlocked ? `Unlocked on ${record.unlockedAt}` : 'Incomplete'}</span>
                  {isUnlocked && <Icon name="check" size={12} />}
                </div>

                <div className="achievement-progress-bar" style={{ marginTop: '6px' }}>
                  <div
                    className="achievement-progress-fill"
                    style={{ width: isUnlocked ? '100%' : '0%' }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
