import Icon from '../common/Icons';

/**
 * WelcomeBanner Component
 * 
 * Clean, restrained arcade welcome banner:
 * - Headline greeting
 * - Play Now action navigating to World
 * - Handcrafted arcade radar visual
 */
export default function WelcomeBanner({ playerName = 'Player', onPlayNow }) {
  return (
    <section className="welcome-banner" aria-label="Welcome Overview">
      <div className="banner-content">
        <div className="banner-pill">
          <span className="badge-pill badge-cyan">
            <Icon name="bolt" size={13} />
            <span>Season 1: Arcade Frontier</span>
          </span>
        </div>

        <h1 className="banner-title">
          Welcome back, <span className="highlight">{playerName}</span>
        </h1>

        <p className="banner-subtitle">
          Ready to beat your high score today? Arcade zones are primed for your reflexes and memory.
        </p>

        <div className="banner-actions">
          <button
            type="button"
            className="btn-arcade primary banner-play-btn"
            onClick={onPlayNow}
          >
            <Icon name="play" size={14} />
            <span>Explore Games</span>
          </button>
        </div>
      </div>

      <div className="banner-graphic" aria-hidden="true">
        <div className="arcade-radar-badge">
          <Icon name="controller" size={32} />
          <span className="radar-subtext">Arcade</span>
        </div>
      </div>
    </section>
  );
}
