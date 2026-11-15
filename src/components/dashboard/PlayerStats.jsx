import Icon from '../common/Icons';

/**
 * PlayerStats Component
 * 
 * Displays live progression statistics:
 * - Level, Current & Total XP, Coins, Games Played
 */
export default function PlayerStats({ player }) {
  const stats = [
    {
      id: 'level',
      label: 'Player Level',
      value: player?.level ?? 1,
      iconName: 'star',
      accentColor: '#00d8f6',
      bgColor: 'rgba(0, 216, 246, 0.1)',
      borderColor: 'rgba(0, 216, 246, 0.25)',
      subtext: `Rank: ${player?.title || 'Novice'}`,
    },
    {
      id: 'xp',
      label: 'XP Progress',
      value: player?.totalXp ?? 0,
      iconName: 'bolt',
      accentColor: '#9d5cf7',
      bgColor: 'rgba(157, 92, 247, 0.1)',
      borderColor: 'rgba(157, 92, 247, 0.25)',
      subtext: `${player?.currentLevelXp ?? 0} / ${player?.xpNeeded ?? 100} to Lvl ${(player?.level ?? 1) + 1}`,
    },
    {
      id: 'coins',
      label: 'Coins',
      value: player?.coins ?? 100,
      iconName: 'coin',
      accentColor: '#f5b700',
      bgColor: 'rgba(245, 183, 0, 0.1)',
      borderColor: 'rgba(245, 183, 0, 0.25)',
      subtext: 'Arcade tokens',
    },
    {
      id: 'games',
      label: 'Games Played',
      value: player?.gamesPlayed ?? 0,
      iconName: 'gamepad',
      accentColor: '#f43f85',
      bgColor: 'rgba(244, 63, 133, 0.1)',
      borderColor: 'rgba(244, 63, 133, 0.25)',
      subtext: 'Completed runs',
    },
  ];

  return (
    <section className="stats-section" aria-label="Player Statistics">
      <div className="section-title-wrap">
        <h2 className="section-title">
          <Icon name="user" size={17} />
          <span>Player Overview</span>
        </h2>
        <span className="section-subtitle">Real-time Progress</span>
      </div>

      <div className="stats-grid">
        {stats.map((item) => (
          <div
            key={item.id}
            className="stat-card"
            style={{
              '--stat-accent': item.accentColor,
              '--stat-bg': item.bgColor,
              '--stat-border': item.borderColor,
            }}
          >
            <div className="stat-icon-wrapper" aria-hidden="true">
              <Icon name={item.iconName} size={20} />
            </div>
            <div className="stat-info">
              <span className="stat-label">{item.label}</span>
              <span className="stat-value">{item.value}</span>
              <span className="stat-footer-text">{item.subtext}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
