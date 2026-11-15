import Icon from '../common/Icons';

/**
 * Slim Top Bar Header Component
 * - Brand logo & title
 * - Desktop nav links: Home, Play, Rewards, Profile (>=768px)
 * - Coins and Level indicators
 * - Clickable Profile avatar
 */
export default function Header({
  player,
  activePage,
  activeGame,
  onNavigate,
}) {
  return (
    <header className="header" role="banner">
      <div className="header-inner">
        <div
          className="header-brand"
          onClick={() => onNavigate('home')}
          role="button"
          tabIndex={0}
          title="Pixarcade Home"
        >
          <div className="header-brand-icon">
            <Icon name="controller" size={18} />
          </div>
          <div className="header-brand-text">
            <span className="header-brand-title">Pixarcade</span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        {!activeGame && (
          <nav className="header-nav" aria-label="Desktop Navigation">
            <button
              type="button"
              className={`header-nav-btn ${activePage === 'home' ? 'active' : ''}`}
              onClick={() => onNavigate('home')}
            >
              <Icon name="home" size={15} />
              <span>Home</span>
            </button>
            <button
              type="button"
              className={`header-nav-btn ${activePage === 'world' ? 'active' : ''}`}
              onClick={() => onNavigate('world')}
            >
              <Icon name="map" size={15} />
              <span>Play</span>
            </button>
            <button
              type="button"
              className={`header-nav-btn ${activePage === 'achievements' ? 'active' : ''}`}
              onClick={() => onNavigate('achievements')}
            >
              <Icon name="trophy" size={15} />
              <span>Rewards</span>
            </button>
            <button
              type="button"
              className={`header-nav-btn ${activePage === 'profile' ? 'active' : ''}`}
              onClick={() => onNavigate('profile')}
            >
              <Icon name="user" size={15} />
              <span>Profile</span>
            </button>
          </nav>
        )}

        <div className="header-right">
          <div
            className="header-coins-pill"
            title={`Coins: ${player?.coins ?? 100}`}
          >
            <Icon name="coin" size={14} />
            <span>{player?.coins ?? 100}</span>
          </div>

          <div
            className="header-level-pill"
            title={`Level ${player?.level ?? 1}`}
          >
            <Icon name="star" size={14} />
            <span>LVL {player?.level ?? 1}</span>
          </div>

          <button
            type="button"
            className="header-profile-btn"
            onClick={() => onNavigate('profile')}
            title="Open Player Profile & Settings"
          >
            <div className="header-profile-avatar">
              <Icon name={player?.avatar || 'user'} size={15} />
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
